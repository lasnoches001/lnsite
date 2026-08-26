import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isAdmin = !!user; // Admin verdadeiro via Supabase

  const navLinks = [
    { name: 'Obras', path: '/obras' },
    { name: 'Atualizações', path: '/atualizacoes' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Painel', path: '/painel' });
  }

  const isHome = location.pathname === '/';
  if (isHome) return null; // Não mostra navbar na landing page

  return (
    <nav className="bg-lasnoches-bg border-b border-lasnoches-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-full border border-lasnoches-text group-hover:border-lasnoches-accent flex items-center justify-center transition-all duration-300 shadow-[0_0_0px_rgba(0,255,65,0)] group-hover:shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                <span className="font-display text-xs tracking-wider text-lasnoches-text group-hover:text-lasnoches-accent transition-colors">LN</span>
              </div>
              <span className="font-display text-lg tracking-[0.2em] uppercase mt-1 group-hover:text-lasnoches-accent transition-colors duration-300">Las Noches</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-10">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`font-sans text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                      isActive 
                        ? 'text-lasnoches-accent' 
                        : 'text-lasnoches-textDim hover:text-lasnoches-accent'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              {isAdmin && (
                <button onClick={signOut} className="text-lasnoches-textDim hover:text-white transition-colors" title="Sair do Painel">
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
