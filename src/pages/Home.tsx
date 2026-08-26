import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center overflow-hidden selection:bg-lasnoches-accent/30">
      
      {/* Container Principal */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4">
        
        {/* Subtítulo Superior (Projeto de Fãs) */}
        <p className="font-sans font-bold text-[10px] md:text-xs tracking-[0.6em] text-lasnoches-accent uppercase mb-8 z-20">
          Projeto de Fãs
        </p>

        {/* Grupo do Título (Texto no fundo + Texto na frente) */}
        <div className="relative w-full flex items-center justify-center">
          
          {/* Texto Escuro no Fundo */}
          <h1 className="absolute font-display text-[8rem] md:text-[14rem] lg:text-[18rem] leading-[0.8] text-[#0A2E12] opacity-80 tracking-widest uppercase text-center select-none whitespace-nowrap z-0">
            LAS NOCHES
          </h1>

          {/* Texto Branco na Frente (Quebrado em duas linhas) */}
          <h1 className="font-display text-[5rem] md:text-[9rem] lg:text-[12rem] leading-[0.85] text-white tracking-widest uppercase text-center z-10 flex flex-col drop-shadow-2xl">
            <span>LAS</span>
            <span>NOCHES</span>
          </h1>
          
        </div>

        {/* Linha Divisória com Losango */}
        <div className="w-full max-w-sm flex items-center justify-center my-12 z-20 opacity-40">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-lasnoches-accent to-transparent"></div>
          <div className="w-1.5 h-1.5 border border-lasnoches-accent rotate-45 mx-2"></div>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-lasnoches-accent to-transparent"></div>
        </div>

        {/* Botão de Entrar */}
        <Link 
          to="/obras" 
          className="z-20 border border-lasnoches-border hover:border-lasnoches-accent/50 bg-black/40 px-8 py-4 flex items-center gap-6 group transition-all duration-500 w-auto min-w-[160px] justify-between"
        >
          <span className="font-sans font-semibold text-[10px] md:text-[12px] tracking-[0.3em] uppercase text-lasnoches-textDim group-hover:text-white transition-colors duration-500">
            Entrar
          </span>
          <ArrowRight className="w-3 h-3 text-lasnoches-textDim group-hover:text-lasnoches-accent group-hover:translate-x-1 transition-all duration-500" />
        </Link>
        
      </div>
    </div>
  );
}
