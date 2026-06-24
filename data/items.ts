import { ItemDefinition } from '@/lib/generation/types';

export const ITEMS: ItemDefinition[] = [
  { id: 'apple', name: 'Apple', category: 'food', rarity: 'common', description: 'A crisp red apple.', icon: '🍎', sellValue: 2, flavorText: 'Keeps the doctor away!' },
  { id: 'bread', name: 'Bread', category: 'food', rarity: 'common', description: 'A warm loaf of bread.', icon: '🍞', sellValue: 2, flavorText: 'Simple and filling.' },
  { id: 'fish', name: 'Fish', category: 'food', rarity: 'common', description: 'A fresh-caught fish.', icon: '🐟', sellValue: 3, flavorText: 'Omega-3 for a healthy buddy!' },
  { id: 'berries', name: 'Berry Bowl', category: 'food', rarity: 'common', description: 'Mixed wild berries.', icon: '🫐', sellValue: 3, flavorText: 'Sweet and tangy.' },
  { id: 'cake', name: 'Celebration Cake', category: 'food', rarity: 'rare', description: 'A fancy cake with frosting.', icon: '🎂', sellValue: 15, flavorText: 'For special occasions!' },
  { id: 'honey', name: 'Honey Pot', category: 'food', rarity: 'uncommon', description: 'Sweet golden honey.', icon: '🍯', sellValue: 8, flavorText: 'Buddies love this!' },
  { id: 'bandage', name: 'Bandage', category: 'medicine', rarity: 'common', description: 'A clean bandage wrap.', icon: '🩹', sellValue: 5, flavorText: 'Heals minor ouchies.' },
  { id: 'potion', name: 'Health Potion', category: 'medicine', rarity: 'uncommon', description: 'A glowing green potion.', icon: '🧪', sellValue: 20, flavorText: 'Restores vitality.' },
  { id: 'rubber_duck', name: 'Rubber Duck', category: 'toy', rarity: 'common', description: 'A squeaky rubber duck.', icon: '🐤', sellValue: 5, flavorText: '*squeak squeak*' },
  { id: 'yarn_ball', name: 'Yarn Ball', category: 'toy', rarity: 'common', description: 'A tangle of colorful yarn.', icon: '🧶', sellValue: 4, flavorText: 'Great for pouncing.' },
  { id: 'bouncy_ball', name: 'Bouncy Ball', category: 'toy', rarity: 'uncommon', description: 'A super bouncy ball.', icon: '⚾', sellValue: 8, flavorText: 'Boing boing boing!' },
  { id: 'puzzle_box', name: 'Puzzle Box', category: 'toy', rarity: 'rare', description: 'A tricky puzzle box.', icon: '🧩', sellValue: 20, flavorText: 'Keeps clever buddies busy.' },
  { id: 'feather_wand', name: 'Feather Wand', category: 'toy', rarity: 'uncommon', description: 'A wand with feathers.', icon: '🪶', sellValue: 10, flavorText: 'Irresistible to play with.' },
  { id: 'flower_crown', name: 'Flower Crown', category: 'hat', rarity: 'uncommon', description: 'A crown of wildflowers.', icon: '🌸', sellValue: 12, flavorText: 'Makes any buddy adorable.' },
  { id: 'tiny_glasses', name: 'Tiny Glasses', category: 'hat', rarity: 'rare', description: 'Adorable tiny spectacles.', icon: '👓', sellValue: 25, flavorText: 'Look smart!' },
  { id: 'adventurer_hat', name: 'Adventurer Hat', category: 'hat', rarity: 'epic', description: 'A hat for explorers.', icon: '🎩', sellValue: 40, flavorText: 'Ready for anything.' },
  { id: 'cozy_bed', name: 'Cozy Bed', category: 'decor', rarity: 'common', description: 'A soft little bed.', icon: '🛏️', sellValue: 15, flavorText: 'Sweet dreams guaranteed.', placementSlot: 'floor_left' },
  { id: 'flower_rug', name: 'Flower Rug', category: 'decor', rarity: 'common', description: 'A rug with embroidered flowers.', icon: '🌸', sellValue: 12, flavorText: 'Adds a touch of nature.', placementSlot: 'floor_right' },
  { id: 'cozy_armchair', name: 'Cozy Armchair', category: 'decor', rarity: 'uncommon', description: 'A plush armchair to snuggle in.', icon: '🪑', sellValue: 30, flavorText: 'Perfect for reading.', placementSlot: 'floor_left' },
  { id: 'lava_lamp', name: 'Lava Lamp', category: 'decor', rarity: 'uncommon', description: 'A groovy lava lamp.', icon: '💡', sellValue: 25, flavorText: 'Mesmerizing.', placementSlot: 'table' },
  { id: 'flower_vase', name: 'Flower Vase', category: 'decor', rarity: 'common', description: 'A glass vase with fresh flowers.', icon: '🏺', sellValue: 10, flavorText: 'Brightens the room.', placementSlot: 'table' },
  { id: 'tea_set', name: 'Tea Set', category: 'decor', rarity: 'uncommon', description: 'A delicate porcelain tea set.', icon: '🫖', sellValue: 20, flavorText: 'Time for a tea party!', placementSlot: 'table' },
  { id: 'stack_of_books', name: 'Stack of Books', category: 'decor', rarity: 'common', description: 'A tall stack of books.', icon: '📚', sellValue: 8, flavorText: 'Knowledge is power.', placementSlot: 'shelf' },
  { id: 'crystal_ball', name: 'Crystal Ball', category: 'decor', rarity: 'rare', description: 'A mysterious crystal ball.', icon: '🔮', sellValue: 40, flavorText: 'The future is hazy.', placementSlot: 'shelf' },
  { id: 'music_box', name: 'Music Box', category: 'decor', rarity: 'uncommon', description: 'A hand-cranked music box.', icon: '🎵', sellValue: 25, flavorText: 'Plays a gentle lullaby.', placementSlot: 'shelf' },
  { id: 'hanging_plant', name: 'Hanging Plant', category: 'decor', rarity: 'common', description: 'A trailing plant in a macrame hanger.', icon: '🌿', sellValue: 10, flavorText: 'Brings the outdoors in.', placementSlot: 'window' },
  { id: 'star_mobile', name: 'Star Mobile', category: 'decor', rarity: 'rare', description: 'Glow-in-the-dark stars.', icon: '⭐', sellValue: 35, flavorText: 'Constellations at home.', placementSlot: 'window' },
  { id: 'framed_photo', name: 'Framed Photo', category: 'decor', rarity: 'common', description: 'A frame with a buddy picture.', icon: '🖼️', sellValue: 8, flavorText: 'Cherished memories.', placementSlot: 'wall' },
  { id: 'wall_clock', name: 'Wall Clock', category: 'decor', rarity: 'common', description: 'A ticking wall clock.', icon: '🕐', sellValue: 10, flavorText: 'Time flies when having fun.', placementSlot: 'wall' },
  { id: 'fancy_chandelier', name: 'Fancy Chandelier', category: 'decor', rarity: 'epic', description: 'A sparkling crystal chandelier.', icon: '💎', sellValue: 60, flavorText: 'Fit for royalty.', placementSlot: 'wall' },
  { id: 'courage_book', name: 'Courage Manual', category: 'skill_book', rarity: 'uncommon', description: 'Teaches courage techniques.', icon: '📖', sellValue: 25, effect: 'courage', flavorText: 'Face your fears!' },
  { id: 'curiosity_book', name: 'Curiosity Encyclopedia', category: 'skill_book', rarity: 'uncommon', description: 'A book of wonders.', icon: '📚', sellValue: 25, effect: 'curiosity', flavorText: 'So many questions.' },
  { id: 'playfulness_book', name: 'Playfulness Guide', category: 'skill_book', rarity: 'uncommon', description: 'The art of having fun.', icon: '🎮', sellValue: 25, effect: 'playfulness', flavorText: 'Fun is serious business.' },
  { id: 'cloth', name: 'Soft Cloth', category: 'material', rarity: 'common', description: 'A soft piece of cloth.', icon: '🧵', sellValue: 3, flavorText: 'Useful for crafting.' },
  { id: 'wood', name: 'Wood Plank', category: 'material', rarity: 'common', description: 'A sturdy plank of wood.', icon: '🪵', sellValue: 4, flavorText: 'Smells like pine.' },
  { id: 'gem', name: 'Shiny Gem', category: 'material', rarity: 'rare', description: 'A sparkling gemstone.', icon: '💎', sellValue: 30, flavorText: 'So shiny!' },
  { id: 'feather', name: 'Magical Feather', category: 'material', rarity: 'uncommon', description: 'A glowing feather.', icon: '🪶', sellValue: 12, flavorText: 'Light as a dream.' },
  { id: 'lucky_coin', name: 'Lucky Coin', category: 'trinket', rarity: 'epic', description: 'An ancient lucky coin.', icon: '🪙', sellValue: 50, flavorText: 'Brings good fortune.' },
  { id: 'friendship_bracelet', name: 'Friendship Bracelet', category: 'trinket', rarity: 'uncommon', description: 'Woven with care.', icon: '📿', sellValue: 15, flavorText: 'Bond boost!' },
  { id: 'mysterious_egg', name: 'Mysterious Egg', category: 'quest', rarity: 'legendary', description: 'What could be inside?', icon: '🥚', sellValue: 0, flavorText: 'It vibrates gently.' },
  { id: 'treasure_map', name: 'Treasure Map', category: 'quest', rarity: 'rare', description: 'Marks an X on a special spot.', icon: '🗺️', sellValue: 0, flavorText: 'X marks the spot.' },
];

export const ITEM_MAP = new Map(ITEMS.map(i => [i.id, i]));

export const FOOD_ITEMS = ITEMS.filter(i => i.category === 'food');
export const TOY_ITEMS = ITEMS.filter(i => i.category === 'toy');
export const HAT_ITEMS = ITEMS.filter(i => i.category === 'hat');
export const DECOR_ITEMS = ITEMS.filter(i => i.category === 'decor');
export const MEDICINE_ITEMS = ITEMS.filter(i => i.category === 'medicine');
export const MATERIAL_ITEMS = ITEMS.filter(i => i.category === 'material');
export const SKILL_BOOK_ITEMS = ITEMS.filter(i => i.category === 'skill_book');