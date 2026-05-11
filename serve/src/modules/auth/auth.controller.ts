import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { WxLoginDto } from './dto/wx-login.dto';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('wx-login')
  async wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.code);
  }

  @Post('bind-phone')
  async bindPhone(
    @CurrentUser() user: { id: string },
    @Body() dto: BindPhoneDto,
  ) {
    return this.authService.bindPhone(user.id, dto.code);
  }
}
