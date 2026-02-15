import { useState, useCallback } from 'react';
import { ArrowLeft, Bookmark, Check } from 'lucide-react';
import { HexSearchBar } from './HexSearchBar';
import { PmsMatchList } from './PmsMatchList';
import { DistanceBadge } from './DistanceBadge';
import { useMixingSearch } from '../hooks/useMixingSearch';
import { useMixingCards } from '../hooks/useMixingCards';
import type { FnInkMatch } from '../types/fnink';

type WeightUnit = 'g' | 'kg' | 'lb';

// --- Exported FN-INK Formula Detail Component ---
export function FnInkFormulaDetailView({ match }: { match: FnInkMatch }) {
  const [totalWeight, setTotalWeight] = useState(1000);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('g');

  const formula = match.formula;
  const totalParts = formula.materials.reduce((sum, m) => sum + m.amount, 0);

  const computeAmount = (materialAmount: number) => {
    const raw = (materialAmount / totalParts) * totalWeight;
    return Math.round(raw * 100) / 100;
  };

  const formatWeight = (value: number) => {
    if (value >= 1000 && weightUnit === 'g') return `${(value / 1000).toFixed(3)} kg`;
    return `${value.toFixed(2)} ${weightUnit}`;
  };

  return (
    <div className="space-y-6">
      {/* Color Banner */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div
          className="h-24 flex items-end px-6 pb-4"
          style={{ backgroundColor: match.hex }}
        >
          <div className="text-white drop-shadow-md">
            <h2 className="text-2xl font-bold">{match.code}</h2>
            <p className="text-sm opacity-90">{match.name}</p>
          </div>
        </div>
        <div className="px-6 py-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="font-mono">{match.hex}</span>
          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">FN-INK</span>
          {formula.multiplier !== 1 && (
            <span className="text-gray-400 text-xs">Multiplier: {formula.multiplier}x</span>
          )}
        </div>
      </div>

      {/* Material Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium">Materials</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {formula.materials.length} components
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Color</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-right">Percentage</th>
                <th className="px-6 py-3 font-medium text-right">Calculated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {formula.materials.map((m, i) => {
                const pct = totalParts > 0
                  ? ((m.amount / totalParts) * 100).toFixed(2)
                  : '0.00';
                const amount = totalParts > 0 ? computeAmount(m.amount) : 0;

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{m.material.name}</td>
                    <td className="px-6 py-3">
                      <div
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: m.material.hex || '#ccc' }}
                      />
                    </td>
                    <td className="px-6 py-3 text-right font-mono">{m.amount}</td>
                    <td className="px-6 py-3 text-right font-mono">{pct}%</td>
                    <td className="px-6 py-3 text-right font-mono">
                      {formatWeight(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quantity Calculator */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Quantity Calculator</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm text-gray-600 mb-2">Total Weight</label>
            <input
              type="number"
              value={totalWeight}
              onChange={(e) => setTotalWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent font-mono"
              min={0}
              step={10}
            />
          </div>
          <div className="w-32">
            <label className="block text-sm text-gray-600 mb-2">Unit</label>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            >
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Amounts in the table above update automatically
        </p>
      </div>
    </div>
  );
}

export function FnInkMix() {
  const vendorUrl = useCallback(
    (hex: string) => `/api/fnink/match?hex=${encodeURIComponent(hex)}&limit=10`,
    []
  );
  const { hex, searching, pmsResults, vendorResults: fninkResults, error, pmsError, hasSearched, handleSearch } =
    useMixingSearch<FnInkMatch>({ vendorUrl });

  const [selectedMatch, setSelectedMatch] = useState<FnInkMatch | null>(null);
  const [saved, setSaved] = useState(false);
  const { saveCard } = useMixingCards();

  // Formula detail view (inline — no second fetch needed)
  if (selectedMatch) {
    const handleSave = () => {
      saveCard({
        type: 'fnink',
        name: selectedMatch.code,
        searchHex: hex.normalizedHex,
        match: selectedMatch,
        distance: selectedMatch.distance,
        notes: '',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    return (
      <>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl mb-2">Color Mixing — FN-INK</h1>
            <p className="text-gray-600">Formula detail</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saved
                ? 'bg-green-100 text-green-800'
                : 'bg-[#0D9E7A] text-white hover:bg-[#0b8566]'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save to Cards'}
          </button>
        </div>

        <button
          onClick={() => setSelectedMatch(null)}
          className="flex items-center gap-2 text-[#0D9E7A] hover:text-[#0b8566] mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>

        <FnInkFormulaDetailView match={selectedMatch} />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Color Mixing — FN-INK</h1>
        <p className="text-gray-600">
          Type a hex code to find closest PMS matches and FN-INK formulas
        </p>
      </div>

      <HexSearchBar hexInput={hex} searching={searching} onSearch={handleSearch} />

      {/* Errors */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}
      {pmsError && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm mb-6">
          {pmsError}
        </div>
      )}

      {/* Results */}
      {hasSearched && !searching && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PmsMatchList results={pmsResults} />

          {/* FN-INK Matches */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Closest FN-INK Colors</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {fninkResults.length} results
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {fninkResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No FN-INK colors found
                </div>
              )}
              {fninkResults.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedMatch(m)}
                >
                  <div
                    className="w-10 h-10 rounded-md border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: m.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{m.code}</div>
                    <div className="text-xs text-gray-500 truncate">{m.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{m.hex}</div>
                  </div>
                  <DistanceBadge distance={m.distance} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
