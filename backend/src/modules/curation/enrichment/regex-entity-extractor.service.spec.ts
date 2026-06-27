import { RegexEntityExtractorService } from './regex-entity-extractor.service';

describe('RegexEntityExtractorService', () => {
  let service: RegexEntityExtractorService;

  beforeEach(() => {
    service = new RegexEntityExtractorService();
  });

  it('extrai entidades únicas e limita o resultado a cinco itens', () => {
    // Garante que a extração de entidades virou uma responsabilidade isolada e com saída estável.
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
