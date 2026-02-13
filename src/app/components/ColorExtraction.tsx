import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Upload, FlaskConical, Copy, Check, ImageIcon } from 'lucide-react';
import ColorThief from 'colorthief';
import { DistanceBadge } from './DistanceBadge';
import { getContrastColor } from '../utils/colorMath';

interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  pmsMatch: PMSMatch | null;
  loading: boolean;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

export function ColorExtraction() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const extractColors = useCallback(async (img: HTMLImageElement) => {
    setExtracting(true);
    setError(null);
    setColors([]);

    try {
      const ct = new ColorThief();
      // Request 8 colors, then filter near-white and near-black
      const rawPalette: [number, number, number][] = ct.getPalette(img, 8);

      const filtered = rawPalette.filter(([r, g, b]) => {
        const sum = r + g + b;
        return sum <= 740 && sum >= 30;
      });

      // Take top 6
      const palette = filtered.slice(0, 6);

      // Initialize color entries
      const initial: ExtractedColor[] = palette.map(([r, g, b]) => ({
        hex: rgbToHex(r, g, b),
        r,
        g,
        b,
        pmsMatch: null,
        loading: true,
      }));
      setColors(initial);

      // Fetch PMS matches in parallel
      const promises = palette.map(async ([r, g, b], i) => {
        const hex = rgbToHex(r, g, b);
        try {
          const res = await fetch(`/api/pms?hex=${encodeURIComponent(hex)}&series=BOTH&limit=1`);
          const data = await res.json();
          if (res.ok && data.results?.length > 0) {
            return { index: i, match: data.results[0] as PMSMatch };
          }
        } catch { /* ignore individual failures */ }
        return { index: i, match: null };
      });

      const results = await Promise.all(promises);

      setColors((prev) =>
        prev.map((c, i) => {
          const result = results.find((r) => r.index === i);
          return { ...c, pmsMatch: result?.match ?? null, loading: false };
        })
      );
    } catch {
      setError('Failed to extract colors. Please try a different image.');
    } finally {
      setExtracting(false);
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, GIF, WebP).');
        return;
      }

      setError(null);
      setColors([]);

      const url = URL.createObjectURL(file);
      setImageUrl(url);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        extractColors(img);
      };
      img.onerror = () => {
        setError('Failed to load image.');
      };
      img.src = url;
    },
    [extractColors]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const copyHex = (hex: string, idx: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Color Extraction</h1>
        <p className="text-gray-600">
          Upload artwork to extract dominant colors, find PMS matches, and jump to mixing
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-xl shadow-sm p-8 mb-6 border-2 border-dashed transition-colors cursor-pointer text-center ${
          dragOver
            ? 'border-[#0D9E7A] bg-[#0D9E7A]/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">
          Drop an image here or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supports PNG, JPG, GIF, WebP
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {imageUrl && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Uploaded artwork"
            className="max-w-full max-h-80 mx-auto rounded-lg object-contain"
          />
        </div>
      )}

      {/* Extracting Indicator */}
      {extracting && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 mb-6">
          Extracting colors...
        </div>
      )}

      {/* Extracted Palette */}
      {colors.length > 0 && !extracting && (
        <div>
          <h2 className="text-lg font-medium mb-4">
            Extracted Palette ({colors.length} colors)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((color, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Color Swatch */}
                <div
                  className="h-28 flex items-end px-4 pb-3"
                  style={{ backgroundColor: color.hex }}
                >
                  <button
                    onClick={() => copyHex(color.hex, i)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-mono transition-colors"
                    style={{
                      color: getContrastColor(color.hex),
                      backgroundColor: 'rgba(0,0,0,0.15)',
                    }}
                  >
                    {copiedIdx === i ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedIdx === i ? 'Copied!' : color.hex}
                  </button>
                </div>

                {/* PMS Match Info */}
                <div className="px-4 py-3">
                  {color.loading ? (
                    <p className="text-sm text-gray-400">Finding PMS match...</p>
                  ) : color.pmsMatch ? (
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-6 h-6 rounded border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: color.pmsMatch.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {color.pmsMatch.name || color.pmsMatch.pms}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {color.pmsMatch.hex}
                        </span>
                      </div>
                      <DistanceBadge distance={color.pmsMatch.distance} />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mb-3">No PMS match found</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/mixing/matsui?hex=${encodeURIComponent(color.hex)}`
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#0D9E7A] text-white hover:bg-[#0b8566] transition-colors"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      Matsui
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/mixing/greengalaxy?hex=${encodeURIComponent(color.hex)}`
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#1B1B2F] text-white hover:bg-[#2a2a4a] transition-colors"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      Green Galaxy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
