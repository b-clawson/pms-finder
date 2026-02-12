import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchCardProps {
  onSearch: (hex: string, series: string, limit: number) => void;
  isSearching: boolean;
}

export function SearchCard({ onSearch, isSearching }: SearchCardProps) {
  const [hexInput, setHexInput] = useState('');
  const [series, setSeries] = useState('Both');
  const [limit, setLimit] = useState(10);
  const [previewColor, setPreviewColor] = useState('#FF6A00');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Validate and update preview color
    const hex = hexInput.trim();
    if (hex === '') {
      setPreviewColor('#FF6A00');
      setIsValid(true);
      return;
    }

    const hexPattern = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    if (hexPattern.test(hex)) {
      const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;
      setPreviewColor(normalizedHex);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [hexInput]);

  const handleSearch = () => {
    if (isValid && hexInput.trim()) {
      const normalizedHex = hexInput.trim().startsWith('#') 
        ? hexInput.trim() 
        : `#${hexInput.trim()}`;
      onSearch(normalizedHex, series, limit);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-end gap-4">
        {/* HEX Color Input with Swatch */}
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
              onKeyPress={handleKeyPress}
              placeholder="#FF6A00"
              className="w-full pl-[54px] pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent font-mono"
              disabled={isSearching}
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

        {/* Series Dropdown */}
        <div className="w-40">
          <label className="block text-sm text-gray-600 mb-2">Series</label>
          <select
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            disabled={isSearching}
          >
            <option>Both</option>
            <option>Coated (C)</option>
            <option>Uncoated (U)</option>
          </select>
        </div>

        {/* Limit Dropdown */}
        <div className="w-32">
          <label className="block text-sm text-gray-600 mb-2">Limit</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            disabled={isSearching}
          >
            <option>5</option>
            <option>10</option>
            <option>20</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!isValid || !hexInput.trim() || isSearching}
          className="px-6 py-3 bg-[#0D9E7A] text-white rounded-lg hover:bg-[#0b8566] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Search className="w-5 h-5" />
          Find matches
        </button>
      </div>
    </div>
  );
}
