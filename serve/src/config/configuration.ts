export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  logLevel: string;
  wxAppid: string;
  wxSecret: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '8090', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  wxAppid: process.env.WX_APPID ?? '',
  wxSecret: process.env.WX_SECRET ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
});
