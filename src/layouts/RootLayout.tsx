import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-lasnoches-bg text-lasnoches-text">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
