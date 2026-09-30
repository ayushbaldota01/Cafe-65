import { useState } from 'react';
import { dummyItems, CATEGORIES } from '../lib/dummyData';
import { ItemCard } from '../components/Menu/ItemCard';
import { ItemDetailModal } from '../components/Menu/ItemDetailModal';
import { CafeHero } from '../components/Menu/CafeHero';
import { CafeInfoModal } from '../components/Menu/CafeInfoModal';
import type { Item } from '../types';

export function Menu() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const filteredItems = dummyItems.filter(item => 
    activeCategory === 'All' ? true : item.category.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="pb-24">
      <CafeHero onOpenInfo={() => setIsInfoOpen(true)} />

      {/* Category Tabs with Glassmorphism */}
      <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 py-4 px-1 max-w-5xl mx-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-gray-900 text-white shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-5xl mx-auto p-4 mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeCategory} Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border shadow-sm">
              No items in this category yet.
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          isOpen={true} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
      
      <CafeInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
}
