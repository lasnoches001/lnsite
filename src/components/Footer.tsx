import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  if (isHome) return null; // Não mostra footer na landing page

  return (
    <footer className="bg-lasnoches-bg border-t border-[#1a1a1a] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
        <span className="font-oswald uppercase tracking-[0.2em] text-xs text-lasnoches-textDim">
          LAS NOCHES — PROJETO DE FÃS
        </span>
        <div className="flex gap-6">
          <a href="https://x.com/LasNochees" target="_blank" rel="noopener noreferrer" className="text-lasnoches-textDim hover:text-white transition-colors" title="X (Twitter)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="https://t.me/+bdYg-HrDYCo4NDc5" target="_blank" rel="noopener noreferrer" className="text-lasnoches-textDim hover:text-white transition-colors" title="Telegram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
