import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from './ai-provider.abstract';

@Injectable()
export class OpenRouterAiProvider extends AiProvider {
  readonly name = 'openrouter';
  private readonly logger = new Logger(OpenRouterAiProvider.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  protected async doSummarize(content: string): Promise<string> {
    const apiKey = this.configService.get<string>('ai.openRouterApiKey');
    const model = this.configService.get<string>('ai.openRouterModel');

    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not configured.');
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    if (!model) {
      this.logger.warn('OPENROUTER_MODEL not configured.');
      throw new Error('OPENROUTER_MODEL not configured');
    }

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/teste-singu-pleno',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant. Summarize the provided news article in Brazilian Portuguese using at most 2 concise sentences. Respond only with the summary, no extra text.',
            },
            {
              role: 'user',
              content,
            },
          ],
          max_tokens: 200,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter summarization failed: ${errorText}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const summary = payload.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('OpenRouter summarization returned an empty response.');
    }

    return summary;
  }
}
