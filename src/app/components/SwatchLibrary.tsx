import { useState, useEffect, useMemo, useRef, useCallback, memo, type CSSProperties, type ReactElement } from 'react';
import { Grid } from 'react-window';
import { Search, Copy, Check } from 'lucide-react';
import { getContrastColor } from '../utils/colorMath';

interface Swatch {
  pms: string;
  series: string;
  hex: string;
  name: string;
  notes: string;
}

const GAP = 16;
const MIN_CARD_WIDTH = 160;
const ROW_HEIGHT = 162; // card height + gap

const SwatchCard = memo(function SwatchCard({ swatch }: { swatch: Swatch }) {
  const [copied, setCopied] = useState(false);
  const contrast = getContrastColor(swatch.hex);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(swatch.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={`PMS ${swatch.pms}, ${swatch.hex} — click to copy`}
        className="h-24 relative cursor-pointer"
        style={{ backgroundColor: swatch.hex }}
        onClick={handleCopy}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopy(); } }}
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
      <div className="px-3 pt-2.5 pb-3.5">
        <div className="font-semibold text-sm text-gray-900">PMS {swatch.pms}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">{swatch.hex}</div>
      </div>
    </div>
  );
});

interface SwatchCellProps {
  swatches: Swatch[];
  columnCount: number;
}

function SwatchCell({
  columnIndex,
  rowIndex,
  style,
  swatches,
  columnCount,
}: {
  ariaAttributes: { 'aria-colindex': number; role: 'gridcell' };
  columnIndex: number;
  rowIndex: number;
  style: CSSProperties;
  swatches: Swatch[];
  columnCount: number;
}): ReactElement | null {
  const idx = rowIndex * columnCount + columnIndex;
  if (idx >= swatches.length) return <div style={style} />;
  const swatch = swatches[idx];

  return (
    <div style={{ ...style, paddingRight: GAP, paddingBottom: GAP }}>
      <SwatchCard swatch={swatch} />
    </div>
  );
}

function useContainerWidth() {
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const callbackRef = useCallback((el: HTMLDivElement | null) => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  return { width, callbackRef };
}

export function SwatchLibrary() {
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { width: containerWidth, callbackRef: containerRef } = useContainerWidth();

  useEffect(() => {
    fetch('/api/swatches')
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setSwatches(data.swatches);
        setLoading(false);
      })
      .catch(() => {
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

  const columnCount = Math.max(1, Math.floor((containerWidth + GAP) / (MIN_CARD_WIDTH + GAP)));
  const columnWidth = containerWidth > 0 ? containerWidth / columnCount : MIN_CARD_WIDTH;
  const rowCount = Math.ceil(filtered.length / columnCount);
  const gridHeight = Math.min(rowCount * ROW_HEIGHT, window.innerHeight - 250);

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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6007E] focus:border-transparent"
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {filtered.length} of {swatches.length} swatches
        </div>
      </div>

      {/* Swatch Grid */}
      <div ref={containerRef}>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No swatches match &ldquo;{search}&rdquo;
          </div>
        ) : containerWidth > 0 ? (
          <Grid<SwatchCellProps>
            cellComponent={SwatchCell}
            cellProps={{ swatches: filtered, columnCount }}
            columnCount={columnCount}
            columnWidth={columnWidth}
            rowCount={rowCount}
            rowHeight={ROW_HEIGHT}
            overscanCount={4}
            style={{ height: gridHeight, width: containerWidth }}
          />
        ) : null}
      </div>
    </div>
  );
}
