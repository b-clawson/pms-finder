import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useHexInput } from './useHexInput';

interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

interface UseMixingSearchOptions {
  /** Build the vendor-specific API URL from a normalized hex */
  vendorUrl: (hex: string) => string;
  /** Additional values that should trigger a fresh search callback */
  extraDeps?: unknown[];
  /** If provided, auto-search waits until this returns true (e.g. series loaded) */
  readyForAutoSearch?: boolean;
}

export function useMixingSearch<T>({
  vendorUrl,
  extraDeps = [],
  readyForAutoSearch = true,
}: UseMixingSearchOptions) {
  const [searchParams] = useSearchParams();
  const initialHex = searchParams.get('hex') || undefined;
  const hex = useHexInput(initialHex);

  const [searching, setSearching] = useState(false);
  const [pmsResults, setPmsResults] = useState<PMSMatch[]>([]);
  const [vendorResults, setVendorResults] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pmsError, setPmsError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const autoSearched = useRef(false);

  const handleSearch = useCallback(async () => {
    if (!hex.hexInput.trim() || !hex.isValid) return;

    setSearching(true);
    setError(null);
    setPmsError(null);
    setPmsResults([]);
    setVendorResults([]);
    setHasSearched(true);

    try {
      await Promise.all([
        (async () => {
          try {
            const res = await fetch(`/api/pms?hex=${encodeURIComponent(hex.normalizedHex)}&series=BOTH&limit=5`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (data.results) setPmsResults(data.results);
          } catch {
            setPmsError('Failed to load PMS matches');
          }
        })(),
        (async () => {
          try {
            const res = await fetch(vendorUrl(hex.normalizedHex));
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
              setVendorResults(data);
            } else if (data.error) {
              setError(data.error);
            }
          } catch {
            setError('Network error — is the server running?');
          }
        })(),
      ]);
    } finally {
      setSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex.hexInput, hex.isValid, hex.normalizedHex, vendorUrl, ...extraDeps]);

  // Auto-search when navigated with ?hex= param
  useEffect(() => {
    if (initialHex && hex.isValid && hex.hexInput.trim() && readyForAutoSearch && !autoSearched.current) {
      autoSearched.current = true;
      handleSearch();
    }
  }, [initialHex, hex.isValid, hex.hexInput, readyForAutoSearch, handleSearch]);

  return {
    hex,
    searching,
    pmsResults,
    vendorResults,
    error,
    pmsError,
    hasSearched,
    handleSearch,
  };
}
