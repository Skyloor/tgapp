import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Match } from './match.entity.js';
import { User } from './user.entity.js';

@Entity('moves')
export class Move {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Match, m => m.moves, { onDelete: 'CASCADE' })
  match!: Match;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  made_by!: User;

  @Column({ type: 'int' })
  move_no!: number;

  @Column({ type: 'jsonb' })
  payload!: any;

  @CreateDateColumn()
  made_at!: Date;
}
