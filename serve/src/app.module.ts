import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FollowModule } from './modules/follow/follow.module';

@Module({
  imports: [ConfigModule, LoggerModule, PrismaModule, AuthModule, UserModule, FollowModule, HealthModule],
})
export class AppModule {}
