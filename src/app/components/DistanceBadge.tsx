interface DistanceBadgeProps {
  distance: number;
  thresholds?: [number, number];
}

const DEFAULT_THRESHOLDS: [number, number] = [10, 30];

export function DistanceBadge({ distance, thresholds = DEFAULT_THRESHOLDS }: DistanceBadgeProps) {
  const colorClass =
    distance < thresholds[0]
      ? 'bg-green-100 text-green-800'
      : distance < thresholds[1]
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  const label =
    distance < thresholds[0] ? 'close' : distance < thresholds[1] ? 'moderate' : 'far';

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs ${colorClass}`}
      role="status"
      aria-label={`Color distance: ${distance.toFixed(1)} (${label} match)`}
    >
      {distance.toFixed(1)}
    </span>
  );
}
