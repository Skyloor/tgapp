import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, u => u.wallets, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ unique: true })
  address!: string;

  @CreateDateColumn()
  connected_at!: Date;
}
