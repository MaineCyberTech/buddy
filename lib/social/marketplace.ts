import { ITEM_MAP } from '@/data/items';
import { Rarity } from '@/lib/generation/types';

export const MARKETPLACE_BUY_MARKUP = 1.5;
export const MARKETPLACE_SELL_DISCOUNT = 0.4;

export interface MarketListing {
  itemId: string;
  buyPrice: number;
  stock: number;
}

export function getBuyPrice(itemId: string): number {
  const def = ITEM_MAP.get(itemId);
  if (!def) return 10;
  return Math.max(1, Math.round(def.sellValue * MARKETPLACE_BUY_MARKUP));
}

export function getSellPrice(itemId: string): number {
  const def = ITEM_MAP.get(itemId);
  if (!def) return 1;
  return Math.max(1, Math.floor(def.sellValue * MARKETPLACE_SELL_DISCOUNT));
}

export function generateDailyStock(): MarketListing[] {
  const seed = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const rng = () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };

  const items = Array.from(ITEM_MAP.values());
  const listings: MarketListing[] = [];
  const pickCount = 8 + Math.floor(rng() * 7);

  const shuffled = [...items].sort(() => rng() - 0.5);
  for (let i = 0; i < Math.min(pickCount, shuffled.length); i++) {
    const item = shuffled[i];
    const maxStock = item.rarity === 'legendary' ? 1 : item.rarity === 'epic' ? 2 : item.rarity === 'rare' ? 3 : item.rarity === 'uncommon' ? 5 : 10;
    const stock = 1 + Math.floor(rng() * maxStock);
    listings.push({ itemId: item.id, buyPrice: getBuyPrice(item.id), stock });
  }
  return listings;
}
