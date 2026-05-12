import { Injectable, Logger } from '@nestjs/common';
import { SensitiveWordService } from './sensitive-word.service';
import { WxModerationService } from './wx-moderation.service';

export type ModerationVerdict = 'pass' | 'review' | 'reject';

export interface TextCheckResult {
  verdict: ModerationVerdict;
  reason?: string;
  matchedWords?: string[];
}

export interface ImageCheckResult {
  verdict: ModerationVerdict;
  reason?: string;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly sensitiveWord: SensitiveWordService,
    private readonly wx: WxModerationService,
  ) {}

  async checkText(content: string, openid?: string): Promise<TextCheckResult> {
    const local = this.sensitiveWord.check(content);
    if (!local.pass) {
      return {
        verdict: 'reject',
        reason: '内容包含敏感词',
        matchedWords: local.matched.map((m) => m.word),
      };
    }

    if (!openid) {
      return { verdict: 'pass' };
    }

    const wx = await this.wx.msgSecCheck(content, openid);
    if (!wx.enabled) {
      return { verdict: 'pass' };
    }

    if (wx.suggest === 'risky') {
      return { verdict: 'reject', reason: '内容违规' };
    }
    if (wx.suggest === 'review') {
      return { verdict: 'review', reason: '内容需人工复审' };
    }
    return { verdict: 'pass' };
  }

  async checkImage(mediaUrl: string): Promise<ImageCheckResult> {
    const wx = await this.wx.imgSecCheck(mediaUrl);
    if (!wx.enabled) {
      return { verdict: 'pass' };
    }
    if (wx.suggest === 'risky') {
      return { verdict: 'reject', reason: '图片违规' };
    }
    if (wx.suggest === 'review') {
      return { verdict: 'review', reason: '图片需人工复审' };
    }
    return { verdict: 'pass' };
  }
}
