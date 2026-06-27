import { NewsSentiment } from '../../../generated/prisma/enums';
import { AiService } from '../ai/ai.service';
import { NewsEnrichmentService } from './news-enrichment.service';

describe('NewsEnrichmentService', () => {
  let service: NewsEnrichmentService;
  let aiService: jest.Mocked<Pick<AiService, 'summarize'>>;

  beforeEach(() => {
    aiService = {
      summarize: jest.fn(),
    };

    service = new NewsEnrichmentService(aiService as AiService);
  });

  it('delegates summarization to the configured AI service', async () => {
    // Garante que o service de enriquecimento apenas delega o resumo para a camada de IA.
    aiService.summarize.mockResolvedValue('resumo pronto');

    await expect(service.summarize('conteudo bruto')).resolves.toBe('resumo pronto');
    expect(aiService.summarize).toHaveBeenCalledWith('conteudo bruto');
  });

  it('detects positive sentiment when positive terms outnumber negative ones', () => {
    // Cobre a heuristica simples de sentimento positivo baseada em termos do conteudo.
    expect(
      service.detectSentiment(
        'As equipes aceleram a inovacao e melhorar a eficiencia do produto.',
      ),
    ).toBe(NewsSentiment.POSITIVE);
  });

  it('detects negative sentiment when negative terms dominate the content', () => {
    // Verifica o ramo de sentimento negativo quando o texto tem termos de falha, crise e risco.
    expect(service.detectSentiment('A crise causou falha, risco e atraso.')).toBe(
      NewsSentiment.NEGATIVE,
    );
  });

  it('extracts unique entities and caps the list at five items', () => {
    // Garante que as entidades extraidas sejam unicas e limitadas a cinco itens para persistencia.
    const entities = service.extractEntities(
      'Google Cloud integrou OpenAI no Azure DevOps e Google Cloud repetiu Google Cloud para teste.',
    );

    expect(entities).toEqual(
      expect.arrayContaining(['Google Cloud', 'OpenAI', 'Azure DevOps']),
    );
    expect(new Set(entities).size).toBe(entities.length);
    expect(entities.length).toBeLessThanOrEqual(5);
  });
});
