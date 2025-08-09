import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Wallet } from './wallet.entity.js';
import { Room } from './room.entity.js';
import { Match } from './match.entity.js';
import { Rating } from './rating.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  tg_id!: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Wallet, w => w.user)
  wallets!: Wallet[];

  @OneToMany(() => Room, r => r.creator)
  rooms!: Room[];

  @OneToMany(() => Match, m => m.a)
  matchesA!: Match[];

  @OneToMany(() => Match, m => m.b)
  matchesB!: Match[];

  @OneToMany(() => Rating, r => r.user)
  ratings!: Rating[];
}
