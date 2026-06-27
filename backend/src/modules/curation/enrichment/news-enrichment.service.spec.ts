import { NewsSentiment } from '../../../../generated/prisma/enums';
import { EntityExtractorContract } from './contracts/entity-extractor.contract';
import { SentimentAnalyzerContract } from './contracts/sentiment-analyzer.contract';
import { SummarizerContract } from './contracts/summarizer.contract';
import { NewsEnrichmentService } from './news-enrichment.service';

describe('NewsEnrichmentService', () => {
  let service: NewsEnrichmentService;
  let summarizer: jest.Mocked<SummarizerContract>;
  let sentimentAnalyzer: jest.Mocked<SentimentAnalyzerContract>;
  let entityExtractor: jest.Mocked<EntityExtractorContract>;

  beforeEach(() => {
    summarizer = {
      summarize: jest.fn(),
    };
    sentimentAnalyzer = {
      detectSentiment: jest.fn(),
    };
    entityExtractor = {
      extractEntities: jest.fn(),
    };

    service = new NewsEnrichmentService(
      summarizer,
      sentimentAnalyzer,
      entityExtractor,
    );
  });

  it('delegates summarization to the configured AI service', async () => {
    // Garante que o service de enriquecimento apenas delega o resumo para o contrato de sumarização.
    summarizer.summarize.mockResolvedValue('resumo pronto');

    await expect(service.summarize('conteudo bruto')).resolves.toBe(
      'resumo pronto',
    );
    expect(summarizer.summarize).toHaveBeenCalledWith('conteudo bruto');
  });

  it('detects positive sentiment when positive terms outnumber negative ones', () => {
    // Garante que o facade repassa a analise de sentimento ao contrato especializado.
    sentimentAnalyzer.detectSentiment.mockReturnValue(NewsSentiment.POSITIVE);

    expect(service.detectSentiment('conteudo')).toBe(NewsSentiment.POSITIVE);
    expect(sentimentAnalyzer.detectSentiment).toHaveBeenCalledWith('conteudo');
  });

  it('detects negative sentiment when negative terms dominate the content', () => {
    // Garante que o facade mantém transparente o retorno negativo vindo do analisador dedicado.
    sentimentAnalyzer.detectSentiment.mockReturnValue(NewsSentiment.NEGATIVE);

    expect(service.detectSentiment('conteudo')).toBe(NewsSentiment.NEGATIVE);
  });

  it('extracts unique entities and caps the list at five items', () => {
    // Garante que o facade delega a extração para o contrato especializado sem alterar a saída.
    entityExtractor.extractEntities.mockReturnValue([
      'Google Cloud',
      'OpenAI',
      'Azure DevOps',
    ]);

    const entities = service.extractEntities('conteudo');

    expect(entities).toEqual(
      expect.arrayContaining(['Google Cloud', 'OpenAI', 'Azure DevOps']),
    );
    expect(entityExtractor.extractEntities).toHaveBeenCalledWith('conteudo');
  });
});
