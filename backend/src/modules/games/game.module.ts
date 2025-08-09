import { Module } from '@nestjs/common';
import { RpsService } from './rps.service.js';

@Module({
  providers: [RpsService],
  exports: [RpsService],
})
export class GameModule {}
