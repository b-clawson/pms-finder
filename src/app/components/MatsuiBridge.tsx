import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { hexToRgb, rgbDistance, cmykToHex } from '../utils/colorMath';
import type { MatsuiFormula, MatsuiSeries } from '../types/matsui';

interface MatsuiBridgeProps {
  targetHex: string | null;
  onClose: () => void;
}

interface ScoredFormula extends MatsuiFormula {
  distance: number;
}

export function MatsuiBridge({ targetHex, onClose }: MatsuiBridgeProps) {
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<MatsuiSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState('301 RC Neo');
  const [matches, setMatches] = useState<ScoredFormula[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load series once
  useEffect(() => {
    fetch('/api/matsui/series')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (s: MatsuiSeries) => s.seriesName.toLowerCase() !== 'test'
        );
        setSeries(filtered);
      })
      .catch(() => {});
  }, []);

  // Search when targetHex or series changes
  useEffect(() => {
    if (!targetHex) return;
    findClosest(targetHex, selectedSeries);
  }, [targetHex, selectedSeries]);

  async function findClosest(hex: string, seriesName: string) {
    setLoading(true);
    setError(null);
    setMatches([]);

    try {
      const res = await fetch('/api/matsui/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaSeries: seriesName,
          formulaSearchQuery: '',
          userCompany: '',
          selectedCompany: '',
          userEmail: '',
        }),
      });
      const formulas: MatsuiFormula[] = await res.json();

      if (!Array.isArray(formulas) || formulas.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const targetRgb = hexToRgb(hex);

      const scored: ScoredFormula[] = formulas
        .map((f) => {
          const fHex = f.formulaColor || '';
          if (!fHex || fHex.length < 6) return null;
          const fRgb = hexToRgb(fHex);
          return { ...f, distance: Math.round(rgbDistance(targetRgb, fRgb) * 100) / 100 };
        })
        .filter(Boolean) as ScoredFormula[];

      scored.sort((a, b) => a.distance - b.distance);
      setMatches(scored.slice(0, 5));
    } catch {
      setError('Failed to search Matsui formulas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!targetHex} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find Matsui Formula</DialogTitle>
          <DialogDescription>
            Closest Matsui ink formulas to{' '}
            <span className="font-mono font-semibold">{targetHex}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Target color preview + series picker */}
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-12 h-12 rounded-lg border border-gray-200"
            style={{ backgroundColor: targetHex || '#888' }}
          />
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Ink Series</label>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            >
              {series.map((s) => (
                <option key={s._id} value={s.seriesName}>
                  {s.seriesName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="text-center py-8 text-gray-500 text-sm">Searching formulas...</div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && matches.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No formulas found in {selectedSeries}
            </div>
          )}

          {matches.length > 0 && (
            <div className="space-y-2">
              {matches.map((m) => {
                const hex = `#${m.formulaColor}`;
                return (
                  <div
                    key={m._id || m.formulaCode}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-md border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{m.formulaCode}</div>
                      <div className="text-xs text-gray-500 truncate">{m.formulaDescription}</div>
                      <div className="text-xs text-gray-400 font-mono">{hex}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          m.distance < 20
                            ? 'bg-green-100 text-green-800'
                            : m.distance < 80
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {m.distance.toFixed(1)}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        {m.components.length} components
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
