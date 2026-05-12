import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AuthService } from '../auth/auth.service';

export interface WxCheckResult {
  pass: boolean;
  suggest?: 'pass' | 'review' | 'risky';
  label?: number;
  enabled: boolean;
}

@Injectable()
export class WxModerationService {
  private readonly logger = new Logger(WxModerationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  private get enabled(): boolean {
    return this.config.get<boolean>('moderationWxEnabled') === true;
  }

  async msgSecCheck(
    content: string,
    openid: string,
    scene: 1 | 2 | 3 | 4 = 2,
  ): Promise<WxCheckResult> {
    if (!this.enabled) {
      return { pass: true, enabled: false };
    }

    try {
      const token = await this.authService.getAccessToken();
      const { data } = await axios.post(
        `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${token}`,
        {
          version: 2,
          openid,
          scene,
          content,
        },
      );
      if (data.errcode !== 0) {
        this.logger.warn(`msgSecCheck failed: ${data.errcode} ${data.errmsg}`);
        return { pass: false, suggest: 'review', enabled: true };
      }
      const suggest = data.result?.suggest as 'pass' | 'review' | 'risky';
      return {
        pass: suggest === 'pass',
        suggest,
        label: data.result?.label,
        enabled: true,
      };
    } catch (err) {
      this.logger.error(`msgSecCheck error: ${(err as Error).message}`);
      return { pass: false, suggest: 'review', enabled: true };
    }
  }

  async imgSecCheck(mediaUrl: string): Promise<WxCheckResult> {
    if (!this.enabled) {
      return { pass: true, enabled: false };
    }

    try {
      const token = await this.authService.getAccessToken();
      const { data } = await axios.post(
        `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${token}`,
        { media_url: mediaUrl },
      );
      if (data.errcode !== 0) {
        this.logger.warn(`imgSecCheck failed: ${data.errcode} ${data.errmsg}`);
        return { pass: false, suggest: 'review', enabled: true };
      }
      return { pass: true, suggest: 'pass', enabled: true };
    } catch (err) {
      this.logger.error(`imgSecCheck error: ${(err as Error).message}`);
      return { pass: false, suggest: 'review', enabled: true };
    }
  }
}
