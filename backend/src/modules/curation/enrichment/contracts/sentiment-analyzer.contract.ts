import { NewsSentiment } from '../../../../../generated/prisma/enums';

export interface SentimentAnalyzerContract {
  detectSentiment(content: string): NewsSentiment;
}
