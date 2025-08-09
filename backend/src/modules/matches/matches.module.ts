import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../../models/match.entity.js';
import { Room } from '../../models/room.entity.js';
import { User } from '../../models/user.entity.js';
import { Move } from '../../models/move.entity.js';
import { MatchesService } from './matches.service.js';
import { MatchesController } from './matches.controller.js';
import { RpsService } from '../games/rps.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Room, User, Move])],
  providers: [MatchesService, RpsService],
  controllers: [MatchesController],
})
export class MatchesModule {}
