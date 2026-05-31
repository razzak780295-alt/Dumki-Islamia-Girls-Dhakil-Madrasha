import React, { useState, useEffect } from 'react';
import { Quote, Camera, Save, RefreshCw } from 'lucide-react';

interface BaniTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function BaniTab({ showToast }: BaniTabProps) {
  // Principal State
  const [principalName, setPrincipalName] = useState('মাওলানা মোহাম্মদ হারুন অর রশিদ');
  const [principalTitle, setPrincipalTitle] = useState('সুপার মহোদয়, দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা');
  const [principalBani, setPrincipalBani] = useState('');
  const [principalImage, setPrincipalImage] = useState<string | null>(null);

  // Chairman State
  const [chairmanName, setChairmanName] = useState('মাওলানা মোঃ আবদুল মালেক');
  const [chairmanTitle, setChairmanTitle] = useState('সভাপতি, দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা');
  const [chairmanBani, setChairmanBani] = useState('');
  const [chairmanImage, setChairmanImage] = useState<string | null>(null);

  // Editing Forms State (Admin Panel Inputs)
  const [editPrincipalBani, setEditPrincipalBani] = useState('');
  const [editChairmanBani, setEditChairmanBani] = useState('');

  // Default fallback text as spec state
  const defaultPrincipalBani = "আমাদের মাদ্রাসা শিক্ষার্থীদের ধর্মীয় ও নৈতিক মূল্যবোধ গঠনে এবং আধুনিক শিক্ষায় আলোকিত করতে সদা প্রতিশ্রুতিবদ্ধ। আল্লাহর রহমতে আমরা একটি আদর্শ শিক্ষাপ্রতিষ্ঠান গড়ে তুলতে চাই।";
  const defaultChairmanBani = "এই মাদ্রাসা আমাদের এলাকার গর্ব। আমরা চাই প্রতিটি শিক্ষার্থী সত্যিকারের মানুষ হিসেবে গড়ে উঠুক — দ্বীন ও দুনিয়া উভয় ক্ষেত্রে সফল হোক।";

  // Hydrate states from localStorage
  useEffect(() => {
    const pBani = localStorage.getItem('dumki_principal_bani');
    const cBani = localStorage.getItem('dumki_chairman_bani');
    const pImg = localStorage.getItem('dumki_principal_image');
    const cImg = localStorage.getItem('dumki_chairman_image');

    const loadedPBani = pBani !== null ? pBani : defaultPrincipalBani;
    const loadedCBani = cBani !== null ? cBani : defaultChairmanBani;

    setPrincipalBani(loadedPBani);
    setChairmanBani(loadedCBani);
    
    setEditPrincipalBani(loadedPBani);
    setEditChairmanBani(loadedCBani);

    if (pImg) setPrincipalImage(pImg);
    if (cImg) setChairmanImage(cImg);
  }, []);

  // Save changes handler for texts
  const handleSaveBani = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dumki_principal_bani', editPrincipalBani);
    localStorage.setItem('dumki_chairman_bani', editChairmanBani);
    
    setPrincipalBani(editPrincipalBani);
    setChairmanBani(editChairmanBani);

    showToast('বাণী সফলভাবে আপডেট করা হয়েছে! (Messages updated successfully!)', 'success');
  };

  // Image upload base64 converter helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, role: 'principal' | 'chairman') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: keep it reasonable (e.g. 1.5MB) to avoid exceeding localStorage quota
    if (file.size > 1.5 * 1024 * 1024) {
      showToast('ছবিটির আকার ১.৫ মেগাবাইট এর কম হতে হবে! (Image must be under 1.5MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (role === 'principal') {
        setPrincipalImage(base64String);
        localStorage.setItem('dumki_principal_image', base64String);
        showToast('সুপার মহোদয়ের ছবি সফলভাবে পরিবর্তন করা হয়েছে।', 'success');
      } else {
        setChairmanImage(base64String);
        localStorage.setItem('dumki_chairman_image', base64String);
        showToast('সভাপতির ছবি সফলভাবে পরিবর্তন করা হয়েছে।', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="bani-tab" className="space-y-8 select-none animate-fade-in no-print">
      
      {/* Title block with Bengali Style theme */}
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-madrasha-green-700 tracking-tight flex items-center gap-2">
            ✒️ সুপার ও সভাপতির বাণী (Principal & Chairman Messages)
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold font-sans">
            Dumki Girls Madrasha Leadership Insights
          </p>
        </div>
        <div className="h-[2px] w-12 bg-madrasha-gold-500"></div>
      </div>

      {/* Grid for public presentation view of the Messages Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Principal Message */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-madrasha-green-300 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          {/* Quote background shape */}
          <div className="absolute right-3 top-3 opacity-5 pointer-events-none group-hover:scale-110 duration-300">
            <Quote className="w-20 h-20 text-madrasha-green-700 font-black" />
          </div>

          <div className="space-y-4">
            {/* Top quote icon marker */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-madrasha-green-50 text-madrasha-green-700 flex items-center justify-center border border-madrasha-green-100 shrink-0">
                <Quote className="h-4 w-4" />
              </div>
              <span className="text-[9px] bg-madrasha-gold-500 text-zinc-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans leading-none">
                সুপার মহোদয়ের বাণী
              </span>
            </div>

            {/* Profile info block */}
            <div className="flex items-center gap-4 py-2">
              {/* Photo placeholder with clickable camera icon to change */}
              <label 
                title="সুপার মহোদয়ের ছবি পরিবর্তন করুন" 
                className="relative w-20 h-20 bg-slate-150 border-2 border-dashed border-slate-300 rounded-full flex flex-col justify-center items-center overflow-hidden cursor-pointer group hover:border-madrasha-green-600 hover:scale-105 duration-200 shrink-0"
              >
                {principalImage ? (
                  <>
                    <img 
                      src={principalImage} 
                      alt={principalName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                      <Camera className="h-4 w-4 text-white" />
                      <span className="text-[8px] text-white font-bold text-center mt-0.5 leading-none">পরিবর্তন</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-zinc-400">
                    <Camera className="h-6 w-6 text-zinc-400 group-hover:text-madrasha-green-600 transition duration-150" />
                    <span className="text-[8px] font-bold text-center mt-0.5 leading-tight group-hover:text-madrasha-green-700 font-sans">ছবি যোগ করুন</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'principal')} 
                  className="hidden" 
                />
              </label>

              <div>
                <h4 className="font-extrabold text-[13px] text-zinc-800 leading-tight">{principalName}</h4>
                <p className="text-[10px] text-zinc-405 leading-relaxed mt-1">{principalTitle}</p>
                <p className="text-[8px] font-sans text-emerald-600 font-semibold mt-1">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</p>
              </div>
            </div>

            {/* The actual message displaying decorative border & quote */}
            <div className="border-l-4 border-madrasha-green-600 bg-madrasha-green-50/40 p-4 rounded-r-xl relative">
              <p className="text-zinc-700 text-xs md:text-[12.5px] leading-relaxed font-medium font-sans">
                " {principalBani || defaultPrincipalBani} "
              </p>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 font-medium font-sans mt-4 border-t pt-2 flex justify-between items-center">
            <span>Dumki Patuakhali</span>
            <span className="opacity-70">প্রতিষ্ঠিত: ১৯৮০</span>
          </div>
        </div>

        {/* Card 2: Chairman Message */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-madrasha-green-300 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          {/* Quote background shape */}
          <div className="absolute right-3 top-3 opacity-5 pointer-events-none group-hover:scale-110 duration-300">
            <Quote className="w-20 h-20 text-madrasha-green-700 font-black" />
          </div>

          <div className="space-y-4">
            {/* Top quote icon marker */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-madrasha-green-50 text-madrasha-green-700 flex items-center justify-center border border-madrasha-green-100 shrink-0">
                <Quote className="h-4 w-4" />
              </div>
              <span className="text-[9px] bg-madrasha-green-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans leading-none">
                সভাপতির বাণী
              </span>
            </div>

            {/* Profile info block */}
            <div className="flex items-center gap-4 py-2">
              {/* Photo placeholder with clickable camera icon to change */}
              <label 
                title="সভাপতির ছবি পরিবর্তন করুন" 
                className="relative w-20 h-20 bg-slate-150 border-2 border-dashed border-slate-300 rounded-full flex flex-col justify-center items-center overflow-hidden cursor-pointer group hover:border-madrasha-green-600 hover:scale-105 duration-200 shrink-0"
              >
                {chairmanImage ? (
                  <>
                    <img 
                      src={chairmanImage} 
                      alt={chairmanName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                      <Camera className="h-4 w-4 text-white" />
                      <span className="text-[8px] text-white font-bold text-center mt-0.5 leading-none">পরিবর্তন</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-zinc-400">
                    <Camera className="h-6 w-6 text-zinc-400 group-hover:text-madrasha-green-600 transition duration-150" />
                    <span className="text-[8px] font-bold text-center mt-0.5 leading-tight group-hover:text-madrasha-green-700 font-sans">ছবি যোগ করুন</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'chairman')} 
                  className="hidden" 
                />
              </label>

              <div>
                <h4 className="font-extrabold text-[13px] text-zinc-800 leading-tight">{chairmanName}</h4>
                <p className="text-[10px] text-zinc-405 leading-relaxed mt-1">{chairmanTitle}</p>
                <p className="text-[8px] font-sans text-emerald-600 font-semibold mt-1">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</p>
              </div>
            </div>

            {/* The actual message displaying decorative border & quote */}
            <div className="border-l-4 border-madrasha-green-600 bg-madrasha-green-50/40 p-4 rounded-r-xl relative">
              <p className="text-zinc-700 text-xs md:text-[12.5px] leading-relaxed font-medium font-sans">
                " {chairmanBani || defaultChairmanBani} "
              </p>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 font-medium font-sans mt-4 border-t pt-2 flex justify-between items-center">
            <span>Dumki Patuakhali</span>
            <span className="opacity-70">প্রতিষ্ঠিত: ১৯৮০</span>
          </div>
        </div>

      </div>

      {/* Admin Panel Area to edit these Messages directly! Area (Compact Card styled beautifully like the design rules) */}
      <div className="bg-white rounded-2xl border border-rose-100 p-5 mt-6 relative shadow-xs border-l-4 border-l-rose-500 overflow-hidden">
        
        {/* Subtle decorative background stripe */}
        <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-zinc-50 rounded-full -z-10 pointer-events-none"></div>

        <div className="space-y-4">
          <div className="border-b pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-zinc-850 text-xs uppercase tracking-wider flex items-center gap-2">
                ⚙️ বাণী নিয়ন্ত্রণ প্যানেল (Bani & Messages Edit Panel)
              </h3>
              <p className="text-[9px] text-zinc-400 mt-0.5">মাদ্রাসার সুপার ও সভাপতির বাণীগুলি পরিবর্তন বা সংযোজন করার ব্যবস্থা</p>
            </div>
            <span className="bg-rose-50 text-rose-600 text-[8px] font-bold px-2 py-0.5 rounded border border-rose-200">
              SECRET_ADMIN_AUTHORIZATION
            </span>
          </div>

          <form onSubmit={handleSaveBani} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Edit Principal Bani */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-zinc-700">
                  সুপার মহোদয়ের বাণী (Message Content)
                </label>
                <textarea
                  id="edit-principal-bani-input"
                  required
                  rows={4}
                  value={editPrincipalBani}
                  onChange={(e) => setEditPrincipalBani(e.target.value)}
                  placeholder="সুপার মহোদয়ের বাণী এখানে লিখুন..."
                  className="block w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 focus:border-madrasha-green-600 transition-colors resize-y leading-relaxed font-sans"
                />
              </div>

              {/* Edit Chairman Bani */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-zinc-700">
                  সভাপতির বাণী (Message Content)
                </label>
                <textarea
                  id="edit-chairman-bani-input"
                  required
                  rows={4}
                  value={editChairmanBani}
                  onChange={(e) => setEditChairmanBani(e.target.value)}
                  placeholder="সভাপতির বাণী এখানে লিখুন..."
                  className="block w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 focus:border-madrasha-green-600 transition-colors resize-y leading-relaxed font-sans"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              {/* Reset defaults feature */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('আপনি কি বাণী দুটিকে ডিফল্ট টেক্সট এ ফিরিয়ে মেলাতে চান? (Restore default Bani texts?)')) {
                    setEditPrincipalBani(defaultPrincipalBani);
                    setEditChairmanBani(defaultChairmanBani);
                    showToast('ভরাটকৃত বাণী ডিফল্ট টেক্সট এ ফিরিয়ে দেওয়া হয়েছে!', 'success');
                  }
                }}
                className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition duration-200 font-bold text-[10px] text-zinc-600 cursor-pointer flex items-center gap-1 leading-none"
              >
                <RefreshCw className="h-3 w-3" />
                <span>ডিফল্ট রিস্টোর (Reset default)</span>
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 text-white bg-madrasha-green-600 hover:bg-madrasha-green-700 rounded-lg shadow-sm hover:shadow-md transition duration-200 font-bold text-[10px] cursor-pointer flex items-center gap-1.5 leading-none"
              >
                <Save className="h-3.5 w-3.5" />
                <span>পরিবর্তন সংরক্ষণ করুন (Save Updates)</span>
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
}
