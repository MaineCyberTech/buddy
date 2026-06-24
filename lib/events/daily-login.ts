export interface DailyLoginState {
  lastLoginDate: string;
  streak: number;
  claimedDays: number[];
}

export const DAILY_REWARDS = [
  { day: 1, coins: 10, item: null },
  { day: 2, coins: 15, item: null },
  { day: 3, coins: 20, item: null },
  { day: 4, coins: 25, item: null },
  { day: 5, coins: 30, item: 'special_food' },
  { day: 6, coins: 35, item: null },
  { day: 7, coins: 50, item: 'lucky_coin' },
] as const;

export function initDailyLogin(): DailyLoginState {
  return { lastLoginDate: '', streak: 0, claimedDays: [] };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function checkDailyLogin(state: DailyLoginState): { state: DailyLoginState; reward: { coins: number; item: string | null } | null } {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const wasYesterday = state.lastLoginDate === yesterday;
  const alreadyClaimed = state.lastLoginDate === today;
  if (alreadyClaimed) return { state, reward: null };
  const newStreak = wasYesterday ? state.streak + 1 : 1;
  const dayIndex = ((newStreak - 1) % DAILY_REWARDS.length);
  const reward = DAILY_REWARDS[dayIndex];
  return {
    state: { ...state, lastLoginDate: today, streak: newStreak, claimedDays: [...state.claimedDays, newStreak] },
    reward: { coins: reward.coins, item: reward.item },
  };
}

export function getDailyRewardForStreak(streak: number): typeof DAILY_REWARDS[number] {
  const dayIndex = ((streak - 1) % DAILY_REWARDS.length);
  return DAILY_REWARDS[dayIndex];
}
