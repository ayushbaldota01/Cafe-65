import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Coffee, User } from 'lucide-react';
import { Menu } from './pages/Menu';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { OrderHistory } from './pages/OrderHistory';
import { CartSheet } from './components/Cart/CartSheet';
import { Rider } from './pages/Rider';
import { useState, useEffect } from 'react';
import { useCartStore } from './store/cartStore';

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemsCount = useCartStore(state => state.items.reduce((sum, item) => sum + item.qty, 0));
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isMenuPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClass = isMenuPage && !scrolled 
    ? "bg-transparent text-white absolute w-full transition-all duration-300"
    : "bg-white/80 backdrop-blur-lg shadow-sm text-gray-900 sticky top-0 transition-all duration-300";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
      
      {/* Header */}
      <header className={`z-40 ${headerClass}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <Coffee className={`w-6 h-6 ${isMenuPage && !scrolled ? 'text-white' : 'text-brand-600'}`} />
            <span className="tracking-tight">Cafe 65</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/history" className="hover:opacity-70 transition-opacity">
              <User className="w-6 h-6" />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:opacity-70 transition-opacity"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full relative ${!isMenuPage ? 'max-w-5xl mx-auto p-4 mt-6' : ''}`}>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/tracking/:orderId" element={<OrderTracking />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/rider" element={<Rider />} />
        </Routes>
      </main>
      
      {/* Cart Sheet */}
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
