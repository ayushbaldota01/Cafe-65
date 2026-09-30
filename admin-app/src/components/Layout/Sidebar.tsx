import { Link, useLocation } from 'react-router-dom';
import { Coffee, ListOrdered, MenuSquare, LogOut } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: Props) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-semibold transition-colors min-h-[56px]
    ${isActive(path) 
      ? 'bg-brand-100 text-brand-700' 
      : 'text-gray-600 hover:bg-gray-100'}
  `;

  return (
    <aside className="w-72 bg-white border-r flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b">
        <Coffee className="w-8 h-8 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Cafe 65</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-3">
        <Link to="/" className={linkClass('/')}>
          <ListOrdered className="w-6 h-6" />
          Live Orders
        </Link>
        <Link to="/menu" className={linkClass('/menu')}>
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
  );
}
