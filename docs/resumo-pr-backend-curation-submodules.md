# Resumo do PR `refactor/backend-curation-submodules`

Este PR refatora o módulo de curadoria em submódulos coesos (`run/`, `sources/`, `enrichment/`, `processing/`), aplica ISP (Interface Segregation Principle) na camada de enriquecimento e adiciona suite completa de testes unitários (54 testes, 17 suites).

## O que entrou neste PR

### Separação do módulo de curadoria em submódulos

O antigo `CurationModule` monolítico foi dividido em 4 submódulos com responsabilidades claras:

```
curation/
├── run/           — domain, repository, controller, service (orquestração)
├── sources/       — agentes de descoberta de notícias (curation-agent, template-news)
├── enrichment/    — enriquecimento: sumarização, sentimento, entidades
└── processing/    — processors BullMQ (curation-run, news-processing)
```

Cada submódulo possui seu próprio `*.module.ts` com `imports`, `providers` e `exports` explícitos. O `CurationModule` root age como fachada, importando todos os submódulos.

Arquivos principais:
- `backend/src/modules/curation/run/run.module.ts`
- `backend/src/modules/curation/sources/sources.module.ts`
- `backend/src/modules/curation/enrichment/enrichment.module.ts`
- `backend/src/modules/curation/processing/processing.module.ts`
- `backend/src/modules/curation/curation.module.ts` — root que importa os 4 submódulos

### ISP (Interface Segregation Principle) na camada de enriquecimento

Foram criados contratos específicos para cada operação de enriquecimento, desacoplando o `NewsEnrichmentService` das implementações concretas:

Arquivos:
- `backend/src/modules/curation/enrichment/contracts/summarizer.contract.ts`
- `backend/src/modules/curation/enrichment/contracts/sentiment-analyzer.contract.ts`
- `backend/src/modules/curation/enrichment/contracts/entity-extractor.contract.ts`
- `backend/src/modules/curation/enrichment/enrichment.tokens.ts` — DI tokens (`SUMMARIZER`, `SENTIMENT_ANALYZER`, `ENTITY_EXTRACTOR`)

Mudanças:
- `AiService` implementa `SummarizerContract` e é injetado via token `SUMMARIZER`
- `RuleBasedSentimentAnalyzerService` implementa `SentimentAnalyzerContract` e é injetado via token `SENTIMENT_ANALYZER`
- `RegexEntityExtractorService` implementa `EntityExtractorContract` e é injetado via token `ENTITY_EXTRACTOR`
- `NewsEnrichmentService` virou uma fachada que depende apenas dos contratos, não das implementações

### Suite de testes unitários (54 testes, 17 suites)

Cobertura completa dos principais serviços e providers:

| Suite | Arquivo |
|---|---|
| AuthService | `auth/auth.service.spec.ts` |
| UsersService | `users/users.service.spec.ts` |
| QueueService | `queue/queue.service.spec.ts` |
| CurationService | `curation/run/curation.service.spec.ts` |
| CurationRunDomain | `curation/run/curation-run.domain.spec.ts` |
| CurationAgentService | `curation/sources/curation-agent.service.spec.ts` |
| TemplateNewsSource | `curation/sources/template-news.source.spec.ts` |
| NewsEnrichmentService | `curation/enrichment/news-enrichment.service.spec.ts` |
| RuleBasedSentimentAnalyzerService | `curation/enrichment/rule-based-sentiment-analyzer.service.spec.ts` |
| RegexEntityExtractorService | `curation/enrichment/regex-entity-extractor.service.spec.ts` |
| AiService | `ai/ai.service.spec.ts` |
| AiProvider (abstract) | `ai/providers/ai-provider.abstract.spec.ts` |
| OpenAiProvider | `ai/providers/openai-ai.provider.spec.ts` |
| AnthropicAiProvider | `ai/providers/anthropic-ai.provider.spec.ts` |
| OpenRouterAiProvider | `ai/providers/openrouter-ai.provider.spec.ts` |
| CurationRunProcessor | `curation/processing/curation-run.processor.spec.ts` |
| NewsProcessingProcessor | `curation/processing/news-processing.processor.spec.ts` |

Testes comentados em português. Configurado `--runInBand` para evitar concorrência com integração do BullMQ.

### Ajustes de configuração

- `backend/tsconfig.json` — adicionado `"types": ["node", "jest"]`
- `backend/package.json` — scripts `test` e `test:cov` com `--runInBand`
- `backend/README.md` — seção de testes atualizada

### Correções ao longo do desenvolvimento

- `WorkerModule` ajustado para importar `ProcessingModule` em vez do `CurationModule` completo
- Processors movidos do diretório `processors/` para `processing/` (consistência com nome do submódulo)
- Specs movidas do raiz `curation/` para seus respectivos submódulos
- Removido arquivo `.playwright-mcp/page-*.yml` commitado acidentalmente
- Types de mock simplificados (`as never` → tipos concretos) nos specs existentes
- Formatação de código ajustada (imports multilinha, quebras de linha)

## Commits deste PR

- `3eb09eb` `test(backend): add unit test coverage for curation, auth, queue, and AI`
- `b232db4` `refactor(backend): split curation into run, sources, enrichment, and processing modules`
- `63cdb8b` `refactor(backend): remove curation compatibility re-exports`
- `c51db39` `chore(backend): remove accidentally committed Playwright snapshot`
- `bcb1028` `refactor(backend): move processors into processing submodule`
- `4431f32` `test(backend): move specs to respective curation submodules`
- `57f43d0` `style(backend): fix formatting and simplify mock types in specs`

## Resultado final deste PR

Ao final deste PR, o módulo de curadoria passa a oferecer:

- arquitetura modular com 4 submódulos coesos (`run`, `sources`, `enrichment`, `processing`)
- contratos (ISP) na camada de enriquecimento — sumarização, sentimento e extração de entidades desacoplados das implementações
- 54 testes unitários (17 suites) comentados em português cobrindo todos os serviços, providers e processors
- configuração de testes com `--runInBand` e `"types": ["node", "jest"]`
- encapsulamento de módulo preservado (root `CurationModule` como fachada)
