import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, Settings, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export interface CustomField {
  id: string;
  label: string;
  type: 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Textarea' | 'Checkbox';
  required: boolean;
  options?: string; // Comma-separated options for dropdown
}

interface FieldManagerTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function FieldManagerTab({ showToast }: FieldManagerTabProps) {
  // We keep tabs or direct lists of the 4 form categories
  const forms = [
    { id: 'student', title: 'ছাত্রী ফরম (Student Form)', icon: 'Users' },
    { id: 'teacher', title: 'শিক্ষক ফরম (Teacher Form)', icon: 'UserSquare2' },
    { id: 'exam', title: 'পরীক্ষার নম্বর ফরম (Exam Marks Form)', icon: 'Award' },
    { id: 'fee', title: 'ফি আদায় ফরম (Fee Payment Form)', icon: 'PiggyBank' },
  ];

  const [activeFormId, setActiveFormId] = useState<string>('student');

  // Load custom fields state
  const [customFields, setCustomFields] = useState<Record<string, CustomField[]>>({
    student: [],
    teacher: [],
    exam: [],
    fee: []
  });

  // Adding Field Entry State
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<CustomField['type']>('Text');
  const [newRequired, setNewRequired] = useState(false);
  const [newOptionsStr, setNewOptionsStr] = useState(''); // comma-separated default options for select

  // Hardcoded read-only standard fields representation to provide high-quality scannable overview context
  const defaultFields: Record<string, { label: string; type: string; required: boolean }[]> = {
    student: [
      { label: 'ছাত্রী নাম (বাংলায়)', type: 'Text', required: true },
      { label: 'Student Name (English)', type: 'Text', required: true },
      { label: 'পিতার নাম (Father\'s Name)', type: 'Text', required: true },
      { label: 'মাতার নাম (Mother\'s Name)', type: 'Text', required: true },
      { label: 'শ্রেণী (Class Selection)', type: 'Dropdown', required: true },
      { label: 'রোল নম্বর (Roll Number)', type: 'Number', required: true },
      { label: 'জন্ম তারিখ (Date of Birth)', type: 'Date', required: true },
      { label: 'অভিভাবকের মোবাইল (Guardian Mobile)', type: 'Text', required: true },
      { label: 'ভর্তির তারিখ (Admission Date)', type: 'Date', required: true },
      { label: 'ঠিকানা (Permanent Address)', type: 'Textarea', required: true },
    ],
    teacher: [
      { label: 'শিক্ষকের নাম (Teacher\'s Name)', type: 'Text', required: true },
      { label: 'প্রধান বিষয় (Specialized Subject)', type: 'Text', required: true },
      { label: 'শিক্ষাগত যোগ্যতা (Qualification)', type: 'Text', required: true },
      { label: 'মোবাইল নম্বর (Mobile Number)', type: 'Text', required: true },
      { label: 'যোগদানের তারিখ (Join Date)', type: 'Date', required: true },
      { label: 'মাসিক বেতন (Monthly Salary)', type: 'Number', required: true },
    ],
    exam: [
      { label: 'পরীক্ষার নাম (Exam Term)', type: 'Dropdown', required: true },
      { label: 'শ্রেণী (Class Selection)', type: 'Dropdown', required: true },
      { label: 'ছাত্রী নির্বাচন (Student Selection)', type: 'Dropdown', required: true },
      { label: 'বাংলা (Bangla Score)', type: 'Number', required: true },
      { label: 'ইংরেজি (English Score)', type: 'Number', required: true },
      { label: 'গণিত (Mathematics Score)', type: 'Number', required: true },
      { label: 'আরবি ও কুরআন (Arabic Score)', type: 'Number', required: true },
      { label: 'হাদিস শরীফ (Hadith Score)', type: 'Number', required: true },
      { label: 'বিজ্ঞান (Science Score)', type: 'Number', required: true },
    ],
    fee: [
      { label: 'ছাত্রী নির্বাচন (Student Selection)', type: 'Dropdown', required: true },
      { label: 'ফি ধরণ (Fee Type Selection)', type: 'Dropdown', required: true },
      { label: 'টাকার পরিমাণ (Fee Amount)', type: 'Number', required: true },
      { label: 'ফি আদায়ের মাস (Invoice Month)', type: 'Dropdown', required: true },
      { label: 'পরিশোধের স্ট্যাটাস (Payment Status)', type: 'Dropdown', required: true },
      { label: 'টাকা জমা দেওয়ার তারিখ (Payment Date)', type: 'Date', required: false },
      { label: 'অতিরিক্ত নোটস (Optional Notes)', type: 'Textarea', required: false },
    ],
  };

  // Load custom fields from local storage on mount
  useEffect(() => {
    const loaded: Record<string, CustomField[]> = {
      student: [],
      teacher: [],
      exam: [],
      fee: []
    };
    forms.forEach(f => {
      const stored = localStorage.getItem(`customFields_${f.id}`);
      if (stored) {
        try {
          loaded[f.id] = JSON.parse(stored);
        } catch (e) {
          loaded[f.id] = [];
        }
      }
    });
    setCustomFields(loaded);
  }, []);

  // Save specific form data to localStorage
  const saveFormFields = (formId: string, updatedFields: CustomField[]) => {
    const copy = { ...customFields, [formId]: updatedFields };
    setCustomFields(copy);
    localStorage.setItem(`customFields_${formId}`, JSON.stringify(updatedFields));
  };

  // Add field handler
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      showToast('ফিল্ডের শিরোনাম দিন! (Enter field label)', 'error');
      return;
    }

    const newField: CustomField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      label: newLabel.trim(),
      type: newType,
      required: newRequired,
      ...(newType === 'Dropdown' ? { options: newOptionsStr.trim() } : {})
    };

    const updated = [...customFields[activeFormId], newField];
    saveFormFields(activeFormId, updated);

    // Reset inputs
    setNewLabel('');
    setNewType('Text');
    setNewRequired(false);
    setNewOptionsStr('');
    showToast('নতুন কাস্টম ফিল্ড সফলভাবে যোগ করা হয়েছে!', 'success');
  };

  // Delete field handler with confirmation
  const handleDeleteField = (fieldId: string) => {
    const isConfirmed = window.confirm('এই ফিল্ড মুছলে পুরনো ডেটা হারিয়ে যেতে পারে। নিশ্চিত? (Deleting this field may result in loss of historic custom data for this field. Proceed?)');
    if (isConfirmed) {
      const updated = customFields[activeFormId].filter(f => f.id !== fieldId);
      saveFormFields(activeFormId, updated);
      showToast('কাস্টম ফিল্ডটি সফলভাবে মুছে ফেলা হয়েছে!', 'success');
    }
  };

  // Move up event
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentList = [...customFields[activeFormId]];
    const temp = currentList[index];
    currentList[index] = currentList[index - 1];
    currentList[index - 1] = temp;
    saveFormFields(activeFormId, currentList);
  };

  // Move down event
  const handleMoveDown = (index: number) => {
    const currentList = [...customFields[activeFormId]];
    if (index === currentList.length - 1) return;
    const temp = currentList[index];
    currentList[index] = currentList[index + 1];
    currentList[index + 1] = temp;
    saveFormFields(activeFormId, currentList);
  };

  // Inline name change trigger handler
  const handleLabelChange = (fieldId: string, value: string) => {
    const updated = customFields[activeFormId].map(f => {
      if (f.id === fieldId) {
        return { ...f, label: value };
      }
      return f;
    });
    saveFormFields(activeFormId, updated);
  };

  // Inline required toggle handler
  const handleRequiredToggle = (fieldId: string) => {
    const updated = customFields[activeFormId].map(f => {
      if (f.id === fieldId) {
        return { ...f, required: !f.required };
      }
      return f;
    });
    saveFormFields(activeFormId, updated);
  };

  // Inline type toggle handler
  const handleTypeChange = (fieldId: string, value: CustomField['type']) => {
    const updated = customFields[activeFormId].map(f => {
      if (f.id === fieldId) {
        return { ...f, type: value };
      }
      return f;
    });
    saveFormFields(activeFormId, updated);
  };

  // Inline dropdown options edit
  const handleOptionsChange = (fieldId: string, value: string) => {
    const updated = customFields[activeFormId].map(f => {
      if (f.id === fieldId) {
        return { ...f, options: value };
      }
      return f;
    });
    saveFormFields(activeFormId, updated);
  };

  return (
    <div id="field-manager-tab" className="space-y-6 select-none animate-fade-in no-print font-sans">
      
      {/* Tab upper title */}
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-madrasha-green-700 tracking-tight flex items-center gap-2">
            🛠️ ফিল্ড ম্যানেজার (Field Manager)
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">
            Manage forms and dynamic parameters parameters
          </p>
        </div>
        <div className="h-[2px] w-12 bg-madrasha-gold-500"></div>
      </div>

      {/* Grid containing Sidebar of forms and dynamic fields container editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side menu selector */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-slate-100 p-2.5 rounded-xl border">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-sans tracking-wide">মডিউল ফর্মসমূহ (Forms)</span>
          </div>
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0">
            {forms.map(f => {
              const isActive = activeFormId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFormId(f.id);
                    setNewLabel('');
                    setNewOptionsStr('');
                    setNewRequired(false);
                  }}
                  className={`px-4 py-3 rounded-xl border text-xs text-left font-bold transition duration-200 cursor-pointer flex items-center gap-2 shrink-0 lg:shrink-1 ${
                    isActive 
                      ? 'bg-madrasha-green-700 text-white border-madrasha-green-800 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-zinc-600'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>{f.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Content space */}
        <div className="lg:col-span-3 space-y-6">

          {/* Warning notice info bar */}
          <div className="bg-rose-50 border-l-4 border-l-rose-500 border border-rose-200 rounded-xl p-4 flex gap-3 text-xs font-sans">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-rose-800">সতর্কতা: এই ফিল্ড মুছলে পুরনো ডেটা হারিয়ে যেতে পারে। নিশ্চিত?</p>
              <p className="text-[10px] text-rose-700 mt-0.5 font-medium">Deletes are cascading. Avoid deleting fields that are already occupied with historical entries.</p>
            </div>
          </div>

          {/* List layout of the selected Form Fields */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            
            <div className="border-b pb-2 flex justify-between items-center text-xs">
              <h3 className="font-extrabold text-zinc-800 flex items-center gap-2">
                <Settings className="h-4 w-4 text-madrasha-green-700" />
                <span>সক্রিয় ফিল্ডসমূহ (Active Fields Structure)</span>
              </h3>
              <span className="bg-emerald-50 text-emerald-750 font-sans text-[9px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 uppercase">
                Active: {forms.find(f => f.id === activeFormId)?.id}
              </span>
            </div>

            {/* Default compiled fields (Read Only list in upper pane to understand overall schema index) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">Default Fields (সিস্টেমের মূল ফিল্ডসমূহ - পরিবর্তন অযোগ্য):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {defaultFields[activeFormId].map((df, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-[11px] font-medium text-zinc-600 opacity-80">
                    <span className="font-bold">{df.label}</span>
                    <div className="space-x-1">
                      <span className="bg-slate-200 text-zinc-700 border border-slate-300 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-sans">{df.type}</span>
                      {df.required && <span className="bg-rose-100 text-rose-750 border border-rose-250 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-sans">Required</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom custom added fields (Ordered, editable, deletable) */}
            <div className="space-y-3 pt-3 border-t">
              <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest block font-sans">Custom Fields (আপনার যোগ করা কাস্টম ফিল্ডসমূহ):</span>
              
              {customFields[activeFormId].length > 0 ? (
                <div className="space-y-3">
                  {customFields[activeFormId].map((field, index) => (
                    <div 
                      key={field.id}
                      className="bg-white border-2 border-slate-200 rounded-xl p-3 sm:p-4 hover:border-madrasha-green-500/45 transition flex flex-col sm:flex-row gap-3 justify-between items-center"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:flex-1 text-xs font-sans">
                        {/* Title inline modifier code */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">ফিল্ডের শিরোনাম (Field Label)</label>
                          <input 
                            type="text" 
                            value={field.label}
                            onChange={(e) => handleLabelChange(field.id, e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-madrasha-green-600 focus:bg-white"
                          />
                        </div>

                        {/* Type modifier */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">ফিল্ড ধরণ (Data Type)</label>
                          <select 
                            value={field.type}
                            onChange={(e) => handleTypeChange(field.id, e.target.value as any)}
                            className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-madrasha-green-600"
                          >
                            <option value="Text">Text (সাধারণ লেখা)</option>
                            <option value="Number">Number (সংখ্যা)</option>
                            <option value="Date">Date (তারিখ)</option>
                            <option value="Dropdown">Dropdown (ড্রপডাউন লিস্ট)</option>
                            <option value="Textarea">Textarea (দীর্ঘ বর্ণনা)</option>
                            <option value="Checkbox">Checkbox (টিক বক্স)</option>
                          </select>
                        </div>

                        {/* Drodown Options configuration modifier if Dropdown selection is active */}
                        {field.type === 'Dropdown' ? (
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase">বিকল্পসমূহ, কমা দিয়ে (Comma-separated Options)</label>
                            <input 
                              type="text" 
                              value={field.options || ''} 
                              placeholder="বিকল্প ১, বিকল্প ২, বিকল্প ৩"
                              onChange={(e) => handleOptionsChange(field.id, e.target.value)}
                              className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-[11px] w-full focus:ring-1 focus:ring-madrasha-green-600 focus:bg-white"
                            />
                          </div>
                        ) : (
                          /* Required Status Switch toggler button */
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">বাধ্যতামূলক করা (Required)</label>
                            <button
                              type="button"
                              onClick={() => handleRequiredToggle(field.id)}
                              className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer border ${
                                field.required
                                  ? 'bg-rose-50 border-rose-220 text-rose-600'
                                  : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                              }`}
                            >
                              {field.required ? 'হ্যাঁ (On)' : 'না (Off)'}
                            </button>
                          </div>
                        )}

                        {field.type === 'Dropdown' && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">বাধ্যতামূলক করা (Required)</label>
                            <button
                              type="button"
                              onClick={() => handleRequiredToggle(field.id)}
                              className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer border ${
                                field.required
                                  ? 'bg-rose-50 border-rose-220 text-rose-600'
                                  : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                              }`}
                            >
                              {field.required ? 'হ্যাঁ (On)' : 'না (Off)'}
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Direction Shift & Delete controllers */}
                      <div className="flex gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 border hover:bg-zinc-50 rounded transition duration-150 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === customFields[activeFormId].length - 1}
                          className="p-1.5 border hover:bg-zinc-50 rounded transition duration-150 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1.5 border border-rose-100 hover:bg-rose-50 rounded transition duration-155 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed text-center rounded-xl p-6 text-zinc-400 font-medium text-xs">
                  কোনো কাস্টম ফিল্ড এখনও যোগ করা হয়নি।
                </div>
              )}

            </div>

            {/* Bottom Input: "+ নতুন ফিল্ড যোগ করুন" */}
            <div className="border-t pt-5 bg-zinc-50/50 p-4 rounded-xl mt-4">
              <span className="text-[10px] uppercase font-extrabold text-zinc-650 tracking-wide flex items-center gap-1 mb-3">
                <Plus className="h-3.5 w-3.5 text-madrasha-green-700 font-black" />
                <span>নতুন কাস্টম ফিল্ড যুক্ত করুন (Add Dynamic Custom Field Entry)</span>
              </span>

              <form onSubmit={handleAddField} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs font-sans">
                
                {/* Field Label Input */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block font-bold text-zinc-700">ফিল্ড লেবেল / নাম (Field Label) *</label>
                  <input 
                    type="text" 
                    required 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="যেমন: রক্তের গ্রুপ / এনআইডি নম্বর"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-madrasha-green-600 border-zinc-200 text-xs text-zinc-750 bg-white"
                  />
                </div>

                {/* Field Type Select */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-700 font-sans">ডাটা টাইপ (Type) *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-madrasha-green-600 border-zinc-200 text-xs text-zinc-750 bg-white cursor-pointer font-sans"
                  >
                    <option value="Text">Text (লেখা)</option>
                    <option value="Number">Number (সংখ্যা)</option>
                    <option value="Date">Date (তারিখ)</option>
                    <option value="Dropdown">Dropdown (তালিকা)</option>
                    <option value="Textarea">Textarea (দীর্ঘ লেখা)</option>
                    <option value="Checkbox">Checkbox (টিক চয়েস)</option>
                  </select>
                </div>

                {/* Sub Options trigger or Toggle & Add button in grid row */}
                <div className="space-y-1 flex sm:flex-col lg:flex-row gap-3 items-center">
                  <label className="flex items-center gap-1.5 py-2 cursor-pointer text-zinc-700 font-bold shrink-0">
                    <input 
                      type="checkbox" 
                      checked={newRequired}
                      onChange={(e) => setNewRequired(e.target.checked)}
                      className="rounded text-madrasha-green-600 border-zinc-300 focus:ring-madrasha-green-600 h-4 w-4" 
                    />
                    <span>বাধ্যতামূলক (Required)</span>
                  </label>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white font-extrabold text-xs rounded-lg transition duration-200 shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap h-9 w-full"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>যোগ করুন (Add)</span>
                  </button>
                </div>

                {/* Extra conditional Options lists in new block */}
                {newType === 'Dropdown' && (
                  <div className="md:col-span-4 space-y-1 bg-white border p-3 rounded-lg mt-2">
                    <label className="block font-bold text-zinc-700">ড্রপডাউন অপশন বা বিকল্পসমূহ (Dropdown Options, comma-separated) *</label>
                    <input 
                      type="text" 
                      required 
                      value={newOptionsStr}
                      onChange={(e) => setNewOptionsStr(e.target.value)}
                      placeholder="বিকল্প ১, বিকল্প ২, বিকল্প ৩, বিকল্প ৪"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-madrasha-green-600 border-zinc-200 text-xs text-zinc-750 bg-white"
                    />
                    <p className="text-[10px] text-zinc-400">প্রতিটি বিকল্পের মাঝে অবশ্যই কমা (,) চিহ্ন ব্যবহার করে লিখুন।</p>
                  </div>
                )}

              </form>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
