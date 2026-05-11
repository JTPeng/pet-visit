import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WxLoginDto } from './dto/wx-login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('wx-login')
  async wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.code);
  }
}
