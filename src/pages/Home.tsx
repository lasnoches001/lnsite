import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="fixed inset-0 bg-lasnoches-bg flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center space-y-8">
        
        <div className="flex flex-col items-center relative group">
          {/* Subtle background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-lasnoches-border/30 pointer-events-none"></div>
          
          <div className="w-[60px] h-[60px] rounded-full border border-white flex items-center justify-center mb-4 relative z-10 transition-colors duration-300 group-hover:border-lasnoches-accent bg-lasnoches-bg">
            <span className="font-display text-xl tracking-widest text-white group-hover:text-lasnoches-accent transition-colors duration-300">LN</span>
          </div>
          
          <h1 className="font-display text-[6rem] md:text-[9rem] leading-none text-white tracking-widest uppercase text-center relative z-10 transition-colors duration-300 group-hover:text-lasnoches-accent">
            LAS NOCHES
          </h1>
          
          <p className="mt-6 font-sans font-medium text-xs md:text-sm tracking-[0.4em] uppercase text-lasnoches-textDim relative z-10">
            PROJETO DE FÃS
          </p>
        </div>

        <Link 
          to="/obras" 
          className="mt-16 flex items-center gap-2 text-lasnoches-textDim hover:text-lasnoches-accent font-sans font-medium tracking-[0.2em] text-[11px] md:text-xs uppercase transition-colors duration-300 group"
        >
          <span>ENTRAR</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
        
      </div>
    </div>
  );
}
