export class CurationJobDto {
  runId!: string;
  sourceType!: string;
  item!: {
    title: string;
    sourceName: string;
    sourceUrl: string | null;
    url?: string | null;
    content: string;
    publishedAt: string;
    categorySlug: string;
  };
}
