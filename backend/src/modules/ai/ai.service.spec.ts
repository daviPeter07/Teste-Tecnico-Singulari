import { AiProvider } from './providers/ai-provider.abstract';
import { AiService } from './ai.service';

describe('AiService', () => {
  it('delegates summarization to the provider selected by the module factory', async () => {
    // Garante que o AiService funciona como fachada fina e delega a logica ao provider selecionado.
    const provider: AiProvider = {
      name: 'mock',
      summarize: jest.fn().mockResolvedValue('provider-summary'),
    } as unknown as AiProvider;

    const service = new AiService(provider);

    await expect(service.summarize('raw content')).resolves.toBe(
      'provider-summary',
    );
    expect(provider.summarize).toHaveBeenCalledWith('raw content');
  });
});
