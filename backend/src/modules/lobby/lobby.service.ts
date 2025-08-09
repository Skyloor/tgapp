import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../models/room.entity.js';
import { User } from '../../models/user.entity.js';

@Injectable()
export class LobbyService {
  constructor(
    @InjectRepository(Room) private rooms: Repository<Room>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  list(filters: any) {
    const qb = this.rooms.createQueryBuilder('r').leftJoinAndSelect('r.creator', 'creator').orderBy('r.id', 'DESC');
    if (filters.game) qb.andWhere('r.game = :game', { game: filters.game });
    if (filters.lang) qb.andWhere('r.lang = :lang', { lang: filters.lang });
    if (filters.privacy) qb.andWhere('r.privacy = :privacy', { privacy: filters.privacy });
    return qb.getMany();
  }

  async create(payload: any) {
    const creator = await this.users.findOneBy({ id: Number(payload.creatorId) });
    const room = this.rooms.create({
      game: payload.game,
      variant: payload.variant || {},
      stake_nanotons: String(payload.stake_nanotons),
      time_control: payload.time_control || 'N/A',
      privacy: payload.privacy || 'PUBLIC',
      lang: payload.lang || 'RU',
      creator: creator!,
    });
    return this.rooms.save(room);
  }
}
