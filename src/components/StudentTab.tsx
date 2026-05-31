import React, { useState, useEffect } from 'react';
import { Student, ClassNameType } from '../types';
import { User, Users, Plus, Edit, Trash2, Search, Filter, BookOpen, Calendar, Phone, MapPin, X, Check, Eye } from 'lucide-react';

interface StudentTabProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const CLASSES: ClassNameType[] = [
  'Ebtedayi 1', 'Ebtedayi 2', 'Ebtedayi 3', 'Ebtedayi 4', 'Ebtedayi 5',
  'Dakhil 6', 'Dakhil 7', 'Dakhil 8', 'Dakhil 9', 'Dakhil 10'
];

export default function StudentTab({ students, onAddStudent, onEditStudent, onDeleteStudent, showToast }: StudentTabProps) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');
  
  // Dialog controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Custom Fields Configurations
  const [customFieldDefs, setCustomFieldDefs] = useState<any[]>([]);
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, string>>({});

  // Form Fields
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [className, setClassName] = useState<ClassNameType>('Ebtedayi 1');
  const [rollNumber, setRollNumber] = useState<number | ''>('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);

  // Load custom field configurations
  useEffect(() => {
    const stored = localStorage.getItem('customFields_student');
    if (stored) {
      try {
        setCustomFieldDefs(JSON.parse(stored));
      } catch (e) {
        setCustomFieldDefs([]);
      }
    } else {
      setCustomFieldDefs([]);
    }
  }, [isFormOpen]);

  // Handle auto roll number calculation
  useEffect(() => {
    if (!editId && isFormOpen) {
      const sameClassStudents = students.filter(s => s.className === className);
      if (sameClassStudents.length > 0) {
        const maxRoll = Math.max(...sameClassStudents.map(s => s.rollNumber));
        setRollNumber(maxRoll + 1);
      } else {
        setRollNumber(1);
      }
    }
  }, [className, students, editId, isFormOpen]);

  const openAddForm = () => {
    setEditId(null);
    setNameBn('');
    setNameEn('');
    setFatherName('');
    setMotherName('');
    setClassName('Ebtedayi 1');
    setDob('2015-01-01');
    setAddress('');
    setGuardianMobile('');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setCustomFieldsData({});
    setIsFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setEditId(student.id);
    setNameBn(student.nameBn);
    setNameEn(student.nameEn);
    setFatherName(student.fatherName);
    setMotherName(student.motherName);
    setClassName(student.className);
    setRollNumber(student.rollNumber);
    setDob(student.dob);
    setAddress(student.address);
    setGuardianMobile(student.guardianMobile);
    setAdmissionDate(student.admissionDate);
    setCustomFieldsData(student.customFields || {});
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !nameEn.trim() || !fatherName.trim() || !motherName.trim() || !dob || !address.trim() || !guardianMobile.trim() || rollNumber === '') {
      showToast('সবগুলো ঘর পূরণ করা আবশ্যক! (Please fill all fields!)', 'error');
      return;
    }

    // Validate custom fields required on/off switches
    for (const f of customFieldDefs) {
      if (f.required && (!customFieldsData[f.id] || customFieldsData[f.id].trim() === '')) {
        showToast(`কাস্টম ফিল্ড "${f.label}" পূরণ করা আবশ্যক!`, 'error');
        return;
      }
    }

    const studentData = {
      nameBn: nameBn.trim(),
      nameEn: nameEn.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      className,
      rollNumber: Number(rollNumber),
      dob,
      address: address.trim(),
      guardianMobile: guardianMobile.trim(),
      admissionDate,
      customFields: customFieldsData
    };

    if (editId) {
      onEditStudent({ id: editId, ...studentData });
    } else {
      onAddStudent(studentData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, nameBnStr: string) => {
    const isConfirmed = window.confirm(`আপনি কি ছাত্রী "${nameBnStr}" এর সমস্ত রেকর্ড মুছে ফেলতে চান? (Are you sure you want to delete student "${nameBnStr}"?)`);
    if (isConfirmed) {
      onDeleteStudent(id);
    }
  };

  const filteredStudents = students.filter(s => {
    const term = search.toLowerCase();
    const classTerm = classFilter;
    
    const matchesSearch = 
      s.nameBn.toLowerCase().includes(term) ||
      s.nameEn.toLowerCase().includes(term) ||
      s.fatherName.toLowerCase().includes(term) ||
      s.rollNumber.toString().includes(term) ||
      s.guardianMobile.includes(term);
      
    const matchesClass = classTerm === 'All' || s.className === classTerm;
    
    return matchesSearch && matchesClass;
  });

  return (
    <div id="student-management-tab" className="space-y-6">
      
      {/* Header view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-madrasha-green-600" />
            ছাত্রী ব্যবস্থাপনা (Student Management)
          </h2>
          <p className="text-sm text-zinc-500">নতুন ছাত্রী ভর্তি ও তথ্য সম্পাদনা মডিউল (Manage student enrollments, profiles and records)</p>
        </div>
        <button
          id="add-student-btn"
          onClick={openAddForm}
          className="bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ছাত্রী ভর্তি (Enroll New Student)</span>
        </button>
      </div>

      {/* Pop-up dialog layer for Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col border border-zinc-100">
            <div className="flex justify-between items-center bg-madrasha-green-700 text-white p-4">
              <h3 className="font-bold text-base">
                {editId ? 'ছাত্রী তথ্য সংশোধন ফরম (Edit Student Demographics)' : 'নতুন ছাত্রী ভর্তি ফরম (Student Admission Form)'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 cursor-pointer transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">ছাত্রী নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    required
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="যেমন: ফাতেমা আক্তার"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">Student Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Fatema Akter"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">পিতার নাম (Father's Name) *</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="পিতার নাম লিখুন"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">মাতার নাম (Mother's Name) *</label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="মাতার নাম লিখুন"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">শ্রেণী (Class Selection) *</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value as ClassNameType)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  >
                    {CLASSES.map(clsName => (
                      <option key={clsName} value={clsName}>{clsName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">রোল নম্বর (Roll Number) *</label>
                  <input
                    type="number"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm bg-zinc-50 font-bold"
                  />
                  <p className="text-[10px] text-zinc-400">শ্রেণী পরিবর্তন করলে এটি স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">জন্ম তারিখ (Date of Birth) *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">অভিভাবকের মোবাইল (Guardian Mobile) *</label>
                  <input
                    type="tel"
                    required
                    value={guardianMobile}
                    onChange={(e) => setGuardianMobile(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">ভর্তির তারিখ (Admission Date) *</label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">ঠিকানা (Permanent Address) *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="স্থায়ী এবং বর্তমান ঠিকানা লিখুন..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                />
              </div>

              {/* Dynamic Custom Fields Rendering under field manager */}
              {customFieldDefs.length > 0 && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-madrasha-green-750 uppercase tracking-wide">অতিরিক্ত তথ্য (Additional Custom Information)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customFieldDefs.map((field) => {
                      const value = customFieldsData[field.id] || '';
                      const handleValueChange = (val: string) => {
                        setCustomFieldsData(prev => ({ ...prev, [field.id]: val }));
                      };

                      return (
                        <div key={field.id} className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-750 block">
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

              <div className="flex justify-end gap-3 pt-4 border-t mt-4 col-span-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white rounded-lg text-xs font-semibold shadow cursor-pointer flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  <span>সংরক্ষণ করুন (Submit Admission)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Options */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="student-search-input"
            type="text"
            placeholder="নাম, পিতার নাম, মোবাইল দিয়ে খুঁজুন... (Search student...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs text-zinc-700"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 items-center">
          <span className="text-xs text-zinc-500 flex items-center gap-1 font-semibold shrink-0">
            <Filter className="h-3.5 w-3.5" />
            শ্রেণী:
          </span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-white border-zinc-200 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-madrasha-green-600"
          >
            <option value="All">সকল শ্রেণী (All Classes)</option>
            {CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((stud) => (
            <div key={stud.id} className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow transition duration-200 relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-madrasha-green-50 rounded-full flex items-center justify-center text-madrasha-green-700 border border-madrasha-green-200">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-800 text-sm leading-tight">{stud.nameBn}</h4>
                      <p className="text-zinc-400 font-sans text-xs">{stud.nameEn}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-madrasha-green-600 text-white rounded-md">
                    {stud.className}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 border-t pt-3 mt-1">
                  <div className="flex justify-between">
                    <span>রোল (Roll No):</span>
                    <strong className="text-zinc-800">#{stud.rollNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>পিতা (Father):</span>
                    <span className="text-zinc-800 text-right font-medium">{stud.fatherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>মোবাইল (Mobile):</span>
                    <span className="text-zinc-800">{stud.guardianMobile}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t flex justify-end gap-2 text-[11px]">
                <button
                  onClick={() => setViewingStudent(stud)}
                  className="px-2 py-1.5 text-zinc-600 hover:text-madrasha-green-600 border border-zinc-200 bg-zinc-50 rounded-md transition cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <Eye className="h-3 w-3" />
                  <span>প্রোফাইল (Profile)</span>
                </button>
                <button
                  onClick={() => openEditForm(stud)}
                  className="px-2 py-1.5 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-100 rounded-md transition cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <Edit className="h-3 w-3" />
                  <span>সম্পাদনা (Edit)</span>
                </button>
                <button
                  onClick={() => handleDelete(stud.id, stud.nameBn)}
                  className="px-2 py-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-100 rounded-md transition cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>মুছুন (Delete)</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-400 bg-white rounded-xl border border-dashed border-zinc-200">
            <Users className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
            <p className="text-sm">কোনো ছাত্রীর তথ্য খুঁজে পাওয়া যায়নি! (No students match filter requirements.)</p>
          </div>
        )}
      </div>

      {/* HTML5 Modal Dialog for Detailed Student Profile View */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center bg-madrasha-green-700 text-white p-4">
              <h3 className="font-bold text-base">ছাত্রী জীবনবৃত্তান্ত (Student Detailed Profile)</h3>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-white hover:bg-white/10 p-1 rounded-full cursor-pointer transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Header profile */}
              <div className="flex flex-col items-center border-b pb-4">
                <div className="w-16 h-16 bg-madrasha-green-100 text-madrasha-green-700 rounded-full flex items-center justify-center mb-3 border-2 border-madrasha-green-200 text-xl font-bold font-sans">
                  {viewingStudent.nameEn.charAt(0)}
                </div>
                <h4 className="text-base font-bold text-zinc-800">{viewingStudent.nameBn}</h4>
                <p className="text-xs text-zinc-500 font-sans uppercase font-medium tracking-wide mt-0.5">{viewingStudent.nameEn}</p>
                <span className="mt-2 text-xs font-semibold px-3 py-1 bg-madrasha-green-600 text-white rounded-full">
                  {viewingStudent.className} | রোল: #{viewingStudent.rollNumber}
                </span>
              </div>

              {/* Information listing */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> পিতার নাম (Father):</span>
                  <strong className="text-zinc-800">{viewingStudent.fatherName}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> মাতার নাম (Mother):</span>
                  <strong className="text-zinc-800">{viewingStudent.motherName}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> জন্ম তারিখ (DOB):</span>
                  <strong className="text-zinc-800 font-sans">{viewingStudent.dob}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> মোবাইল (Mobile):</span>
                  <strong className="text-zinc-800 font-sans">{viewingStudent.guardianMobile}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> ভর্তির তারিখ (Adm. Date):</span>
                  <strong className="text-zinc-800 font-sans">{viewingStudent.admissionDate}</strong>
                </div>

                <div className="flex flex-col gap-1 py-1.5">
                  <span className="text-zinc-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> ঠিকানা (Address):</span>
                  <p className="bg-zinc-50 p-2.5 border border-zinc-150 rounded-lg text-zinc-700 text-xs mt-1 leading-relaxed">
                    {viewingStudent.address}
                  </p>
                </div>

                {/* Additional custom fields dynamically rendered */}
                {customFieldDefs.map((field) => {
                  const val = viewingStudent.customFields?.[field.id];
                  if (!val) return null;
                  return (
                    <div key={field.id} className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-500 font-semibold">{field.label}:</span>
                      <strong className="text-zinc-800">
                        {field.type === 'Checkbox' ? (val === 'true' ? 'হ্যাঁ (Yes)' : 'না (No)') : val}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
