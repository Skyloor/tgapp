import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, u => u.ratings, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'varchar' })
  game!: 'RPS' | 'DURAK' | 'CHECKERS' | 'CHESS';

  @Column({ type: 'int', default: 1200 })
  elo!: number;

  @UpdateDateColumn()
  updated_at!: Date;
}
