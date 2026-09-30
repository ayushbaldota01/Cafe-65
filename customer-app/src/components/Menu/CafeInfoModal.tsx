import { X, MapPin, Clock, Phone, Mail } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CafeInfoModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:w-[500px] max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900">About Cafe 65</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Map Mock */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2"><MapPin className="text-brand-600" /> Location</h3>
            <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden relative border">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                alt="Map View" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-xl shadow-lg font-bold text-brand-600 flex items-center gap-2">
                  <MapPin className="fill-brand-600 text-white w-5 h-5" />
                  123 Main St, Bangalore
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Opposite Central Park, Bangalore, Karnataka 560001</p>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2"><Clock className="text-brand-600" /> Opening Hours</h3>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border">
              <div className="flex justify-between"><span className="text-gray-500">Mon - Fri</span><span className="font-medium">9:00 AM - 10:00 PM</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Sat - Sun</span><span className="font-medium">10:00 AM - 11:30 PM</span></div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2"><Phone className="text-brand-600" /> Contact Us</h3>
            <div className="grid grid-cols-2 gap-3">
              <a href="tel:+919876543210" className="flex items-center gap-3 p-4 bg-gray-50 border rounded-2xl hover:border-brand-500 transition-colors">
                <div className="bg-brand-100 p-2 rounded-full text-brand-600"><Phone className="w-5 h-5" /></div>
                <span className="font-medium text-sm">Call Us</span>
              </a>
              <a href="mailto:hello@cafe65.com" className="flex items-center gap-3 p-4 bg-gray-50 border rounded-2xl hover:border-brand-500 transition-colors">
                <div className="bg-brand-100 p-2 rounded-full text-brand-600"><Mail className="w-5 h-5" /></div>
                <span className="font-medium text-sm">Email</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
