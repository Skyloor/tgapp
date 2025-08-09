import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../../models/room.entity.js';
import { User } from '../../models/user.entity.js';
import { LobbyService } from './lobby.service.js';
import { LobbyController } from './lobby.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User])],
  providers: [LobbyService],
  controllers: [LobbyController],
  exports: [LobbyService],
})
export class LobbyModule {}
