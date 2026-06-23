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