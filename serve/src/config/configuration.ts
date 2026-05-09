export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  logLevel: string;
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '8090', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  logLevel: process.env.LOG_LEVEL ?? 'info',
});
