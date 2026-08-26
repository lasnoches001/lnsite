import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas ou você não tem acesso a esta área.');
      setLoading(false);
    } else if (data.session) {
      navigate('/painel');
    }
  };

  return (
    <div className="fixed inset-0 bg-lasnoches-darker flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-lasnoches-surface border border-lasnoches-border p-8 relative overflow-hidden">
        {/* Detalhe visual (Reiatsu) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-lasnoches-cero"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full border border-lasnoches-text flex items-center justify-center mb-4 bg-lasnoches-darker">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display text-3xl tracking-widest text-white uppercase text-center">
            HUECO MUNDO
          </h1>
          <p className="font-oswald text-xs uppercase tracking-widest text-lasnoches-textDim mt-2">
            Acesso Restrito
          </p>
        </div>

        {error && (
          <div className="bg-lasnoches-blood/10 border border-lasnoches-blood text-lasnoches-blood text-sm p-3 mb-6 text-center font-oswald tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-oswald uppercase tracking-wider text-xs text-lasnoches-textDim mb-2">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-lasnoches-bg border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero transition-colors" 
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block font-oswald uppercase tracking-wider text-xs text-lasnoches-textDim mb-2">Senha Secreta</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-lasnoches-bg border border-lasnoches-border text-white p-3 focus:outline-none focus:border-lasnoches-cero transition-colors" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-oswald uppercase tracking-widest py-3 hover:bg-lasnoches-text transition-colors disabled:opacity-50"
          >
            {loading ? 'Validando Reiatsu...' : 'Destrancar'}
          </button>
        </form>
      </div>
    </div>
  );
}
