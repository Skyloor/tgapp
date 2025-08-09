import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { WalletModule } from './wallet/wallet.module.js';
import { LobbyModule } from './lobby/lobby.module.js';
import { MatchesModule } from './matches/matches.module.js';
import { GameModule } from './games/game.module.js';
import { AdminModule } from './admin/admin.module.js';
import { User } from '../models/user.entity.js';
import { Wallet } from '../models/wallet.entity.js';
import { Room } from '../models/room.entity.js';
import { Match } from '../models/match.entity.js';
import { Move } from '../models/move.entity.js';
import { Rating } from '../models/rating.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
        entities: [User, Wallet, Room, Match, Move, Rating],
        synchronize: true, // NOTE: dev only
      }),
    }),
    AuthModule,
    WalletModule,
    LobbyModule,
    MatchesModule,
    GameModule,
    AdminModule,
  ],
})
export class AppModule {}
