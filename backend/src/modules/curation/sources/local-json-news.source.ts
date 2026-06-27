import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CuratedNewsItem } from '../../../common/contracts/curated-news-item.type';

type TechSignal = {
  slug: string;
  categorySlug: string;
  topic: string;
  signal: string;
  currentValue: number;
  previousValue: number;
  unit: string;
  impact: string;
  team: string;
  observedAt: string;
};

@Injectable()
export class LocalJsonNewsSource {
  generate(limit: number, seed: string): CuratedNewsItem[] {
    const signals = this.loadSignals();
    const baseTimestamp = this.createBaseTimestamp(seed);
    const orderedSignals = this.rotateSignalsBySeed(
      signals.sort((left, right) => {
        return this.getSignalScore(right) - this.getSignalScore(left);
      }),
      seed,
    );

    return orderedSignals.slice(0, limit).map((signal, index) => {
      const delta = signal.currentValue - signal.previousValue;
      const absoluteDelta = Math.abs(delta);
      const trendDirection = delta >= 0 ? 'alta' : 'queda';

      return {
        title: this.buildTitle(signal, delta, absoluteDelta),
        sourceName: 'Local Signals Lab',
        sourceUrl: 'file://tech-signals.json',
        url: `https://local-signals.example.com/insights/${signal.slug}-${seed}-${index + 1}`,
        content: `Uma analise local do time ${signal.team} mostrou ${trendDirection} em ${signal.signal}. O indicador saiu de ${signal.previousValue}${signal.unit} para ${signal.currentValue}${signal.unit} ao observar ${signal.topic}. ${signal.impact}`,
        publishedAt: new Date(baseTimestamp - index * 1000 * 60 * 60 * 4).toISOString(),
        categorySlug: signal.categorySlug,
      };
    });
  }

  private buildTitle(signal: TechSignal, delta: number, absoluteDelta: number) {
    if (delta >= 0) {
      return `${this.capitalize(signal.topic)} registram alta de ${absoluteDelta}${signal.unit} em analise local`;
    }

    return `${this.capitalize(signal.topic)} mostram queda de ${absoluteDelta}${signal.unit} em monitoramento interno`;
  }

  private getSignalScore(signal: TechSignal) {
    return Math.abs(signal.currentValue - signal.previousValue);
  }

  private rotateSignalsBySeed(signals: TechSignal[], seed: string) {
    if (signals.length === 0) {
      return [];
    }

    const startIndex = this.createSeedHash(seed) % signals.length;

    return [...signals.slice(startIndex), ...signals.slice(0, startIndex)];
  }

  private loadSignals(): TechSignal[] {
    const datasetPath = join(
      process.cwd(),
      'src',
      'modules',
      'curation',
      'sources',
      'data',
      'tech-signals.json',
    );

    return JSON.parse(readFileSync(datasetPath, 'utf-8')) as TechSignal[];
  }

  private createSeedHash(seed: string) {
    return seed.split('').reduce((accumulator, character) => {
      return accumulator + character.charCodeAt(0);
    }, 0);
  }

  private createBaseTimestamp(seed: string) {
    const now = new Date();
    const utcMidday = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      11,
      0,
      0,
    );

    return utcMidday - (this.createSeedHash(seed) % (12 * 60)) * 60_000;
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
