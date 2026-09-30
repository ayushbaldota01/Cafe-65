import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Plus } from 'lucide-react';
import type { Item } from '../types';

export function MenuManagement() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('*').order('name');
    if (data) setItems(data as Item[]);
  };

  const toggleItemAvailability = async (id: string, currentStatus: boolean) => {
    await supabase.from('items').update({ is_available: !currentStatus }).eq('id', id);
    fetchItems();
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <button 
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Item</th>
                <th className="p-4 font-semibold text-gray-600">Category</th>
                <th className="p-4 font-semibold text-gray-600">Base Price</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="font-bold text-gray-900">{item.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{item.category}</td>
                  <td className="p-4 font-bold text-gray-900">₹{item.base_price}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleItemAvailability(item.id, item.is_available)}
                      className={`px-4 py-2 rounded-full text-sm font-bold min-w-[100px] transition-colors ${
                        item.is_available 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {item.is_available ? 'Available' : '86\'d (Out)'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-3 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors inline-flex items-center justify-center">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
