import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MenuManagement } from './pages/MenuManagement';
import { useState } from 'react';
import { Menu as MenuIcon } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuth') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    localStorage.setItem('isAdminAuth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-16 bg-white border-b flex items-center px-4 z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2">
            <MenuIcon className="w-6 h-6 text-gray-700" />
          </button>
          <span className="font-bold text-lg ml-2">Admin Dashboard</span>
        </div>

        <Sidebar 
          onLogout={handleLogout} 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 overflow-auto p-4 pt-20 lg:p-8 lg:pt-8 relative w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
