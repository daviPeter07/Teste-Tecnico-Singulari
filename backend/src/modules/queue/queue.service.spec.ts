import { Queue } from 'bullmq';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;
  let curationRunQueue: jest.Mocked<Pick<Queue, 'add'>>;
  let newsProcessingQueue: jest.Mocked<Pick<Queue, 'addBulk'>>;

  beforeEach(() => {
    curationRunQueue = {
      add: jest.fn(),
    };
    newsProcessingQueue = {
      addBulk: jest.fn(),
    };

    service = new QueueService(
      curationRunQueue as unknown as Queue,
      newsProcessingQueue as unknown as Queue,
    );
  });

  it('publishes the parent curation job with retry and retention policies', async () => {
    // Verifica que o job pai usa um jobId estavel e configura retry e retencao corretamente.
    curationRunQueue.add.mockResolvedValue({ id: 'curation-run-run-1' } as never);

    await service.enqueueCurationRunJob({
      runId: 'run-1',
      sourceType: 'template',
      limit: 5,
    });

    expect(curationRunQueue.add).toHaveBeenCalledWith(
      'request-curation-run',
      {
        runId: 'run-1',
        sourceType: 'template',
        limit: 5,
      },
      expect.objectContaining({
        jobId: 'curation-run-run-1',
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 100,
      }),
    );
  });

  it('deduplicates child jobs by their computed stable id before bulk enqueueing', () => {
    // Garante que retries nao criem trabalho duplicado para a mesma noticia curada.
    const jobs = service.prepareNewsProcessingJobs([
      {
        runId: 'run-1',
        sourceType: 'template',
        item: {
          title: 'Same item',
          content: 'content',
          publishedAt: '2026-06-26T12:00:00.000Z',
          categorySlug: 'backend',
          url: 'https://example.com/news/1',
          sourceName: 'Example',
          sourceUrl: 'https://example.com',
        },
      },
      {
        runId: 'run-1',
        sourceType: 'template',
        item: {
          title: 'Same item',
          content: 'content',
          publishedAt: '2026-06-26T12:00:00.000Z',
          categorySlug: 'backend',
          url: 'https://example.com/news/1',
          sourceName: 'Example',
          sourceUrl: 'https://example.com',
        },
      },
    ]);

    expect(jobs).toHaveLength(1);
  });

  it('returns an empty array when there are no child jobs to enqueue', async () => {
    // Evita chamar o BullMQ com um bulk vazio quando nao ha itens para processar.
    await expect(service.enqueueNewsProcessingJobs([])).resolves.toEqual([]);
    expect(newsProcessingQueue.addBulk).not.toHaveBeenCalled();
  });

  it('sanitizes generated child job ids so BullMQ never receives colons from URLs', async () => {
    // Cobre o bug real em que URLs com https:// faziam o BullMQ rejeitar o jobId.
    newsProcessingQueue.addBulk.mockResolvedValue([] as never);

    await service.enqueueNewsProcessingJobs([
      {
        runId: 'run-1',
        sourceType: 'template',
        item: {
          title: 'AI article',
          content: 'content',
          publishedAt: '2026-06-26T12:00:00.000Z',
          categorySlug: 'artificial-intelligence',
          url: 'https://example.com/news/1',
          sourceName: 'Example',
          sourceUrl: 'https://example.com',
        },
      },
    ]);

    expect(newsProcessingQueue.addBulk).toHaveBeenCalledWith([
      expect.objectContaining({
        opts: expect.objectContaining({
          jobId: 'news-item-run-1-https-//example.com/news/1',
        }),
      }),
    ]);
  });
});
