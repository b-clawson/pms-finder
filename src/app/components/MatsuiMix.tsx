import { useState, useEffect } from 'react';
import { Bookmark, Check } from 'lucide-react';
import { FormulaDetail, resolveFormulaHex } from './MatsuiFormulas';
import { HexSearchBar } from './HexSearchBar';
import { PmsMatchList } from './PmsMatchList';
import { DistanceBadge } from './DistanceBadge';
import { useHexInput } from '../hooks/useHexInput';
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
  const hex = useHexInput();

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
    if (!hex.hexInput.trim() || !hex.isValid) return;

    setSearching(true);
    setError(null);
    setPmsResults([]);
    setMatsuiResults([]);
    setHasSearched(true);
    setSelectedFormula(null);

    try {
      const [pmsRes, matsuiRes] = await Promise.all([
        fetch(`/api/pms?hex=${encodeURIComponent(hex.normalizedHex)}&series=BOTH&limit=5`),
        fetch(`/api/matsui/match?hex=${encodeURIComponent(hex.normalizedHex)}&series=${encodeURIComponent(selectedSeries)}&limit=10`),
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

  if (selectedFormula) {
    const resolvedHex = resolveFormulaHex(selectedFormula);
    const scoredFormula = matsuiResults.find((m) => m.formulaCode === selectedFormula.formulaCode);
    const distance = scoredFormula?.distance ?? 0;

    const handleSave = () => {
      saveCard({
        type: 'matsui',
        name: selectedFormula.formulaCode,
        searchHex: hex.normalizedHex,
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

      <HexSearchBar hexInput={hex} searching={searching} onSearch={handleSearch}>
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
                const formulaHex = m.resolvedHex || resolveFormulaHex(m);
                return (
                  <div
                    key={m._id || m.formulaCode}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFormula(m)}
                  >
                    <div
                      className="w-10 h-10 rounded-md border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: formulaHex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{m.formulaCode}</div>
                      <div className="text-xs text-gray-500 truncate">{m.formulaDescription}</div>
                      <div className="text-xs text-gray-400 font-mono">{formulaHex}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <DistanceBadge distance={m.distance} thresholds={[20, 80]} />
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
