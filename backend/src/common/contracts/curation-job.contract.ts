import { CuratedNewsItem } from './curated-news-item.type';

export class CurationJobContract {
  runId!: string;
  sourceType!: string;
  item!: CuratedNewsItem;
}
