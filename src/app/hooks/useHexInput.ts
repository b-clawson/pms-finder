import { useState, useEffect } from 'react';

const HEX_PATTERN = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

interface Swatch {
  pms: string;
  series: string;
  hex: string;
  name: string;
  notes: string;
}

// Module-level swatch cache — fetched once, reused across all instances
let swatchCache: Swatch[] | null = null;
let swatchPromise: Promise<Swatch[]> | null = null;

function fetchSwatches(): Promise<Swatch[]> {
  if (swatchCache) return Promise.resolve(swatchCache);
  if (swatchPromise) return swatchPromise;
  swatchPromise = fetch('/api/swatches')
    .then((res) => res.json())
    .then((data) => {
      swatchCache = data.swatches as Swatch[];
      return swatchCache;
    })
    .catch((err) => {
      console.warn('[useHexInput] Failed to fetch swatches:', err);
      swatchPromise = null;
      return [] as Swatch[];
    });
  return swatchPromise;
}

function stripPmsPrefix(input: string): string {
  return input.replace(/^(pantone|pms)\s*/i, '').trim();
}

function findSwatch(swatches: Swatch[], raw: string): Swatch | null {
  const cleaned = stripPmsPrefix(raw).toLowerCase();
  if (!cleaned) return null;

  // 1. Exact match on name (e.g. "185 C")
  const byName = swatches.find((s) => s.name.toLowerCase() === cleaned);
  if (byName) return byName;

  // 2. Match on pms field (e.g. "185") — first match (Coated preferred since they come first)
  const byPms = swatches.find((s) => s.pms.toLowerCase() === cleaned);
  if (byPms) return byPms;

  // 3. Partial: if user typed just a number, try matching pms field
  const byNumber = swatches.find((s) => s.pms === cleaned);
  if (byNumber) return byNumber;

  return null;
}

function looksLikePms(input: string): boolean {
  // Anything that isn't a valid hex could be a PMS code
  // But filter out truly empty or single-char garbage
  return input.length >= 1 && !HEX_PATTERN.test(input);
}

export function useHexInput(initialValue?: string) {
  const [hexInput, setHexInput] = useState(initialValue ?? '');
  const [previewColor, setPreviewColor] = useState('#FF6A00');
  const [isValid, setIsValid] = useState(true);
  const [resolvedFromPms, setResolvedFromPms] = useState<{ name: string; hex: string } | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const hex = hexInput.trim();

    if (hex === '') {
      setPreviewColor('#FF6A00');
      setIsValid(true);
      setResolvedFromPms(null);
      setResolving(false);
      return;
    }

    // Direct hex input
    if (HEX_PATTERN.test(hex)) {
      const color = hex.startsWith('#') ? hex : `#${hex}`;
      setPreviewColor(color);
      setIsValid(true);
      setResolvedFromPms(null);
      setResolving(false);
      return;
    }

    // Looks like it could be a PMS code
    if (looksLikePms(hex)) {
      // If we already have cached swatches, resolve synchronously
      if (swatchCache) {
        const match = findSwatch(swatchCache, hex);
        if (match) {
          const color = match.hex.startsWith('#') ? match.hex : `#${match.hex}`;
          setPreviewColor(color);
          setIsValid(true);
          setResolvedFromPms({ name: match.name, hex: color });
        } else {
          setIsValid(false);
          setResolvedFromPms(null);
        }
        setResolving(false);
        return;
      }

      // Need to fetch swatches
      setResolving(true);
      let cancelled = false;
      fetchSwatches().then((swatches) => {
        if (cancelled) return;
        const match = findSwatch(swatches, hex);
        if (match) {
          const color = match.hex.startsWith('#') ? match.hex : `#${match.hex}`;
          setPreviewColor(color);
          setIsValid(true);
          setResolvedFromPms({ name: match.name, hex: color });
        } else {
          setIsValid(false);
          setResolvedFromPms(null);
        }
        setResolving(false);
      });
      return () => { cancelled = true; };
    }

    setIsValid(false);
    setResolvedFromPms(null);
    setResolving(false);
  }, [hexInput]);

  const normalizedHex = (() => {
    if (resolvedFromPms) return resolvedFromPms.hex;
    const hex = hexInput.trim();
    return hex.startsWith('#') ? hex : `#${hex}`;
  })();

  return { hexInput, setHexInput, previewColor, isValid, normalizedHex, resolvedFromPms, resolving };
}
