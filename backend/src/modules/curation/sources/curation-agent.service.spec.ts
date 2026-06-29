import { CurationAgentService } from './curation-agent.service';
import { LocalJsonNewsSource } from './local-json-news.source';
import { TemplateNewsSource } from './template-news.source';

describe('CurationAgentService', () => {
  let service: CurationAgentService;
  let templateNewsSource: jest.Mocked<Pick<TemplateNewsSource, 'generate'>>;
  let localJsonNewsSource: jest.Mocked<Pick<LocalJsonNewsSource, 'generate'>>;

  beforeEach(() => {
    templateNewsSource = {
      generate: jest.fn(),
    };
    localJsonNewsSource = {
      generate: jest.fn(),
    };

    service = new CurationAgentService(
      templateNewsSource as unknown as TemplateNewsSource,
      localJsonNewsSource as unknown as LocalJsonNewsSource,
    );
  });

  it('delegates template runs to the template news source using limit and run id', () => {
    // Garante que a descoberta usa limit e runId como seed deterministica da fonte template.
    templateNewsSource.generate.mockReturnValue([
      { title: 'generated' },
    ] as never);

    const result = service.discoverNews({
      runId: 'run-1',
      sourceType: 'template',
      limit: 3,
    });

    expect(templateNewsSource.generate).toHaveBeenCalledWith(3, 'run-1');
    expect(result).toEqual([{ title: 'generated' }]);
  });

  it('delegates local-json runs to the structured local source', () => {
    // Garante que a estrategia local-json do agente usa a fonte estruturada de sinais locais.
    localJsonNewsSource.generate.mockReturnValue([
      { title: 'local insight' },
    ] as never);

    const result = service.discoverNews({
      runId: 'run-1',
      sourceType: 'local-json',
      limit: 2,
    });

    expect(localJsonNewsSource.generate).toHaveBeenCalledWith(2, 'run-1');
    expect(result).toEqual([{ title: 'local insight' }]);
  });

  it('throws for unsupported source types', () => {
    // Garante erro explicito quando a origem configurada nao e suportada pelo agente.
    expect(() =>
      service.discoverNews({
        runId: 'run-1',
        sourceType: 'rss',
        limit: 3,
      }),
    ).toThrow('Unsupported curation source: rss');
  });
});
