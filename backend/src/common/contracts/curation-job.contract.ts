import { CuratedNewsItem } from '../../modules/curation/types/curated-news-item.type';

export class CurationJobContract {
  runId!: string;
  sourceType!: string;
  item!: CuratedNewsItem;
}
