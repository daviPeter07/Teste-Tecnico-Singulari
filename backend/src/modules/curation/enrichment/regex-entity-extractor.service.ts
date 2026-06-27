import { Injectable } from '@nestjs/common';
import type { EntityExtractorContract } from './contracts/entity-extractor.contract';

@Injectable()
export class RegexEntityExtractorService implements EntityExtractorContract {
  extractEntities(content: string) {
    const matches =
      content.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g) ?? [];

    return Array.from(new Set(matches)).slice(0, 5);
  }
}
