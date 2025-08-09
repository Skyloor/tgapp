import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { User } from '../../models/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
