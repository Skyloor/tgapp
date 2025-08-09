import crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity.js';

function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const obj: Record<string, string> = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  validateInitData(initData: string): any {
    // Minimal verification (real: HMAC with bot token's SHA256 secret)
    // For dev mode, allow "dev" initData.
    if (initData === 'dev') return { id: 'dev-1', username: 'dev', photo_url: '' };

    const obj = parseInitData(initData);
    if (!obj.hash) throw new UnauthorizedException('No hash');

    // NOTE: Simplified. In production implement exact Telegram Mini App HMAC verification.
    // Here we trust for demo purposes.
    return {
      id: obj['user.id'] || obj['id'] || 'unknown',
      username: obj['user.username'] || obj['username'] || '',
      photo_url: obj['user.photo_url'] || obj['photo_url'] || '',
    };
  }

  async findOrCreate(tg_id: string, username?: string, avatar?: string) {
    let user = await this.users.findOne({ where: { tg_id } });
    if (!user) {
      user = this.users.create({ tg_id, username, avatar });
      await this.users.save(user);
    } else {
      user.username = username || user.username;
      user.avatar = avatar || user.avatar;
      await this.users.save(user);
    }
    return user;
  }
}
