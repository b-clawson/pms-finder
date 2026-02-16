import { Search } from 'lucide-react';
import { useHexInput } from '../hooks/useHexInput';

interface HexSearchBarProps {
  hexInput: ReturnType<typeof useHexInput>;
  searching: boolean;
  onSearch: () => void;
  children?: React.ReactNode;
}

export function HexSearchBar({ hexInput: hex, searching, onSearch, children }: HexSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  const isPmsMode = hex.resolvedFromPms !== null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-end gap-4">
        {/* Hex / PMS Input */}
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-2">HEX or PMS Code</label>
          <div className="relative flex items-center">
            <div
              className="absolute left-3 w-[38px] h-[38px] rounded-md border border-gray-200 flex-shrink-0"
              style={{ backgroundColor: hex.isValid ? hex.previewColor : '#e5e7eb' }}
            />
            <input
              type="text"
              value={hex.hexInput}
              onChange={(e) => hex.setHexInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="#FF6A00 or 185 C"
              aria-label="HEX color code or PMS code"
              className={`w-full pl-[54px] pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6007E] focus:border-transparent ${isPmsMode ? '' : 'font-mono'}`}
              disabled={searching}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {hex.resolving
              ? 'Resolving PMS code…'
              : hex.hexInput.trim() === ''
                ? 'Enter a HEX color or PMS code'
                : isPmsMode
                  ? `Resolved: PMS ${hex.resolvedFromPms!.name} → ${hex.resolvedFromPms!.hex}`
                  : hex.isValid
                    ? `Preview: ${hex.previewColor}`
                    : 'Invalid HEX or PMS code'}
          </p>
        </div>

        {/* Slot for series/category dropdown */}
        {children}

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={!hex.isValid || !hex.hexInput.trim() || searching || hex.resolving}
          className="px-6 py-3 bg-[#E6007E] text-white rounded-lg hover:bg-[#B80065] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Search className="w-5 h-5" />
          {searching ? 'Searching...' : 'Find matches'}
        </button>
      </div>
    </div>
  );
}
