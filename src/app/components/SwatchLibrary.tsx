import { useState, useEffect, useMemo } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { getContrastColor } from '../utils/colorMath';

interface Swatch {
  pms: string;
  series: string;
  hex: string;
  name: string;
  notes: string;
}

function SwatchCard({ swatch }: { swatch: Swatch }) {
  const [copied, setCopied] = useState(false);
  const contrast = getContrastColor(swatch.hex);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(swatch.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="h-24 relative cursor-pointer"
        style={{ backgroundColor: swatch.hex }}
        onClick={handleCopy}
      >
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: contrast }}
        >
          {copied ? (
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Check className="w-4 h-4" />
              Copied
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Copy className="w-4 h-4" />
              {swatch.hex}
            </div>
          )}
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="font-semibold text-sm text-gray-900">PMS {swatch.pms}</div>
        <div className="text-xs text-gray-500 font-mono">{swatch.hex}</div>
      </div>
    </div>
  );
}

export function SwatchLibrary() {
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/swatches')
      .then((res) => res.json())
      .then((data) => {
        setSwatches(data.swatches);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load swatches — is the server running?');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return swatches;
    const q = search.trim().toLowerCase();
    return swatches.filter(
      (s) =>
        s.pms.toLowerCase().includes(q) ||
        s.hex.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q))
    );
  }, [swatches, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading swatches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Search / Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PMS number, hex, or name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent"
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {filtered.length} of {swatches.length} swatches
        </div>
      </div>

      {/* Swatch Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No swatches match "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((swatch) => (
            <SwatchCard key={`${swatch.pms}-${swatch.series}`} swatch={swatch} />
          ))}
        </div>
      )}
    </div>
  );
}
