import { describe, it, expect } from 'vitest';
import { HAT_ITEMS } from '@/data/items';
import { HATS, ITEM_HAT_STYLES, resolveHatStyle } from '@/data/hats';

// USE-P2-002: item ids must normalise to a style the LCD renderer understands
// without polluting the generated-hat vocabulary.
describe('Hat item normalisation', () => {
  it('maps every equipable hat item to a renderable style', () => {
    for (const item of HAT_ITEMS) {
      expect(ITEM_HAT_STYLES[item.id], item.id).toBeTruthy();
      expect(resolveHatStyle(item.id)).not.toBe(item.id);
    }
  });

  it('keeps generated hat names unchanged', () => {
    for (const hat of HATS) {
      expect(resolveHatStyle(hat)).toBe(hat);
    }
  });

  it('maps the three catalogue hats explicitly', () => {
    expect(resolveHatStyle('flower_crown')).toBe('flower');
    expect(resolveHatStyle('tiny_glasses')).toBe('glasses');
    expect(resolveHatStyle('adventurer_hat')).toBe('pilot hat');
  });
});
