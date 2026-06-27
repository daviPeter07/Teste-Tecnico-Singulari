import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from './ai-provider.abstract';

@Injectable()
export class AnthropicAiProvider extends AiProvider {
  readonly name = 'anthropic';
  private readonly logger = new Logger(AnthropicAiProvider.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  protected async doSummarize(content: string): Promise<string> {
    const apiKey = this.configService.get<string>('ai.anthropicApiKey');
    const model = this.configService.get<string>('ai.anthropicModel');

    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY not configured.');
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    if (!model) {
      this.logger.warn('ANTHROPIC_MODEL not configured.');
      throw new Error('ANTHROPIC_MODEL not configured');
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
      content?: Array<{ type?: string; text?: string }>;
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
