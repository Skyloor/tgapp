import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { TonConnectUIProvider, TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';

const API = import.meta.env.VITE_API || 'http://localhost:3000';

function useInitData() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const tg:any = (window as any).Telegram?.WebApp;
    const initData = tg?.initData || 'dev'; // dev fallback
    axios.post(`${API}/auth/tg`, { initData }).then(r => setUser(r.data.user));
  }, []);
  return user;
}

function WalletPane({ user }: { user:any }) {
  const [tonConnectUI] = useTonConnectUI();
  const [address, setAddress] = useState<string>('');
  useEffect(() => {
    const unsub = tonConnectUI.onStatusChange((w) => {
      const addr = w?.account?.address || '';
      setAddress(addr);
      if (addr) axios.post(`${API}/wallet/connect`, { userId: user.id, address: addr });
    });
    return () => unsub();
  }, [tonConnectUI, user?.id]);
  return (
    <div style={{display:'flex',gap:12,alignItems:'center'}}>
      <TonConnectButton />
      <div>{address ? `Wallet: ${address.slice(0,6)}...` : 'Not connected'}</div>
    </div>
  );
}

function Rooms({ user }: { user:any }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [stake, setStake] = useState(0.1);
  const load = () => axios.get(`${API}/rooms?game=RPS`).then(r => setRooms(r.data));
  useEffect(() => { load(); }, []);
  const create = async () => {
    await axios.post(`${API}/rooms`, { game: 'RPS', stake_nanotons: Math.floor(stake*1e9), creatorId: user.id, privacy:'PUBLIC', lang:'RU' });
    load();
  };
  return (
    <div style={{marginTop:16}}>
      <h3>Комнаты RPS</h3>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input type="number" step="0.1" value={stake} onChange={e => setStake(parseFloat(e.target.value))} />
        <button onClick={create}>Создать</button>
        <button onClick={load}>Обновить</button>
      </div>
      <ul>
        {rooms.map(r => <li key={r.id}>Room #{r.id} • stake {(Number(r.stake_nanotons)/1e9).toFixed(2)} TON • by @{r.creator?.username||r.creator?.tg_id}</li>)}
      </ul>
    </div>
  );
}

function RpsDemo({ user }: { user:any }) {
  const [matchId, setMatchId] = useState<number>(1);
  const [choice, setChoice] = useState<'rock'|'paper'|'scissors'>('rock');
  const [salt, setSalt] = useState<string>('' + Math.random().toString(36).slice(2));
  const [commit, setCommit] = useState<string>('');
  const deposit = async () => {
    const r = await axios.post(`${API}/matches/${matchId}/deposit`);
    alert('TonConnect payload for LOCK:\n' + JSON.stringify(r.data, null, 2));
  };
  const onCommit = async () => {
    if (!commit) { alert('Сначала вычислите commit'); return; }
    await axios.post(`${API}/matches/${matchId}/commit`, { userId: user.id, commit });
    alert('Commit записан');
  };
  const onReveal = async () => {
    await axios.post(`${API}/matches/${matchId}/reveal`, { userId: user.id, choice, salt });
    alert('Reveal записан');
  };
  const onSettle = async () => {
    const r = await axios.post(`${API}/matches/${matchId}/settle`);
    alert('TonConnect payload for SETTLE:\n' + JSON.stringify(r.data, null, 2));
  };
  const computeCommit = async () => {
    const pre = `${choice}:${salt}`;
    const hex = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pre)).then(buf => Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join(''));
    setCommit(hex);
  };
  return (
    <div style={{marginTop:16, borderTop:'1px solid #ccc', paddingTop:16}}>
      <h3>RPS bo3 — commit-reveal демо</h3>
      <div>matchId: <input type="number" value={matchId} onChange={e => setMatchId(parseInt(e.target.value))} style={{width:80}} /></div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
        <select value={choice} onChange={e => setChoice(e.target.value as any)}>
          <option value="rock">rock</option>
          <option value="paper">paper</option>
          <option value="scissors">scissors</option>
        </select>
        <input value={salt} onChange={e => setSalt(e.target.value)} placeholder="salt" />
        <button onClick={computeCommit}>Вычислить commit</button>
        <span style={{fontFamily:'monospace'}}>{commit ? commit.slice(0,10)+'…' : ''}</span>
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button onClick={deposit}>Deposit (LOCK)</button>
        <button onClick={onCommit}>Commit</button>
        <button onClick={onReveal}>Reveal</button>
        <button onClick={onSettle}>Settle</button>
      </div>
      <p style={{marginTop:8,fontSize:12,opacity:0.8}}>В реальном матче commit/reveal делают оба игрока; здесь демонстрация ручная.</p>
    </div>
  );
}

export default function App() {
  const manifestUrl = useMemo(() => `${window.location.origin}/tonconnect-manifest.json`, []);
  const user = useInitData();
  if (!user) return <div style={{padding:20}}>Loading…</div>;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <div style={{maxWidth:800, margin:'20px auto', padding:20}}>
        <h2>TON Games</h2>
        <p>Подключите TON-кошелёк через TonConnect, создайте комнату и сыграйте на TON. (RPS готов; остальные игры — скоро.)</p>
        <WalletPane user={user} />
        <Rooms user={user} />
        <RpsDemo user={user} />
      </div>
    </TonConnectUIProvider>
  );
}
