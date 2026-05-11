import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async wxLogin(code: string) {
    const { openid, unionid } = await this.code2session(code);

    let user = await this.prisma.user.findUnique({ where: { openid } });

    if (!user) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      user = await this.prisma.user.create({
        data: {
          openid,
          unionid,
          nickname: `养宠人_${randomSuffix}`,
          avatar: '/static/default-avatar.png',
        },
      });
    }

    const token = this.jwt.sign({ sub: user.id });

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  }

  private async code2session(code: string) {
    const appid = this.config.get<string>('wxAppid');
    const secret = this.config.get<string>('wxSecret');

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    const { data } = await axios.get(url);

    if (data.errcode) {
      this.logger.error(`code2session failed: ${data.errcode} ${data.errmsg}`);
      throw new UnauthorizedException('微信登录失败');
    }

    return {
      openid: data.openid as string,
      unionid: (data.unionid as string) || undefined,
    };
  }
}
