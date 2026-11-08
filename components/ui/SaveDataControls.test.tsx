import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveDataControls } from '@/components/ui/SaveDataControls';
import { deleteSave, exportSave, loadGame, saveGame } from '@/lib/storage/indexeddb';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { GameSave } from '@/lib/generation/types';
import { SAVE_VERSION } from '@/lib/storage/schema';

function makeSave(guestId: string, nickname = 'TestBuddy'): GameSave {
  const buddy = createInitialBuddyState(guestId, nickname);
  return {
    version: SAVE_VERSION,
    buddy,
    guestId,
    createdAt: buddy.identity.generatedAt,
    updatedAt: Date.now(),
    inventory: { coins: 7, items: [{ id: 'apple', quantity: 1 }] },
  };
}

function makeFile(content: string, name: string): File {
  const file = new File([content], name, { type: 'text/plain' });
  if (typeof file.text !== 'function') {
    Object.defineProperty(file, 'text', { value: async () => content });
  }
  return file;
}

async function chooseFile(file: File) {
  fireEvent.change(screen.getByLabelText('Choose save file to import'), {
    target: { files: [file] },
  });
  await screen.findByRole('alertdialog', { name: 'Confirm save import' });
}

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeEach(async () => {
  await deleteSave();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:buddy-save'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  if (originalCreateObjectURL) {
    URL.createObjectURL = originalCreateObjectURL;
  } else {
    delete (URL as { createObjectURL?: unknown }).createObjectURL;
  }
  if (originalRevokeObjectURL) {
    URL.revokeObjectURL = originalRevokeObjectURL;
  } else {
    delete (URL as { revokeObjectURL?: unknown }).revokeObjectURL;
  }
  await deleteSave();
});

// FILE-P2-002: export/import must be reachable from the device UI.
describe('SaveDataControls', () => {
  it('shows the persisted buddy and downloads an export', async () => {
    await saveGame(makeSave('export-1', 'Exporty'));

    render(<SaveDataControls onImported={() => {}} />);

    expect(await screen.findByText(/Saved buddy: Exporty/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'EXPORT SAVE' }));

    expect(await screen.findByText('Save exported.')).toBeTruthy();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  });

  it('confirms, imports a backup, and invokes the reload callback', async () => {
    await saveGame(makeSave('source-guest', '日本語バディ 🌸'));
    const backup = await exportSave();

    await saveGame(makeSave('current-guest', 'Current'));
    const onImported = vi.fn();
    render(<SaveDataControls onImported={onImported} />);
    expect(await screen.findByText(/Saved buddy: Current/)).toBeTruthy();

    await chooseFile(makeFile(backup, 'buddy-save.txt'));
    fireEvent.click(screen.getByRole('button', { name: 'IMPORT & RELOAD' }));

    await waitFor(() => expect(onImported).toHaveBeenCalledTimes(1));
    const loaded = await loadGame();
    expect(loaded?.guestId).toBe('source-guest');
    expect(loaded?.buddy?.identity.nickname).toBe('日本語バディ 🌸');
  });

  it('shows an error and keeps the current save when the file is invalid', async () => {
    await saveGame(makeSave('keep-guest', 'Keeper'));
    const onImported = vi.fn();
    render(<SaveDataControls onImported={onImported} />);
    expect(await screen.findByText(/Saved buddy: Keeper/)).toBeTruthy();

    await chooseFile(makeFile('not a buddy save', 'broken.txt'));
    fireEvent.click(screen.getByRole('button', { name: 'IMPORT & RELOAD' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/not a valid Buddy save/);
    expect(onImported).not.toHaveBeenCalled();
    expect((await loadGame())?.guestId).toBe('keep-guest');
  });

  it('can cancel a selected import file', async () => {
    await saveGame(makeSave('cancel-guest', 'Canceller'));
    render(<SaveDataControls onImported={() => {}} />);
    expect(await screen.findByText(/Saved buddy: Canceller/)).toBeTruthy();

    await chooseFile(makeFile('anything', 'cancel.txt'));
    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
