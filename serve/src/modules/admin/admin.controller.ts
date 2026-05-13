import { Body, Controller, ForbiddenException, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto.username, dto.password);
  }

  @Public()
  @Post('dev-login')
  async devLogin(@Query('userId') userId: string) {
    if (this.config.get<string>('nodeEnv') !== 'development') {
      throw new ForbiddenException('仅开发环境可用');
    }
    const token = this.jwt.sign({ sub: userId });
    return { token };
  }
}
