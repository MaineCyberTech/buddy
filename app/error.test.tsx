import React from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { deleteSave } from '@/lib/storage/indexeddb';
import ErrorBoundary from './error';

vi.mock('@/lib/storage/indexeddb', () => ({
  deleteSave: vi.fn().mockResolvedValue(undefined),
}));

const mockedDeleteSave = vi.mocked(deleteSave);
const errorSpy = vi.spyOn(console, 'error');

describe('app/error Error boundary (OBS-P2-002)', () => {
  beforeEach(() => {
    mockedDeleteSave.mockClear();
    errorSpy.mockClear();
    errorSpy.mockImplementation(() => {});
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  it('renders a recoverable fallback and reports a structured error', () => {
    const error = Object.assign(new Error('boom'), { digest: 'abc123' });

    render(<ErrorBoundary error={error} reset={() => {}} />);

    expect(screen.getByText('SYSTEM FAULT')).toBeTruthy();
    expect(screen.getByText('TRY AGAIN')).toBeTruthy();
    expect(screen.getByText('RELOAD')).toBeTruthy();
    expect(screen.getByText('RESET SAVE')).toBeTruthy();

    const logged = errorSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(logged).toContain('"type":"error"');
    expect(logged).toContain('boom');
    expect(logged).toContain('abc123');
  });

  it('invokes reset when TRY AGAIN is clicked', () => {
    const reset = vi.fn();

    render(<ErrorBoundary error={new Error('boom')} reset={reset} />);
    fireEvent.click(screen.getByText('TRY AGAIN'));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('clears the save when RESET SAVE is clicked', async () => {
    render(<ErrorBoundary error={new Error('boom')} reset={() => {}} />);

    fireEvent.click(screen.getByText('RESET SAVE'));

    await waitFor(() => expect(mockedDeleteSave).toHaveBeenCalledTimes(1));
  });
});
