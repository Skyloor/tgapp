import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity.js';

export type GameType = 'RPS' | 'DURAK' | 'CHECKERS' | 'CHESS';
export type PrivacyType = 'PUBLIC' | 'PRIVATE';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  game!: GameType;

  @Column({ type: 'jsonb', default: {} })
  variant!: any;

  @Column({ type: 'bigint' })
  stake_nanotons!: string; // store as string

  @Column({ type: 'varchar', default: 'N/A' })
  time_control!: string;

  @Column({ type: 'varchar', default: 'PUBLIC' })
  privacy!: PrivacyType;

  @Column({ type: 'varchar', default: 'RU' })
  lang!: string;

  @ManyToOne(() => User, u => u.rooms, { eager: true, onDelete: 'CASCADE' })
  creator!: User;

  @CreateDateColumn()
  created_at!: Date;
}
