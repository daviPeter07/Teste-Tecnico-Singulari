export interface EntityExtractorContract {
  extractEntities(content: string): string[];
}
