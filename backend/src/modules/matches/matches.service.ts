import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../models/match.entity.js';
import { Room } from '../../models/room.entity.js';
import { User } from '../../models/user.entity.js';
import { Move } from '../../models/move.entity.js';
import { RpsService } from '../games/rps.service.js';
import { beginCell } from '@ton/core';
import crypto from 'crypto';

function toNano(ton: number) { return BigInt(Math.floor(ton * 1e9)); }

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match) private matches: Repository<Match>,
    @InjectRepository(Room) private rooms: Repository<Room>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Move) private moves: Repository<Move>,
    private rps: RpsService,
  ) {}

  async create(roomId: number, aId: number, bId: number) {
    const room = await this.rooms.findOneBy({ id: roomId });
    const a = await this.users.findOneBy({ id: aId });
    const b = await this.users.findOneBy({ id: bId });
    if (!room || !a || !b) throw new BadRequestException('Not found');
    const match = this.matches.create({ room, a, b, status: 'DEPOSITING' });
    return this.matches.save(match);
  }

  buildLockPayload(matchId: number, aAddr: string, bAddr: string, stakeNano: bigint) {
    // op::LOCK = 0x4c4f434b
    const cell = beginCell()
      .storeUint(0x4c4f434b, 32) // "LOCK"
      .storeUint(BigInt(matchId), 64)
      .storeAddress({ toString: () => aAddr } as any)
      .storeAddress({ toString: () => bAddr } as any)
      .storeUint(stakeNano, 64)
      .endCell();
    return cell.toBoc().toString('base64');
  }

  buildSettlePayload(matchId: number, winnerAddr: string, resultHashHex: string) {
    // op::SETTLE = 0x53455454
    const rh = Buffer.from(resultHashHex.replace(/^0x/, ''), 'hex');
    const cell = beginCell()
      .storeUint(0x53455454, 32) // "SETT"
      .storeUint(BigInt(matchId), 64)
      .storeAddress({ toString: () => winnerAddr } as any)
      .storeRef(beginCell().storeBuffer(rh).endCell())
      .endCell();
    return cell.toBoc().toString('base64');
  }

  async depositPayload(matchId: number) {
    const match = await this.matches.findOne({ where: { id: matchId }, relations: ['room', 'a', 'b'] });
    if (!match) throw new BadRequestException('Match not found');
    const stake = BigInt(match.room.stake_nanotons);
    // In real flow, you would pass sender address dynamically.
    const payload = this.buildLockPayload(match.id, 'addressA', 'addressB', stake);
    return {
      to: process.env.ESCROW_ADDRESS,
      value: (stake).toString(),
      payload,
    };
  }

  async commit(matchId: number, userId: number, commitHex: string) {
    const match = await this.matches.findOneBy({ id: matchId });
    if (!match) throw new BadRequestException('Match not found');
    const moveNo = await this.moves.countBy({ match: { id: matchId } }) + 1;
    const mv = this.moves.create({ match: { id: matchId } as any, made_by: { id: userId } as any, move_no: moveNo, payload: { type: 'commit', commit: commitHex } });
    await this.moves.save(mv);
    return { ok: true };
  }

  async reveal(matchId: number, userId: number, choice: 'rock'|'paper'|'scissors', salt: string) {
    const moves = await this.moves.find({ where: { match: { id: matchId } }, order: { move_no: 'ASC' }});
    // Verify last commits exist; simplistic check for demo
    const myCommit = [...moves].reverse().find(m => m.made_by.id === userId && m.payload?.type === 'commit');
    if (!myCommit) throw new BadRequestException('No commit found');
    this.rps.revealVerify(myCommit.payload.commit, choice, salt);
    const mv = this.moves.create({ match: { id: matchId } as any, made_by: { id: userId } as any, move_no: moves.length + 1, payload: { type: 'reveal', choice, salt } });
    await this.moves.save(mv);
    return { ok: true };
  }

  async settle(matchId: number) {
    // Compute result hash from moves
    const moves = await this.moves.find({ where: { match: { id: matchId } }, order: { move_no: 'ASC' }});
    const data = JSON.stringify(moves.map(m => ({ u: m.made_by.id, p: m.payload })));
    const rh = crypto.createHash('sha256').update(String(matchId) + ':' + data).digest('hex');
    // winner demo (random or simple): here we just check last round if present
    // For demo: assume A is winner
    const winnerAddr = 'winnerAddress';
    const payload = this.buildSettlePayload(matchId, winnerAddr, rh);
    return {
      to: process.env.ESCROW_ADDRESS,
      value: '0',
      payload,
      resultHash: rh,
    };
  }
}
