import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, BookOpen, Database, Trash2, LogOut, UploadCloud, MessageCircle, Send, Power, Image } from 'lucide-react';
import Publicacao from './Publicacao';

export default function Painel() {
  const [activeTab, setActiveTab] = useState<'obras' | 'publicacao' | 'config'>('obras');
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    sinopse: '',
    status: 'Em Lançamento',
    tipo: 'Mangá',
    capa_url: ''
  });

  const [r2Config, setR2Config] = useState({
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    publicUrl: '',
    bucketName: ''
  });

  const [telegramConfig, setTelegramConfig] = useState({
    ativo: false,
    token: '',
    chatId: '',
    topicId: '',
    siteUrl: 'https://',
    mensagem: '📚 Novo capítulo disponível!\n\n📖 {work_name} — Cap. {chapter_number}\n\nLeia agora: {chapter_url}'
  });

  const [imgbbKeys, setImgbbKeys] = useState('');

  useEffect(() => {
    const savedR2 = localStorage.getItem('@lasnoches:r2Config');
    if (savedR2) setR2Config(JSON.parse(savedR2));
    
    const savedImgbb = localStorage.getItem('@lasnoches:imgbbKeys');
    if (savedImgbb) setImgbbKeys(savedImgbb);
  }, []);

  const handleSalvarR2 = () => {
    localStorage.setItem('@lasnoches:r2Config', JSON.stringify(r2Config));
    alert('Credenciais do Cloudflare R2 salvas com segurança no seu navegador!');
  };

  const handleSalvarImgbb = () => {
    localStorage.setItem('@lasnoches:imgbbKeys', imgbbKeys);
    alert('Chaves do ImgBB salvas com segurança!');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(session) fetchObras();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) fetchObras();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchObras = async () => {
    setLoading(true);
    const { data } = await supabase.from('obras').select('*').order('created_at', { ascending: false });
    if (data) setObras(data);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erro ao logar: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSalvarObra = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase.from('obras').insert([formData]);
    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Sucesso! Obra salva no banco.");
      setModalOpen(false);
      setFormData({ titulo: '', sinopse: '', status: 'Em Lançamento', tipo: 'Mangá', capa_url: '' });
      fetchObras();
    }
    setSalvando(false);
  };

  if (!session) {
    return (
      <div className="w-full max-w-md mx-auto mt-20 bg-lasnoches-surface border border-lasnoches-border p-8 rounded shadow-2xl">
        <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-6 text-center">Login Restrito</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email do Admin" className="w-full p-3 bg-lasnoches-bg border border-lasnoches-border text-white" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full p-3 bg-lasnoches-bg border border-lasnoches-border text-white" required />
          <button type="submit" className="w-full bg-white text-black p-3 font-oswald uppercase tracking-widest hover:bg-lasnoches-cero transition-colors">Entrar no Painel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-lasnoches-border pb-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-2">Painel de Controle</h1>
          <p className="text-lasnoches-textDim text-sm font-oswald uppercase tracking-wider">Logado como Admin Central</p>
        </div>
        <button onClick={handleLogout} className="text-lasnoches-blood hover:text-red-400 transition-colors flex items-center gap-2 font-oswald uppercase text-sm tracking-widest">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      <div className="flex space-x-1 border-b border-lasnoches-border mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('obras')} className={`px-6 py-3 font-oswald uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'obras' ? 'border-b-2 border-lasnoches-cero text-white bg-lasnoches-surface/50' : 'text-lasnoches-textDim hover:text-white'}`}>
          <BookOpen className="w-4 h-4 inline-block mr-2 -mt-1"/> Obras Cadastradas
        </button>
        <button onClick={() => setActiveTab('publicacao')} className={`px-6 py-3 font-oswald uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'publicacao' ? 'border-b-2 border-lasnoches-cero text-white bg-lasnoches-surface/50' : 'text-lasnoches-textDim hover:text-white'}`}>
          <UploadCloud className="w-4 h-4 inline-block mr-2 -mt-1"/> Publicar Capítulo
        </button>
        <button onClick={() => setActiveTab('config')} className={`px-6 py-3 font-oswald uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'config' ? 'border-b-2 border-lasnoches-cero text-white bg-lasnoches-surface/50' : 'text-lasnoches-textDim hover:text-white'}`}>
          <Database className="w-4 h-4 inline-block mr-2 -mt-1"/> Configurações (R2)
        </button>
      </div>

      <div className="w-full min-h-[500px]">
        {activeTab === 'obras' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-lasnoches-surface p-4 border border-lasnoches-border">
              <h2 className="font-oswald uppercase tracking-wide text-white text-lg">Suas Obras</h2>
              <button onClick={() => setModalOpen(true)} className="bg-lasnoches-cero text-black px-4 py-2 font-oswald uppercase tracking-wider text-sm hover:bg-white transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nova Obra
              </button>
            </div>
            {loading ? (
              <div className="text-center p-12 text-lasnoches-textDim font-oswald uppercase tracking-widest">Carregando...</div>
            ) : obras.length === 0 ? (
              <div className="text-center p-12 bg-lasnoches-surface border border-lasnoches-border text-lasnoches-textDim font-oswald uppercase tracking-widest">Nenhuma obra cadastrada ainda.</div>
            ) : (
              <div className="bg-lasnoches-surface border border-lasnoches-border overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/50 border-b border-lasnoches-border">
                    <tr>
                      <th className="p-4 font-oswald uppercase tracking-widest text-xs text-lasnoches-textDim font-normal">Obra</th>
                      <th className="p-4 font-oswald uppercase tracking-widest text-xs text-lasnoches-textDim font-normal">Status</th>
                      <th className="p-4 font-oswald uppercase tracking-widest text-xs text-lasnoches-textDim font-normal text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lasnoches-border">
                    {obras.map((obra) => (
                      <tr key={obra.id} className="hover:bg-black/20 transition-colors">
                        <td className="p-4 flex items-center gap-3 min-w-[250px]">
                          <img src={obra.capa_url} alt={obra.titulo} className="w-10 h-14 object-cover" />
                          <div>
                            <p className="font-oswald text-white uppercase tracking-wide">{obra.titulo}</p>
                            <p className="text-xs text-lasnoches-textDim truncate max-w-[200px]">{obra.sinopse}</p>
                          </div>
                        </td>
                        <td className="p-4 text-xs uppercase tracking-wider text-lasnoches-cero">{obra.status}</td>
                        <td className="p-4 text-right">
                          <button onClick={async () => {
                            if(confirm(`Excluir a obra "${obra.titulo}"?`)) {
                              await supabase.from('obras').delete().eq('id', obra.id);
                              fetchObras();
                            }
                          }} className="text-lasnoches-blood hover:text-red-400 p-2 transition-colors inline-flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'publicacao' && (
          <div className="bg-lasnoches-surface p-6 border border-lasnoches-border">
            <Publicacao />
          </div>
        )}

        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="space-y-6">
              {/* Bloco Cloudflare R2 */}
              <div className="bg-lasnoches-surface p-6 border border-lasnoches-border space-y-4">
                <h2 className="font-oswald uppercase tracking-wide text-white text-lg flex items-center gap-2 mb-6">
                  <Database className="w-5 h-5 text-lasnoches-cero" /> Cloudflare R2 Config
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">Account ID</label>
                    <input type="text" value={r2Config.accountId} onChange={e => setR2Config({...r2Config, accountId: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">Access Key ID</label>
                      <input type="password" value={r2Config.accessKeyId} onChange={e => setR2Config({...r2Config, accessKeyId: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                    </div>
                    <div>
                      <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">Secret Access Key</label>
                      <input type="password" value={r2Config.secretAccessKey} onChange={e => setR2Config({...r2Config, secretAccessKey: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">Nome do Bucket</label>
                      <input type="text" value={r2Config.bucketName} onChange={e => setR2Config({...r2Config, bucketName: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                    </div>
                    <div>
                      <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">URL Pública</label>
                      <input type="text" value={r2Config.publicUrl} onChange={e => setR2Config({...r2Config, publicUrl: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                    </div>
                  </div>
                  <button onClick={handleSalvarR2} className="w-full bg-white text-black px-4 py-3 font-oswald uppercase tracking-widest mt-4 hover:bg-lasnoches-cero transition-colors">
                    Salvar Configurações
                  </button>
                </div>
              </div>

              {/* Bloco Automação Telegram */}
              <div className="bg-lasnoches-surface p-6 border border-lasnoches-border space-y-6">
              <h2 className="font-oswald uppercase tracking-wide text-white text-lg flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-400" /> Telegram
              </h2>

              <div className="flex items-center justify-between p-4 border border-lasnoches-border bg-lasnoches-bg">
                <div className="flex items-start gap-3">
                  <Power className={`w-5 h-5 mt-1 ${telegramConfig.ativo ? 'text-lasnoches-cero' : 'text-lasnoches-textDim'}`} />
                  <div>
                    <h3 className="font-oswald uppercase text-white tracking-wide text-sm">Bot ativo</h3>
                    <p className="text-xs text-lasnoches-textDim mt-1">Envia notificação ao publicar um capítulo</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTelegramConfig({...telegramConfig, ativo: !telegramConfig.ativo})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${telegramConfig.ativo ? 'bg-lasnoches-cero' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${telegramConfig.ativo ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">Token do Bot</label>
                  <input type="password" value={telegramConfig.token} onChange={e => setTelegramConfig({...telegramConfig, token: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                  <p className="text-xs text-lasnoches-textDim mt-1">Crie seu bot com @BotFather no Telegram.</p>
                </div>
                
                <div>
                  <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">Chat ID do Canal/Grupo</label>
                  <input type="text" value={telegramConfig.chatId} onChange={e => setTelegramConfig({...telegramConfig, chatId: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" placeholder="-1002472866564" />
                  <p className="text-xs text-lasnoches-textDim mt-1">Adicione o bot como administrador do canal ou grupo.</p>
                </div>

                <div>
                  <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">ID do Tópico (message_thread_id)</label>
                  <input type="text" value={telegramConfig.topicId} onChange={e => setTelegramConfig({...telegramConfig, topicId: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                  <p className="text-xs text-lasnoches-textDim mt-1">Para grupos com tópicos ativos. Especifica em qual tópico a mensagem será enviada.</p>
                </div>

                <div>
                  <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">URL do Site</label>
                  <input type="text" value={telegramConfig.siteUrl} onChange={e => setTelegramConfig({...telegramConfig, siteUrl: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero" />
                  <p className="text-xs text-lasnoches-textDim mt-1">URL base para gerar o link direto do capítulo.</p>
                </div>

                <div>
                  <label className="block text-xs text-lasnoches-textDim mb-1 uppercase font-oswald">Modelo da Mensagem</label>
                  <textarea rows={5} value={telegramConfig.mensagem} onChange={e => setTelegramConfig({...telegramConfig, mensagem: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero resize-y font-mono" />
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['{work_name}', '{chapter_number}', '{title}', '{volume}', '{chapter_url}'].map(tag => (
                      <span key={tag} className="text-xs text-lasnoches-textDim border border-lasnoches-border px-2 py-1 rounded cursor-pointer hover:bg-lasnoches-cero hover:text-black transition-colors" onClick={() => setTelegramConfig({...telegramConfig, mensagem: telegramConfig.mensagem + ' ' + tag})}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-lasnoches-textDim mt-2">Clique nas variáveis para inseri-las no modelo.</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-lasnoches-border mt-6">
                  <button onClick={() => alert('Configurações do Telegram salvas visualmente!')} className="flex-1 bg-white text-black px-4 py-3 font-oswald uppercase tracking-widest hover:bg-lasnoches-cero transition-colors text-center">
                    Salvar
                  </button>
                  <button onClick={() => alert('Enviando mensagem de teste...')} className="flex-1 bg-lasnoches-bg border border-lasnoches-border text-white px-4 py-3 font-oswald uppercase tracking-widest hover:border-blue-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Enviar Teste
                  </button>
                </div>

              </div>
            </div>

            <div className="space-y-6">
              {/* Bloco ImgBB Rotativo */}
              <div className="bg-lasnoches-surface p-6 border border-lasnoches-border space-y-4">
                <h2 className="font-oswald uppercase tracking-wide text-white text-lg flex items-center gap-2 mb-6">
                  <Image className="w-5 h-5 text-lasnoches-cero" /> ImgBB API (Rotativo)
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-lasnoches-textDim uppercase font-oswald">Chaves de API</label>
                      <span className="text-xs text-lasnoches-cero font-oswald uppercase tracking-wider">
                        {imgbbKeys.split('\n').filter(k => k.trim()).length} chaves carregadas
                      </span>
                    </div>
                    <textarea 
                      rows={10} 
                      value={imgbbKeys} 
                      onChange={e => setImgbbKeys(e.target.value)} 
                      placeholder="Cole suas chaves de API aqui, uma por linha..."
                      className="w-full bg-lasnoches-bg border border-lasnoches-border p-3 text-sm text-white focus:outline-none focus:border-lasnoches-cero resize-y font-mono" 
                    />
                    <p className="text-xs text-lasnoches-textDim mt-2">O sistema vai alternar automaticamente entre essas chaves para cada imagem enviada, contornando o limite da API (rate limit).</p>
                  </div>
                  <button onClick={handleSalvarImgbb} className="w-full bg-white text-black px-4 py-3 font-oswald uppercase tracking-widest mt-4 hover:bg-lasnoches-cero transition-colors">
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-lasnoches-surface border border-lasnoches-border w-full max-w-xl p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-lasnoches-textDim hover:text-white p-2">✕</button>
            <h2 className="font-display text-2xl uppercase tracking-wide text-white mb-6">Cadastrar Obra</h2>
            <form onSubmit={handleSalvarObra} className="space-y-4">
              <input required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Nome da Obra" className="w-full bg-lasnoches-bg border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero" />
              <textarea required rows={3} value={formData.sinopse} onChange={e => setFormData({...formData, sinopse: e.target.value})} placeholder="Sinopse..." className="w-full bg-lasnoches-bg border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero">
                  <option value="Em Lançamento">Em Lançamento</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Hiato">Hiato</option>
                </select>
                <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full bg-lasnoches-bg border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero">
                  <option value="Mangá">Mangá</option>
                  <option value="Manhwa">Manhwa</option>
                  <option value="Manhua">Manhua</option>
                  <option value="One-shot">One-shot</option>
                  <option value="Novel">Novel</option>
                </select>
              </div>
              <input required value={formData.capa_url} onChange={e => setFormData({...formData, capa_url: e.target.value})} placeholder="URL da Capa" className="w-full bg-lasnoches-bg border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero" />
              <button disabled={salvando} type="submit" className="w-full bg-white text-black font-oswald uppercase py-3 hover:bg-lasnoches-cero transition-colors mt-6">
                {salvando ? 'Salvando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
