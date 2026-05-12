import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwtSecret')!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, banUntil: true },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.banUntil && user.banUntil > new Date()) {
      const ms = user.banUntil.getTime() - Date.now();
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      throw new ForbiddenException(
        `账号已被封禁，剩余 ${days} 天（至 ${user.banUntil.toISOString().slice(0, 10)}）`,
      );
    }

    return { id: user.id };
  }
}
