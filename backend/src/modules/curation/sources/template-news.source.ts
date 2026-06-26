import { Injectable } from '@nestjs/common';

type TemplateNewsItem = {
  title: string;
  sourceName: string;
  sourceUrl: string | null;
  url: string;
  content: string;
  publishedAt: Date;
  categorySlug: string;
};

@Injectable()
export class TemplateNewsSource {
  generate(limit: number): TemplateNewsItem[] {
    const now = Date.now();

    const templates: TemplateNewsItem[] = [
      {
        title:
          'Agentes de IA aceleram fluxos operacionais em produtos digitais',
        sourceName: 'Tech Daily',
        sourceUrl: 'https://techdaily.example.com',
        url: `https://techdaily.example.com/news/ai-agents-${now}-1`,
        content:
          'Empresas de tecnologia estão incorporando agentes de IA em produtos digitais para automatizar tarefas, melhorar produtividade interna e responder usuários com mais contexto.',
        publishedAt: new Date(now),
        categorySlug: 'artificial-intelligence',
      },
      {
        title:
          'Arquiteturas backend modernas priorizam filas e processamento assíncrono',
        sourceName: 'Backend Weekly',
        sourceUrl: 'https://backendweekly.example.com',
        url: `https://backendweekly.example.com/news/backend-queues-${now}-2`,
        content:
          'Times de backend têm adotado filas e workers para desacoplar o processamento pesado da camada HTTP e melhorar a escalabilidade de serviços críticos.',
        publishedAt: new Date(now - 1000 * 60 * 60 * 6),
        categorySlug: 'backend',
      },
      {
        title:
          'React e renderização híbrida seguem moldando novas aplicações web',
        sourceName: 'Frontend Now',
        sourceUrl: 'https://frontendnow.example.com',
        url: `https://frontendnow.example.com/news/react-hybrid-${now}-3`,
        content:
          'Aplicações modernas em React continuam combinando renderização no servidor, streaming e componentes interativos para melhorar performance e experiência do usuário.',
        publishedAt: new Date(now - 1000 * 60 * 60 * 12),
        categorySlug: 'frontend',
      },
      {
        title: 'Cloud Run e serviços serverless ganham espaço em workloads web',
        sourceName: 'Cloud Report',
        sourceUrl: 'https://cloudreport.example.com',
        url: `https://cloudreport.example.com/news/serverless-${now}-4`,
        content:
          'Workloads web e APIs leves têm migrado para ambientes serverless e containerizados para reduzir custo operacional e simplificar deploy.',
        publishedAt: new Date(now - 1000 * 60 * 60 * 18),
        categorySlug: 'cloud',
      },
      {
        title:
          'Observabilidade se torna critério central em pipelines de produção',
        sourceName: 'DevOps Radar',
        sourceUrl: 'https://devopsradar.example.com',
        url: `https://devopsradar.example.com/news/observability-${now}-5`,
        content:
          'Logs estruturados, métricas e tracing estão cada vez mais presentes em pipelines de produção para acelerar diagnóstico e reduzir tempo de resposta a incidentes.',
        publishedAt: new Date(now - 1000 * 60 * 60 * 24),
        categorySlug: 'devops',
      },
    ];

    return templates.slice(0, limit);
  }
}
