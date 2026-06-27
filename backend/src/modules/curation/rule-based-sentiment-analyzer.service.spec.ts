import { NewsSentiment } from '../../../generated/prisma/enums';
import { RuleBasedSentimentAnalyzerService } from './enrichment/rule-based-sentiment-analyzer.service';

describe('RuleBasedSentimentAnalyzerService', () => {
  let service: RuleBasedSentimentAnalyzerService;

  beforeEach(() => {
    service = new RuleBasedSentimentAnalyzerService();
  });

  it('classifica como positivo quando os termos positivos predominam', () => {
    // Garante que o analisador dedicado mantém a heurística positiva isolada em um contrato próprio.
    expect(
      service.detectSentiment(
        'As equipes aceleram a inovacao e melhorar a eficiencia do produto.',
      ),
    ).toBe(NewsSentiment.POSITIVE);
  });

  it('classifica como negativo quando os termos negativos predominam', () => {
    // Garante que o analisador dedicado mantém a heurística negativa isolada em um contrato próprio.
    expect(service.detectSentiment('A crise causou falha, risco e atraso.')).toBe(
      NewsSentiment.NEGATIVE,
    );
  });

  it('classifica como neutro quando nao existe predominancia clara', () => {
    // Garante comportamento previsível quando o texto não puxa claramente para um lado.
    expect(service.detectSentiment('Texto informativo sem sinais fortes.')).toBe(
      NewsSentiment.NEUTRAL,
    );
  });
});
