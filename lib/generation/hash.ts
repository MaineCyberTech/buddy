export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function hashCombine(...values: (string | number)[]): number {
  let hash = 0;
  for (const value of values) {
    const num = typeof value === 'string' ? hashString(value) : value;
    hash = ((hash << 5) - hash) + num;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateSeed(userId: string, salt: string = 'buddy-v2'): string {
  const combined = `${salt}:${userId}`;
  const hash = hashString(combined);
  return hash.toString(36).padStart(8, '0');
}

export function deriveSeeds(baseSeed: string, count: number): number[] {
  const seeds: number[] = [];
  for (let i = 0; i < count; i++) {
    seeds.push(hashCombine(baseSeed, i));
  }
  return seeds;
}