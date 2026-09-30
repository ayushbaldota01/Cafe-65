import { Info, Star, Clock } from 'lucide-react';

interface Props {
  onOpenInfo: () => void;
}

export function CafeHero({ onOpenInfo }: Props) {
  return (
    <div className="relative h-64 md:h-[400px] w-full overflow-hidden">
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1600" 
        alt="Cafe 65 Interior" 
        className="w-full h-full object-cover"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 flex items-end justify-between">
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">Cafe 65</h1>
          <p className="text-gray-200 text-sm md:text-base max-w-md mb-4 font-medium line-clamp-2">
            Specialty coffee, wood-fired pizzas, and gourmet sandwiches crafted with love.
          </p>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm font-bold">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.8 (120+ ratings)</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-green-400" />
              <span>20-30 mins</span>
            </div>
          </div>
        </div>
        
        {/* Info Button */}
        <button 
          onClick={onOpenInfo}
          className="bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md text-white p-3 md:px-6 md:py-3 rounded-xl flex items-center gap-2 font-bold"
        >
          <Info className="w-5 h-5" />
          <span className="hidden md:inline">View Info</span>
        </button>
      </div>
    </div>
  );
}
