import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('tg')
  async tg(@Body() body: any) {
    const { initData } = body;
    const tg = this.auth.validateInitData(initData);
    const user = await this.auth.findOrCreate(String(tg.id), tg.username, tg.photo_url);
    return { user };
  }
}
