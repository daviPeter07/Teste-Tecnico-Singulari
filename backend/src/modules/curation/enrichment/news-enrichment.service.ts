import { Inject, Injectable } from '@nestjs/common';
import type { EntityExtractorContract } from './contracts/entity-extractor.contract';
import type { SentimentAnalyzerContract } from './contracts/sentiment-analyzer.contract';
import type { SummarizerContract } from './contracts/summarizer.contract';
import {
  ENTITY_EXTRACTOR,
  SENTIMENT_ANALYZER,
  SUMMARIZER,
} from './enrichment.tokens';

@Injectable()
export class NewsEnrichmentService {
  constructor(
    @Inject(SUMMARIZER)
    private readonly summarizer: SummarizerContract,
    @Inject(SENTIMENT_ANALYZER)
    private readonly sentimentAnalyzer: SentimentAnalyzerContract,
    @Inject(ENTITY_EXTRACTOR)
    private readonly entityExtractor: EntityExtractorContract,
  ) {}

  summarize(content: string) {
    return this.summarizer.summarize(content);
  }

  detectSentiment(content: string) {
    return this.sentimentAnalyzer.detectSentiment(content);
  }

  extractEntities(content: string) {
    return this.entityExtractor.extractEntities(content);
  }
}
