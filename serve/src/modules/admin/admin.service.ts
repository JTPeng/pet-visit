import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const token = this.jwt.sign({ sub: admin.id, role: 'admin' });
    return { token };
  }

  async seed() {
    const existing = await this.prisma.admin.findUnique({
      where: { username: 'admin' },
    });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await this.prisma.admin.create({
        data: { username: 'admin', password: hashed },
      });
      console.log('Admin seed: created default admin (admin / admin123)');
    }
  }
}
