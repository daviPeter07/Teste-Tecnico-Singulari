export interface SummarizerContract {
  summarize(content: string): Promise<string>;
}
