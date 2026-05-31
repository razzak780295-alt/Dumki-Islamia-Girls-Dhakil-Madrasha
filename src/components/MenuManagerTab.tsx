import React, { useState, useEffect } from 'react';
import { 
  FolderTree, Plus, Trash2, ArrowUp, ArrowDown, Save, RefreshCw, 
  HelpCircle, Eye, EyeOff, Check, GripVertical 
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  labelEn: string;
  icon: string; // Lucide icon name or raw emoji
  active: boolean;
  isCore: boolean;
}

interface MenuManagerTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
  onMenuConfigChange: (newConfig: MenuItem[]) => void;
  defaultMenuItems: MenuItem[];
}

export default function MenuManagerTab({ 
  showToast, 
  onMenuConfigChange, 
  defaultMenuItems 
}: MenuManagerTabProps) {
  
  // Temporary menus state for editing before save
  const [menus, setMenus] = useState<MenuItem[]>([]);

  // Add Custom Menu Inline Form State
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [newLabelBn, setNewLabelBn] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [newIcon, setNewIcon] = useState('⭐');
  const [newPageId, setNewPageId] = useState('');

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Hydrate local copy of menus
  useEffect(() => {
    const stored = localStorage.getItem('madrasha_menu_config');
    if (stored) {
      try {
        setMenus(JSON.parse(stored));
      } catch (e) {
        setMenus([...defaultMenuItems]);
      }
    } else {
      setMenus([...defaultMenuItems]);
    }
  }, [defaultMenuItems]);

  // Save changes to localStorage
  const handleSaveChanges = () => {
    // Validate inputs
    for (const m of menus) {
      if (!m.label.trim() || !m.labelEn.trim()) {
        showToast('মেনুর বাংলা ও ইংরেজি উভয় লেবেল পূরণ করতে হবে!', 'error');
        return;
      }
      if (!m.icon.trim()) {
        showToast('মেনুর আইকন ফাঁকা রাখা যাবে না!', 'error');
        return;
      }
    }

    localStorage.setItem('madrasha_menu_config', JSON.stringify(menus));
    onMenuConfigChange(menus); // Sync to parent App container
    showToast('মেনু কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  };

  // Reset to default
  const handleResetMenu = () => {
    const isAgree = window.confirm(
      'আপনি কি মেনু বিন্যাস পূর্বাবস্থায় ফিরিয়ে নিতে চান? (Restore original menu order and items?)'
    );
    if (isAgree) {
      localStorage.removeItem('madrasha_menu_config');
      setMenus([...defaultMenuItems]);
      onMenuConfigChange([...defaultMenuItems]);
      showToast('মেনু বিন্যাস সফলভাবে ডিফল্টে রিসেট করা হয়েছে!', 'success');
    }
  };

  // Add new menu item
  const handleAddNewMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelBn.trim() || !newLabelEn.trim() || !newPageId.trim()) {
      showToast('সকল প্রয়োজনীয় তথ্য পূরণ করুন!', 'error');
      return;
    }

    const cleanPageId = newPageId.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Check if duplicate tab ID
    if (menus.some(m => m.id.toLowerCase() === cleanPageId)) {
      showToast('এই পেজ আইডিটি ইতিমধ্যে ব্যবহৃত হচ্ছে!', 'error');
      return;
    }

    const newItem: MenuItem = {
      id: cleanPageId,
      label: newLabelBn.trim(),
      labelEn: newLabelEn.trim(),
      icon: newIcon.trim(),
      active: true,
      isCore: false
    };

    const updated = [...menus, newItem];
    setMenus(updated);
    
    // Reset fields
    setNewLabelBn('');
    setNewLabelEn('');
    setNewIcon('⭐');
    setNewPageId('');
    setAddFormOpen(false);

    showToast('নতুন মেনু খসড়ায় যোগ হয়েছে! অনুগ্রহ করে নিচের "সংরক্ষণ" বাটনে চাপুন।', 'success');
  };

  // Delete custom menu item with confirmation
  const handleDeleteMenu = (id: string) => {
    const item = menus.find(m => m.id === id);
    if (!item) return;

    if (item.isCore) {
      showToast('সিস্টেম কোড মেনু ডিলিট করা সম্ভব নয়, শুধুমাত্র হাইড করতে পারবেন!', 'error');
      return;
    }

    const isAgree = window.confirm(
      `আপনি কি নিশ্চিত যে "${item.label}" মেনুটি মুছে ফেলতে চান? (Delete page?)`
    );
    if (isAgree) {
      const updated = menus.filter(m => m.id !== id);
      setMenus(updated);
      showToast('মেনু সরানো হয়েছে! অনুগ্রহ করে নিচের "পরিবর্তন সংরক্ষণ করুন" বাটনে চাপুন।', 'success');
    }
  };

  // Toggle active/hidden status
  const handleToggleActive = (id: string) => {
    const updated = menus.map(m => {
      if (m.id === id) {
        return { ...m, active: !m.active };
      }
      return m;
    });
    setMenus(updated);
  };

  // Inline value change handlers
  const handleFieldNameChange = (id: string, field: 'label' | 'labelEn' | 'icon', val: string) => {
    const updated = menus.map(m => {
      if (m.id === id) {
        return { ...m, [field]: val };
      }
      return m;
    });
    setMenus(updated);
  };

  // Up/down reordering events
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...menus];
    const target = items[index];
    items[index] = items[index - 1];
    items[index - 1] = target;
    setMenus(items);
  };

  const handleMoveDown = (index: number) => {
    const items = [...menus];
    if (index === items.length - 1) return;
    const target = items[index];
    items[index] = items[index + 1];
    items[index + 1] = target;
    setMenus(items);
  };

  // HTML5 Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = [...menus];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setMenus(items);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print font-sans">
      
      {/* Title */}
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-madrasha-green-700 tracking-tight flex items-center gap-2">
            🗂️ মেনু ম্যানেজার (Menu Manager)
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">
            Manage sidebar navigations, icons, order and permissions
          </p>
        </div>
        <div className="h-[2px] w-12 bg-madrasha-gold-500"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Helper info sidebar block */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3 text-xs text-zinc-700">
            <h3 className="font-bold text-madrasha-green-800 text-sm flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-madrasha-green-700 shrink-0" />
              <span>সহায়িকা (Nav Instructions)</span>
            </h3>
            <p className="leading-relaxed">
              এই পাতা থেকে মাদ্রাসার সমস্ত মেন্যুর ড্রয়ার প্যানেল নিয়ন্ত্রণ করা সম্ভব।
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600 font-medium">
              <li>আইকনে পছন্দমতো <strong>Emoji</strong> বা <strong>Lucide Icon Component Name</strong> দিন।</li>
              <li>কোর বা বিল্ট-ইন পেজসমূহ (যেমন: ড্যাশবোর্ড, ছাত্রী) মুছা অসম্ভব। নিরাপত্তা বজায় রাখতে এদের শুধুমাত্র লুকিয়ে রাখতে (Hide) পারবেন।</li>
              <li>নতুন পাতা যোগ করলে তার কন্টেন্ট সোর্স এডিটর থেকে সংশোধন করতে পারবেন।</li>
              <li>মেনু ডানপাশে ধরে <strong>Drag-and-Drop</strong> করে অথবা উপরে/নিচে বাটনে চেপে সাজানো যাবে।</li>
            </ul>
          </div>
        </div>

        {/* Dynamic menus editor list column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            
            <div className="border-b pb-2.5 flex justify-between items-center text-xs">
              <h3 className="font-extrabold text-zinc-850 flex items-center gap-1.5">
                <FolderTree className="h-4 w-4 text-madrasha-green-700 shrink-0" />
                <span>মেনূর বর্তমান তালিকা (Nav List Structure)</span>
              </h3>
              <span className="text-zinc-650 bg-slate-100 text-[10px] font-sans font-bold px-2 rounded px-2.5 py-0.5 border">
                Total Tabs: {menus.length}
              </span>
            </div>

            {/* List columns Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 pb-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider border-b">
              <div className="col-span-1 text-center font-sans">Grip</div>
              <div className="col-span-1 text-center">আইকন</div>
              <div className="col-span-3">নাম (বাংলা)</div>
              <div className="col-span-3">Name (English)</div>
              <div className="col-span-2 text-center">অবস্থা (State)</div>
              <div className="col-span-2 text-center">ক্রিয়া (Actions)</div>
            </div>

            {/* Dragable list items */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {menus.map((m, idx) => {
                const isDragOverTarget = draggedIndex === idx;
                return (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white border rounded-xl p-3 sm:p-2 hover:bg-slate-50 transition duration-150 relative ${
                      isDragOverTarget ? 'border-dashed border-2 border-madrasha-green-500 bg-emerald-50' : 'border-slate-200'
                    }`}
                  >
                    
                    {/* Drag point indicator */}
                    <div className="hidden sm:flex col-span-1 justify-center text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Icon editable input */}
                    <div className="col-span-1">
                      <div className="flex sm:justify-center items-center gap-2 sm:gap-0">
                        <span className="text-[10px] font-bold text-zinc-400 block sm:hidden">Icon:</span>
                        <input
                          type="text"
                          required
                          value={m.icon}
                          onChange={(e) => handleFieldNameChange(m.id, 'icon', e.target.value)}
                          className="w-12 px-1 text-center font-bold py-1 border rounded focus:ring-1 focus:ring-madrasha-green-600 bg-white shadow-xs text-xs"
                          placeholder="🕌"
                          title="Lucide class name or emoji"
                        />
                      </div>
                    </div>

                    {/* Bangla Label */}
                    <div className="col-span-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 block sm:hidden">বাংলা নাম (Bangla label):</span>
                        <input
                          type="text"
                          required
                          value={m.label}
                          onChange={(e) => handleFieldNameChange(m.id, 'label', e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-madrasha-green-600 bg-white"
                          placeholder="পেজ নাম"
                        />
                      </div>
                    </div>

                    {/* English Label */}
                    <div className="col-span-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 block sm:hidden">English Label:</span>
                        <input
                          type="text"
                          required
                          value={m.labelEn}
                          onChange={(e) => handleFieldNameChange(m.id, 'labelEn', e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-madrasha-green-600 font-sans"
                          placeholder="Page Label"
                        />
                      </div>
                    </div>

                    {/* State switch - Show / Hide toggle */}
                    <div className="col-span-2">
                      <div className="flex sm:justify-center items-center gap-2 sm:gap-0 font-bold text-xs">
                        <span className="text-[10px] font-bold text-zinc-400 block sm:hidden text-right">Status:</span>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(m.id)}
                          className={`px-3 py-1 text-[10px] rounded-full border cursor-pointer font-bold flex items-center gap-1 ${
                            m.active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          }`}
                        >
                          {m.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{m.active ? 'Active' : 'Hidden'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Positional shifters and purge actions */}
                    <div className="col-span-2">
                      <div className="flex justify-start sm:justify-center items-center gap-1.5 border-t sm:border-0 pt-2.5 sm:pt-0">
                        <button
                          type="button"
                          title="Move Up"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 border bg-slate-50 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="h-3 w-3 text-zinc-650" />
                        </button>
                        <button
                          type="button"
                          title="Move Down"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === menus.length - 1}
                          className="p-1 border bg-slate-50 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="h-3 w-3 text-zinc-650" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMenu(m.id)}
                          disabled={m.isCore}
                          className={`p-1 border rounded transition cursor-pointer ${
                            m.isCore 
                              ? 'border-slate-150 text-slate-300 cursor-not-allowed bg-slate-50' 
                              : 'border-rose-100 text-rose-500 hover:bg-rose-50'
                          }`}
                          title={m.isCore ? 'Built-in core Tab' : 'Remove tab'}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Inline creation field layout inside Menu settings */}
            {addFormOpen ? (
              <form onSubmit={handleAddNewMenu} className="border-t pt-4 bg-slate-50/50 p-4 rounded-xl mt-4 border border-dashed text-xs space-y-4">
                <h4 className="font-extrabold text-zinc-800 flex items-center gap-1">
                  <Plus className="h-4 w-4 text-madrasha-green-700 font-bold" />
                  <span>নতুন মেনু যোগ করুন (Add Custom Menu Item)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Bangla */}
                  <div className="space-y-1">
                    <label className="block font-bold text-zinc-600">Bangla Label *</label>
                    <input
                      type="text"
                      required
                      value={newLabelBn}
                      onChange={(e) => setNewLabelBn(e.target.value)}
                      placeholder="যেমন: ভর্তি বিজ্ঞপ্তি"
                      className="w-full px-3 py-1.5 border hover:border-zinc-300 rounded-lg text-xs shadow-xs text-zinc-800 bg-white"
                    />
                  </div>

                  {/* English */}
                  <div className="space-y-1">
                    <label className="block font-bold text-zinc-600 font-sans">English Label *</label>
                    <input
                      type="text"
                      required
                      value={newLabelEn}
                      onChange={(e) => setNewLabelEn(e.target.value)}
                      placeholder="Admission Advisory"
                      className="w-full px-3 py-1.5 border hover:border-zinc-300 rounded-lg text-xs shadow-xs text-zinc-800 font-sans bg-white"
                    />
                  </div>

                  {/* Icon */}
                  <div className="space-y-1">
                    <label className="block font-bold text-zinc-600">Icon (Emoji / Lucide code) *</label>
                    <input
                      type="text"
                      required
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      placeholder="⭐"
                      className="w-full px-3 py-1.5 border hover:border-zinc-300 rounded-lg text-xs shadow-xs text-zinc-800 text-center bg-white"
                    />
                  </div>

                  {/* Tab id */}
                  <div className="space-y-1">
                    <label className="block font-bold text-zinc-600">লিংক / পেজ আইডি (Page ID) *</label>
                    <input
                      type="text"
                      required
                      value={newPageId}
                      onChange={(e) => setNewPageId(e.target.value)}
                      placeholder="admission_advisory"
                      className="w-full px-3 py-1.5 border hover:border-zinc-300 rounded-lg text-xs shadow-xs text-zinc-800 font-sans bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAddFormOpen(false)}
                    className="px-3.5 py-1.5 bg-white border hover:bg-slate-50 text-zinc-600 text-xs font-bold rounded-lg transition"
                  >
                    বন্ধ করুন (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white text-xs font-extrabold rounded-lg shadow-sm hover:shadow"
                  >
                    তালিকায় যোগ করুন (Insert Item)
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAddFormOpen(true)}
                className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 border-2 border-dashed border-zinc-200 text-zinc-600 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl transition cursor-pointer mt-3 shrink-0"
              >
                <Plus className="h-4 w-4 text-madrasha-green-750" />
                <span>+ নতুন মেনু যোগ করুন (Add New Menu Tab View)</span>
              </button>
            )}

            {/* Bottom Actions footer buttons */}
            <div className="flex flex-wrap gap-3 pt-5 border-t justify-between items-center bg-transparent">
              <button
                type="button"
                onClick={handleResetMenu}
                className="px-4 py-2 bg-zinc-105 hover:bg-zinc-200 border border-zinc-250 text-zinc-700 font-bold text-xs rounded-lg transition duration-200 flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="h-4 w-4 text-zinc-500" />
                <span>ডিফল্ট মেনুতে ফিরুন (Reset Menu)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-5 py-2 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white font-extrabold text-xs rounded-lg transition duration-200 shadow hover:shadow-md flex items-center gap-1.5"
              >
                <Save className="h-4 w-4 text-emerald-100" />
                <span>পরিবর্তন সংরক্ষণ করুন (Save Menu Layout Settings)</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
