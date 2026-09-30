import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MenuManagement } from './pages/MenuManagement';
import { useState } from 'react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar onLogout={() => setIsAuthenticated(false)} />
        <main className="flex-1 overflow-auto p-8 relative">
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
