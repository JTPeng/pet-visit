import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SensitiveWordService } from './sensitive-word.service';
import { WxModerationService } from './wx-moderation.service';
import { ModerationService } from './moderation.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [SensitiveWordService, WxModerationService, ModerationService],
  exports: [ModerationService, SensitiveWordService],
})
export class ModerationModule {}
