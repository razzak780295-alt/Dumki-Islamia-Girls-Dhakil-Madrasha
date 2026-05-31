import React, { useState, useMemo, useEffect } from 'react';
import { Student, FeePayment, FeeType } from '../types';
import { DollarSign, Plus, CheckCircle, Clock, Trash, Receipt, Search, Filter, Printer, Download, PiggyBank, Calendar, X } from 'lucide-react';

interface FeesTabProps {
  students: Student[];
  fees: FeePayment[];
  onAddFeePayment: (payment: Omit<FeePayment, 'id'>) => void;
  onUpdateFeeStatus: (id: string, status: 'Paid' | 'Due') => void;
  onDeleteFeePayment: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const CONST_MONTHS = [
  'জানুয়ারি ২০২৬ (January 2026)', 'ফেব্রুয়ারি ২০২৬ (February 2026)',
  'মার্চ ২০২৬ (March 2026)', 'এপ্রিল ২০২৬ (April 2026)',
  'মে ২০২৬ (May 2026)', 'জুন ২০২৬ (June 2026)',
  'জুলাই ২০২৬ (July 2026)', 'আগস্ট ২০২৬ (August 2026)',
  'সেপ্টেম্বর ২০২৬ (September 2026)', 'অক্টোবর ২০২৬ (October 2026)',
  'নভেম্বর ২০২৬ (November 2026)', 'ডিসেম্বর ২০২৬ (December 2026)',
];

export default function FeesTab({ students, fees, onAddFeePayment, onUpdateFeeStatus, onDeleteFeePayment, showToast }: FeesTabProps) {
  const [search, setSearch] = useState('');
  const [feeFilter, setFeeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Form & view state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [feeType, setFeeType] = useState<FeeType>('Monthly Tuition');
  const [amount, setAmount] = useState<number | ''>('');
  const [monthName, setMonthName] = useState(CONST_MONTHS[4]); // Defaults to May 2026
  const [status, setStatus] = useState<'Paid' | 'Due'>('Paid');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Custom Fields Configurations
  const [customFieldDefs, setCustomFieldDefs] = useState<any[]>([]);
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, string>>({});

  // Load custom field configurations
  useEffect(() => {
    if (isFormOpen) {
      const stored = localStorage.getItem('customFields_fee');
      if (stored) {
        try {
          setCustomFieldDefs(JSON.parse(stored));
        } catch (e) {
          setCustomFieldDefs([]);
        }
      } else {
        setCustomFieldDefs([]);
      }
      setCustomFieldsData({});
    }
  }, [isFormOpen]);

  // Report Month State
  const [reportMonth, setReportMonth] = useState('মে ২০২৬ (May 2026)');

  // Preset typical fee values for speed
  React.useEffect(() => {
    if (feeType === 'Monthly Tuition') setAmount(500);
    else if (feeType === 'Exam Fee') setAmount(300);
    else if (feeType === 'Registration Fee') setAmount(1000);
  }, [feeType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('ছাত্রী নির্বাচন করা আবশ্যক! (Please select a student!)', 'error');
      return;
    }
    if (amount === '' || amount <= 0) {
      showToast('সঠিক ফি পরিমাণ দিন! (Please give a valid amount!)', 'error');
      return;
    }

    // Validate custom fields required inputs
    for (const f of customFieldDefs) {
      if (f.required && (!customFieldsData[f.id] || customFieldsData[f.id].trim() === '')) {
        showToast(`কাস্টম ফিল্ড "${f.label}" পূরণ করা আবশ্যক!`, 'error');
        return;
      }
    }

    onAddFeePayment({
      studentId: selectedStudentId,
      feeType,
      amount: Number(amount),
      paymentDate: status === 'Paid' ? paymentDate : '',
      monthName,
      status,
      notes: notes.trim(),
      customFields: customFieldsData
    });

    setIsFormOpen(false);
    setSelectedStudentId('');
    setNotes('');
  };

  const toggleStatus = (id: string, current: 'Paid' | 'Due') => {
    const nextStatus = current === 'Paid' ? 'Due' : 'Paid';
    onUpdateFeeStatus(id, nextStatus);
    showToast(`ফি স্ট্যাটাস আপডেট করা হয়েছে! (Fee receipt updated to ${nextStatus})`, 'success');
  };

  const handleDelete = (id: string) => {
    const isConfirmed = window.confirm('আপনি কি এই ফি রেকর্ডটি ডিলিট করতে চান? (Are you sure you want to delete this payment record?)');
    if (isConfirmed) {
      onDeleteFeePayment(id);
    }
  };

  // Compile Transactions with Student Names populated
  const populatedFees = useMemo(() => {
    return fees.map(f => {
      const student = students.find(s => s.id === f.studentId);
      return {
        ...f,
        studentName: student ? student.nameBn : 'অজানা ছাত্রী (Unknown Student)',
        studentRoll: student ? student.rollNumber : 0,
        studentClass: student ? student.className : ''
      };
    }).sort((a,b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [fees, students]);

  // Filters
  const filteredFees = useMemo(() => {
    return populatedFees.filter(f => {
      const term = search.toLowerCase();
      const matchesSearch = 
        f.studentName.toLowerCase().includes(term) ||
        f.monthName.toLowerCase().includes(term) ||
        f.feeType.toLowerCase().includes(term);
        
      const matchesType = feeFilter === 'All' || f.feeType === feeFilter;
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [populatedFees, search, feeFilter, statusFilter]);

  // Report statistics for selected Month
  const reportTotals = useMemo(() => {
    const monthTx = populatedFees.filter(f => f.monthName === reportMonth);
    const paidSum = monthTx.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const dueSum = monthTx.filter(f => f.status === 'Due').reduce((sum, f) => sum + f.amount, 0);
    return {
      txCount: monthTx.length,
      paidSum,
      dueSum,
      total: paidSum + dueSum,
      transactions: monthTx
    };
  }, [populatedFees, reportMonth]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="fees-management-tab" className="space-y-6">
      
      {/* Printable Area: Monthly Collection Report Sheet */}
      <div className="hidden print-only print:block p-8 bg-white text-black text-xs">
        <div className="text-center pb-4 mb-6 border-b">
          <h2 className="text-xl font-bold text-madrasha-green-700">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</h2>
          <p className="text-xs">দুমকি, পটুয়াখালী, বাংলাদেশ (Est. 1980)</p>
          <h3 className="text-base font-bold mt-3 underline">মাসিক ফি আদায় প্রতিবেদন (Monthly Fee Collection Report)</h3>
          <div className="flex justify-center gap-6 mt-2 font-semibold">
            <span>বিবরণ মাস (Month): {reportMonth}</span>
            <span>প্রিন্ট তারিখ (Printed on): {new Date().toLocaleDateString('bn-BD')}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border p-3 rounded text-center bg-zinc-50">
            <p className="text-zinc-550 font-semibold">আদায়কৃত মোট টাকা (Total Paid)</p>
            <strong className="text-base text-zinc-900 font-sans">৳ {reportTotals.paidSum}</strong>
          </div>
          <div className="border p-3 rounded text-center bg-zinc-50">
            <p className="text-zinc-550 font-semibold">বকেয়া মোট টাকা (Total Outstanding)</p>
            <strong className="text-base text-zinc-900 font-sans">৳ {reportTotals.dueSum}</strong>
          </div>
          <div className="border p-3 rounded text-center bg-zinc-50">
            <p className="text-zinc-550 font-semibold">সর্বমোট টাকা (Gross Invoiced)</p>
            <strong className="text-base text-zinc-90 display-font font-sans">৳ {reportTotals.total}</strong>
          </div>
        </div>

        <table className="w-full border-collapse border border-zinc-300">
          <thead>
            <tr className="bg-zinc-100">
              <th className="border border-zinc-300 p-2 text-left">ছাত্রী নাম (Student)</th>
              <th className="border border-zinc-300 p-2 text-center">শ্রেণী (Class)</th>
              <th className="border border-zinc-300 p-2 text-center">রোল (Roll)</th>
              <th className="border border-zinc-300 p-2 text-center">ফি ধরণ (Type)</th>
              <th className="border border-zinc-300 p-2 text-right">পরিমাণ (Amount)</th>
              <th className="border border-zinc-300 p-2 text-center">স্ট্যাটাস (Status)</th>
            </tr>
          </thead>
          <tbody>
            {reportTotals.transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border border-zinc-300 p-2 font-semibold">{tx.studentName}</td>
                <td className="border border-zinc-300 p-2 text-center">{tx.studentClass}</td>
                <td className="border border-zinc-300 p-2 text-center font-sans">#{tx.studentRoll}</td>
                <td className="border border-zinc-300 p-2 text-center">{tx.feeType}</td>
                <td className="border border-zinc-300 p-2 text-right font-sans">৳ {tx.amount}</td>
                <td className="border border-zinc-300 p-2 text-center font-bold">
                  {tx.status === 'Paid' ? 'আদায়কৃত (Paid)' : 'বকেয়া (Due)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-20 flex justify-between pt-8 border-t text-xs">
          <div>
            <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
            <p>হিসাবরক্ষক (Accountant)</p>
          </div>
          <div className="text-center">
            <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
            <p>সুপারিনটেনডেন্ট (Superintendent)</p>
          </div>
        </div>
      </div>

      {/* Screen Interface (No Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-madrasha-green-600" />
            বেতন ও ফি ব্যবস্থাপনা (Fees Management)
          </h2>
          <p className="text-sm text-zinc-500">মাসিক বেতন, পরীক্ষার ফি ও অন্যান্য আদায়ের হিসাব বিবরণী (Keep records of tuition collections, exam fees receipts and dues sheets)</p>
        </div>
        <button
          id="record-fee-btn"
          onClick={() => setIsFormOpen(true)}
          className="bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ফি আদায় রেকর্ড (Record Payment)</span>
        </button>
      </div>

      {/* PopUp modal for Entry Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-zinc-100">
            <div className="flex justify-between items-center bg-madrasha-green-700 text-white p-4">
              <h3 className="font-bold text-sm">নতুন ফি আদায় ফরম (Record New Payment Form)</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded-full cursor-pointer transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">ছাত্রী নির্বাচন করুন (Student) *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                >
                  <option value="">ছাত্রী সিলেক্ট করুন...</option>
                  {students.map((stud) => (
                    <option key={stud.id} value={stud.id}>
                      {stud.nameBn} - রোল #{stud.rollNumber} ({stud.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">ফির ধরণ (Fee Type) *</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as FeeType)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  >
                    <option value="Monthly Tuition">মাসিক বেতন (Monthly Tuition)</option>
                    <option value="Exam Fee">পরীক্ষা ফি (Exam Fee)</option>
                    <option value="Registration Fee">রেজিস্ট্রেশন ফি (Registration Fee)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">টাকার পরিমাণ (Amount BDT) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm hover:border-zinc-350"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">মাসের নাম (Billing Month) *</label>
                  <select
                    value={monthName}
                    onChange={(e) => setMonthName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
                  >
                    {CONST_MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block"> পরিশোধ অবস্থা (Status) *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Paid' | 'Due')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  >
                    <option value="Paid">পরিশোধিত (Paid)</option>
                    <option value="Due">বকেয়া (Due)</option>
                  </select>
                </div>
              </div>

              {status === 'Paid' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">পরিশোধের তারিখ (Date of Payment) *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm font-sans"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">মন্তব্য (Notes/Remarks)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ফি রসিদ সংক্রান্ত নোট..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                />
              </div>

              {/* Dynamic Custom Fields Rendering under field manager */}
              {customFieldDefs.length > 0 && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-madrasha-green-750 uppercase tracking-wide">অতিরিক্ত রসিদ তথ্য (Additional Invoice Info)</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {customFieldDefs.map((field) => {
                      const value = customFieldsData[field.id] || '';
                      const handleValueChange = (val: string) => {
                        setCustomFieldsData(prev => ({ ...prev, [field.id]: val }));
                      };

                      return (
                        <div key={field.id} className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-75 block">
                            {field.label} {field.required && ' *'}
                          </label>
                          {field.type === 'Text' && (
                            <input
                              type="text"
                              required={field.required}
                              value={value}
                              onChange={(e) => handleValueChange(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                            />
                          )}
                          {field.type === 'Number' && (
                            <input
                              type="number"
                              required={field.required}
                              value={value}
                              onChange={(e) => handleValueChange(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                            />
                          )}
                          {field.type === 'Date' && (
                            <input
                              type="date"
                              required={field.required}
                              value={value}
                              onChange={(e) => handleValueChange(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                            />
                          )}
                          {field.type === 'Dropdown' && (
                            <select
                              required={field.required}
                              value={value}
                              onChange={(e) => handleValueChange(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                            >
                              <option value="">নির্বাচন করুন (Select)</option>
                              {(field.options || '').split(',').map((opt: string) => (
                                <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                              ))}
                            </select>
                          )}
                          {field.type === 'Textarea' && (
                            <textarea
                              required={field.required}
                              rows={2}
                              value={value}
                              onChange={(e) => handleValueChange(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                            />
                          )}
                          {field.type === 'Checkbox' && (
                            <label className="flex items-center gap-2 py-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value === 'true'}
                                onChange={(e) => handleValueChange(e.target.checked ? 'true' : 'false')}
                                className="rounded text-madrasha-green-600"
                              />
                              <span className="text-xs text-zinc-650">পছন্দ চিহ্নিত করুন (Enable)</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition"
                >
                  হিসাবভুক্ত করুন (Submit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary report selection layout (No Print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        
        {/* Left Search Filter Board */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-zinc-800 text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-madrasha-green-600" />
            আদায়ের বিবরণ তালিকা (All Payment Transactions)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="ছাত্রী দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
              />
            </div>

            <div>
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-zinc-700 border-zinc-200 focus:outline-none focus:ring-1 focus:ring-madrasha-green-600"
              >
                <option value="All">সকল ফি (All Fees Categories)</option>
                <option value="Monthly Tuition">মাসিক বেতন (Monthly Tuition)</option>
                <option value="Exam Fee">পরীক্ষা ফি (Exam Fee)</option>
                <option value="Registration Fee">রেজিস্ট্রেশন ফি (Registration Fee)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-zinc-700 border-zinc-200 focus:outline-none focus:ring-1 focus:ring-madrasha-green-600"
              >
                <option value="All">সকল অবস্থা (All Status)</option>
                <option value="Paid">পরিশোধিত (Paid)</option>
                <option value="Due">বকেয়া (Due)</option>
              </select>
            </div>
          </div>

          {/* List display */}
          <div className="overflow-x-auto border rounded-xl divide-y">
            {filteredFees.length > 0 ? (
              filteredFees.map((tx) => (
                <div key={tx.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:bg-zinc-50/50 transition">
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-800 text-xs sm:text-sm">{tx.studentName}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
                      <span>শ্রেণী: {tx.studentClass}</span>
                      <span>•</span>
                      <span>রোল: #{tx.studentRoll}</span>
                      <span>•</span>
                      <span className="text-zinc-650 bg-zinc-100 px-1.5 py-0.5 rounded font-sans">{tx.monthName}</span>
                    </div>

                    {tx.customFields && Object.keys(tx.customFields).length > 0 && (
                      <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-150 rounded px-1.5 py-0.5 max-w-lg">
                        {Object.entries(tx.customFields).map(([k, v]) => {
                          if (!v) return null;
                          return (
                            <span key={k} className="border-r pr-2 last:border-0 last:pr-0">
                              <span className="text-zinc-400 font-medium">{customFieldDefs.find(fd => fd.id === k)?.label || k}:</span> <span className="font-semibold text-zinc-700">{v === 'true' ? 'হ্যাঁ' : v === 'false' ? 'না' : v}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="text-right">
                      <p className="font-bold text-madrasha-green-700 text-sm font-sans">৳ {tx.amount}</p>
                      <p className="text-[10px] font-mono text-zinc-400">{tx.feeType}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => toggleStatus(tx.id, tx.status)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1 ${
                          tx.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {tx.status === 'Paid' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        <span>{tx.status === 'Paid' ? 'পরিশোধিত' : 'বকেয়া'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-md border border-red-50 cursor-pointer transition"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-400">
                <p className="text-xs">কোনো ফি আদায়ের রেকর্ড পাওয়া যায়নি। (No transactions fit the filter.)</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Monthly Report compiler Box */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5 space-y-4">
          <h3 className="font-bold text-zinc-800 text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-madrasha-green-600" />
            মাসিক আদায় রিপোর্ট (Monthly Compilations)
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">রিপোর্ট মাস নির্বাচন করুন (Compile Month)</label>
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-200 text-xs focus:ring-1 text-zinc-700"
            >
              {CONST_MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 bg-zinc-50 p-4 border border-zinc-150 rounded-lg">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-xs text-zinc-500">মোট রশিদ (Invoiced Tickets):</span>
              <strong className="text-zinc-800 font-sans">{reportTotals.txCount}টি</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-xs text-zinc-500">আদায়কৃত (Paid sum):</span>
              <strong className="text-emerald-700 font-sans">৳ {reportTotals.paidSum}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-xs text-zinc-500">বকেয়া পরিমাণ (Outstanding):</span>
              <strong className="text-red-500 font-sans">৳ {reportTotals.dueSum}</strong>
            </div>
            <div className="flex justify-between items-center pt-1 font-bold">
              <span className="text-xs text-zinc-800">সর্বমোট (Gross sum):</span>
              <span className="text-zinc-900 font-sans">৳ {reportTotals.total}</span>
            </div>
          </div>

          <button
            onClick={handlePrintReport}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow"
          >
            <Printer className="h-4 w-4" />
            <span>ফি রিপোর্ট প্রিন্ট করুন (Print Collection Sheet)</span>
          </button>
        </div>

      </div>

    </div>
  );
}
