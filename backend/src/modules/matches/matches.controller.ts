import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MatchesService } from './matches.service.js';

@Controller('matches')
export class MatchesController {
  constructor(private matches: MatchesService) {}

  @Post(':id/deposit')
  async deposit(@Param('id') id: string) {
    return this.matches.depositPayload(Number(id));
  }

  @Post(':id/commit')
  async commit(@Param('id') id: string, @Body() body: any) {
    return this.matches.commit(Number(id), Number(body.userId), body.commit);
  }

  @Post(':id/reveal')
  async reveal(@Param('id') id: string, @Body() body: any) {
    return this.matches.reveal(Number(id), Number(body.userId), body.choice, body.salt);
  }

  @Post(':id/settle')
  async settle(@Param('id') id: string) {
    return this.matches.settle(Number(id));
  }
}
