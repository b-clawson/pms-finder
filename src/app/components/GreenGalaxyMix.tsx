import { useState, useEffect } from 'react';
import { Search, ArrowLeft, ExternalLink, Bookmark, Check } from 'lucide-react';
import { useMixingCards } from '../hooks/useMixingCards';
import type { GGMatch, GGFormulaDetail } from '../types/greengalaxy';

export type { GGMatch, GGFormulaDetail };

interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

type WeightUnit = 'g' | 'kg' | 'lb';

const CATEGORIES = [
  { value: 'UD', label: 'Uncoated Direct' },
  { value: 'CD', label: 'Coated Direct' },
];

// --- Exported GG Formula Detail Component ---
export function GGFormulaDetailView({ formula }: { formula: GGFormulaDetail }) {
  const [totalWeight, setTotalWeight] = useState(1000);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('g');

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
          style={{ backgroundColor: formula.color.hex }}
        >
          <div className="text-white drop-shadow-md">
            <h2 className="text-2xl font-bold">{formula.color.code}</h2>
            <p className="text-sm opacity-90">{formula.color.name}</p>
          </div>
        </div>
        <div className="px-6 py-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="font-mono">{formula.color.hex}</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
            {formula.color.category === 'UD' ? 'Uncoated Direct' : 'Coated Direct'}
          </span>
          {formula.comments && (
            <span className="text-gray-400 italic">{formula.comments}</span>
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
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Color</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium text-right">Percentage</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {formula.materials.map((m, i) => {
                const pct = totalParts > 0
                  ? ((m.amount / totalParts) * 100).toFixed(2)
                  : '0.00';
                const amount = totalParts > 0 ? computeAmount(m.amount) : 0;
                const matType = m.material.materialType || 'BASE';

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs">{m.material.code}</td>
                    <td className="px-6 py-3">
                      <div
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: m.material.hex || '#ccc' }}
                      />
                    </td>
                    <td className="px-6 py-3">
                      {m.material.url ? (
                        <a
                          href={m.material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0D9E7A] hover:underline inline-flex items-center gap-1"
                        >
                          {m.material.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        m.material.name
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-mono">{pct}%</td>
                    <td className="px-6 py-3 text-right font-mono">
                      {formatWeight(amount)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          matType === 'DYE'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {matType}
                      </span>
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

export function GreenGalaxyMix() {
  const [hexInput, setHexInput] = useState('');
  const [previewColor, setPreviewColor] = useState('#FF6A00');
  const [isValid, setIsValid] = useState(true);
  const [category, setCategory] = useState('UD');

  const [searching, setSearching] = useState(false);
  const [pmsResults, setPmsResults] = useState<PMSMatch[]>([]);
  const [ggResults, setGgResults] = useState<GGMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState<GGMatch | null>(null);
  const [formulaDetail, setFormulaDetail] = useState<GGFormulaDetail | null>(null);
  const [formulaLoading, setFormulaLoading] = useState(false);
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { saveCard } = useMixingCards();

  // Validate hex input
  useEffect(() => {
    const hex = hexInput.trim();
    if (hex === '') {
      setPreviewColor('#FF6A00');
      setIsValid(true);
      return;
    }
    const hexPattern = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    if (hexPattern.test(hex)) {
      setPreviewColor(hex.startsWith('#') ? hex : `#${hex}`);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [hexInput]);

  const handleSearch = async () => {
    const hex = hexInput.trim();
    if (!hex || !isValid) return;

    const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;
    setSearching(true);
    setError(null);
    setPmsResults([]);
    setGgResults([]);
    setHasSearched(true);
    setSelectedMatch(null);
    setFormulaDetail(null);

    try {
      const [pmsRes, ggRes] = await Promise.all([
        fetch(`/api/pms?hex=${encodeURIComponent(normalizedHex)}&series=BOTH&limit=5`),
        fetch(`/api/gg/match?hex=${encodeURIComponent(normalizedHex)}&category=${category}&limit=10`),
      ]);

      const pmsData = await pmsRes.json();
      const ggData = await ggRes.json();

      if (pmsRes.ok && pmsData.results) {
        setPmsResults(pmsData.results);
      }

      if (ggRes.ok && Array.isArray(ggData)) {
        setGgResults(ggData);
      } else if (ggData.error) {
        setError(ggData.error);
      }
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectFormula = async (match: GGMatch) => {
    setSelectedMatch(match);
    setFormulaLoading(true);
    setFormulaError(null);
    setFormulaDetail(null);

    try {
      const res = await fetch(
        `/api/gg/formula?code=${encodeURIComponent(match.code)}&category=${category}`
      );
      const data = await res.json();
      if (res.ok) {
        setFormulaDetail(data);
      } else {
        setFormulaError(data.error || 'Failed to load formula');
      }
    } catch {
      setFormulaError('Network error loading formula');
    } finally {
      setFormulaLoading(false);
    }
  };

  // Formula detail view
  if (selectedMatch && (formulaDetail || formulaLoading || formulaError)) {
    const hex = hexInput.trim();
    const searchHex = hex.startsWith('#') ? hex : `#${hex}`;

    const handleSave = () => {
      if (!formulaDetail) return;
      saveCard({
        type: 'greengalaxy',
        name: selectedMatch.code,
        searchHex,
        category: category as 'UD' | 'CD',
        match: selectedMatch,
        formula: formulaDetail,
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
            <h1 className="text-3xl mb-2">Color Mixing — Green Galaxy</h1>
            <p className="text-gray-600">Formula detail</p>
          </div>
          {formulaDetail && (
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
          )}
        </div>

        <button
          onClick={() => {
            setSelectedMatch(null);
            setFormulaDetail(null);
          }}
          className="flex items-center gap-2 text-[#0D9E7A] hover:text-[#0b8566] mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>

        {formulaLoading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            Loading formula...
          </div>
        )}

        {formulaError && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            {formulaError}
          </div>
        )}

        {formulaDetail && <GGFormulaDetailView formula={formulaDetail} />}
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Color Mixing — Green Galaxy</h1>
        <p className="text-gray-600">
          Type a hex code to find closest PMS matches and GG Fusion ink formulas
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-end gap-4">
          {/* Hex Input */}
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2">HEX Color</label>
            <div className="relative flex items-center">
              <div
                className="absolute left-3 w-[38px] h-[38px] rounded-md border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: isValid ? previewColor : '#e5e7eb' }}
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="#FF6A00"
                className="w-full pl-[54px] pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent font-mono"
                disabled={searching}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {hexInput.trim() === ''
                ? 'Enter a HEX color'
                : isValid
                  ? `Preview: ${previewColor}`
                  : 'Invalid HEX'}
            </p>
          </div>

          {/* Category */}
          <div className="w-52">
            <label className="block text-sm text-gray-600 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={searching}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!isValid || !hexInput.trim() || searching}
            className="px-6 py-3 bg-[#0D9E7A] text-white rounded-lg hover:bg-[#0b8566] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Search className="w-5 h-5" />
            {searching ? 'Searching...' : 'Find matches'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {hasSearched && !searching && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PMS Matches */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Closest PMS Matches</h3>
              <p className="text-xs text-gray-500 mt-0.5">{pmsResults.length} results</p>
            </div>
            <div className="divide-y divide-gray-100">
              {pmsResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">No PMS matches found</div>
              )}
              {pmsResults.map((m) => (
                <div
                  key={`${m.pms}-${m.series}`}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-md border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: m.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{m.name || m.pms}</div>
                    <div className="text-xs text-gray-400 font-mono">{m.hex}</div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      m.distance < 10
                        ? 'bg-green-100 text-green-800'
                        : m.distance < 30
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {m.distance.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GG Fusion Matches */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Closest GG Fusion Colors</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {ggResults.length} results in {category === 'UD' ? 'Uncoated Direct' : 'Coated Direct'}
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {ggResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No GG Fusion colors found
                </div>
              )}
              {ggResults.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectFormula(m)}
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
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      m.distance < 10
                        ? 'bg-green-100 text-green-800'
                        : m.distance < 30
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {m.distance.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
