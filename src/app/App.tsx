import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { SwatchLibrary } from './components/SwatchLibrary';
import { ColorExtraction } from './components/ColorExtraction';
import { MatsuiMix } from './components/MatsuiMix';
import { GreenGalaxyMix } from './components/GreenGalaxyMix';
import { FnInkMix } from './components/FnInkMix';
import { IccMix } from './components/IccMix';
import { MixingCards } from './components/MixingCards';

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

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-[#F3F4F6] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/swatches" replace />} />
              <Route path="/swatches" element={<SwatchLibraryPage />} />
              <Route path="/extract" element={<ColorExtraction />} />
              <Route path="/mixing/matsui" element={<MatsuiMix />} />
              <Route path="/mixing/greengalaxy" element={<GreenGalaxyMix />} />
              <Route path="/mixing/fnink" element={<FnInkMix />} />
              <Route path="/mixing/icc" element={<IccMix />} />
              <Route path="/mixing/cards" element={<MixingCards />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
