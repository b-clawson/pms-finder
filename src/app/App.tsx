import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { SearchCard } from './components/SearchCard';
import { MessageBar } from './components/MessageBar';
import { ResultsCard } from './components/ResultsCard';
import { SwatchLibrary } from './components/SwatchLibrary';
import { MatsuiFormulas } from './components/MatsuiFormulas';
import { MatsuiBridge } from './components/MatsuiBridge';
import { MatsuiMix } from './components/MatsuiMix';
import { GreenGalaxyMix } from './components/GreenGalaxyMix';

interface PMSMatch {
  pms: string;
  series: string;
  hex: string;
  distance: number;
  name: string;
  notes: string;
}

function PmsFinderPage() {
  const [results, setResults] = useState<PMSMatch[]>([]);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matsuiBridgeHex, setMatsuiBridgeHex] = useState<string | null>(null);

  const handleSearch = async (hex: string, series: string, limit: number) => {
    setIsSearching(true);
    setMessage({ type: 'info', text: 'Searching...' });
    setResults([]);

    let seriesParam = 'BOTH';
    if (series === 'Coated (C)') seriesParam = 'C';
    else if (series === 'Uncoated (U)') seriesParam = 'U';

    try {
      const url = `/api/pms?hex=${encodeURIComponent(hex)}&series=${seriesParam}&limit=${limit}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'API error' });
        setResults([]);
        return;
      }

      if (data.results.length === 0) {
        setMessage({ type: 'info', text: 'No matches found.' });
        setResults([]);
      } else {
        setMessage(null);
        setResults(data.results);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error — is the server running?' });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">PMS Finder</h1>
        <p className="text-gray-600">Find the closest Pantone match for any HEX color</p>
      </div>

      <div className="mb-6">
        <SearchCard onSearch={handleSearch} isSearching={isSearching} />
      </div>

      {message && (
        <div className="mb-6">
          <MessageBar type={message.type} message={message.text} />
        </div>
      )}

      {results.length > 0 && (
        <ResultsCard results={results} onFindMatsui={(hex) => setMatsuiBridgeHex(hex)} />
      )}

      <MatsuiBridge targetHex={matsuiBridgeHex} onClose={() => setMatsuiBridgeHex(null)} />
    </>
  );
}

function SwatchLibraryPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Swatch Library</h1>
        <p className="text-gray-600">Browse all 901 Pantone swatches — click any swatch to copy its hex</p>
      </div>
      <SwatchLibrary />
    </>
  );
}

function MatsuiMixPage() {
  return <MatsuiMix />;
}

function MatsuiFormulasPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Matsui Formulas</h1>
        <p className="text-gray-600">Browse and search Matsui ink formulas by series</p>
      </div>
      <MatsuiFormulas />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-[#F3F4F6] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Routes>
              <Route path="/" element={<PmsFinderPage />} />
              <Route path="/swatches" element={<SwatchLibraryPage />} />
              <Route path="/mixing/matsui" element={<MatsuiMixPage />} />
              <Route path="/mixing/matsui/browse" element={<MatsuiFormulasPage />} />
              <Route path="/mixing/greengalaxy" element={<GreenGalaxyMix />} />
              <Route path="/formulas" element={<Navigate to="/mixing/matsui/browse" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
