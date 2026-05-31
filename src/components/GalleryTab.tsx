import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, X, Eye, Maximize2 } from 'lucide-react';

interface GalleryPhoto {
  id: string;
  category: string; // 'building' | 'teachers' | 'students' | 'events'
  base64: string;
}

interface GalleryTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function GalleryTab({ showToast }: GalleryTabProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('building');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Categories translation and identifier definition
  const categories = [
    { id: 'building', label: 'মাদ্রাসা ভবন', labelEn: 'Madrasha Building' },
    { id: 'teachers', label: 'শিক্ষক-কর্মচারী', labelEn: 'Teachers & Staff' },
    { id: 'students', label: 'ছাত্রী', labelEn: 'Students' },
    { id: 'events', label: 'অনুষ্ঠান', labelEn: 'Events' }
  ];

  // Load photos on mount
  useEffect(() => {
    const stored = localStorage.getItem('dumki_gallery_photos');
    if (stored) {
      try {
        setPhotos(JSON.parse(stored));
      } catch (e) {
        setPhotos([]);
      }
    }
  }, []);

  // Sync to localStorage
  const savePhotos = (updatedPhotos: GalleryPhoto[]) => {
    setPhotos(updatedPhotos);
    localStorage.setItem('dumki_gallery_photos', JSON.stringify(updatedPhotos));
  };

  // Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Reject excessive size files
    if (file.size > 1.2 * 1024 * 1024) {
      showToast('ছবিটির আকার ১.২ মেগাবাইট এর কম হতে হবে! (Image must be under 1.2MB for local memory storage)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newPhoto: GalleryPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        category: activeCategory,
        base64
      };
      const updated = [...photos, newPhoto];
      savePhotos(updated);
      showToast('গ্যালারিতে নতুন ছবি সফলভাবে যুক্ত করা হয়েছে!', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Delete handler
  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering lightbox
    if (window.confirm('আপনি কি এই ছবিটি গ্যালারি থেকে চিরতরে মুছে ফেলতে চান?')) {
      const updated = photos.filter(p => p.id !== id);
      savePhotos(updated);
      showToast('ছবিটি সফলভাবে মুছে ফেলা হয়েছে!', 'success');
    }
  };

  // Count photos per category helper
  const getCategoryCount = (catId: string) => {
    return photos.filter(p => p.category === catId).length;
  };

  // Filter photos for current active tab
  const activePhotos = photos.filter(p => p.category === activeCategory);

  return (
    <div id="gallery-tab" className="space-y-6 select-none animate-fade-in no-print">
      
      {/* Upper header styling */}
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-madrasha-green-700 tracking-tight flex items-center gap-2">
            📸 ছবি গ্যালারি (Photo Gallery)
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold font-sans">
            Dumki Girls Madrasha Visual History & Highlights
          </p>
        </div>
        <div className="h-[2px] w-12 bg-madrasha-gold-500"></div>
      </div>

      {/* Category Tabs Section (Dynamic buttons showing live uploads count format: "মাদ্রাসা ভবন (৩)") */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold font-sans transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-madrasha-green-700 border-madrasha-green-800 text-white shadow-xs'
                  : 'bg-white border-slate-300 text-zinc-600 hover:bg-slate-50 hover:text-zinc-800'
              }`}
            >
              <span className="leading-none">{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-sans ${
                isActive ? 'bg-madrasha-gold-500 text-zinc-900' : 'bg-slate-100 text-zinc-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Grid layout: 3 columns desktop, 2 columns mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Slot 1: ALWAYS Show "Add Image" Placeholder as the first interactive target action of the selected category tab */}
        <label 
          className="relative aspect-video rounded-xl border-2 border-dashed border-zinc-300 bg-white hover:border-madrasha-green-600 flex flex-col items-center justify-center p-4 cursor-pointer hover:shadow-sm duration-200 group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-madrasha-green-50 text-madrasha-green-700 flex items-center justify-center border border-madrasha-green-100 group-hover:scale-110 duration-200">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold text-zinc-700 mt-2.5 leading-none">নতুন ছবি যোগ করুন</span>
          <span className="text-[8px] font-sans text-zinc-400 mt-1 uppercase font-semibold">Upload base64 photo</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            className="hidden" 
          />
        </label>

        {/* Dynamic Photo Cards Render */}
        {activePhotos.map((photo) => (
          <div 
            key={photo.id}
            onClick={() => setLightboxPhoto(photo.base64)}
            className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-madrasha-green-500 shadow-xs hover:shadow-md transition-all duration-300 cursor-zoom-in group"
          >
            {/* The actual image */}
            <img 
              src={photo.base64} 
              alt="Madrasha Gallery Snapshot" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />

            {/* Dark Hover overlay with Magnify and Delete controllers */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              
              {/* Maximize Icon */}
              <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition backdrop-blur-xs">
                <Maximize2 className="h-4 w-4" />
              </div>

              {/* Hover Delete trigger control - styled safely */}
              <button
                title="মুছে ফেলুন (Purge Image)"
                onClick={(e) => handleDeletePhoto(photo.id, e)}
                className="w-8 h-8 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center transition border border-rose-500 cursor-pointer shadow-md"
              >
                <Trash2 className="h-4 w-4" />
              </button>

            </div>

            {/* Tag/Index Label */}
            <span className="absolute bottom-2 left-2 bg-black/55 text-[8.5px] font-sans text-white px-2 py-0.5 rounded-full backdrop-blur-xs font-semibold">
              HD Snapshot
            </span>
          </div>
        ))}

      </div>

      {/* Conditional Info Banner when no uploads exist */}
      {activePhotos.length === 0 && (
        <div className="bg-slate-100 rounded-xl p-8 text-center border text-zinc-500 text-xs">
          <ImageIcon className="h-10 w-10 text-zinc-400 mx-auto mb-2" />
          <p className="font-bold">গ্যালারিতে এখনও কোনো ছবি রাখা হয়নি।</p>
          <p className="text-[10px] text-zinc-400 mt-1">পছন্দসই ক্যাটাগরিতে ছবি যোগ করতে "নতুন ছবি যোগ করুন" স্লটে ফাইল আপলোড দিন।</p>
        </div>
      )}

      {/* Lightbox Mode Overlay (Full viewport with backdrop exit triggers) */}
      {lightboxPhoto && (
        <div 
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <button 
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/30 text-white p-2 rounded-full cursor-pointer transition border border-white/25"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxPhoto} 
              alt="Fullscreen View" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain shadow-2xl" 
            />
          </div>
        </div>
      )}

    </div>
  );
}
