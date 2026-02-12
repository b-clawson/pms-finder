import { DistanceBadge } from './DistanceBadge';

interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

export function PmsMatchList({ results }: { results: PMSMatch[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">Closest PMS Matches</h3>
        <p className="text-xs text-gray-500 mt-0.5">{results.length} results</p>
      </div>
      <div className="divide-y divide-gray-100">
        {results.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No PMS matches found</div>
        )}
        {results.map((m) => (
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
            <DistanceBadge distance={m.distance} />
          </div>
        ))}
      </div>
    </div>
  );
}
