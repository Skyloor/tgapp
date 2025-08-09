import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LobbyService } from './lobby.service.js';

@Controller('rooms')
export class LobbyController {
  constructor(private lobby: LobbyService) {}

  @Get()
  async list(@Query() q: any) {
    return this.lobby.list(q);
  }

  @Post()
  async create(@Body() body: any) {
    return this.lobby.create(body);
  }
}
