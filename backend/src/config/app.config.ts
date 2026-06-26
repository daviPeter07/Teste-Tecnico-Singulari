export default () => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3333,
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },

  ai: {
    provider: process.env.AI_PROVIDER ?? 'mock',
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-haiku-latest',
  },
});
