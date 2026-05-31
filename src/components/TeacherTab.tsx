import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';
import { Users, Plus, Edit, Trash2, Phone, Award, Calendar, DollarSign, Search, X, Check } from 'lucide-react';

interface TeacherTabProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function TeacherTab({ teachers, onAddTeacher, onEditTeacher, onDeleteTeacher, showToast }: TeacherTabProps) {
  const [search, setSearch] = useState('');
  
  // Modal & Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Custom Fields Configurations
  const [customFieldDefs, setCustomFieldDefs] = useState<any[]>([]);
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, string>>({});

  // Form Fields
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [qualification, setQualification] = useState('');
  const [mobile, setMobile] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [salary, setSalary] = useState<number | ''>('');

  // Load custom field configurations
  useEffect(() => {
    const stored = localStorage.getItem('customFields_teacher');
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

  const openAddForm = () => {
    setEditId(null);
    setName('');
    setSubject('');
    setQualification('');
    setMobile('');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setSalary('');
    setCustomFieldsData({});
    setIsFormOpen(true);
  };

  const openEditForm = (teacher: Teacher) => {
    setEditId(teacher.id);
    setName(teacher.name);
    setSubject(teacher.subject);
    setQualification(teacher.qualification);
    setMobile(teacher.mobile);
    setJoinDate(teacher.joinDate);
    setSalary(teacher.salary);
    setCustomFieldsData(teacher.customFields || {});
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !qualification.trim() || !mobile.trim() || !joinDate || salary === '') {
      showToast('সকল তারকা চিহ্নিত ঘরগুলো পূরণ করুন! (Please fill all required fields!)', 'error');
      return;
    }

    // Validate custom fields required on/off switches
    for (const f of customFieldDefs) {
      if (f.required && (!customFieldsData[f.id] || customFieldsData[f.id].trim() === '')) {
        showToast(`কাস্টম ফিল্ড "${f.label}" পূরণ করা আবশ্যক!`, 'error');
        return;
      }
    }

    const teacherData = {
      name: name.trim(),
      subject: subject.trim(),
      qualification: qualification.trim(),
      mobile: mobile.trim(),
      joinDate,
      salary: Number(salary),
      customFields: customFieldsData
    };

    if (editId) {
      onEditTeacher({ id: editId, ...teacherData });
    } else {
      onAddTeacher(teacherData);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string, nameStr: string) => {
    const isConfirmed = window.confirm(`আপনি কি শিক্ষক "${nameStr}" এর তথ্য মুছে ফেলতে নিশ্চিত? (Are you sure you want to delete teacher "${nameStr}"?)`);
    if (isConfirmed) {
      onDeleteTeacher(id);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const term = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.subject.toLowerCase().includes(term) ||
      t.qualification.toLowerCase().includes(term) ||
      t.mobile.toLowerCase().includes(term)
    );
  });

  return (
    <div id="teacher-management-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-madrasha-green-600" />
            শিক্ষক তথ্য (Teacher Management)
          </h2>
          <p className="text-sm text-zinc-500">মাদ্রাসার সম্মানিত শিক্ষকদের বিবরণ ও বেতন সংক্রান্ত তালিকা (Manage Madrasha teachers directory & metadata)</p>
        </div>
        <button
          id="add-teacher-btn"
          onClick={openAddForm}
          className="bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন শিক্ষক যোগ করুন (Add Teacher)</span>
        </button>
      </div>

      {/* Pop-up dialog layer for Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col border border-zinc-100">
            <div className="flex justify-between items-center bg-madrasha-green-700 text-white p-4">
              <h3 className="font-bold text-base">
                {editId ? 'শিক্ষক তথ্য পরিবর্তন করুন (Edit Teacher Profile)' : 'নতুন শিক্ষক নিবন্ধন (Register New Teacher)'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 cursor-pointer transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">শিক্ষকের নাম (Teacher's Name) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মাওলানা মো: আমিনুল ইসলাম"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">পাঠদানের বিষয় (Teaching Subject) *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="হাদিস শরিফ / বাংলা / গণিত"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">যোগ্যতা (Educational Qualification) *</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="কামিল / এম.এ / বি.এসসি"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">মোবাইল নম্বর (Mobile Number) *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">যোগদানের তারিখ (Joining Date) *</label>
                  <input
                    type="date"
                    required
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">মাসিক বেতন (Monthly Salary BDT) *</label>
                <div className="relative rounded-lg shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="20000"
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Custom Fields Rendering under field manager */}
              {customFieldDefs.length > 0 && (
                <div className="border-t pt-4 space-y-4 col-span-full">
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

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
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
                  <Check className="h-3.5 w-3.5" />
                  <span>সংরক্ষণ করুন (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
        <div className="relative max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="teacher-search-input"
            type="text"
            placeholder="নাম, বিষয় অথবা ফোন নম্বর লিখুন... (Search teachers...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs text-zinc-700"
          />
        </div>
      </div>

      {/* Teacher Directory Board / Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between">
              
              {/* Islamic/Gold decorative top corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-madrasha-green-50 rounded-bl-full border-b border-l border-zinc-100 flex items-center justify-center">
                <Award className="h-4 w-4 text-madrasha-gold-500" />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-zinc-800 leading-tight pr-6">{teacher.name}</h4>
                  <p className="text-xs text-madrasha-green-700 font-semibold mt-1 bg-madrasha-green-50 px-2 py-0.5 rounded-md inline-block">
                    {teacher.subject}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 mt-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>যোগ্যতা (Qual.): <strong className="text-zinc-800 font-medium">{teacher.qualification}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>মোবাইল (Mobile): <strong className="text-zinc-800 font-medium">{teacher.mobile}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>যোগদান (Joined): <strong className="text-zinc-800 font-medium">{teacher.joinDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>মাসিক বেতন (Salary): <strong className="text-madrasha-green-700 font-bold">৳ {teacher.salary.toLocaleString('bn-BD')}</strong></span>
                  </div>

                  {customFieldDefs.length > 0 && (
                    <div className="border-t pt-2 mt-2 space-y-1">
                      {customFieldDefs.map((field) => {
                        const val = teacher.customFields?.[field.id];
                        if (!val) return null;
                        return (
                          <div key={field.id} className="flex justify-between text-[11px] text-zinc-550 border-b border-dashed border-zinc-100 last:border-0 pb-1">
                            <span>{field.label}:</span>
                            <span className="font-semibold text-zinc-800 text-right">
                              {field.type === 'Checkbox' ? (val === 'true' ? 'হ্যাঁ' : 'না') : val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t flex justify-end gap-2 text-xs">
                <button
                  onClick={() => openEditForm(teacher)}
                  className="px-2.5 py-1.5 text-madrasha-green-600 hover:text-white hover:bg-madrasha-green-600 border border-madrasha-green-100 rounded-md transition duration-200 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>সম্পাদনা (Edit)</span>
                </button>
                <button
                  onClick={() => handleDelete(teacher.id, teacher.name)}
                  className="px-2.5 py-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-100 rounded-md transition duration-200 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>মুছুন (Delete)</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-zinc-400 bg-white rounded-xl border border-dashed border-zinc-200">
            <p className="text-sm">কোনো শিক্ষকের তথ্য খুঁজে পাওয়া যায়নি! (No teachers matched search.)</p>
          </div>
        )}
      </div>
    </div>
  );
}
