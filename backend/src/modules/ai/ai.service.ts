import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AiProvider = 'mock' | 'openai' | 'anthropic';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  async summarize(content: string) {
    const provider =
      this.configService.get<AiProvider>('ai.provider') ?? 'mock';

    try {
      switch (provider) {
        case 'openai':
          return await this.summarizeWithOpenAi(content);

        case 'anthropic':
          return await this.summarizeWithAnthropic(content);

        default:
          return await this.summarizeWithMock(content);
      }
    } catch (error) {
      this.logger.warn(
        `AI summarization failed for provider ${provider}. Falling back to mock summarization.`,
      );

      if (error instanceof Error) {
        this.logger.warn(error.message);
      }

      return this.summarizeWithMock(content);
    }
  }

  private summarizeWithMock(content: string) {
    if (content.length <= 180) {
      return Promise.resolve(content);
    }

    const normalized = content.replace(/\s+/g, ' ').trim();
    const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
    const summary = sentences.slice(0, 2).join(' ').trim();

    return Promise.resolve(
      summary.length <= 180 ? summary : `${summary.slice(0, 177).trim()}...`,
    );
  }

  private async summarizeWithOpenAi(content: string) {
    const apiKey = this.configService.get<string>('ai.openAiApiKey');
    const model = this.configService.get<string>('ai.openAiModel');

    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured. Falling back to mock summarization.',
      );
      return this.summarizeWithMock(content);
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions:
          'Summarize the provided news article in Brazilian Portuguese using at most 2 concise sentences.',
        input: content,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI summarization failed: ${errorText}`);
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        type?: string;
        content?: Array<{
          type?: string;
          text?: string;
        }>;
      }>;
    };

    const summary =
      payload.output_text?.trim() ??
      payload.output
        ?.flatMap((entry) => entry.content ?? [])
        .find((entry) => entry.type === 'output_text')
        ?.text?.trim();

    if (!summary) {
      throw new Error('OpenAI summarization returned an empty response.');
    }

    return summary;
  }

  private async summarizeWithAnthropic(content: string) {
    const apiKey = this.configService.get<string>('ai.anthropicApiKey');
    const model = this.configService.get<string>('ai.anthropicModel');

    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY not configured. Falling back to mock summarization.',
      );
      return this.summarizeWithMock(content);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 180,
        messages: [
          {
            role: 'user',
            content: `Resuma a noticia abaixo em portugues do Brasil, com no maximo 2 frases.\n\n${content}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic summarization failed: ${errorText}`);
    }

    const payload = (await response.json()) as {
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    };

    const summary = payload.content
      ?.filter((entry) => entry.type === 'text')
      .map((entry) => entry.text?.trim())
      .filter((entry): entry is string => Boolean(entry))
      .join(' ')
      .trim();

    if (!summary) {
      throw new Error('Anthropic summarization returned an empty response.');
    }

    return summary;
  }
}
