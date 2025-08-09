// Simplified Escrow contract (skeleton) for TON testnet
// Methods: LOCK, CANCEL, SETTLE, TIMEOUT_REFUND
// NOTE: This is a minimal illustrative Tact contract; harden before mainnet.

contract Escrow {
    owner: address;
    rakeAddress: address;
    rakePercent: int; // 5 = 5%

    matchStates: map<int, MatchState>;

    struct MatchState {
        a: address;
        b: address;
        stake: int;         // nanotons
        aLocked: bool;
        bLocked: bool;
        winner: address?;
        resultHash: slice?;
        timeoutAt: int;
    }

    init(owner: address, rakeAddress: address, rakePercent: int) {
        self.owner = owner;
        self.rakeAddress = rakeAddress;
        self.rakePercent = rakePercent;
        self.matchStates = map();
    }

    receive("LOCK", matchId: int, a: address, b: address, stake: int) {
        // Accept exact stake
        require(msg.value == stake, "bad value");
        let st = self.matchStates.get(matchId);
        if (st == null) {
            st = MatchState{ a: a, b: b, stake: stake, aLocked: false, bLocked: false, winner: null(), resultHash: null(), timeoutAt: now() + 600 };
        } else {
            // stake must match
            require(st?.stake == stake, "stake mismatch");
        }
        if (msg.sender == a) {
            st?.aLocked = true;
        } else if (msg.sender == b) {
            st?.bLocked = true;
        } else {
            throw(100);
        }
        self.matchStates.set(matchId, st?);
        // emit event-like via bounced message (for off-chain watcher)
    }

    receive("CANCEL", matchId: int) {
        let st = self.matchStates.get(matchId);
        require(st != null, "no match");
        // allow cancel only before both locked
        require(!(st?.aLocked && st?.bLocked), "already started");
        if (st?.aLocked) {
            send_raw_message(st?.a, st?.stake, 0);
        }
        if (st?.bLocked) {
            send_raw_message(st?.b, st?.stake, 0);
        }
        self.matchStates.delete(matchId);
    }

    receive("SETTLE", matchId: int, winner: address, resultHash: slice) {
        let st = self.matchStates.get(matchId);
        require(st != null, "no match");
        require(st?.aLocked && st?.bLocked, "not locked both");
        require(st?.winner == null(), "already settled");
        // Winner must be A or B
        require(winner == st?.a || winner == st?.b, "bad winner");
        let bank = st?.stake * 2;
        let rake = (bank * self.rakePercent) / 100;
        let payout = bank - rake;
        send_raw_message(winner, payout, 0);
        send_raw_message(self.rakeAddress, rake, 0);
        st?.winner = winner;
        st?.resultHash = resultHash;
        self.matchStates.set(matchId, st?);
    }

    receive("TIMEOUT_REFUND", matchId: int) {
        let st = self.matchStates.get(matchId);
        require(st != null, "no match");
        require(now() > st?.timeoutAt, "not timeout");
        // If only one locked, refund that one
        if (st?.aLocked && !st?.bLocked) {
            send_raw_message(st?.a, st?.stake, 0);
            self.matchStates.delete(matchId);
        } else if (!st?.aLocked && st?.bLocked) {
            send_raw_message(st?.b, st?.stake, 0);
            self.matchStates.delete(matchId);
        } else {
            // both locked => no refund here
            throw(201);
        }
    }
}
