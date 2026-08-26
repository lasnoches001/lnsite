import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trash2, ArrowLeft, ChevronDown, Eye } from 'lucide-react';
import { supabase } from '../supabase';

export default function ObraDetalhes() {
  const { id } = useParams();
  const [obra, setObra] = useState<any>(null);
  const [capitulos, setCapitulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [filterType, setFilterType] = useState<'volume' | 'data'>('volume');
  const [collapsedVolumes, setCollapsedVolumes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    
    async function fetchDados() {
      if (!id) return;
      
      const { data: obraData } = await supabase.from('obras').select('*').eq('id', id).single();
      if (obraData) setObra(obraData);

      const { data: capData } = await supabase.from('capitulos').select('*').eq('obra_id', id).order('numero', { ascending: false });
      if (capData) setCapitulos(capData);
      
      setLoading(false);
    }
    fetchDados();
  }, [id]);

  if (loading) return <div className="text-white p-8 font-sans text-sm uppercase tracking-widest">Carregando...</div>;
  if (!obra) return <div className="text-white p-8 font-sans text-sm uppercase tracking-widest">Obra não encontrada.</div>;

  // Organizar capítulos
  let chaptersToDisplay = [...capitulos];
  if (filterType === 'data') {
    chaptersToDisplay.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    chaptersToDisplay.sort((a, b) => a.numero - b.numero);
  }

  // Agrupar por volume (a cada 10 capítulos = 1 volume para simulação, já que não há coluna volume)
  const groupedByVolume = chaptersToDisplay.reduce((acc, cap) => {
    const vol = Math.max(1, Math.ceil(cap.numero / 10));
    if (!acc[vol]) acc[vol] = [];
    acc[vol].push(cap);
    return acc;
  }, {} as Record<number, any[]>);

  const lastUpdate = capitulos.length > 0 
    ? new Date(capitulos[0].created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : 'Nenhuma';

  return (
    <div className="w-full">
      <Link to="/obras" className="inline-flex items-center gap-2 text-lasnoches-textDim hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Obras
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="md:w-1/4 flex-shrink-0">
          <img 
            src={obra.capa_url || 'https://via.placeholder.com/300x450?text=Sem+Capa'} 
            alt={obra.titulo} 
            className="w-full rounded border border-lasnoches-border"
          />
        </div>
        
        <div className="md:w-3/4 flex flex-col justify-start">
          <span className="text-lasnoches-textDim text-[10px] font-sans uppercase tracking-[0.2em] mb-1">
            {obra.tipo || 'MANGÁ'}
          </span>
          <h1 className="font-display text-5xl md:text-7xl uppercase tracking-wider text-white mb-2 leading-none">
            {obra.titulo}
          </h1>
          <p className="text-lasnoches-textDim text-xs font-sans mb-6">
            Última atualização: {lastUpdate}
          </p>
          
          <div className="mb-6 flex flex-col">
            <span className="font-display text-4xl text-white leading-none">{capitulos.length}</span>
            <span className="text-[10px] font-sans text-lasnoches-textDim uppercase tracking-widest mt-1">
              {capitulos.length === 1 ? 'CAPÍTULO' : 'CAPÍTULOS'}
            </span>
          </div>

          <p className="text-lasnoches-textDim text-sm font-sans leading-relaxed text-justify md:w-4/5">
            {obra.sinopse || 'Nenhuma sinopse disponível.'}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl text-white uppercase tracking-wider">
          Capítulos
        </h2>
        <div className="relative">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="appearance-none bg-lasnoches-surface border border-lasnoches-border text-white text-xs px-4 py-2 pr-8 focus:outline-none focus:border-lasnoches-accent cursor-pointer"
          >
            <option value="volume">Por volume</option>
            <option value="data">Data de postagem</option>
          </select>
          <ChevronDown className="w-4 h-4 text-lasnoches-textDim absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        {capitulos.length === 0 ? (
          <p className="text-lasnoches-textDim">Nenhum capítulo lançado ainda.</p>
        ) : (
          filterType === 'volume' ? (
            Object.entries(groupedByVolume).reverse().map(([vol, caps]) => {
              const isCollapsed = collapsedVolumes[vol] || false;
              return (
                <div key={vol} className="mb-4">
                  <div 
                    className="flex justify-between items-center mb-4 cursor-pointer group select-none"
                    onClick={() => setCollapsedVolumes(prev => ({ ...prev, [vol]: !isCollapsed }))}
                  >
                    <h3 className="font-display text-xl text-white uppercase tracking-wider group-hover:text-lasnoches-accent transition-colors">Volume {vol}</h3>
                    <ChevronDown className={`w-5 h-5 text-lasnoches-textDim transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
                  </div>
                  <div className={`flex flex-col gap-3 transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
                    {(caps as any[]).reverse().map(renderChapterItem)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col gap-3">
              {chaptersToDisplay.map(renderChapterItem)}
            </div>
          )
        )}
      </div>
    </div>
  );

  function renderChapterItem(cap: any) {
    const thumbUrl = cap.paginas && cap.paginas.length > 1 ? cap.paginas[1] : (cap.paginas?.[0] || 'https://via.placeholder.com/80x110?text=Sem+Pagina');
    const pubDate = new Date(cap.created_at).toLocaleDateString('pt-BR');
    const pubTime = new Date(cap.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <Link
        key={cap.id}
        to={`/leitura/${cap.id}`}
        className="flex items-center gap-4 bg-transparent p-2 border-b border-lasnoches-border hover:bg-lasnoches-surface/50 transition-all group"
      >
        <div className="w-[80px] h-[110px] flex-shrink-0 bg-lasnoches-surface overflow-hidden border border-lasnoches-border rounded-sm">
          <img src={thumbUrl} alt={`Capítulo ${cap.numero}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-sans font-bold text-xs text-lasnoches-textDim uppercase tracking-widest mb-1 group-hover:text-white transition-colors">
            Capítulo {cap.numero}
          </h4>
          <h5 className="font-sans text-sm text-white mb-2 line-clamp-1">
            {cap.titulo || `Capítulo ${cap.numero}`}
          </h5>
          <div className="flex items-center gap-3 text-[10px] font-sans text-lasnoches-textDim">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {cap.visualizacoes || 0}</span>
            <span>{pubDate} às {pubTime}</span>
          </div>
        </div>
        {session && (
          <button 
            onClick={async (e) => {
              e.preventDefault(); 
              if(confirm(`Excluir Capítulo ${cap.numero}?`)) {
                await supabase.from('capitulos').delete().eq('id', cap.id);
                setCapitulos(capitulos.filter(c => c.id !== cap.id));
              }
            }}
            className="text-lasnoches-blood hover:text-red-400 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </Link>
    );
  }
}
