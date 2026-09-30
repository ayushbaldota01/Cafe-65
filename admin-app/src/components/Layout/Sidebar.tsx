import { Link, useLocation } from 'react-router-dom';
import { Coffee, ListOrdered, MenuSquare, LogOut, X } from 'lucide-react';

interface Props {
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ onLogout, isOpen, onClose }: Props) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-semibold transition-colors min-h-[56px]
    ${isActive(path) 
      ? 'bg-brand-100 text-brand-700' 
      : 'text-gray-600 hover:bg-gray-100'}
  `;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full w-72 bg-white border-r flex flex-col shadow-sm z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Cafe 65</h1>
          </div>
          <button className="lg:hidden p-2 -mr-2" onClick={onClose}>
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      
      <nav className="flex-1 p-4 space-y-3">
        <Link to="/" onClick={onClose} className={linkClass('/')}>
          <ListOrdered className="w-6 h-6" />
          Live Orders
        </Link>
        <Link to="/menu" onClick={onClose} className={linkClass('/menu')}>
          <MenuSquare className="w-6 h-6" />
          Menu Management
        </Link>
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-4 rounded-xl text-lg font-semibold text-red-600 hover:bg-red-50 transition-colors min-h-[56px]"
        >
          <LogOut className="w-6 h-6" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
