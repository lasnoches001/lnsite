import { useState, useEffect } from 'react';
import { Upload, Cloud, Loader2, Image } from 'lucide-react';
import { supabase } from '../supabase';
import JSZip from 'jszip';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export default function Publicacao() {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Dados das Obras (Para o Select)
  const [obras, setObras] = useState<any[]>([]);
  
  // Estado do Formulário
  const [obraId, setObraId] = useState('');
  const [numero, setNumero] = useState('');
  const [titulo, setTitulo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Estado de Upload
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const [provider, setProvider] = useState<'r2' | 'imgbb'>('r2');
  const [tipoConteudo, setTipoConteudo] = useState<'manga' | 'novel'>('manga');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(session) fetchObras();
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) fetchObras();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchObras = async () => {
    const { data } = await supabase.from('obras').select('*').order('titulo');
    if (data) setObras(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.name.endsWith('.zip')) {
        setFile(selected);
      } else {
        alert("Por favor, selecione um arquivo .zip");
        e.target.value = '';
      }
    }
  };

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obraId || !numero || !file) {
      alert("Preencha a obra, o número do capítulo e selecione o arquivo ZIP.");
      return;
    }

    if (provider === 'r2') {
      const savedR2 = localStorage.getItem('@lasnoches:r2Config');
      if (!savedR2) {
        alert("Credenciais do R2 não encontradas! Vá na aba Painel e salve as configurações do Cloudflare R2 primeiro.");
        return;
      }
      const r2Config = JSON.parse(savedR2);
      if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.bucketName) {
        alert("As configurações do R2 estão incompletas. Verifique a aba Painel.");
        return;
      }
    } else if (provider === 'imgbb') {
      const savedImgbb = localStorage.getItem('@lasnoches:imgbbKeys');
      if (!savedImgbb || !savedImgbb.trim()) {
        alert("Nenhuma chave do ImgBB configurada! Vá na aba Configurações e adicione suas chaves.");
        return;
      }
      const keys = savedImgbb.split('\n').map(k => k.trim()).filter(k => k);
      if (keys.length === 0) {
        alert("Chaves do ImgBB inválidas. Adicione pelo menos uma chave na aba Configurações.");
        return;
      }
    }

    setUploading(true);
    setProgress(0);
    setStatusText('Lendo arquivo ZIP...');

    try {
      // 1. Ler o ZIP
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Filtrar apenas imagens e ordenar pelo nome (natural sort)
      const imageFiles = Object.keys(zipContent.files)
        .filter(filename => !zipContent.files[filename].dir && filename.match(/\.(jpe?g|png|webp|gif)$/i))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      if (imageFiles.length === 0) {
        throw new Error("Nenhuma imagem encontrada dentro do ZIP.");
      }

      const publicUrls: string[] = [];
      const obraSelecionada = obras.find(o => o.id.toString() === obraId);
      const safeObraName = obraSelecionada?.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      if (provider === 'r2') {
        // 2. Configurar o Cliente do S3 (Cloudflare R2)
        const savedR2 = localStorage.getItem('@lasnoches:r2Config');
        const r2Config = JSON.parse(savedR2!);
        
        const s3 = new S3Client({
          region: "auto",
          endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: r2Config.accessKeyId,
            secretAccessKey: r2Config.secretAccessKey,
          },
        });
        
        // 3. Fazer Upload de cada imagem para o R2
        for (let i = 0; i < imageFiles.length; i++) {
          const filename = imageFiles[i];
          const fileData = await zipContent.files[filename].async("uint8array");
          
          const extension = filename.split('.').pop()?.toLowerCase();
          let contentType = 'image/jpeg';
          if (extension === 'png') contentType = 'image/png';
          if (extension === 'webp') contentType = 'image/webp';
          if (extension === 'gif') contentType = 'image/gif';

          // Caminho no bucket: mangabname/cap_1/001.jpg
          const objectKey = `${safeObraName}/cap_${numero}/${String(i + 1).padStart(3, '0')}.${extension}`;
          
          setStatusText(`Enviando página ${i + 1} de ${imageFiles.length} (R2)...`);
          
          await s3.send(new PutObjectCommand({
            Bucket: r2Config.bucketName,
            Key: objectKey,
            Body: fileData,
            ContentType: contentType,
          }));

          // Montar URL pública
          let baseUrl = r2Config.publicUrl.endsWith('/') ? r2Config.publicUrl.slice(0, -1) : r2Config.publicUrl;
          publicUrls.push(`${baseUrl}/${objectKey}`);
          
          setProgress(Math.round(((i + 1) / imageFiles.length) * 100));
        }
      } else if (provider === 'imgbb') {
        // Upload rotativo para ImgBB
        const savedImgbb = localStorage.getItem('@lasnoches:imgbbKeys');
        const imgbbApiKeys = savedImgbb!.split('\n').map(k => k.trim()).filter(k => k);
        let keyIndex = 0;

        for (let i = 0; i < imageFiles.length; i++) {
          const filename = imageFiles[i];
          const fileBlob = await zipContent.files[filename].async("blob");
          
          setStatusText(`Enviando página ${i + 1} de ${imageFiles.length} (ImgBB)...`);
          
          let uploaded = false;
          let attempts = 0;
          
          while (!uploaded && attempts < imgbbApiKeys.length) {
            const currentKey = imgbbApiKeys[keyIndex];
            try {
              const formData = new FormData();
              formData.append('image', fileBlob);
              
              const res = await fetch(`https://api.imgbb.com/1/upload?key=${currentKey}`, {
                method: 'POST',
                body: formData,
              });
              
              const json = await res.json();
              if (json.success) {
                publicUrls.push(json.data.url);
                uploaded = true;
                // Move para a próxima chave (revezamento)
                keyIndex = (keyIndex + 1) % imgbbApiKeys.length;
              } else {
                throw new Error(json.error?.message || "Erro desconhecido no ImgBB");
              }
            } catch (err) {
              console.warn(`Chave ${currentKey} falhou. Tentando próxima...`, err);
              keyIndex = (keyIndex + 1) % imgbbApiKeys.length;
              attempts++;
            }
          }

          if (!uploaded) {
            throw new Error(`Falha ao enviar a página ${i + 1}. Todas as chaves estouraram limite ou deram erro.`);
          }

          setProgress(Math.round(((i + 1) / imageFiles.length) * 100));
        }
      }

      // 4. Salvar no Supabase
      setStatusText('Salvando capítulo no banco de dados...');
      const { error: dbError } = await supabase.from('capitulos').insert([{
        obra_id: parseInt(obraId),
        numero: parseFloat(numero.replace(',', '.')),
        titulo: titulo || null,
        paginas: publicUrls
      }]);

      if (dbError) throw dbError;

      // 5. Automação do Telegram
      const savedTelegram = localStorage.getItem('@lasnoches:telegramConfig');
      if (savedTelegram) {
        const tgConfig = JSON.parse(savedTelegram);
        if (tgConfig.ativo && tgConfig.token && tgConfig.chatId) {
          try {
            setStatusText('Enviando notificação no Telegram...');
            
            const routeType = obraSelecionada?.tipo === 'Novel' ? 'novel' : 'manga';
            const safeObraNameUrl = obraSelecionada?.titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase();
            let finalUrl = tgConfig.siteUrl.endsWith('/') ? tgConfig.siteUrl : tgConfig.siteUrl + '/';
            finalUrl += `${routeType}/${safeObraNameUrl}/${numero}`; 
            
            const msg = tgConfig.mensagem
              .replace(/{work_name}/g, obraSelecionada?.titulo || '')
              .replace(/{chapter_number}/g, numero)
              .replace(/{title}/g, titulo ? `- ${titulo}` : '')
              .replace(/{volume}/g, '')
              .replace(/{chapter_url}/g, finalUrl);
              
            const payload: any = {
              chat_id: tgConfig.chatId,
              text: msg,
            };
            
            if (tgConfig.topicId) {
              payload.message_thread_id = tgConfig.topicId;
            }
            
            await fetch(`https://api.telegram.org/bot${tgConfig.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch (err) {
            console.error('Erro na automação do telegram:', err);
          }
        }
      }

      setStatusText('Capítulo publicado com sucesso!');
      alert("Capítulo publicado com sucesso!");
      
      // Limpar formulário
      setNumero('');
      setTitulo('');
      setFile(null);
      
    } catch (error: any) {
      console.error(error);
      alert("Erro ao publicar: " + error.message);
    } finally {
      setUploading(false);
      setTimeout(() => setStatusText(''), 3000);
    }
  };

  if (loadingAuth) return <div className="w-full flex justify-center p-20 text-white font-oswald uppercase tracking-widest">Verificando segurança...</div>;

  if (!session) {
    return (
      <div className="w-full max-w-md mx-auto mt-20 bg-lasnoches-surface border border-lasnoches-border p-8 rounded shadow-2xl text-center">
        <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-6">Acesso Restrito</h1>
        <p className="text-lasnoches-textDim text-sm mb-4">Você precisa fazer login no Painel para acessar a área de Publicação.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-8 border-b border-lasnoches-border pb-4">
        Publicação de Capítulos
      </h1>

      <div className="space-y-8">
        
        {/* Seleção de Servidor (Provider) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setProvider('r2')}
            className={`p-4 border text-left transition-colors flex items-center justify-between ${provider === 'r2' ? 'border-lasnoches-cero bg-lasnoches-surface' : 'border-lasnoches-border bg-transparent hover:border-gray-600'}`}
          >
            <span className="font-oswald uppercase tracking-wider text-sm flex items-center gap-2 text-white">
              <Cloud className={`w-4 h-4 ${provider === 'r2' ? 'text-lasnoches-cero' : 'text-lasnoches-textDim'}`} /> Cloudflare R2
            </span>
            {provider === 'r2' && (
              <span className="text-xs text-lasnoches-cero flex items-center gap-1 font-oswald tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-lasnoches-cero animate-pulse"></span>
                Ativo
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setProvider('imgbb')}
            className={`p-4 border text-left transition-colors flex items-center justify-between ${provider === 'imgbb' ? 'border-lasnoches-cero bg-lasnoches-surface' : 'border-lasnoches-border bg-transparent hover:border-gray-600'}`}
          >
            <span className="font-oswald uppercase tracking-wider text-sm flex items-center gap-2 text-white">
              <Image className={`w-4 h-4 ${provider === 'imgbb' ? 'text-lasnoches-cero' : 'text-lasnoches-textDim'}`} /> ImgBB
            </span>
            {provider === 'imgbb' && (
              <span className="text-xs text-lasnoches-cero flex items-center gap-1 font-oswald tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-lasnoches-cero animate-pulse"></span>
                Ativo
              </span>
            )}
          </button>
        </div>

        {/* Formulário Principal */}
        <form onSubmit={handlePublicar} className="space-y-6">
          
          <div>
            <label className="block font-oswald uppercase tracking-wider text-xs text-lasnoches-textDim mb-2">Tipo de Conteúdo</label>
            <div className="grid grid-cols-2 border border-lasnoches-border">
              <button
                type="button"
                onClick={() => { setTipoConteudo('manga'); setObraId(''); }}
                className={`py-3 font-oswald uppercase tracking-wider text-sm transition-colors ${tipoConteudo === 'manga' ? 'bg-white text-black' : 'bg-transparent text-lasnoches-textDim hover:text-white'}`}
              >
                Mangá
              </button>
              <button
                type="button"
                onClick={() => { setTipoConteudo('novel'); setObraId(''); }}
                className={`py-3 font-oswald uppercase tracking-wider text-sm transition-colors border-l border-lasnoches-border ${tipoConteudo === 'novel' ? 'bg-white text-black' : 'bg-transparent text-lasnoches-textDim hover:text-white'}`}
              >
                Novel
              </button>
            </div>
          </div>

          <div>
            <label className="block font-oswald uppercase tracking-wider text-xs text-lasnoches-textDim mb-2">Obra</label>
            <select 
              required
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              className="w-full bg-lasnoches-surface border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero transition-colors"
            >
              <option value="">Selecione uma obra...</option>
              {obras
                .filter(obra => tipoConteudo === 'novel' ? obra.tipo === 'Novel' : obra.tipo !== 'Novel')
                .map(obra => (
                  <option key={obra.id} value={obra.id}>{obra.titulo}</option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-oswald uppercase tracking-wider text-xs text-lasnoches-textDim mb-2">Nº Capítulo</label>
              <input 
                type="number" 
                step="0.1"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full bg-lasnoches-surface border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero transition-colors" 
                placeholder="Ex: 1 ou 1.5" 
              />
            </div>
            <div>
              <label className="block font-oswald uppercase tracking-wider text-xs text-lasnoches-textDim mb-2">Título (Opcional)</label>
              <input 
                type="text" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-lasnoches-surface border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero transition-colors" 
                placeholder="Nome do capítulo" 
              />
            </div>
          </div>

          <div className="relative border-2 border-dashed border-lasnoches-border p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-lasnoches-cero hover:bg-lasnoches-surface transition-all group">
            <input 
              type="file" 
              accept=".zip" 
              required
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              disabled={uploading}
            />
            <Upload className={`w-8 h-8 mb-4 transition-colors ${file ? 'text-lasnoches-cero' : 'text-lasnoches-textDim group-hover:text-lasnoches-cero'}`} />
            <p className={`font-oswald tracking-wide text-lg ${file ? 'text-white' : 'text-lasnoches-textDim'}`}>
              {file ? file.name : 'Clique ou arraste um arquivo .zip'}
            </p>
            <p className="text-xs text-lasnoches-textDim mt-2">
              Contendo as imagens soltas ou em pastas. Serão ordenadas por nome automaticamente.
            </p>
          </div>

          {uploading && (
            <div className="w-full bg-lasnoches-surface border border-lasnoches-border p-4">
              <div className="flex justify-between text-xs font-oswald uppercase tracking-wider text-lasnoches-textDim mb-2">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-black h-2 overflow-hidden">
                <div className="bg-lasnoches-cero h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-white text-black font-oswald uppercase tracking-widest py-4 hover:bg-lasnoches-cero transition-colors text-lg flex justify-center items-center gap-3 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Publicar Capítulo'}
          </button>
        </form>

      </div>
    </div>
  );
}
/ /   G a t i l h o   d e   d e p l o y  
 