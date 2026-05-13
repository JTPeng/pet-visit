import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('未登录');
    }

    try {
      const payload = this.jwt.verify(auth.slice(7));
      if (payload.role !== 'admin') {
        throw new UnauthorizedException('无管理员权限');
      }
      request.admin = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }
}
