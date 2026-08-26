import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

export default function Obras() {
  const [activeTab, setActiveTab] = useState<'Mangás' | 'Novels'>('Mangás');
  const [obras, setObras] = useState<any[]>([]);

  useEffect(() => {
    async function fetchObras() {
      const { data: obrasData, error } = await supabase.from('obras').select('*');
      if (error) {
        console.error("Erro ao buscar obras:", error);
      } else if (obrasData) {
        // Buscar apenas os IDs das obras nos capítulos para fazer a contagem
        const { data: capsData } = await supabase.from('capitulos').select('obra_id');
        
        const obrasComContagem = obrasData.map((obra) => {
          const count = capsData ? capsData.filter((cap) => cap.obra_id === obra.id).length : 0;
          return { ...obra, capCount: count };
        });
        
        setObras(obrasComContagem);
      }
    }
    fetchObras();
  }, []);

  const obrasFiltradas = obras.filter(obra => {
    if (activeTab === 'Novels') return obra.tipo === 'Novel';
    // Se for Mangás, mostra Mangá, Manhwa, Manhua e One-shot
    return obra.tipo !== 'Novel';
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="font-display text-4xl uppercase tracking-wide text-white">Mangás & Novels</h1>
        
        <div className="flex space-x-2 bg-lasnoches-surface p-1 rounded">
          <button 
            onClick={() => setActiveTab('Mangás')}
            className={`px-6 py-2 text-sm font-sans tracking-wider uppercase transition-colors ${activeTab === 'Mangás' ? 'bg-white text-black font-medium' : 'text-lasnoches-textDim hover:text-white'}`}
          >
            Mangás
          </button>
          <button 
            onClick={() => setActiveTab('Novels')}
            className={`px-6 py-2 text-sm font-sans tracking-wider uppercase transition-colors ${activeTab === 'Novels' ? 'bg-white text-black font-medium' : 'text-lasnoches-textDim hover:text-white'}`}
          >
            Novels
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {obrasFiltradas.length === 0 ? (
          <p className="text-lasnoches-textDim col-span-full">Nenhuma obra encontrada nesta categoria.</p>
        ) : (
          obrasFiltradas.map((obra) => {
            const capCount = obra.capCount || 0;
            return (
              <Link to={`/obras/${obra.id}`} key={obra.id} className="group cursor-pointer block">
                <div className="relative aspect-[2/3] overflow-hidden bg-lasnoches-surface mb-3 rounded-md transition-colors shadow-lg">
                  <img src={obra.capa_url || 'https://via.placeholder.com/200x300?text=Sem+Capa'} alt={obra.titulo} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  <div className={`absolute top-2 right-2 px-1.5 py-[2px] rounded-sm shadow ${obra.tipo?.toLowerCase() === 'one-shot' ? 'bg-white text-black' : 'bg-black/90 text-white'}`}>
                    <span className="text-[9px] font-sans font-medium uppercase tracking-wide">{obra.tipo || 'Tipo'}</span>
                  </div>
                </div>
                <h3 className="font-display text-xl text-white group-hover:text-lasnoches-accent transition-colors line-clamp-1 leading-tight mb-1">
                  {obra.titulo}
                </h3>
                <p className="font-sans text-xs text-lasnoches-textDim">
                  {capCount} {capCount === 1 ? 'capítulo' : 'capítulos'}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
