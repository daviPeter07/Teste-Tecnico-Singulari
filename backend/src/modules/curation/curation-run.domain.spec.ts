import { CurationRunStatus } from '../../../generated/prisma/enums';
import { CurationRunDomain } from './curation-run.domain';

describe('CurationRunDomain', () => {
  let domain: CurationRunDomain;

  beforeEach(() => {
    domain = new CurationRunDomain();
  });

  it('finalizes only when there is work queued and all queued items were processed', () => {
    // Garante que um run so finalize quando houver itens enfileirados e todos tiverem sido processados.
    expect(domain.shouldFinalize({ itemsQueued: 0, itemsProcessed: 0 })).toBe(
      false,
    );
    expect(domain.shouldFinalize({ itemsQueued: 5, itemsProcessed: 4 })).toBe(
      false,
    );
    expect(domain.shouldFinalize({ itemsQueued: 5, itemsProcessed: 5 })).toBe(
      true,
    );
  });

  it('marks the run as COMPLETED when no child item failed', () => {
    // Cobre o caminho ideal em que todos os itens descobertos foram salvos com sucesso.
    expect(domain.getFinalStatus({ itemsFailed: 0, itemsSaved: 5 })).toBe(
      CurationRunStatus.COMPLETED,
    );
  });

  it('marks the run as PARTIAL when some items failed but at least one was saved', () => {
    // Garante status PARTIAL quando ha sucesso parcial, sem mascarar o resultado final.
    expect(domain.getFinalStatus({ itemsFailed: 2, itemsSaved: 3 })).toBe(
      CurationRunStatus.PARTIAL,
    );
  });

  it('marks the run as FAILED when no item could be persisted', () => {
    // Representa o caso em que nenhum item foi salvo e a execucao falhou por completo.
    expect(domain.getFinalStatus({ itemsFailed: 2, itemsSaved: 0 })).toBe(
      CurationRunStatus.FAILED,
    );
  });
});
