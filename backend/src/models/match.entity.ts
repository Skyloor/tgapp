import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity.js';
import { Room } from './room.entity.js';
import { Move } from './move.entity.js';

export type MatchStatus = 'CREATED' | 'DEPOSITING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Room, { eager: true, onDelete: 'SET NULL' })
  room!: Room;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  a!: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  b!: User;

  @Column({ type: 'varchar', default: 'CREATED' })
  status!: MatchStatus;

  @Column({ type: 'jsonb', default: {} })
  result!: any;

  @Column({ type: 'bytea', nullable: true })
  result_hash!: Buffer | null;

  @Column({ type: 'bigint', nullable: true })
  escrow_match_id!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Move, mv => mv.match)
  moves!: Move[];
}
