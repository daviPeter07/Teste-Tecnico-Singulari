import { NotFoundException } from '@nestjs/common';
import { QueueService } from '../../queue/queue.service';
import { CurationRepository } from './curation.repository';
import { CurationService } from './curation.service';

jest.mock('./curation.repository', () => ({
  CurationRepository: class CurationRepository {},
}));

describe('CurationService', () => {
  const run = {
    id: 'run-1',
    status: 'QUEUED',
    sourceType: 'template',
    itemsFound: 0,
    itemsQueued: 0,
    itemsProcessed: 0,
    itemsSaved: 0,
    itemsFailed: 0,
    startedAt: new Date('2026-06-26T12:00:00.000Z'),
  };

  let service: CurationService;
  let curationRepository: jest.Mocked<
    Pick<CurationRepository, 'createRun' | 'markRunAsFailed' | 'findRunById'>
  >;
  let queueService: jest.Mocked<Pick<QueueService, 'enqueueCurationRunJob'>>;

  beforeEach(() => {
    curationRepository = {
      createRun: jest.fn(),
      markRunAsFailed: jest.fn(),
      findRunById: jest.fn(),
    };
    queueService = {
      enqueueCurationRunJob: jest.fn(),
    };

    service = new CurationService(
      curationRepository as unknown as CurationRepository,
      queueService as unknown as QueueService,
    );
  });

  it('creates a queued run and publishes the parent job with default values', async () => {
    // Garante que a API consegue enfileirar a curadoria usando os valores padrao quando o body vem vazio.
    curationRepository.createRun.mockResolvedValue(run as never);
    queueService.enqueueCurationRunJob.mockResolvedValue({
      id: 'curation-run-run-1',
    } as never);

    const result = await service.run({});

    expect(curationRepository.createRun).toHaveBeenCalledWith('template');
    expect(queueService.enqueueCurationRunJob).toHaveBeenCalledWith({
      runId: run.id,
      sourceType: 'template',
      limit: 5,
    });
    expect(result.jobId).toBe('curation-run-run-1');
  });

  it('marks the run as failed if publishing to the queue throws', async () => {
    // Garante que a execucao fica como FAILED se o produtor nao conseguir publicar no BullMQ.
    curationRepository.createRun.mockResolvedValue(run as never);
    queueService.enqueueCurationRunJob.mockRejectedValue(
      new Error('redis down'),
    );

    await expect(
      service.run({ sourceType: 'template', limit: 3 }),
    ).rejects.toThrow('redis down');

    expect(curationRepository.markRunAsFailed).toHaveBeenCalledWith(
      run.id,
      'redis down',
    );
  });

  it('accepts local-json as a valid high-code source for the curation agent', async () => {
    // Garante que a API consegue enfileirar a fonte local-json como estrategia oficial do agente.
    curationRepository.createRun.mockResolvedValue({
      ...run,
      sourceType: 'local-json',
    } as never);
    queueService.enqueueCurationRunJob.mockResolvedValue({
      id: 'curation-run-run-1',
    } as never);

    await service.run({ sourceType: 'local-json', limit: 4 });

    expect(curationRepository.createRun).toHaveBeenCalledWith('local-json');
    expect(queueService.enqueueCurationRunJob).toHaveBeenCalledWith({
      runId: run.id,
      sourceType: 'local-json',
      limit: 4,
    });
  });

  it('fails when a requested run id does not exist', async () => {
    // Cobre o endpoint de status quando o cliente consulta um runId inexistente.
    curationRepository.findRunById.mockResolvedValue(null);

    await expect(service.findRunById('missing-run')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
