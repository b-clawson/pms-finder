import { useState } from 'react';
import { Palette, FlaskConical, ChevronDown, Beaker, Bookmark, Pipette } from 'lucide-react';
import { useLocation, Link } from 'react-router';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  nested?: boolean;
}

function NavItem({ icon, label, to, active = false, nested = false }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
        nested ? 'pl-11' : ''
      } ${
        active
          ? 'bg-[#0D9E7A] text-white'
          : 'text-gray-300 hover:bg-[#252541] hover:text-white'
      }`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

interface NavSectionProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function NavSection({ icon, label, active, expanded, onToggle, children }: NavSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          active && !expanded
            ? 'bg-[#0D9E7A]/20 text-[#0D9E7A]'
            : 'text-gray-400 hover:bg-[#252541] hover:text-gray-200'
        }`}
      >
        <div className="w-5 h-5">{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-wider flex-1 text-left">{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? '' : '-rotate-90'}`}
        />
      </button>
      {expanded && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const isMixingActive = location.pathname.startsWith('/mixing');
  const [mixingExpanded, setMixingExpanded] = useState<boolean>(isMixingActive || true);

  return (
    <aside className="w-[230px] bg-[#1B1B2F] h-screen sticky top-0 flex flex-col">
      {/* Brand */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0D9E7A] rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-lg font-semibold">Cercado</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1" aria-label="Main navigation">
        <NavItem
          icon={<Palette />}
          label="Swatch Library"
          to="/swatches"
          active={location.pathname === '/swatches'}
        />
        <NavItem
          icon={<Pipette />}
          label="Color Extraction"
          to="/extract"
          active={location.pathname === '/extract'}
        />

        <div className="pt-2">
          <NavSection
            icon={<Beaker />}
            label="Color Mixing"
            active={isMixingActive}
            expanded={mixingExpanded}
            onToggle={() => setMixingExpanded(!mixingExpanded)}
          >
            <NavItem
              icon={<FlaskConical />}
              label="Matsui"
              to="/mixing/matsui"
              active={location.pathname === '/mixing/matsui'}
              nested
            />
            <NavItem
              icon={<FlaskConical />}
              label="Green Galaxy"
              to="/mixing/greengalaxy"
              active={location.pathname === '/mixing/greengalaxy'}
              nested
            />
            <NavItem
              icon={<FlaskConical />}
              label="FN-INK"
              to="/mixing/fnink"
              active={location.pathname === '/mixing/fnink'}
              nested
            />
            <NavItem
              icon={<FlaskConical />}
              label="ICC UltraMix"
              to="/mixing/icc"
              active={location.pathname === '/mixing/icc'}
              nested
            />
            <NavItem
              icon={<Bookmark />}
              label="Mixing Cards"
              to="/mixing/cards"
              active={location.pathname === '/mixing/cards'}
              nested
            />
          </NavSection>
        </div>
      </nav>
    </aside>
  );
}
