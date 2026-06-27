import { Module } from '@nestjs/common';
import { AiModule } from '../../ai/ai.module';
import { AiService } from '../../ai/ai.service';
import { ENTITY_EXTRACTOR, SENTIMENT_ANALYZER, SUMMARIZER } from './enrichment.tokens';
import { NewsEnrichmentService } from './news-enrichment.service';
import { RegexEntityExtractorService } from './regex-entity-extractor.service';
import { RuleBasedSentimentAnalyzerService } from './rule-based-sentiment-analyzer.service';

@Module({
  imports: [AiModule],
  providers: [
    RuleBasedSentimentAnalyzerService,
    RegexEntityExtractorService,
    {
      provide: SUMMARIZER,
      useExisting: AiService,
    },
    {
      provide: SENTIMENT_ANALYZER,
      useExisting: RuleBasedSentimentAnalyzerService,
    },
    {
      provide: ENTITY_EXTRACTOR,
      useExisting: RegexEntityExtractorService,
    },
    NewsEnrichmentService,
  ],
  exports: [
    RuleBasedSentimentAnalyzerService,
    RegexEntityExtractorService,
    NewsEnrichmentService,
  ],
})
export class EnrichmentModule {}
