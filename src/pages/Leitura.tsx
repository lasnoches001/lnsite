import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { BookOpen, Home } from 'lucide-react';

const ImagePage = ({ src, alt, isZoomed, isVertical }: { src: string, alt: string, isZoomed: boolean, isVertical: boolean }) => {
  const [isWide, setIsWide] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Consideramos "página dupla" se a largura for pelo menos 10% maior que a altura
    if (img.naturalWidth > img.naturalHeight * 1.1) {
      setIsWide(true);
    }
    setLoaded(true);
  };

  const baseImageClass = `object-contain transition-opacity duration-300 ${!loaded ? 'opacity-0' : 'opacity-100'}`;
  const spacingClass = isVertical ? (isZoomed ? 'mb-4' : 'mb-1') : '';
  
  if (isWide) {
    return (
      <div className={`w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar ${spacingClass}`}>
        <img 
          src={src} 
          alt={alt}
          onLoad={handleLoad}
          loading="lazy"
          className={`${baseImageClass} h-[70vh] sm:h-[85vh] md:h-auto md:w-full max-w-none md:max-w-full snap-start md:snap-none`}
        />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      onLoad={handleLoad}
      loading="lazy"
      className={`${baseImageClass} w-full ${spacingClass}`}
    />
  );
};

export default function Leitura() {
  const { id } = useParams();
  const [capitulo, setCapitulo] = useState<any>(null);
  const [obra, setObra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proximoCapitulo, setProximoCapitulo] = useState<any>(null);

  const [viewMode, setViewMode] = useState<'vertical' | 'ltr' | 'rtl'>('vertical');
  const [currentPage, setCurrentPage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    async function fetchLeitura() {
      if (!id) return;

      const { data: capData } = await supabase
        .from('capitulos')
        .select('*')
        .eq('id', id)
        .single();

      if (capData) {
        setCapitulo(capData);
        // Incrementar a visualizacao chamando a funcao (RPC) no banco
        supabase.rpc('incrementar_visualizacao', { cap_id: id }).then();
        
        // Buscar a obra para colocar no titulo e botao voltar
        const { data: obraData } = await supabase
          .from('obras')
          .select('*')
          .eq('id', capData.obra_id)
          .single();
        if (obraData) setObra(obraData);

        // Buscar proximo capitulo
        const { data: proxCapData } = await supabase
          .from('capitulos')
          .select('id, numero')
          .eq('obra_id', capData.obra_id)
          .gt('numero', capData.numero)
          .order('numero', { ascending: true })
          .limit(1)
          .single();
        if (proxCapData) setProximoCapitulo(proxCapData);
      }
      setLoading(false);
    }
    fetchLeitura();
  }, [id]);

  const paginas = capitulo?.paginas || [];

  const handleNextPage = useCallback(() => {
    if (currentPage < paginas.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, paginas.length]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'vertical') return; // let default scrolling happen
      
      if (e.key === 'ArrowRight') {
        if (viewMode === 'ltr') handleNextPage();
        else handlePrevPage();
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'ltr') handlePrevPage();
        else handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handleNextPage, handlePrevPage]);

  const handleDoubleClick = () => {
    setIsZoomed(!isZoomed);
  };

  if (loading) return <div className="text-white p-8 font-oswald text-xl uppercase tracking-widest text-center mt-20">Carregando capítulo...</div>;
  if (!capitulo) return <div className="text-white p-8 font-oswald text-xl uppercase tracking-widest text-center mt-20">Capítulo não encontrado.</div>;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container principal do Header */}
      <div className="w-full max-w-5xl flex flex-col mt-4 mb-8 px-4">
        
        {/* Linha Superior: Voltar e Info do Capítulo */}
        <div className="flex justify-between items-center mb-12">
          <Link to={obra ? `/obras/${obra.id}` : '/obras'} className="text-lasnoches-textDim hover:text-white transition-colors flex items-center gap-2 font-oswald uppercase tracking-widest text-sm">
            <span>&larr;</span> {obra?.titulo || 'Voltar'}
          </Link>
          <span className="text-lasnoches-textDim font-oswald uppercase tracking-widest text-sm">
            Cap. {capitulo.numero}
          </span>
        </div>

        {/* Título do Capítulo (se existir) ou Número */}
        <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wider text-center mb-12 drop-shadow-md">
          {capitulo.titulo || `Capítulo ${capitulo.numero}`}
        </h1>

        {/* Barra de Controles de Modo de Visualização */}
        <div className="w-full bg-[#111] border border-[#222] rounded flex justify-center items-center py-2 gap-4 md:gap-8 text-sm font-oswald uppercase tracking-widest">
          <button 
            onClick={() => setViewMode('vertical')}
            className={`px-4 py-1.5 rounded transition-colors ${viewMode === 'vertical' ? 'bg-white text-black font-bold' : 'text-lasnoches-textDim hover:text-white'}`}
          >
            Vertical
          </button>
          <button 
            onClick={() => setViewMode('ltr')}
            className={`px-4 py-1.5 rounded transition-colors flex items-center gap-2 ${viewMode === 'ltr' ? 'bg-white text-black font-bold' : 'text-lasnoches-textDim hover:text-white'}`}
          >
            <span>&rarr;</span> Esq &rarr; Dir
          </button>
          <button 
            onClick={() => setViewMode('rtl')}
            className={`px-4 py-1.5 rounded transition-colors flex items-center gap-2 ${viewMode === 'rtl' ? 'bg-white text-black font-bold' : 'text-lasnoches-textDim hover:text-white'}`}
          >
            <span>&larr;</span> Dir &larr; Esq
          </button>
        </div>
      </div>

      {/* Área de Leitura */}
      <div 
        className={`w-full flex flex-col items-center bg-black transition-all duration-300 ${isZoomed ? 'max-w-full px-2' : 'max-w-4xl'}`}
        onDoubleClick={handleDoubleClick}
      >
        {paginas.length === 0 ? (
          <p className="text-lasnoches-textDim text-center p-10 font-oswald uppercase tracking-widest">
            Nenhuma imagem inserida neste capítulo.
          </p>
        ) : (
          <>
            {viewMode === 'vertical' && (
               <div className="w-full flex flex-col items-center">
                 {paginas.map((url: string, index: number) => (
                    <ImagePage 
                      key={index}
                      src={url} 
                      alt={`Página ${index + 1}`} 
                      isZoomed={isZoomed}
                      isVertical={true}
                    />
                 ))}
               </div>
            )}

            {(viewMode === 'ltr' || viewMode === 'rtl') && (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full mb-4 px-4">
                  <button 
                    onClick={viewMode === 'ltr' ? handlePrevPage : handleNextPage} 
                    disabled={viewMode === 'ltr' ? currentPage === 0 : currentPage === paginas.length - 1}
                    className="text-white disabled:text-lasnoches-border disabled:opacity-50 font-oswald uppercase tracking-widest hover:text-lasnoches-cero transition-colors px-4 py-2"
                  >
                    Anterior
                  </button>
                  <span className="text-lasnoches-textDim font-oswald my-auto">
                    Página {currentPage + 1} de {paginas.length}
                  </span>
                  <button 
                    onClick={viewMode === 'ltr' ? handleNextPage : handlePrevPage} 
                    disabled={viewMode === 'ltr' ? currentPage === paginas.length - 1 : currentPage === 0}
                    className="text-white disabled:text-lasnoches-border disabled:opacity-50 font-oswald uppercase tracking-widest hover:text-lasnoches-cero transition-colors px-4 py-2"
                  >
                    Próxima
                  </button>
                </div>
                
                <ImagePage 
                  src={paginas[currentPage]} 
                  alt={`Página ${currentPage + 1}`} 
                  isZoomed={isZoomed}
                  isVertical={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center mt-8 px-4">
        
        {(viewMode === 'ltr' || viewMode === 'rtl') && paginas.length > 0 && (
          <div className="w-full flex justify-between items-center mb-2 font-oswald text-lasnoches-textDim uppercase tracking-widest text-sm">
            <button 
              onClick={viewMode === 'ltr' ? handlePrevPage : handleNextPage} 
              disabled={viewMode === 'ltr' ? currentPage === 0 : currentPage === paginas.length - 1}
              className="hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>&lt;</span> Anterior
            </button>
            <span>
              {currentPage + 1} / {paginas.length}
            </span>
            <button 
              onClick={viewMode === 'ltr' ? handleNextPage : handlePrevPage} 
              disabled={viewMode === 'ltr' ? currentPage === paginas.length - 1 : currentPage === 0}
              className="hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Próxima <span>&gt;</span>
            </button>
          </div>
        )}

        <p className="text-[#555] text-[10px] sm:text-xs font-oswald uppercase tracking-[0.2em] mb-10 mt-4 text-center">
          Dê 2 cliques na tela para expandir a imagem.
        </p>

        <div className="w-full h-px bg-[#1a1a1a] mb-10"></div>

        {proximoCapitulo && (
          <div className="w-full flex justify-end mb-10">
            <Link 
              to={`/leitura/${proximoCapitulo.id}`} 
              className="text-lasnoches-textDim hover:text-white font-oswald uppercase tracking-widest text-sm flex items-center gap-2 transition-colors"
            >
              Cap. {proximoCapitulo.numero} <span>&gt;</span>
            </Link>
          </div>
        )}

        <div className="flex gap-4 mb-14">
          <Link 
            to={obra ? `/obras/${obra.id}` : '/obras'} 
            className="flex items-center gap-2 px-6 py-2 border border-[#222] rounded text-lasnoches-textDim hover:text-white hover:border-[#444] transition-colors font-oswald uppercase tracking-widest text-xs sm:text-sm"
          >
            <BookOpen size={16} /> Índice da obra
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-6 py-2 border border-[#222] rounded text-lasnoches-textDim hover:text-white hover:border-[#444] transition-colors font-oswald uppercase tracking-widest text-xs sm:text-sm"
          >
            <Home size={16} /> Página inicial
          </Link>
        </div>

      </div>
    </div>
  );
}
