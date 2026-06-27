import { Injectable } from '@nestjs/common';
import { NewsSentiment } from '../../../../generated/prisma/enums';
import type { SentimentAnalyzerContract } from './contracts/sentiment-analyzer.contract';

@Injectable()
export class RuleBasedSentimentAnalyzerService implements SentimentAnalyzerContract {
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
}
