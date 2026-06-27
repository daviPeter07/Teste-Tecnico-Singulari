import { CurationAgentService } from './sources/curation-agent.service';
import { TemplateNewsSource } from './sources/template-news.source';

describe('CurationAgentService', () => {
  let service: CurationAgentService;
  let templateNewsSource: jest.Mocked<Pick<TemplateNewsSource, 'generate'>>;

  beforeEach(() => {
    templateNewsSource = {
      generate: jest.fn(),
    };

    service = new CurationAgentService(
      templateNewsSource as unknown as TemplateNewsSource,
    );
  });

  it('delegates template runs to the template news source using limit and run id', () => {
    // Garante que a descoberta usa limit e runId como seed deterministica da fonte template.
    templateNewsSource.generate.mockReturnValue([{ title: 'generated' }] as never);

    const result = service.discoverNews({
      runId: 'run-1',
      sourceType: 'template',
      limit: 3,
    });

    expect(templateNewsSource.generate).toHaveBeenCalledWith(3, 'run-1');
    expect(result).toEqual([{ title: 'generated' }]);
  });

  it('throws for unsupported source types', () => {
    // Garante erro explicito quando a origem configurada nao e suportada pelo agente.
    expect(() =>
      service.discoverNews({
        runId: 'run-1',
        sourceType: 'rss' as never,
        limit: 3,
      }),
    ).toThrow('Unsupported curation source: rss');
  });
});
