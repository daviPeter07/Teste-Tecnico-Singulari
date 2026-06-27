import { Injectable } from '@nestjs/common';
import { NewsSentiment } from '../../../generated/prisma/enums';
import { AiService } from '../ai/ai.service';

@Injectable()
export class NewsEnrichmentService {
  constructor(private readonly aiService: AiService) {}

  summarize(content: string) {
    return this.aiService.summarize(content);
  }

  detectSentiment(content: string) {
    const normalizedContent = content.toLowerCase();
    const positiveTerms = [
      'aceleram',
      'ganham',
      'melhorar',
      'crescimento',
      'eficiencia',
      'inovacao',
    ];
    const negativeTerms = [
      'queda',
      'risco',
      'falha',
      'atraso',
      'crise',
      'incidente',
    ];

    const positiveScore = positiveTerms.filter((term) =>
      normalizedContent.includes(term),
    ).length;
    const negativeScore = negativeTerms.filter((term) =>
      normalizedContent.includes(term),
    ).length;

    if (positiveScore > negativeScore) {
      return NewsSentiment.POSITIVE;
    }

    if (negativeScore > positiveScore) {
      return NewsSentiment.NEGATIVE;
    }

    return NewsSentiment.NEUTRAL;
  }

  extractEntities(content: string) {
    const matches =
      content.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g) ?? [];

    return Array.from(new Set(matches)).slice(0, 5);
  }
}
