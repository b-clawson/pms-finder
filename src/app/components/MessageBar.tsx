interface MessageBarProps {
  type: 'error' | 'info';
  message: string;
}

export function MessageBar({ type, message }: MessageBarProps) {
  const isError = type === 'error';

  return (
    <div
      className={`rounded-lg px-4 py-3 ${
        isError
          ? 'bg-red-50 border border-red-200 text-red-800'
          : 'bg-gray-50 border border-gray-200 text-gray-700'
      }`}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}
