'use client';

import { useEffect, useState } from 'react';
import { HatchFlow } from '@/components/hatch/HatchFlow';
import { MainDevice } from '@/components/device/MainDevice';
import { SaveSlotSelection } from '@/components/ui/SaveSlotSelection';
import { useGameStore } from '@/lib/buddy/store';
import { loadGame, loadAllSlots, hasSave } from '@/lib/storage/indexeddb';
import { startAutosave, stopAutosave } from '@/lib/storage/autosave';

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [slots, setSlots] = useState<import('@/lib/generation/types').SaveSlotSummary[]>([]);
  const [showSlotSelection, setShowSlotSelection] = useState(false);
  const { buddy, screen, setBuddy, setScreen } = useGameStore();

  useEffect(() => {
    const init = async () => {
      const allSlots = await loadAllSlots();
      setSlots(allSlots);
      const hasAnySave = allSlots.some(s => s.buddy !== null);

      if (hasAnySave) {
        setShowSlotSelection(true);
      } else {
        setShowSlotSelection(true);
      }
      setLoaded(true);
    };
    init();
  }, []);

  const handleSelectSlot = async (slot: number) => {
    const save = await loadGame(slot);
    if (save?.buddy) {
      setBuddy(save.buddy);
      if (save.guestId) useGameStore.getState().setGuestId(save.guestId);
      if (save.inventory) useGameStore.getState().setInventory(save.inventory);
      if (save.placedDecor) useGameStore.getState().setPlacedDecor(save.placedDecor);
      if (save.speciesBook) useGameStore.getState().setSpeciesBook(save.speciesBook);
      if (save.loreJournal) useGameStore.getState().setLoreJournal(save.loreJournal);
      if (save.photoAlbum) useGameStore.getState().setPhotoAlbum(save.photoAlbum);
      if (save.minigameHighScores) useGameStore.getState().setMinigameHighScores(save.minigameHighScores);
      setScreen('main');
      setShowSlotSelection(false);
      startAutosave();
    }
  };

  const handleNewGame = (slot: number) => {
    setScreen('hatch');
    setShowSlotSelection(false);
    // The new game will use the guestId from store, and save to this slot
  };

  const startAutosave = () => {
    import('@/lib/storage/autosave').then(({ startAutosave: sa }) => {
      sa(
        () => useGameStore.getState().buddy,
        () => useGameStore.getState().inventory,
        () => useGameStore.getState().guestId,
        () => useGameStore.getState().placedDecor,
        () => useGameStore.getState().speciesBook,
        () => useGameStore.getState().loreJournal,
        () => useGameStore.getState().photoAlbum,
        () => useGameStore.getState().minigameHighScores,
      );
    });
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center lcd-screen" role="status" aria-live="polite">
        <div className="lcd-text-accent text-2xl animate-pulse">BOOTING...</div>
      </div>
    );
  }

  if (showSlotSelection) {
    return <SaveSlotSelection slots={slots} onSelectSlot={handleSelectSlot} onNewGame={handleNewGame} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {screen === 'hatch' && <HatchFlow />}
      {screen === 'main' && buddy && <MainDevice buddy={buddy} />}
      {screen === 'profile' && buddy && <MainDevice buddy={buddy} initialTab="profile" />}
      {screen === 'stats' && buddy && <MainDevice buddy={buddy} initialTab="stats" />}
    </div>
  );
}