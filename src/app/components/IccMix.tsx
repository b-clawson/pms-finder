import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { ArrowLeft, Bookmark, Check } from 'lucide-react';
import { HexSearchBar } from './HexSearchBar';
import { PmsMatchList } from './PmsMatchList';
import { DistanceBadge } from './DistanceBadge';
import { useHexInput } from '../hooks/useHexInput';
import { useMixingCards } from '../hooks/useMixingCards';
import type { IccMatch } from '../types/icc';

interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

type WeightUnit = 'g' | 'kg' | 'lb';

// --- Exported ICC Formula Detail Component ---
export function IccFormulaDetailView({ match }: { match: IccMatch }) {
  const [totalWeight, setTotalWeight] = useState(1000);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('g');

  const totalPercent = match.lines.reduce((sum, l) => sum + l.percent, 0);

  const computeAmount = (pct: number) => {
    const raw = (pct / 100) * totalWeight;
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
          style={{ backgroundColor: match.hex || '#888' }}
        >
          <div className="text-white drop-shadow-md">
            <h2 className="text-2xl font-bold">{match.code}</h2>
            <p className="text-sm opacity-90">{match.name}</p>
          </div>
        </div>
        <div className="px-6 py-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="font-mono">{match.hex}</span>
          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-xs">ICC UltraMix</span>
          <span className="text-gray-400 text-xs">{match.family}</span>
        </div>
      </div>

      {/* Material Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium">Formula Lines</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {match.lines.length} components • Total: {totalPercent.toFixed(2)}%
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Part Number</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium text-right">Percentage</th>
                <th className="px-6 py-3 font-medium text-right">Weight</th>
                <th className="px-6 py-3 font-medium text-right">Calculated</th>
                <th className="px-6 py-3 font-medium">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {match.lines.map((line, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-xs">{line.part_number}</td>
                  <td className="px-6 py-3 font-medium">{line.name}</td>
                  <td className="px-6 py-3 text-right font-mono">{line.percent.toFixed(2)}%</td>
                  <td className="px-6 py-3 text-right font-mono">{line.weight.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right font-mono">
                    {formatWeight(computeAmount(line.percent))}
                  </td>
                  <td className="px-6 py-3">
                    {line.category && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-800">
                        {line.category}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
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

export function IccMix() {
  const [searchParams] = useSearchParams();
  const initialHex = searchParams.get('hex') || undefined;
  const hex = useHexInput(initialHex);
  const [family, setFamily] = useState('7500 Coated');

  const [searching, setSearching] = useState(false);
  const [pmsResults, setPmsResults] = useState<PMSMatch[]>([]);
  const [iccResults, setIccResults] = useState<IccMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState<IccMatch | null>(null);
  const [saved, setSaved] = useState(false);
  const { saveCard } = useMixingCards();
  const autoSearched = useRef(false);

  const handleSearch = useCallback(async () => {
    if (!hex.hexInput.trim() || !hex.isValid) return;

    setSearching(true);
    setError(null);
    setPmsResults([]);
    setIccResults([]);
    setHasSearched(true);
    setSelectedMatch(null);

    try {
      const [pmsRes, iccRes] = await Promise.all([
        fetch(`/api/pms?hex=${encodeURIComponent(hex.normalizedHex)}&series=BOTH&limit=5`),
        fetch(`/api/icc/match?hex=${encodeURIComponent(hex.normalizedHex)}&family=${encodeURIComponent(family)}&limit=10`),
      ]);

      const pmsData = await pmsRes.json();
      const iccData = await iccRes.json();

      if (pmsRes.ok && pmsData.results) {
        setPmsResults(pmsData.results);
      }

      if (iccRes.ok && Array.isArray(iccData)) {
        setIccResults(iccData);
      } else if (iccData.error) {
        setError(iccData.error);
      }
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setSearching(false);
    }
  }, [hex.hexInput, hex.isValid, hex.normalizedHex, family]);

  // Auto-search when navigated with ?hex= param
  useEffect(() => {
    if (initialHex && hex.isValid && hex.hexInput.trim() && !autoSearched.current) {
      autoSearched.current = true;
      handleSearch();
    }
  }, [initialHex, hex.isValid, hex.hexInput, handleSearch]);

  // Formula detail view (inline — no second fetch needed)
  if (selectedMatch) {
    const handleSave = () => {
      saveCard({
        type: 'icc',
        name: selectedMatch.code,
        searchHex: hex.normalizedHex,
        family,
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
            <h1 className="text-3xl mb-2">Color Mixing — ICC UltraMix</h1>
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

        <IccFormulaDetailView match={selectedMatch} />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Color Mixing — ICC UltraMix</h1>
        <p className="text-gray-600">
          Type a hex code to find closest PMS matches and ICC UltraMix formulas
        </p>
      </div>

      <HexSearchBar hexInput={hex} searching={searching} onSearch={handleSearch}>
        <div className="w-52">
          <label className="block text-sm text-gray-600 mb-2">Family</label>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            disabled={searching}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
          >
            <option value="7500 Coated">7500 Coated</option>
          </select>
        </div>
      </HexSearchBar>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {hasSearched && !searching && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PmsMatchList results={pmsResults} />

          {/* ICC UltraMix Matches */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Closest ICC UltraMix Colors</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {iccResults.length} results in {family}
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {iccResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No ICC formulas found
                </div>
              )}
              {iccResults.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedMatch(m)}
                >
                  <div
                    className="w-10 h-10 rounded-md border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: m.hex || '#888' }}
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
