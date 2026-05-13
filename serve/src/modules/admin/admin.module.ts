import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminApiController } from './admin-api.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { ModerationModule } from '../moderation/moderation.module';
import { ReportModule } from '../report/report.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwtSecret')!,
        signOptions: { expiresIn: '24h' as const },
      }),
    }),
    ModerationModule,
    ReportModule,
  ],
  controllers: [AdminController, AdminApiController],
  providers: [AdminService, AdminGuard],
  exports: [AdminService, AdminGuard, JwtModule],
})
export class AdminModule implements OnModuleInit {
  constructor(private readonly adminService: AdminService) {}

  async onModuleInit() {
    await this.adminService.seed();
  }
}
