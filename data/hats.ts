export const HATS = [
  'none',
  'crown',
  'bow',
  'cap',
  'beanie',
  'tophat',
  'flower',
  'star',
  'ribbon',
  'beret',
  'headband',
  'bandana',
  'party hat',
  'wizard hat',
  'pilot hat',
  'sailor hat',
  'helmet',
  'hood',
  'hoodie up',
  'antlers',
];

export const HAT_MAP = new Map<string, string>();
HATS.forEach((hat, i) => HAT_MAP.set(String(i), hat));

/**
 * Equipable item ids use the item catalogue vocabulary, while the generated
 * `identity.hat` field and the LCD renderer use hat-style names. This is the
 * single normalisation point between the two (USE-P2-002).
 */
export const ITEM_HAT_STYLES: Record<string, string> = {
  flower_crown: 'flower',
  tiny_glasses: 'glasses',
  adventurer_hat: 'pilot hat',
};

export function resolveHatStyle(hat: string): string {
  return ITEM_HAT_STYLES[hat] ?? hat;
}