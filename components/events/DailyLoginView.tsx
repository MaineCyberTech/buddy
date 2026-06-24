'use client';

import { useState, useCallback } from 'react';
import { DailyLoginState, checkDailyLogin, DAILY_REWARDS } from '@/lib/events';
import { useGameStore } from '@/lib/buddy/store';
import { SoundEngine } from '@/lib/sound';

interface DailyLoginViewProps {
  onBack: () => void;
}

export function DailyLoginView({ onBack }: DailyLoginViewProps) {
  const dailyLogin = useGameStore(s => s.dailyLogin);
  const setDailyLogin = useGameStore(s => s.setDailyLogin);
  const addCoins = useGameStore(s => s.addCoins);
  const addItem = useGameStore(s => s.addItem);
  const [claimed, setClaimed] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  const handleClaim = useCallback(() => {
    const { state, reward } = checkDailyLogin(dailyLogin);
    setDailyLogin(state);
    if (reward) {
      addCoins(reward.coins);
      SoundEngine.coin();
      if (reward.item) { addItem(reward.item, 1); SoundEngine.achievement(); }
      setRewardMsg(`Claimed! +${reward.coins} coins${reward.item ? ` + ${reward.item}` : ''}`);
    } else {
      setRewardMsg('Already claimed today! Come back tomorrow.');
    }
    setClaimed(true);
  }, [dailyLogin, setDailyLogin, addCoins, addItem]);

  const canClaim = !claimed && dailyLogin.lastLoginDate !== new Date().toISOString().slice(0, 10);
  const tomorrow = dailyLogin.streak > 0 ? DAILY_REWARDS[((dailyLogin.streak) % DAILY_REWARDS.length)] : DAILY_REWARDS[0];

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Daily Login</p>
      <div className="bg-lcd-dark rounded-sm p-3 text-center">
        <p className="text-lg lcd-text-accent">Day {dailyLogin.streak}</p>
        <p className="text-[10px] lcd-text opacity-50 mt-1">Streak: {dailyLogin.streak} day{dailyLogin.streak !== 1 ? 's' : ''}</p>
        <div className="flex justify-center gap-1 mt-2">
          {DAILY_REWARDS.slice(0, 7).map((r, i) => (
            <div key={i} className={`w-8 h-8 rounded-xs flex flex-col items-center justify-center text-[8px] ${dailyLogin.claimedDays.includes(i + 1) ? 'bg-lcd-accent text-black' : i + 1 === dailyLogin.streak + 1 ? 'border border-lcd-accent' : 'bg-[#1a1a2e] opacity-50'}`}>
              <span>{r.coins}</span>
              {r.item && <span className="text-[6px]">★</span>}
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleClaim} disabled={!canClaim} className="btn-device w-full py-3 text-sm rounded-md focus-ring">
        {canClaim ? 'CLAIM REWARD' : claimed ? 'CLAIMED' : 'COME BACK TOMORROW'}
      </button>
      {rewardMsg && <p className="text-xs lcd-text-accent text-center animate-fade-in">{rewardMsg}</p>}
      {tomorrow && (
        <div className="bg-[#1a1a2e] rounded-sm p-2">
          <p className="text-[10px] lcd-text opacity-50">Tomorrow&apos;s reward:</p>
          <p className="text-xs lcd-text-accent">{tomorrow.coins} coins{tomorrow.item ? ` + ${tomorrow.item}` : ''}</p>
        </div>
      )}
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
