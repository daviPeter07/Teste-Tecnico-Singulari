import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { NewsSentiment, PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined no ambiente de seed.');
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

const daysAgo = (days: number): Date => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

async function seedCategories() {
  const categories = [
    {
      name: 'Inteligência Artificial',
      slug: 'artificial-intelligence',
      description: 'Notícias sobre IA, LLMs, agentes inteligentes e automação.',
    },
    {
      name: 'Backend',
      slug: 'backend',
      description:
        'Notícias sobre APIs, arquitetura, bancos de dados e sistemas distribuídos.',
    },
    {
      name: 'Frontend',
      slug: 'frontend',
      description:
        'Notícias sobre interfaces, React, experiência do usuário e aplicações web.',
    },
    {
      name: 'Cloud',
      slug: 'cloud',
      description:
        'Notícias sobre computação em nuvem, deploy, escalabilidade e infraestrutura.',
    },
    {
      name: 'DevOps',
      slug: 'devops',
      description:
        'Notícias sobre CI/CD, observabilidade, containers e automação de infraestrutura.',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
      },
      // Desestruturação explícita para evitar injeção de propriedades não mapeadas na DML
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
  }
}

async function seedNews() {
  const news = [
    {
      title: 'Agentes de IA ganham espaço em produtos digitais',
      sourceName: 'Tech Daily',
      sourceUrl: 'https://techdaily.example.com',
      url: 'https://techdaily.example.com/news/ai-agents-products',
      content:
        'Empresas de tecnologia estão incorporando agentes de IA em produtos digitais para automatizar tarefas, responder usuários e auxiliar times internos em fluxos operacionais.',
      summary:
        'Agentes de IA estão sendo adotados em produtos digitais para automatizar tarefas e melhorar fluxos operacionais.',
      sentiment: NewsSentiment.POSITIVE,
      entities: ['OpenAI', 'Anthropic', 'Agentes de IA'],
      publishedAt: daysAgo(0),
      categorySlug: 'artificial-intelligence',
    },
    {
      title: 'NestJS se consolida como opção robusta para APIs escaláveis',
      sourceName: 'Backend Weekly',
      sourceUrl: 'https://backendweekly.example.com',
      url: 'https://backendweekly.example.com/news/nestjs-scalable-apis',
      content:
        'Times que trabalham com TypeScript têm adotado NestJS para organizar APIs REST, workers e serviços assíncronos usando módulos, providers, guards e pipes.',
      summary:
        'NestJS segue forte em projetos TypeScript por oferecer modularidade, injeção de dependência e boa organização para APIs.',
      sentiment: NewsSentiment.POSITIVE,
      entities: ['NestJS', 'TypeScript', 'APIs REST'],
      publishedAt: daysAgo(1),
      categorySlug: 'backend',
    },
    {
      title: 'React Server Components influenciam novas arquiteturas frontend',
      sourceName: 'Frontend Now',
      sourceUrl: 'https://frontendnow.example.com',
      url: 'https://frontendnow.example.com/news/react-server-components',
      content:
        'A adoção de React Server Components tem influenciado a forma como times frontend pensam cache, renderização, fetching e divisão de responsabilidades entre cliente e servidor.',
      summary:
        'React Server Components seguem influenciando decisões de arquitetura em aplicações modernas.',
      sentiment: NewsSentiment.NEUTRAL,
      entities: ['React', 'Next.js', 'Server Components'],
      publishedAt: daysAgo(3),
      categorySlug: 'frontend',
    },
    {
      title: 'Cloud Run ganha adoção em aplicações containerizadas',
      sourceName: 'Cloud Report',
      sourceUrl: 'https://cloudreport.example.com',
      url: 'https://cloudreport.example.com/news/cloud-run-containers',
      content:
        'Equipes estão utilizando serviços serverless para executar containers com menor carga operacional, especialmente em APIs e workers de processamento assíncrono.',
      summary:
        'Serviços serverless para containers reduzem carga operacional em APIs e workers.',
      sentiment: NewsSentiment.POSITIVE,
      entities: ['Google Cloud', 'Cloud Run', 'Docker'],
      publishedAt: daysAgo(6),
      categorySlug: 'cloud',
    },
    {
      title: 'Filas com Redis ajudam a desacoplar processamento de notícias',
      sourceName: 'Async Systems',
      sourceUrl: 'https://asyncsystems.example.com',
      url: 'https://asyncsystems.example.com/news/redis-queues-news-processing',
      content:
        'Sistemas baseados em filas permitem que produtores publiquem tarefas sem bloquear o fluxo principal, enquanto consumidores processam trabalhos em segundo plano.',
      summary:
        'Filas com Redis ajudam a processar tarefas em segundo plano e reduzem acoplamento entre serviços.',
      sentiment: NewsSentiment.POSITIVE,
      entities: ['Redis', 'BullMQ', 'Mensageria'],
      publishedAt: daysAgo(10),
      categorySlug: 'backend',
    },
    {
      title: 'Observabilidade se torna prioridade em times de produto',
      sourceName: 'DevOps Radar',
      sourceUrl: 'https://devopsradar.example.com',
      url: 'https://devopsradar.example.com/news/observability-product-teams',
      content:
        'Times de produto têm investido em logs estruturados, métricas e tracing para detectar falhas rapidamente e entender o comportamento real das aplicações em produção.',
      summary:
        'Observabilidade ganha prioridade com logs, métricas e tracing em aplicações modernas.',
      sentiment: NewsSentiment.NEUTRAL,
      entities: ['Grafana', 'Logs', 'Tracing'],
      publishedAt: daysAgo(18),
      categorySlug: 'devops',
    },
    {
      title:
        'Ferramentas de IA aceleram prototipação, mas exigem revisão técnica',
      sourceName: 'AI Engineering',
      sourceUrl: 'https://aiengineering.example.com',
      url: 'https://aiengineering.example.com/news/ai-prototyping-review',
      content:
        'Ferramentas de IA têm acelerado a criação de protótipos, mas especialistas alertam para a necessidade de revisão técnica, testes e validação arquitetural antes de levar soluções para produção.',
      summary:
        'IA acelera protótipos, mas ainda exige revisão técnica, testes e validação arquitetural.',
      sentiment: NewsSentiment.NEUTRAL,
      entities: ['IA Generativa', 'Testes', 'Arquitetura'],
      publishedAt: daysAgo(25),
      categorySlug: 'artificial-intelligence',
    },
    {
      title: 'Aplicações web antigas passam por modernização gradual',
      sourceName: 'Legacy Modernization',
      sourceUrl: 'https://legacymodernization.example.com',
      url: 'https://legacymodernization.example.com/news/web-app-modernization',
      content:
        'Empresas com sistemas legados têm adotado estratégias graduais de modernização, priorizando separação de módulos, melhoria de testes e redução de acoplamento.',
      summary:
        'Modernização gradual ajuda empresas a melhorar sistemas legados sem reescrever tudo do zero.',
      sentiment: NewsSentiment.POSITIVE,
      entities: ['Legacy', 'Refatoração', 'Arquitetura Modular'],
      publishedAt: daysAgo(40),
      categorySlug: 'frontend',
    },
  ];

  for (const item of news) {
    await prisma.news.upsert({
      where: {
        url: item.url,
      },
      update: {
        title: item.title,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        content: item.content,
        summary: item.summary,
        sentiment: item.sentiment,
        entities: item.entities,
        publishedAt: item.publishedAt,
        // Delegação da resolução relacional ao engine do Prisma
        category: {
          connect: { slug: item.categorySlug },
        },
      },
      create: {
        title: item.title,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        url: item.url,
        content: item.content,
        summary: item.summary,
        sentiment: item.sentiment,
        entities: item.entities,
        publishedAt: item.publishedAt,
        category: {
          connect: { slug: item.categorySlug },
        },
      },
    });
  }
}

async function main() {
  await seedCategories();
  await seedNews();
  console.log('Database seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Database seed failed.');
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
