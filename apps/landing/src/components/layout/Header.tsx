import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/reservar', label: 'Reservar cita' },
];

export const Header = () => {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#f0e8d8]">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Visión 20/20 HD" className="h-8 w-8 object-contain" />
          <span className="font-bold text-[#2c2118] text-sm hidden sm:block">Visión 20/20 HD</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-[#c17d2a] text-white'
                  : 'text-[#2c2118] hover:bg-[#f5f0eb]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
