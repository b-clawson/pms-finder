import { useState, useEffect } from 'react';
import { Search, Bookmark, Check } from 'lucide-react';
import { FormulaDetail, resolveFormulaHex } from './MatsuiFormulas';
import { useMixingCards } from '../hooks/useMixingCards';
import type { MatsuiSeries, MatsuiFormula } from '../types/matsui';

interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

interface ScoredFormula extends MatsuiFormula {
  resolvedHex: string;
  distance: number;
}

export function MatsuiMix() {
  const [hexInput, setHexInput] = useState('');
  const [previewColor, setPreviewColor] = useState('#FF6A00');
  const [isValid, setIsValid] = useState(true);

  const [seriesList, setSeriesList] = useState<MatsuiSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState('301 RC Neo');
  const [seriesLoading, setSeriesLoading] = useState(true);

  const [searching, setSearching] = useState(false);
  const [pmsResults, setPmsResults] = useState<PMSMatch[]>([]);
  const [matsuiResults, setMatsuiResults] = useState<ScoredFormula[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedFormula, setSelectedFormula] = useState<MatsuiFormula | null>(null);
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

  // Load series on mount
  useEffect(() => {
    fetch('/api/matsui/series')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (s: MatsuiSeries) => s.seriesName.toLowerCase() !== 'test'
        );
        setSeriesList(filtered);
        if (filtered.length > 0 && !filtered.find((s: MatsuiSeries) => s.seriesName === '301 RC Neo')) {
          setSelectedSeries(filtered[0].seriesName);
        }
        setSeriesLoading(false);
      })
      .catch(() => setSeriesLoading(false));
  }, []);

  const handleSearch = async () => {
    const hex = hexInput.trim();
    if (!hex || !isValid) return;

    const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;
    setSearching(true);
    setError(null);
    setPmsResults([]);
    setMatsuiResults([]);
    setHasSearched(true);
    setSelectedFormula(null);

    try {
      const [pmsRes, matsuiRes] = await Promise.all([
        fetch(`/api/pms?hex=${encodeURIComponent(normalizedHex)}&series=BOTH&limit=5`),
        fetch(`/api/matsui/match?hex=${encodeURIComponent(normalizedHex)}&series=${encodeURIComponent(selectedSeries)}&limit=10`),
      ]);

      const pmsData = await pmsRes.json();
      const matsuiData = await matsuiRes.json();

      if (pmsRes.ok && pmsData.results) {
        setPmsResults(pmsData.results);
      }

      if (matsuiRes.ok && Array.isArray(matsuiData)) {
        setMatsuiResults(matsuiData);
      } else if (matsuiData.error) {
        setError(matsuiData.error);
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

  if (selectedFormula) {
    const hex = hexInput.trim();
    const searchHex = hex.startsWith('#') ? hex : `#${hex}`;
    const resolvedHex = resolveFormulaHex(selectedFormula);
    const scoredFormula = matsuiResults.find((m) => m.formulaCode === selectedFormula.formulaCode);
    const distance = scoredFormula?.distance ?? 0;

    const handleSave = () => {
      saveCard({
        type: 'matsui',
        name: selectedFormula.formulaCode,
        searchHex,
        series: selectedSeries,
        formula: selectedFormula,
        resolvedHex,
        distance,
        notes: '',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    return (
      <>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl mb-2">Color Mixing — Matsui</h1>
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
        <FormulaDetail formula={selectedFormula} onBack={() => setSelectedFormula(null)} />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Color Mixing — Matsui</h1>
        <p className="text-gray-600">Type a hex code to find closest PMS matches and Matsui ink formulas</p>
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

          {/* Ink Series */}
          <div className="w-52">
            <label className="block text-sm text-gray-600 mb-2">Ink Series</label>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              disabled={seriesLoading || searching}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            >
              {seriesLoading && <option>Loading...</option>}
              {seriesList.map((s) => (
                <option key={s._id} value={s.seriesName}>
                  {s.seriesName}
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

          {/* Matsui Matches */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Closest Matsui Formulas</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {matsuiResults.length} results in {selectedSeries}
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {matsuiResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No Matsui formulas found in {selectedSeries}
                </div>
              )}
              {matsuiResults.map((m) => {
                const hex = m.resolvedHex || resolveFormulaHex(m);
                return (
                  <div
                    key={m._id || m.formulaCode}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFormula(m)}
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
          </div>
        </div>
      )}
    </>
  );
}
