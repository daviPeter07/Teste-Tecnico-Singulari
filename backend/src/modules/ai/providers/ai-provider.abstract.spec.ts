import { AiProvider } from './ai-provider.abstract';

class SuccessfulProvider extends AiProvider {
  readonly name = 'success';

  protected async doSummarize(content: string): Promise<string> {
    return `summary:${content}`;
  }
}

class FailingProvider extends AiProvider {
  readonly name = 'failure';

  protected async doSummarize(): Promise<string> {
    throw new Error('upstream failure');
  }
}

describe('AiProvider', () => {
  it('returns the provider result when the implementation succeeds', async () => {
    // Garante que o template method nao interfere quando o provider concreto funciona normalmente.
    const provider = new SuccessfulProvider();

    await expect(provider.summarize('conteudo')).resolves.toBe('summary:conteudo');
  });

  it('falls back to the local mock summarizer when the provider throws', async () => {
    // Cobre o fallback resiliente que mantem a curadoria funcionando quando a IA externa falha.
    const provider = new FailingProvider();
    const content =
      'Primeira frase bem longa para compor um resumo util e ainda estabelecer contexto suficiente para o leitor entender o assunto. Segunda frase igualmente importante para o leitor acompanhar o impacto da noticia no produto. Terceira frase que nao deve aparecer no fallback resumido porque ela so existe para passar do limite total.';

    const summary = await provider.summarize(content);

    expect(summary).toContain('Primeira frase');
    expect(summary).toContain('Segunda frase');
    expect(summary).not.toContain('Terceira frase');
  });
});
