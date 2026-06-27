import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiProvider } from './providers/openai-ai.provider';
import { AnthropicAiProvider } from './providers/anthropic-ai.provider';
import { OpenRouterAiProvider } from './providers/openrouter-ai.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    AiService,
    MockAiProvider,
    OpenAiProvider,
    AnthropicAiProvider,
    OpenRouterAiProvider,
  ],
  exports: [AiService],
})
export class AiModule {}
