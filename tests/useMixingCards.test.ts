import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMixingCards, type NewMixingCard } from '../src/app/hooks/useMixingCards';

// Mock localStorage
const store: Record<string, string> = {};
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);

  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
  });

  // crypto.randomUUID for generating IDs
  let counter = 0;
  vi.stubGlobal('crypto', {
    randomUUID: () => `uuid-${++counter}`,
  });
});

const sampleCard: NewMixingCard = {
  type: 'icc',
  name: 'Test Red',
  searchHex: '#FF0000',
  notes: '',
  family: 'Mixing',
  match: {
    code: 'ICC-001',
    hex: '#FF1122',
    distance: 5.2,
    lines: [
      { ink: 'Red', percentage: 80, hex: 'FF0000' },
      { ink: 'White', percentage: 20, hex: 'FFFFFF' },
    ],
  },
  distance: 5.2,
};

describe('useMixingCards', () => {
  it('starts with empty cards', () => {
    const { result } = renderHook(() => useMixingCards());
    expect(result.current.cards).toEqual([]);
  });

  it('loads cards from localStorage on mount', () => {
    const existing = [{
      ...sampleCard,
      id: 'existing-1',
      createdAt: '2025-01-01T00:00:00.000Z',
    }];
    store['mixing-cards'] = JSON.stringify(existing);

    const { result } = renderHook(() => useMixingCards());
    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].id).toBe('existing-1');
  });

  it('saves a new card with generated id and timestamp', () => {
    const { result } = renderHook(() => useMixingCards());

    act(() => {
      result.current.saveCard(sampleCard);
    });

    expect(result.current.cards).toHaveLength(1);
    const card = result.current.cards[0];
    expect(card.id).toBe('uuid-1');
    expect(card.name).toBe('Test Red');
    expect(card.createdAt).toBeDefined();
    expect(typeof card.createdAt).toBe('string');

    // Verify persisted to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'mixing-cards',
      expect.stringContaining('Test Red')
    );
  });

  it('prepends new cards (most recent first)', () => {
    const { result } = renderHook(() => useMixingCards());

    act(() => {
      result.current.saveCard({ ...sampleCard, name: 'First' });
    });
    act(() => {
      result.current.saveCard({ ...sampleCard, name: 'Second' });
    });

    expect(result.current.cards).toHaveLength(2);
    expect(result.current.cards[0].name).toBe('Second');
    expect(result.current.cards[1].name).toBe('First');
  });

  it('updates a card name', () => {
    const { result } = renderHook(() => useMixingCards());

    act(() => {
      result.current.saveCard(sampleCard);
    });

    const id = result.current.cards[0].id;

    act(() => {
      result.current.updateCard(id, { name: 'Renamed Red' });
    });

    expect(result.current.cards[0].name).toBe('Renamed Red');
  });

  it('updates card notes', () => {
    const { result } = renderHook(() => useMixingCards());

    act(() => {
      result.current.saveCard(sampleCard);
    });

    const id = result.current.cards[0].id;

    act(() => {
      result.current.updateCard(id, { notes: 'Use for print job #42' });
    });

    expect(result.current.cards[0].notes).toBe('Use for print job #42');
  });

  it('deletes a card', () => {
    const { result } = renderHook(() => useMixingCards());

    act(() => {
      result.current.saveCard({ ...sampleCard, name: 'Keep' });
    });
    act(() => {
      result.current.saveCard({ ...sampleCard, name: 'Delete Me' });
    });

    const deleteId = result.current.cards[0].id; // most recent = "Delete Me"

    act(() => {
      result.current.deleteCard(deleteId);
    });

    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].name).toBe('Keep');
  });

  it('handles corrupt localStorage gracefully', () => {
    store['mixing-cards'] = 'not valid json{{{';

    const { result } = renderHook(() => useMixingCards());
    expect(result.current.cards).toEqual([]);
  });
});
