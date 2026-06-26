import { CuratedNewsItem } from '../types/curated-news-item.type';

export class CurationJobDto {
  runId!: string;
  sourceType!: string;
  item!: CuratedNewsItem;
}
