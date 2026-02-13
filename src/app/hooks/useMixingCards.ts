import { useState, useEffect, useCallback } from 'react';
import type { MatsuiFormula } from '../types/matsui';
import type { GGMatch, GGFormulaDetail } from '../types/greengalaxy';
import type { FnInkMatch } from '../types/fnink';
import type { IccMatch } from '../types/icc';

type MixingCardBase = {
  id: string;
  createdAt: string;
  name: string;
  searchHex: string;
  notes: string;
};

type MatsuiCard = MixingCardBase & {
  type: 'matsui';
  series: string;
  formula: MatsuiFormula;
  resolvedHex: string;
  distance: number;
};

type GreenGalaxyCard = MixingCardBase & {
  type: 'greengalaxy';
  category: 'UD' | 'CD';
  match: GGMatch;
  formula: GGFormulaDetail;
  distance: number;
};

type FnInkCard = MixingCardBase & {
  type: 'fnink';
  match: FnInkMatch;
  distance: number;
};

type IccCard = MixingCardBase & {
  type: 'icc';
  family: string;
  match: IccMatch;
  distance: number;
};

export type MixingCard = MatsuiCard | GreenGalaxyCard | FnInkCard | IccCard;

const STORAGE_KEY = 'mixing-cards';

function loadCards(): MixingCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MixingCard[];
  } catch {
    return [];
  }
}

function persistCards(cards: MixingCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function useMixingCards() {
  const [cards, setCards] = useState<MixingCard[]>(loadCards);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCards(loadCards());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const saveCard = useCallback((card: Omit<MixingCard, 'id' | 'createdAt'>) => {
    setCards((prev) => {
      const newCard = {
        ...card,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      } as MixingCard;
      const next = [newCard, ...prev];
      persistCards(next);
      return next;
    });
  }, []);

  const updateCard = useCallback((id: string, fields: Partial<Pick<MixingCard, 'name' | 'notes'>>) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...fields } : c));
      persistCards(next);
      return next;
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistCards(next);
      return next;
    });
  }, []);

  return { cards, saveCard, updateCard, deleteCard };
}
