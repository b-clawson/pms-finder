interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

interface ResultsCardProps {
  results: PMSMatch[];
}

function getDistanceBadgeColor(distance: number): string {
  if (distance < 20) return 'bg-green-100 text-green-800';
  if (distance < 80) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function getDistanceLabel(distance: number): string {
  if (distance < 20) return 'Exact';
  if (distance < 80) return 'Close';
  return 'Far';
}

export function ResultsCard({ results }: ResultsCardProps) {
  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg">Closest Matches</h3>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Swatch
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                PMS
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                HEX
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((match, index) => (
              <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                {/* Swatch */}
                <td className="px-6 py-4">
                  <div
                    className="w-[34px] h-[34px] rounded-md border border-gray-200"
                    style={{ backgroundColor: match.hex }}
                  />
                </td>
                {/* PMS */}
                <td className="px-6 py-4">
                  <div>
                    <span className="font-semibold">PMS {match.pms}</span>{' '}
                    <span className="text-gray-500">{match.series}</span>
                  </div>
                </td>
                {/* HEX */}
                <td className="px-6 py-4">
                  <span className="font-mono text-sm">{match.hex}</span>
                </td>
                {/* Distance */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getDistanceBadgeColor(
                      match.distance
                    )}`}
                  >
                    {match.distance.toFixed(1)} — {getDistanceLabel(match.distance)}
                  </span>
                </td>
                {/* Name */}
                <td className="px-6 py-4 text-sm text-gray-700">{match.name}</td>
                {/* Notes */}
                <td className="px-6 py-4 text-sm text-gray-500">{match.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
