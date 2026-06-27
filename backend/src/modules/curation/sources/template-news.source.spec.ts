import { TemplateNewsSource } from './template-news.source';

describe('TemplateNewsSource', () => {
  let source: TemplateNewsSource;

  beforeEach(() => {
    source = new TemplateNewsSource();
  });

  it('generates deterministic items for the same seed so retries are idempotent', () => {
    // Garante idempotencia: o mesmo seed precisa gerar exatamente os mesmos itens em retries.
    const first = source.generate(3, 'run-1');
    const second = source.generate(3, 'run-1');

    expect(second).toEqual(first);
  });

  it('honors the requested limit and embeds the seed into generated urls', () => {
    // Garante que o limite e respeitado e que o seed entra na URL para manter identidade estavel.
    const items = source.generate(2, 'seed-123');

    expect(items).toHaveLength(2);
    expect(items[0].url).toContain('seed-123');
    expect(items[1].url).toContain('seed-123');
  });
});
