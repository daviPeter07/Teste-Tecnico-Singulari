import { ConfigService } from '@nestjs/config';
import { AnthropicAiProvider } from './anthropic-ai.provider';

describe('AnthropicAiProvider', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('joins Anthropic text blocks into a final summary', async () => {
    // Garante que o provider concatena corretamente os blocos de texto retornados pela Anthropic.
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'ai.anthropicApiKey') return 'anthropic-key';
        if (key === 'ai.anthropicModel') return 'claude-3-5-haiku-latest';
        return undefined;
      }),
    } as unknown as ConfigService;

    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        content: [
          { type: 'text', text: 'resumo' },
          { type: 'text', text: 'anthropic' },
        ],
      }),
    } as never);

    const provider = new AnthropicAiProvider(configService);

    await expect(provider.summarize('conteudo')).resolves.toBe('resumo anthropic');
  });

  it('falls back to the local summarizer when Anthropic is not configured', async () => {
    // Evita quebrar o pipeline quando o provider opcional nao esta configurado.
    const configService = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    const provider = new AnthropicAiProvider(configService);
    const summary = await provider.summarize(
      'Primeira frase com contexto suficiente para compor um resumo robusto sem depender da API externa. Segunda frase com mais detalhes relevantes para o leitor entender o assunto. Terceira frase fora do resumo porque so existe para empurrar o texto acima do limite e validar o fallback.',
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(summary).not.toContain('Terceira frase');
  });
});
