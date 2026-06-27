import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from './ai-provider.abstract';

@Injectable()
export class OpenAiProvider extends AiProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  protected async doSummarize(content: string): Promise<string> {
    const apiKey = this.configService.get<string>('ai.openAiApiKey');
    const model = this.configService.get<string>('ai.openAiModel');

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured.');
      throw new Error('OPENAI_API_KEY not configured');
    }

    if (!model) {
      this.logger.warn('OPENAI_MODEL not configured.');
      throw new Error('OPENAI_MODEL not configured');
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
        content?: Array<{ type?: string; text?: string }>;
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
}
