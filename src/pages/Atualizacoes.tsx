import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

export default function Atualizacoes() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUpdates() {
      // Puxa os ultimos 20 capitulos lançados e junta com a tabela obras para pegar a capa e titulo
      const { data } = await supabase
        .from('capitulos')
        .select('*, obras(titulo, capa_url)')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (data) setUpdates(data);
    }
    fetchUpdates();
  }, []);

  return (
    <div className="w-full max-w-4xl">
      <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-8">Atualizações Recentes</h1>
      
      <div className="flex flex-col space-y-4">
        {updates.length === 0 ? (
          <p className="text-lasnoches-textDim font-oswald uppercase">Nenhum capítulo lançado ainda.</p>
        ) : (
          updates.map((cap) => (
            <Link 
              to={`/leitura/${cap.id}`} 
              key={cap.id} 
              className="flex items-center justify-between p-4 bg-lasnoches-surface border border-lasnoches-border hover:border-lasnoches-textDim transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 bg-lasnoches-darker border border-lasnoches-border flex-shrink-0 overflow-hidden">
                  <img src={cap.obras?.capa_url} alt="capa" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                </div>
                <div className="flex flex-col">
                  <span className="font-oswald text-lg text-white group-hover:text-lasnoches-cero transition-colors">
                    {cap.obras?.titulo}
                  </span>
                  <span className="text-sm text-lasnoches-textDim mt-1">
                    Capítulo {cap.numero} {cap.titulo ? `- ${cap.titulo}` : ''}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end text-right">
                <span className="text-sm font-oswald text-lasnoches-textDim">
                  {new Date(cap.created_at).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-xs text-lasnoches-textDim mt-1">
                  👁️ {cap.visualizacoes || 0}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
