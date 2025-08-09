import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WalletService } from './wallet.service.js';

@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get('status')
  async status(@Query('userId') userId: string) {
    return this.wallet.status(Number(userId));
  }

  @Post('connect')
  async connect(@Body() body: any) {
    const { userId, address } = body;
    return this.wallet.connect(Number(userId), address);
  }
}
