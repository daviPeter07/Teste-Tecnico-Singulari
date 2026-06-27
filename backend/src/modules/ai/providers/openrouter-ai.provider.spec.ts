import { ConfigService } from '@nestjs/config';
import { OpenRouterAiProvider } from './openrouter-ai.provider';

describe('OpenRouterAiProvider', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('returns the first choice message content from OpenRouter', async () => {
    // Garante parsing correto do formato chat-completions compativel com OpenAI usado pelo OpenRouter.
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'ai.openRouterApiKey') return 'openrouter-key';
        if (key === 'ai.openRouterModel')
          return 'google/gemini-2.0-flash-exp:free';
        return undefined;
      }),
    } as unknown as ConfigService;

    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'resumo openrouter' } }],
      }),
    });

    const provider = new OpenRouterAiProvider(configService);

    await expect(provider.summarize('conteudo')).resolves.toBe(
      'resumo openrouter',
    );
  });

  it('falls back to the local summarizer when OpenRouter is not configured', async () => {
    // Permite rodar desenvolvimento e CI sem depender de conta externa configurada.
    const configService = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    const provider = new OpenRouterAiProvider(configService);
    const summary = await provider.summarize(
      'Primeira frase com contexto suficiente para compor um resumo robusto sem depender da API externa. Segunda frase com mais detalhes relevantes para o leitor entender o assunto. Terceira frase fora do resumo porque so existe para empurrar o texto acima do limite e validar o fallback.',
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(summary).not.toContain('Terceira frase');
  });
});
