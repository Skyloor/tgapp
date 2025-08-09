import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../../models/wallet.entity.js';

@Injectable()
export class WalletService {
  constructor(@InjectRepository(Wallet) private wallets: Repository<Wallet>) {}

  async status(userId: number) {
    const w = await this.wallets.findOne({ where: { user: { id: userId } } });
    return { connected: !!w, address: w?.address };
  }

  async connect(userId: number, address: string) {
    let w = await this.wallets.findOne({ where: { address } });
    if (!w) {
      w = this.wallets.create({ user: { id: userId } as any, address });
      await this.wallets.save(w);
    }
    return { connected: true, address: w.address };
  }
}
