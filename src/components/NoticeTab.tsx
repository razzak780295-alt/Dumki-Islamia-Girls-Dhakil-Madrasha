import React, { useState } from 'react';
import { Notice } from '../types';
import { Megaphone, Plus, Trash2, Calendar, BookOpen, AlertCircle, FileText, Printer, Eye, X, Download } from 'lucide-react';

interface NoticeTabProps {
  notices: Notice[];
  onAddNotice: (notice: Omit<Notice, 'id'>) => void;
  onDeleteNotice: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function NoticeTab({ notices, onAddNotice, onDeleteNotice, showToast }: NoticeTabProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Notice Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'General' | 'Exam' | 'Holiday' | 'Fee'>('General');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [pdfName, setPdfName] = useState<string>('');

  // Currently viewing notice modal/print
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('দয়া করে কেবল PDF ফাইল আপলোড করুন! (Only PDF files are allowed!)', 'error');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('ফাইল সাইজ ৫ মেগাবাইটের কম হতে হবে! (File size must be under 5MB!)', 'error');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPdfBase64(evt.target.result as string);
          setPdfName(file.name);
          showToast('PDF ফাইল সফলভাবে সংযুক্ত করা হয়েছে!', 'success');
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPdfBase64('');
      setPdfName('');
    }
  };

  const viewPdfInNewTab = (base64: string) => {
    try {
      const base64Parts = base64.split(',');
      const byteCharacters = atob(base64Parts[1] || base64Parts[0]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error(err);
      window.open(base64, '_blank');
    }
  };

  const downloadPdf = (base64: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = base64;
      link.download = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('PDF ফাইল ডাউনলোড হচ্ছে...', 'success');
    } catch (err) {
      console.error(err);
      showToast('ডাউনলোড করতে ব্যর্থ হয়েছে!', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date) {
      showToast('সবগুলো ঘর পূরণ করা আবশ্যক! (All fields are required!)', 'error');
      return;
    }

    onAddNotice({
      title: title.trim(),
      description: description.trim(),
      date,
      category,
      pdfBase64: pdfBase64 || undefined,
      pdfName: pdfName || undefined
    });

    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('General');
    setPdfBase64('');
    setPdfName('');
    setIsAdding(false);
  };

  const handleDelete = (id: string, titleStr: string) => {
    const isConfirmed = window.confirm(`আপনি কি নোটিশ "${titleStr}" ডিলিট করতে চান? (Are you sure you want to delete this notice?)`);
    if (isConfirmed) {
      onDeleteNotice(id);
    }
  };

  const triggerPrint = (notice: Notice) => {
    setViewingNotice(notice);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'General':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Exam':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Holiday':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Fee':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  const getCategoryLabelBn = (cat: string) => {
    switch (cat) {
      case 'General': return 'সাধারণ (General)';
      case 'Exam': return 'পরীক্ষা (Exam)';
      case 'Holiday': return 'ছুটি (Holiday)';
      case 'Fee': return 'ফি সংক্রান্ত (Fee)';
      default: return cat;
    }
  };

  const filteredNotices = notices.filter(n => {
    const term = search.toLowerCase();
    const matchesSearch = n.title.toLowerCase().includes(term) || n.description.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="notice-board-tab" className="space-y-6">
      
      {/* Printable Area Specific Overlay */}
      {viewingNotice && (
        <div className="hidden print-only print:block p-8 bg-white border-2 border-madrasha-green-600 rounded-xl max-w-2xl mx-auto text-black">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-madrasha-green-700">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</h2>
            <p className="text-sm">দুমকি, পটুয়াখালী, বাংলাদেশ</p>
            <p className="text-xs text-zinc-500">প্রতিষ্ঠিত: ১৯৮০</p>
            <div className="mt-2 text-xs font-semibold bg-zinc-100 py-1 px-3 inline-block rounded-full">
              অফিসিয়াল নোটিশ বোর্ড (Official Notice Board)
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold border-b pb-2">
              <span>ধরণ: {getCategoryLabelBn(viewingNotice.category)}</span>
              <span>তারিখ: {new Date(viewingNotice.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })} ({viewingNotice.date})</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-800">{viewingNotice.title}</h3>
            <p className="text-base whitespace-pre-wrap leading-relaxed text-zinc-700">{viewingNotice.description}</p>
          </div>
          <div className="mt-12 flex justify-between pt-8 border-t text-sm">
            <div className="text-left">
              <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
              <p>প্রস্তুতকারী (Prepared By)</p>
            </div>
            <div className="text-center">
              <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
              <p>সুপারিনটেনডেন্ট (Superintendent)</p>
            </div>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-madrasha-green-600 animate-bounce" />
            নোটিশ বোর্ড (Notice Board)
          </h2>
          <p className="text-sm text-zinc-500">মাদ্রাসার সকল গুরুত্বপূর্ণ নোটিশ ও ঘোষণা ব্যবস্থাপনা (Manage Madrasha announcements & notices)</p>
        </div>
        <button
          id="add-notice-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow cursor-pointer self-start sm:self-center"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'ফর্ম বন্ধ করুন (Close Form)' : 'নতুন নোটিশ যোগ করুন (Add New Notice)'}
        </button>
      </div>

      {/* Add New Notice Form */}
      {isAdding && (
        <div className="bg-white rounded-xl shadow-md border border-zinc-200 p-6 no-print max-w-2xl">
          <h3 className="text-base font-bold text-zinc-800 pb-3 border-b mb-4">
            নতুন নোটিশ ফরম (New Notice Entry Form)
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">নোটিশের শিরোনাম (Notice Title) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: বার্ষিক মিলাদ মাহফিল ও দোয়া সভা"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">তারিখ (Publish Date) *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-zinc-700">নোটিশের ধরণ (Category) *</label>
                <div className="flex gap-2 flex-wrap">
                  {(['General', 'Exam', 'Holiday', 'Fee'] as const).map((catName) => (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setCategory(catName)}
                      className={`px-4 py-2 text-xs font-medium rounded-lg border cursor-pointer transition ${
                        category === catName
                          ? 'bg-madrasha-green-600 border-madrasha-green-600 text-white'
                          : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      {getCategoryLabelBn(catName)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-zinc-700">নোটিশের বিবরণ (Detailed Description) *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="নোটিশের বিস্তারিত বিবরণ এখানে লিখুন..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-zinc-700">নোটিশ ফাইল (PDF) (Notice File - PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs text-zinc-650 bg-zinc-50"
                />
                <p className="text-[10px] text-zinc-400">কেবলমাত্র .pdf ফাইল আপলোড করা যাবে (সর্বোচ্চ ৫ মেগাবাইট)।</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-madrasha-green-600 hover:bg-madrasha-green-700 rounded-lg shadow cursor-pointer"
              >
                দাখিল করুন (Publish Notice)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="নোটিশ খুঁজুন... (Search notices...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer whitespace-nowrap ${
              categoryFilter === 'All'
                ? 'bg-zinc-800 border-zinc-800 text-white'
                : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
            }`}
          >
            সব নোটিশ (All)
          </button>
          {(['General', 'Exam', 'Holiday', 'Fee'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-madrasha-green-600 border-madrasha-green-600 text-white'
                  : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              {getCategoryLabelBn(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Notice List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl shadow-sm hover:shadow border-l-4 border-l-madrasha-green-600 border border-zinc-200 p-5 flex flex-col justify-between transition group">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${getCategoryColor(notice.category)}`}>
                    {getCategoryLabelBn(notice.category)}
                  </span>
                  <div className="flex items-center text-xs text-zinc-400 gap-2">
                    {notice.pdfBase64 && (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 text-[10px] font-extrabold animate-pulse">
                        <FileText className="h-3.5 w-3.5 text-red-600" />
                        <span>PDF</span>
                      </span>
                    )}
                    <div className="flex items-center gap-1 font-sans">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{notice.date}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-zinc-800 leading-tight">
                  {notice.title}
                </h3>
                
                <p className="text-zinc-600 text-xs line-clamp-3 leading-relaxed whitespace-pre-line">
                  {notice.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t flex flex-wrap justify-end gap-2 text-xs">
                {notice.pdfBase64 && (
                  <>
                    <button
                      onClick={() => viewPdfInNewTab(notice.pdfBase64!)}
                      className="px-2.5 py-1.5 text-emerald-700 hover:text-white border border-emerald-200 bg-emerald-50 hover:bg-emerald-600 rounded-md transition flex items-center gap-1 cursor-pointer font-bold shrink-0"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>PDF দেখুন</span>
                    </button>
                    <button
                      onClick={() => downloadPdf(notice.pdfBase64!, notice.title)}
                      className="px-2.5 py-1.5 text-zinc-700 hover:text-white border border-zinc-200 hover:bg-zinc-700 rounded-md transition flex items-center gap-1 cursor-pointer bg-zinc-50 font-bold shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setViewingNotice(notice);
                    (document.getElementById('view-notice-dialog') as any)?.showModal?.();
                  }}
                  className="px-2.5 py-1.5 text-zinc-600 hover:text-madrasha-green-600 border border-zinc-200 hover:border-madrasha-green-200 rounded-md transition flex items-center gap-1 cursor-pointer bg-zinc-50 shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>দেখুন (View)</span>
                </button>
                <button
                  onClick={() => triggerPrint(notice)}
                  className="px-2.5 py-1.5 text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 rounded-md transition flex items-center gap-1 cursor-pointer bg-blue-50/50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>প্রিন্ট (Print)</span>
                </button>
                <button
                  onClick={() => handleDelete(notice.id, notice.title)}
                  className="px-2.5 py-1.5 text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-md transition flex items-center gap-1 cursor-pointer bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>মুছুন (Delete)</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-zinc-200 p-12 text-center text-zinc-400">
            <AlertCircle className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
            <p className="text-sm font-semibold">কোনো নোটিশ পাওয়া যায়নি! (No notices match the filters.)</p>
          </div>
        )}
      </div>

      {/* HTML5 Modal Dialog for Detailed Viewing */}
      <dialog id="view-notice-dialog" className="rounded-2xl p-0 w-full max-w-xl border border-zinc-100 shadow-2xl bg-white backdrop:bg-zinc-800/45 no-print">
        {viewingNotice && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${getCategoryColor(viewingNotice.category)}`}>
                  {getCategoryLabelBn(viewingNotice.category)}
                </span>
                <h3 className="text-lg font-bold text-zinc-800 mt-2 leading-snug">{viewingNotice.title}</h3>
              </div>
              <button
                onClick={() => (document.getElementById('view-notice-dialog') as HTMLDialogElement)?.close()}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-xs text-zinc-400 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>তারিখ: {viewingNotice.date}</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-150 rounded-lg p-4 font-normal text-zinc-700 text-sm whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {viewingNotice.description}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-[11px] text-zinc-400">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</p>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerPrint(viewingNotice)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold bg-madrasha-green-600 text-white hover:bg-madrasha-green-700 cursor-pointer flex items-center gap-1.5 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>প্রিন্ট করুন (Print Notice)</span>
                </button>
                <button
                  type="button"
                  onClick={() => (document.getElementById('view-notice-dialog') as HTMLDialogElement)?.close()}
                  className="px-4 py-2 border border-zinc-250 text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
