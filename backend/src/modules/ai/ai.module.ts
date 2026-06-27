import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiProvider } from './providers/ai-provider.abstract';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiProvider } from './providers/openai-ai.provider';
import { AnthropicAiProvider } from './providers/anthropic-ai.provider';
import { OpenRouterAiProvider } from './providers/openrouter-ai.provider';

export const AI_PROVIDER = 'AI_PROVIDER';

@Module({
  imports: [ConfigModule],
  providers: [
    MockAiProvider,
    OpenAiProvider,
    AnthropicAiProvider,
    OpenRouterAiProvider,
    {
      provide: AI_PROVIDER,
      useFactory: (
        configService: ConfigService,
        mockAiProvider: MockAiProvider,
        openAiProvider: OpenAiProvider,
        anthropicAiProvider: AnthropicAiProvider,
        openRouterAiProvider: OpenRouterAiProvider,
      ): AiProvider => {
        const providerName = configService.get<string>('ai.provider') ?? 'mock';
        const providers = [
          mockAiProvider,
          openAiProvider,
          anthropicAiProvider,
          openRouterAiProvider,
        ] as const;

        return (
          providers.find((provider) => provider.name === providerName) ??
          mockAiProvider
        );
      },
      inject: [
        ConfigService,
        MockAiProvider,
        OpenAiProvider,
        AnthropicAiProvider,
        OpenRouterAiProvider,
      ],
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
