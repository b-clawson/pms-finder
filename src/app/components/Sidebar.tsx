import { Search, Palette, FlaskConical } from 'lucide-react';
import { useLocation, Link } from 'react-router';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

function NavItem({ icon, label, to, active = false }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
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

export function Sidebar() {
  const location = useLocation();

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
      <nav className="flex-1 px-4 space-y-1">
        <NavItem
          icon={<Search />}
          label="PMS Finder"
          to="/"
          active={location.pathname === '/'}
        />
        <NavItem
          icon={<Palette />}
          label="Swatch Library"
          to="/swatches"
          active={location.pathname === '/swatches'}
        />
        <NavItem
          icon={<FlaskConical />}
          label="Matsui Formulas"
          to="/formulas"
          active={location.pathname === '/formulas'}
        />
      </nav>
    </aside>
  );
}
