import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private accessToken: string | null = null;
  private accessTokenExpiresAt = 0;

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

  async bindPhone(userId: string, code: string) {
    const phone = await this.getPhoneNumber(code);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phone },
    });

    return { phone: user.phone };
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

  private async getPhoneNumber(code: string): Promise<string> {
    const token = await this.getAccessToken();

    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${token}`,
      { code },
    );

    if (data.errcode) {
      this.logger.error(`getPhoneNumber failed: ${data.errcode} ${data.errmsg}`);
      throw new BadRequestException('获取手机号失败');
    }

    return data.phone_info.phoneNumber as string;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) {
      return this.accessToken;
    }

    const appid = this.config.get<string>('wxAppid');
    const secret = this.config.get<string>('wxSecret');

    const { data } = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
    );

    if (data.errcode) {
      this.logger.error(`getAccessToken failed: ${data.errcode} ${data.errmsg}`);
      throw new BadRequestException('获取 access_token 失败');
    }

    this.accessToken = data.access_token;
    this.accessTokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return this.accessToken!;
  }
}
