import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RootLayout from './layouts/RootLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Obras from './pages/Obras';
import ObraDetalhes from './pages/ObraDetalhes';
import Leitura from './pages/Leitura';
import Atualizacoes from './pages/Atualizacoes';
import Painel from './pages/Painel';
import Publicacao from './pages/Publicacao';
import LoginAdmin from './pages/LoginAdmin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas sem Layout (Landing e Login Secreto) */}
          <Route path="/" element={<Home />} />
          <Route path="/fluideznecessaria" element={<LoginAdmin />} />

          {/* Rotas com Layout Base */}
          <Route element={<RootLayout />}>
            {/* Rotas Públicas */}
            <Route path="/obras" element={<Obras />} />
            <Route path="/obras/:id" element={<ObraDetalhes />} />
            <Route path="/leitura/:id" element={<Leitura />} />
            <Route path="/atualizacoes" element={<Atualizacoes />} />
            
            {/* Rotas Protegidas (Apenas Admin) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/painel" element={<Painel />} />
              <Route path="/publicacao" element={<Publicacao />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
