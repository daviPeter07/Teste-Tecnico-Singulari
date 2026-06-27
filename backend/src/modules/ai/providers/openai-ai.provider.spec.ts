import { ConfigService } from '@nestjs/config';
import { OpenAiProvider } from './openai-ai.provider';

describe('OpenAiProvider', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('returns the OpenAI summary when the API answers with output_text', async () => {
    // Garante que o provider entende o formato principal de resposta da OpenAI.
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'ai.openAiApiKey') return 'openai-key';
        if (key === 'ai.openAiModel') return 'gpt-4o-mini';
        return undefined;
      }),
    } as unknown as ConfigService;

    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ output_text: 'resumo openai' }),
    } as never);

    const provider = new OpenAiProvider(configService);

    await expect(provider.summarize('conteudo')).resolves.toBe('resumo openai');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openai.com/v1/responses',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('falls back to the local summarizer when OpenAI is not configured', async () => {
    // Cobre o fluxo comum de desenvolvimento em que nao existe chave externa configurada.
    const configService = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    const provider = new OpenAiProvider(configService);
    const content =
      'Primeira frase com contexto suficiente para compor um resumo robusto sem depender da API externa. Segunda frase com mais detalhes relevantes para o leitor entender o assunto. Terceira frase que deve ficar de fora porque so existe para empurrar o texto acima do limite e validar o fallback.';

    const summary = await provider.summarize(content);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(summary).toContain('Primeira frase');
    expect(summary).toContain('Segunda frase');
    expect(summary).not.toContain('Terceira frase');
  });
});
