import { LocalJsonNewsSource } from './local-json-news.source';

describe('LocalJsonNewsSource', () => {
  let source: LocalJsonNewsSource;

  beforeEach(() => {
    source = new LocalJsonNewsSource();
  });

  it('transforms local tech signals into curated news items', () => {
    // Garante que a fonte local converte sinais estruturados em noticias validas para o pipeline.
    const items = source.generate(2, 'run-1');

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual(
      expect.objectContaining({
        sourceName: 'Local Signals Lab',
        sourceUrl: 'file://tech-signals.json',
      }),
    );
  });

  it('keeps local-json generation deterministic for the same seed', () => {
    // Mantem a ordem estavel para retries do mesmo runId, evitando divergencia entre tentativas.
    expect(source.generate(3, 'run-42')).toEqual(source.generate(3, 'run-42'));
  });
});
