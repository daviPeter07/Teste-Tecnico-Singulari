import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CurationRunStatus } from '../../../../generated/prisma/enums';
import { QueueService } from '../../queue/queue.service';
import { CurationAgentService } from '../curation-agent.service';
import { CurationRepository } from '../curation.repository';
import { CurationRunProcessor } from './curation-run.processor';

jest.mock('../curation.repository', () => ({
  CurationRepository: class CurationRepository {},
}));

describe('CurationRunProcessor', () => {
  let processor: CurationRunProcessor;
  let curationRepository: jest.Mocked<
    Pick<
      CurationRepository,
      'markRunAsRunning' | 'updateRunAfterDiscovery' | 'markRunAsFailed'
    >
  >;
  let curationAgentService: jest.Mocked<
    Pick<CurationAgentService, 'discoverNews'>
  >;
  let queueService: jest.Mocked<
    Pick<QueueService, 'prepareNewsProcessingJobs' | 'enqueueNewsProcessingJobs'>
  >;

  beforeEach(() => {
    curationRepository = {
      markRunAsRunning: jest.fn(),
      updateRunAfterDiscovery: jest.fn(),
      markRunAsFailed: jest.fn(),
    };
    curationAgentService = {
      discoverNews: jest.fn(),
    };
    queueService = {
      prepareNewsProcessingJobs: jest.fn(),
      enqueueNewsProcessingJobs: jest.fn(),
    };

    processor = new CurationRunProcessor(
      curationRepository as unknown as CurationRepository,
      curationAgentService as unknown as CurationAgentService,
      queueService as unknown as QueueService,
    );
  });

  const createJob = (overrides: Partial<Job> = {}) =>
    ({
      name: 'request-curation-run',
      data: {
        runId: 'run-1',
        sourceType: 'template',
        limit: 2,
      },
      opts: { attempts: 3 },
      attemptsMade: 0,
      updateProgress: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    }) as unknown as Job;

  it('returns null and logs when BullMQ delivers an unknown parent job name', async () => {
    // Garante comportamento defensivo quando chega um job pai com nome desconhecido.
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    await expect(
      processor.process(createJob({ name: 'unknown-parent-job' })),
    ).resolves.toBeNull();

    expect(warnSpy).toHaveBeenCalledWith(
      'Unknown curation run job received: unknown-parent-job',
    );
    warnSpy.mockRestore();
  });

  it('short-circuits when the run was already finalized by a previous attempt', async () => {
    // Cobre retries idempotentes em que o run ja terminou e nao deve redisparar descoberta.
    curationRepository.markRunAsRunning.mockResolvedValue({
      status: CurationRunStatus.COMPLETED,
      finishedAt: new Date(),
      itemsQueued: 4,
    } as never);

    const result = await processor.process(createJob());

    expect(result).toEqual({
      runId: 'run-1',
      itemsQueued: 4,
      status: CurationRunStatus.COMPLETED,
    });
    expect(curationAgentService.discoverNews).not.toHaveBeenCalled();
  });

  it('discovers items, records queue counters and publishes child jobs on success', async () => {
    // Cobre o fluxo principal do worker: descoberta, contadores e fan-out para jobs filhos.
    const items = [
      {
        title: 'AI article',
        sourceName: 'Tech Daily',
        sourceUrl: 'https://techdaily.example.com',
        url: 'https://techdaily.example.com/1',
        content: 'content',
        publishedAt: '2026-06-26T12:00:00.000Z',
        categorySlug: 'artificial-intelligence',
      },
    ];
    const jobs = [{ runId: 'run-1', sourceType: 'template', item: items[0] }];
    const job = createJob();

    curationRepository.markRunAsRunning.mockResolvedValue({
      status: CurationRunStatus.RUNNING,
      finishedAt: null,
      itemsQueued: 0,
    } as never);
    curationAgentService.discoverNews.mockReturnValue(items as never);
    queueService.prepareNewsProcessingJobs.mockReturnValue(jobs as never);
    curationRepository.updateRunAfterDiscovery.mockResolvedValue({
      itemsQueued: 1,
    } as never);
    queueService.enqueueNewsProcessingJobs.mockResolvedValue([] as never);

    const result = await processor.process(job);

    expect(curationAgentService.discoverNews).toHaveBeenCalledWith(job.data);
    expect(curationRepository.updateRunAfterDiscovery).toHaveBeenCalledWith({
      runId: 'run-1',
      itemsFound: 1,
      itemsQueued: 1,
    });
    expect(queueService.enqueueNewsProcessingJobs).toHaveBeenCalledWith(jobs);
    expect(job.updateProgress).toHaveBeenCalledWith(100);
    expect(result).toEqual({ runId: 'run-1', itemsQueued: 1 });
  });

  it('marks the run as failed only on the last retry attempt and rethrows the original error', async () => {
    // Garante que o run so seja marcado como failed no ultimo retry, preservando o erro original.
    const job = createJob({ attemptsMade: 2 });
    const error = new Error('discovery failed');

    curationRepository.markRunAsRunning.mockRejectedValue(error);
    curationRepository.markRunAsFailed.mockResolvedValue(undefined as never);

    await expect(processor.process(job)).rejects.toThrow('discovery failed');

    expect(curationRepository.markRunAsFailed).toHaveBeenCalledWith(
      'run-1',
      'discovery failed',
    );
  });
});
