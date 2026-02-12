import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useDebounce } from '../hooks/useDebounce';
import { getContrastColor, cmykToHex, blendComponentColors } from '../utils/colorMath';
import type { MatsuiSeries, MatsuiFormula } from '../types/matsui';

// --- Formula Card ---
function FormulaCard({ formula, onClick }: { formula: MatsuiFormula; onClick: () => void }) {
  const hex = formula.formulaColor
    ? `#${formula.formulaColor}`
    : blendComponentColors(formula.components);
  const contrast = getContrastColor(hex);

  return (
    <div
      className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="h-24 relative" style={{ backgroundColor: hex }}>
        <div className="absolute bottom-2 right-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs bg-black/20 backdrop-blur-sm"
            style={{ color: contrast }}
          >
            {formula.formulaSeries}
          </span>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="font-semibold text-sm text-gray-900 truncate">{formula.formulaCode}</div>
        <div className="text-xs text-gray-500 truncate">{formula.formulaDescription}</div>
        <div className="text-xs text-gray-400 font-mono mt-1">{hex}</div>
      </div>
    </div>
  );
}

// --- Formula Detail ---
function FormulaDetail({ formula, onBack }: { formula: MatsuiFormula; onBack: () => void }) {
  const [weight, setWeight] = useState(1000);
  const [unit, setUnit] = useState<'g' | 'kg' | 'lb'>('g');

  const hex = formula.formulaColor
    ? `#${formula.formulaColor}`
    : blendComponentColors(formula.components);
  const weightInGrams = unit === 'kg' ? weight * 1000 : unit === 'lb' ? weight * 453.592 : weight;

  const chartData = formula.components.map((c) => ({
    name: c.componentCode,
    percentage: c.percentage,
    fill: c.hex ? `#${c.hex}` : cmykToHex(c.cmyk || [0, 0, 0, 0]),
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div
          className="w-16 h-16 rounded-lg border border-gray-200"
          style={{ backgroundColor: hex }}
        />
        <div>
          <h2 className="text-xl font-semibold">{formula.formulaCode}</h2>
          <p className="text-gray-500 text-sm">{formula.formulaDescription}</p>
          <span className="text-xs text-gray-400">
            {formula.formulaSeries} | {hex}
          </span>
        </div>
      </div>

      {/* Component Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium">Formula Components</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Swatch</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formula.components.map((comp, i) => {
                const compHex = comp.hex ? `#${comp.hex}` : cmykToHex(comp.cmyk || [0, 0, 0, 0]);
                return (
                  <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: compHex }}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{comp.componentCode}</td>
                    <td className="px-6 py-4 text-sm">{comp.componentDescription}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#0D9E7A]"
                            style={{ width: `${Math.min(comp.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{comp.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          comp.isBase
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {comp.isBase ? 'Base' : 'Pigment'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Component Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quantity Calculator */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Quantity Calculator</h3>
        <div className="flex items-end gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Total Weight</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
              className="w-32 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'g' | 'kg' | 'lb')}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            >
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Component</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Weight ({unit})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formula.components.map((comp, i) => {
                const compGrams = (comp.percentage / 100) * weightInGrams;
                const displayed =
                  unit === 'kg' ? compGrams / 1000 : unit === 'lb' ? compGrams / 453.592 : compGrams;
                return (
                  <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-3 text-sm">
                      {comp.componentCode} — {comp.componentDescription}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono">{comp.percentage.toFixed(1)}%</td>
                    <td className="px-6 py-3 text-sm font-mono">
                      {displayed.toFixed(2)} {unit}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-3 text-sm">Total</td>
                <td className="px-6 py-3 text-sm font-mono">100%</td>
                <td className="px-6 py-3 text-sm font-mono">
                  {weight.toFixed(2)} {unit}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Main MatsuiFormulas Component ---
export function MatsuiFormulas() {
  const [series, setSeries] = useState<MatsuiSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formulas, setFormulas] = useState<MatsuiFormula[]>([]);
  const [loading, setLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<MatsuiFormula | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 400);

  // Load series on mount
  useEffect(() => {
    fetch('/api/matsui/series')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (s: MatsuiSeries) => s.seriesName.toLowerCase() !== 'test'
        );
        setSeries(filtered);
        if (filtered.length > 0) {
          setSelectedSeries(filtered[0].seriesName);
        }
        setSeriesLoading(false);
      })
      .catch(() => {
        setError('Failed to load Matsui series');
        setSeriesLoading(false);
      });
  }, []);

  // Fetch formulas when series or search changes
  const fetchFormulas = useCallback(async (seriesName: string, query: string) => {
    if (!seriesName) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/matsui/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaSeries: seriesName,
          formulaSearchQuery: query,
          userCompany: '',
          selectedCompany: '',
          userEmail: '',
        }),
      });
      const data = await res.json();
      setFormulas(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to fetch formulas');
      setFormulas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSeries) {
      fetchFormulas(selectedSeries, debouncedQuery);
    }
  }, [selectedSeries, debouncedQuery, fetchFormulas]);

  if (selectedFormula) {
    return <FormulaDetail formula={selectedFormula} onBack={() => setSelectedFormula(null)} />;
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="w-52">
            <label className="block text-sm text-gray-600 mb-2">Ink Series</label>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              disabled={seriesLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            >
              {seriesLoading && <option>Loading...</option>}
              {series.map((s) => (
                <option key={s._id} value={s.seriesName}>
                  {s.seriesName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-600 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by color name or code..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? 'Loading...' : `${formulas.length} formulas in ${selectedSeries}`}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Formula Grid */}
      {!loading && formulas.length === 0 && !error && (
        <div className="text-center py-16 text-gray-500">
          No formulas found in {selectedSeries}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {formulas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {formulas.map((f) => (
            <FormulaCard
              key={f._id || f.formulaCode}
              formula={f}
              onClick={() => setSelectedFormula(f)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
