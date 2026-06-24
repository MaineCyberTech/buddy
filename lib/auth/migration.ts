import { GameSave } from '@/lib/generation/types';
import { AuthUser } from './types';
import { LocalAuthService } from './local-auth-service';
import { saveGame, loadGame } from '@/lib/storage/indexeddb';
import { CloudSaveService } from './cloud-save-service';

export async function migrateGuestToAccount(
  guestId: string,
  email: string,
  username: string,
): Promise<{ user: AuthUser; migratedSave: GameSave | null }> {
  const user = await LocalAuthService.migrateFromGuest(guestId, email, username);

  const localSave = await loadGame();

  if (localSave) {
    const migratedSave: GameSave = {
      ...localSave,
      guestId: user.id,
      updatedAt: Date.now(),
    };
    await saveGame(migratedSave);
    await CloudSaveService.upload(migratedSave, user.id);
    return { user, migratedSave };
  }

  return { user, migratedSave: null };
}
