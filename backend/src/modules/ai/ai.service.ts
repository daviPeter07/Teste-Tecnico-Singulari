import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from './providers/ai-provider.abstract';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiProvider } from './providers/openai-ai.provider';
import { AnthropicAiProvider } from './providers/anthropic-ai.provider';
import { OpenRouterAiProvider } from './providers/openrouter-ai.provider';

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockAiProvider: MockAiProvider,
    private readonly openAiProvider: OpenAiProvider,
    private readonly anthropicAiProvider: AnthropicAiProvider,
    private readonly openRouterAiProvider: OpenRouterAiProvider,
  ) {}

  async summarize(content: string) {
    const name = this.configService.get<string>('ai.provider') ?? 'mock';

    const providers = [
      this.mockAiProvider,
      this.openAiProvider,
      this.anthropicAiProvider,
      this.openRouterAiProvider,
    ] as const;

    const provider: AiProvider =
      providers.find((p) => p.name === name) ?? this.mockAiProvider;

    return provider.summarize(content);
  }
}
