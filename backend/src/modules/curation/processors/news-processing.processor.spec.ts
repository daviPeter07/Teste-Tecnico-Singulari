import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NewsRepository } from '../../news/news.repository';
import { PreferencesRepository } from '../../preferences/preferences.repository';
import { NewsEnrichmentService } from '../enrichment/news-enrichment.service';
import { CurationRunDomain } from '../run/curation-run.domain';
import { CurationRepository } from '../run/curation.repository';
import { NewsProcessingProcessor } from './news-processing.processor';

jest.mock('../../news/news.repository', () => ({
  NewsRepository: class NewsRepository {},
}));

jest.mock('../../preferences/preferences.repository', () => ({
  PreferencesRepository: class PreferencesRepository {},
}));

jest.mock('../run/curation.repository', () => ({
  CurationRepository: class CurationRepository {},
}));

describe('NewsProcessingProcessor', () => {
  let processor: NewsProcessingProcessor;
  let curationRepository: jest.Mocked<
    Pick<
      CurationRepository,
      'registerSavedItem' | 'registerFailedItem' | 'finalizeRun'
    >
  >;
  let preferencesRepository: jest.Mocked<
    Pick<PreferencesRepository, 'findBySlug' | 'findFallback'>
  >;
  let newsRepository: jest.Mocked<Pick<NewsRepository, 'upsertCuratedNews'>>;
  let newsEnrichmentService: jest.Mocked<
    Pick<
      NewsEnrichmentService,
      'summarize' | 'detectSentiment' | 'extractEntities'
    >
  >;
  let curationRunDomain: jest.Mocked<
    Pick<CurationRunDomain, 'shouldFinalize' | 'getFinalStatus'>
  >;

  beforeEach(() => {
    curationRepository = {
      registerSavedItem: jest.fn(),
      registerFailedItem: jest.fn(),
      finalizeRun: jest.fn(),
    };
    preferencesRepository = {
      findBySlug: jest.fn(),
      findFallback: jest.fn(),
    };
    newsRepository = {
      upsertCuratedNews: jest.fn(),
    };
    newsEnrichmentService = {
      summarize: jest.fn(),
      detectSentiment: jest.fn(),
      extractEntities: jest.fn(),
    };
    curationRunDomain = {
      shouldFinalize: jest.fn(),
      getFinalStatus: jest.fn(),
    };

    processor = new NewsProcessingProcessor(
      curationRepository as unknown as CurationRepository,
      preferencesRepository as unknown as PreferencesRepository,
      newsRepository as unknown as NewsRepository,
      newsEnrichmentService as unknown as NewsEnrichmentService,
      curationRunDomain as unknown as CurationRunDomain,
    );
  });

  const createJob = (overrides: Partial<Job> = {}) =>
    ({
      name: 'process-news-item',
      data: {
        runId: 'run-1',
        sourceType: 'template',
        item: {
          title: 'AI article',
          sourceName: 'Tech Daily',
          sourceUrl: 'https://techdaily.example.com',
          url: 'https://techdaily.example.com/news/1',
          content: 'Google Cloud accelerates innovation in Backend systems.',
          publishedAt: '2026-06-26T12:00:00.000Z',
          categorySlug: 'backend',
        },
      },
      opts: { attempts: 3 },
      attemptsMade: 0,
      updateProgress: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    }) as unknown as Job;

  it('returns null and logs when BullMQ delivers an unknown child job name', async () => {
    // Garante seguranca quando um job filho desconhecido cai na fila por engano.
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    await expect(
      processor.process(createJob({ name: 'unknown-child-job' })),
    ).resolves.toBeNull();

    expect(warnSpy).toHaveBeenCalledWith(
      'Unknown news processing job received: unknown-child-job',
    );
    warnSpy.mockRestore();
  });

  it('saves curated news, tracks run progress and finalizes when all items are done', async () => {
    // Cobre o happy path completo: resolve categoria, resume, salva, atualiza progresso e finaliza o run.
    const job = createJob();
    preferencesRepository.findBySlug.mockResolvedValue({
      id: 'cat-1',
      slug: 'backend',
      name: 'Backend',
    } as never);
    newsEnrichmentService.summarize.mockResolvedValue('resumo pronto');
    newsEnrichmentService.detectSentiment.mockReturnValue('POSITIVE' as never);
    newsEnrichmentService.extractEntities.mockReturnValue(['Google Cloud'] as never);
    newsRepository.upsertCuratedNews.mockResolvedValue(undefined as never);
    curationRepository.registerSavedItem.mockResolvedValue({
      itemsQueued: 1,
      itemsProcessed: 1,
      itemsSaved: 1,
      itemsFailed: 0,
    } as never);
    curationRunDomain.shouldFinalize.mockReturnValue(true);
    curationRunDomain.getFinalStatus.mockReturnValue('COMPLETED' as never);
    curationRepository.finalizeRun.mockResolvedValue({
      itemsQueued: 1,
      itemsProcessed: 1,
    } as never);

    const result = await processor.process(job);

    expect(newsRepository.upsertCuratedNews).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'cat-1',
        summary: 'resumo pronto',
        entities: ['Google Cloud'],
      }),
    );
    expect(curationRepository.finalizeRun).toHaveBeenCalledWith(
      'run-1',
      'COMPLETED',
    );
    expect(job.updateProgress).toHaveBeenCalledWith(100);
    expect(result).toEqual({ runId: 'run-1', categorySlug: 'backend' });
  });

  it('falls back to the alphabetical category when the requested slug does not exist', async () => {
    // Garante fallback de categoria quando o slug da noticia nao existe no banco.
    const job = createJob();
    preferencesRepository.findBySlug.mockResolvedValue(null as never);
    preferencesRepository.findFallback.mockResolvedValue({
      id: 'cat-fallback',
      slug: 'artificial-intelligence',
      name: 'AI',
    } as never);
    newsEnrichmentService.summarize.mockResolvedValue('resumo pronto');
    newsEnrichmentService.detectSentiment.mockReturnValue('NEUTRAL' as never);
    newsEnrichmentService.extractEntities.mockReturnValue([] as never);
    newsRepository.upsertCuratedNews.mockResolvedValue(undefined as never);
    curationRepository.registerSavedItem.mockResolvedValue({
      itemsQueued: 2,
      itemsProcessed: 1,
    } as never);
    curationRunDomain.shouldFinalize.mockReturnValue(false);

    await processor.process(job);

    expect(preferencesRepository.findFallback).toHaveBeenCalled();
    expect(curationRepository.finalizeRun).not.toHaveBeenCalled();
  });

  it('registers a failed item on the last attempt and preserves the original processing error', async () => {
    // Cobre o esgotamento de retries, atualizando contadores e mantendo o erro original.
    const job = createJob({ attemptsMade: 2 });
    const processingError = new Error('db unavailable');

    preferencesRepository.findBySlug.mockResolvedValue({
      id: 'cat-1',
      slug: 'backend',
      name: 'Backend',
    } as never);
    newsEnrichmentService.summarize.mockResolvedValue('resumo pronto');
    newsEnrichmentService.detectSentiment.mockReturnValue('NEUTRAL' as never);
    newsEnrichmentService.extractEntities.mockReturnValue([] as never);
    newsRepository.upsertCuratedNews.mockRejectedValue(processingError);
    curationRepository.registerFailedItem.mockResolvedValue({
      itemsQueued: 4,
      itemsProcessed: 4,
      itemsSaved: 2,
      itemsFailed: 2,
    } as never);
    curationRunDomain.shouldFinalize.mockReturnValue(true);
    curationRunDomain.getFinalStatus.mockReturnValue('PARTIAL' as never);
    curationRepository.finalizeRun.mockResolvedValue({
      itemsQueued: 4,
      itemsProcessed: 4,
    } as never);

    await expect(processor.process(job)).rejects.toThrow('db unavailable');

    expect(curationRepository.registerFailedItem).toHaveBeenCalledWith(
      'run-1',
      'db unavailable',
    );
    expect(curationRepository.finalizeRun).toHaveBeenCalledWith(
      'run-1',
      'PARTIAL',
    );
    expect(job.updateProgress).toHaveBeenCalledWith(100);
  });

  it('does not mutate run counters on intermediate retries before the last attempt', async () => {
    // Evita contar a mesma falha varias vezes enquanto o BullMQ ainda esta tentando retry.
    const job = createJob({ attemptsMade: 0, opts: { attempts: 3 } as never });

    preferencesRepository.findBySlug.mockResolvedValue(null as never);
    preferencesRepository.findFallback.mockResolvedValue(null as never);

    await expect(processor.process(job)).rejects.toThrow(
      'No category available to persist curated news.',
    );

    expect(curationRepository.registerFailedItem).not.toHaveBeenCalled();
    expect(job.updateProgress).not.toHaveBeenCalled();
  });
});
