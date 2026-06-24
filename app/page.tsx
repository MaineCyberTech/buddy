'use client';

import { useEffect, useState } from 'react';
import { HatchFlow } from '@/components/hatch/HatchFlow';
import { MainDevice } from '@/components/device/MainDevice';
import { useGameStore } from '@/lib/buddy/store';
import { loadGame, hasSave } from '@/lib/storage/indexeddb';
import { startAutosave, stopAutosave } from '@/lib/storage/autosave';

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const { buddy, screen, setBuddy, setScreen } = useGameStore();

  useEffect(() => {
    const init = async () => {
      if (await hasSave()) {
        const save = await loadGame();
        if (save?.buddy) {
          setBuddy(save.buddy);
          if (save.inventory) {
            useGameStore.getState().setInventory(save.inventory);
          }
          setScreen('main');
        } else {
          setScreen('hatch');
        }
      } else {
        setScreen('hatch');
      }
      setLoaded(true);
      startAutosave(
        () => useGameStore.getState().buddy,
        () => useGameStore.getState().inventory,
        () => useGameStore.getState().guestId,
      );
    };
    init();
    return () => stopAutosave();
  }, [setBuddy, setScreen]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center lcd-screen" role="status" aria-live="polite">
        <div className="lcd-text-accent text-2xl animate-pulse">BOOTING...</div>
      </div>
    );
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