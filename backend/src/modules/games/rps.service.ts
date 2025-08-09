import crypto from 'crypto';
import { Injectable, BadRequestException } from '@nestjs/common';

export type RpsChoice = 'rock' | 'paper' | 'scissors';
type RoundResult = 'A' | 'B' | 'draw';

function judge(a: RpsChoice, b: RpsChoice): RoundResult {
  if (a === b) return 'draw';
  if (a === 'rock' && b === 'scissors') return 'A';
  if (a === 'paper' && b === 'rock') return 'A';
  if (a === 'scissors' && b === 'paper') return 'A';
  return 'B';
}

@Injectable()
export class RpsService {
  commit(choice: RpsChoice, salt: string) {
    const pre = `${choice}:${salt}`;
    return crypto.createHash('sha256').update(pre).digest('hex');
  }

  revealVerify(commit: string, choice: RpsChoice, salt: string) {
    const check = this.commit(choice, salt);
    if (check !== commit) throw new BadRequestException('Commit mismatch');
    return true;
  }

  bo3(results: RoundResult[]) {
    let a = 0, b = 0;
    for (const r of results) {
      if (r === 'A') a++; else if (r === 'B') b++;
      if (a === 2) return 'A';
      if (b === 2) return 'B';
    }
    return a === b ? 'draw' : (a > b ? 'A' : 'B');
  }

  judgeRound(a: RpsChoice, b: RpsChoice): RoundResult {
    return judge(a, b);
  }
}
