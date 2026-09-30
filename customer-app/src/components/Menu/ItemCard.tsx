import type { Item } from '../../types';

interface Props {
  item: Item;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: Props) {
  // Simple bestseller logic for demo
  const isBestseller = item.id.includes('pizza') || item.id.includes('fries');

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={item.image_url} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!item.is_available && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="font-bold text-gray-900 px-4 py-2 bg-white rounded-full shadow-sm">
              Currently Unavailable
            </span>
          </div>
        )}
        {item.is_available && isBestseller && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            Bestseller
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="font-bold text-xl text-brand-600">
            {item.variants?.length ? `from ₹${item.base_price}` : `₹${item.base_price}`}
          </div>
          <button 
            disabled={!item.is_available}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
}
