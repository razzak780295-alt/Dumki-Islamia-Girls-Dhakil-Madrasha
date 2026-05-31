import React, { useState, useEffect } from 'react';
import { 
  Student, Teacher, Notice, AttendanceRecord, FeePayment, Exam, ExamMark 
} from './types';
import { 
  initialStudents, initialTeachers, initialNotices, initialExams, initialExamMarks, initialAttendance, initialFees 
} from './sampleData';

// Component imports
import LoginScreen from './components/LoginScreen';
import DashboardTab from './components/DashboardTab';
import StudentTab from './components/StudentTab';
import AttendanceTab from './components/AttendanceTab';
import FeesTab from './components/FeesTab';
import ExamTab from './components/ExamTab';
import TeacherTab from './components/TeacherTab';
import NoticeTab from './components/NoticeTab';
import BaniTab from './components/BaniTab';
import GalleryTab from './components/GalleryTab';
import SourceEditorTab from './components/SourceEditorTab';
import FieldManagerTab from './components/FieldManagerTab';

// Lucide icon imports
import { 
  LayoutDashboard, Users, CalendarCheck2, PiggyBank, Award, UserSquare2, Megaphone, 
  LogOut, Star, Download, Upload, CheckCircle, AlertTriangle, Menu, X, Landmark,
  Quote, Image, Code, Sliders
} from 'lucide-react';

type TabType = 'Dashboard' | 'Student' | 'Attendance' | 'Fees' | 'Exam' | 'Teacher' | 'Notice' | 'Bani' | 'Gallery' | 'Source' | 'FieldManager';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');

  // Core Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeePayment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examMarks, setExamMarks] = useState<ExamMark[]>([]);

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Mobile menu control toggles
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 1. Initial State Hydration and LocalStorage Loading
  useEffect(() => {
    // Check login state
    const authStatus = localStorage.getItem('dumki_auth');
    if (authStatus === 'true') {
      setIsLoggedIn(true);
    }

    // Hydrate tables
    const storedStudents = localStorage.getItem('dumki_students');
    const storedTeachers = localStorage.getItem('dumki_teachers');
    const storedNotices = localStorage.getItem('dumki_notices');
    const storedAttendance = localStorage.getItem('dumki_attendance');
    const storedFees = localStorage.getItem('dumki_fees');
    const storedExams = localStorage.getItem('dumki_exams');
    const storedMarks = localStorage.getItem('dumki_marks');

    if (storedStudents) setStudents(JSON.parse(storedStudents));
    else {
      setStudents(initialStudents);
      localStorage.setItem('dumki_students', JSON.stringify(initialStudents));
    }

    if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
    else {
      setTeachers(initialTeachers);
      localStorage.setItem('dumki_teachers', JSON.stringify(initialTeachers));
    }

    if (storedNotices) setNotices(JSON.parse(storedNotices));
    else {
      setNotices(initialNotices);
      localStorage.setItem('dumki_notices', JSON.stringify(initialNotices));
    }

    if (storedAttendance) setAttendance(JSON.parse(storedAttendance));
    else {
      setAttendance(initialAttendance);
      localStorage.setItem('dumki_attendance', JSON.stringify(initialAttendance));
    }

    if (storedFees) setFees(JSON.parse(storedFees));
    else {
      setFees(initialFees);
      localStorage.setItem('dumki_fees', JSON.stringify(initialFees));
    }

    if (storedExams) setExams(JSON.parse(storedExams));
    else {
      setExams(initialExams);
      localStorage.setItem('dumki_exams', JSON.stringify(initialExams));
    }

    if (storedMarks) setExamMarks(JSON.parse(storedMarks));
    else {
      setExamMarks(initialExamMarks);
      localStorage.setItem('dumki_marks', JSON.stringify(initialExamMarks));
    }
  }, []);

  // Helper Toast trigger
  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto erase toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // State Persistence watchers
  const persist = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // 2. Data modification handlers
  // --- Students ---
  const handleAddStudent = (newS: Omit<Student, 'id'>) => {
    const stud: Student = {
      id: `stud_${Date.now()}`,
      ...newS
    };
    const updated = [...students, stud];
    setStudents(updated);
    persist('dumki_students', updated);
    showToast('ছাত্রী সফলভাবে ভর্তি করা হয়েছে! (Student successfully enrolled!)', 'success');
  };

  const handleEditStudent = (updatedS: Student) => {
    const updated = students.map(s => s.id === updatedS.id ? updatedS : s);
    setStudents(updated);
    persist('dumki_students', updated);
    showToast('ছাত্রীর প্রোফাইল সফলভাবে আপডেট করা হয়েছে! (Student details updated!)', 'success');
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    persist('dumki_students', updated);

    // Cascade delete any corresponding fees, marks, attendance record
    const updatedFees = fees.filter(f => f.studentId !== id);
    setFees(updatedFees);
    persist('dumki_fees', updatedFees);

    const updatedMarks = examMarks.filter(em => em.studentId !== id);
    setExamMarks(updatedMarks);
    persist('dumki_marks', updatedMarks);

    const updatedAtt = attendance.filter(a => a.studentId !== id);
    setAttendance(updatedAtt);
    persist('dumki_attendance', updatedAtt);

    showToast('ছাত্রীর সমস্ত রেকর্ড নিখুঁতভাবে মুছে ফেলা হয়েছে! (Student and linked files purged!)', 'success');
  };

  // --- Attendance ---
  const handleSaveAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    // Merge or replace existing records on the same date for the target students
    if (records.length === 0) return;
    const dateToCheck = records[0].date;
    const studentIds = records.map(r => r.studentId);

    // Filter out existing records corresponding to these students on this date
    const remaining = attendance.filter(a => !(a.date === dateToCheck && studentIds.includes(a.studentId)));
    
    const newRecords: AttendanceRecord[] = records.map((r, i) => ({
      id: `att_${Date.now()}_${i}`,
      ...r
    }));

    const updated = [...remaining, ...newRecords];
    setAttendance(updated);
    persist('dumki_attendance', updated);
    showToast('আজকের হাজিরা সফলভাবে সংরক্ষণ করা হয়েছে! (Attendance records saved!)', 'success');
  };

  // --- Fees ---
  const handleAddFeePayment = (newP: Omit<FeePayment, 'id'>) => {
    const pay: FeePayment = {
      id: `fee_${Date.now()}`,
      ...newP
    };
    const updated = [...fees, pay];
    setFees(updated);
    persist('dumki_fees', updated);
    showToast('ফি রেকর্ড সফলভাবে যুক্ত করা হয়েছে! (Payment recorded successfully!)', 'success');
  };

  const handleUpdateFeeStatus = (id: string, newStatus: 'Paid' | 'Due') => {
    const updated = fees.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status: newStatus,
          paymentDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : ''
        };
      }
      return f;
    });
    setFees(updated);
    persist('dumki_fees', updated);
  };

  const handleDeleteFeePayment = (id: string) => {
    const updated = fees.filter(f => f.id !== id);
    setFees(updated);
    persist('dumki_fees', updated);
    showToast('ফি রসিদ সফলভাবে বাতিল করা হয়েছে।', 'success');
  };

  // --- Exams & Results ---
  const handleAddExam = (newE: Omit<Exam, 'id'>) => {
    const examObj: Exam = {
      id: `exam_${Date.now()}`,
      ...newE
    };
    const updated = [...exams, examObj];
    setExams(updated);
    persist('dumki_exams', updated);
  };

  const handleSaveMarks = (newMark: Omit<ExamMark, 'id'>) => {
    // Check if entry already exists (same student same exam)
    const existingIndex = examMarks.findIndex(
      m => m.studentId === newMark.studentId && m.examId === newMark.examId
    );

    let updated: ExamMark[];
    if (existingIndex > -1) {
      updated = examMarks.map((m, i) => i === existingIndex ? { ...m, ...newMark } : m);
    } else {
      const entry: ExamMark = {
        id: `mark_${Date.now()}`,
        ...newMark
      };
      updated = [...examMarks, entry];
    }

    setExamMarks(updated);
    persist('dumki_marks', updated);
    showToast('পরীক্ষার ফলাফল ও মেরিট রেকর্ড সফলভাবে সংরক্ষিত হয়েছে! (Marksheet synced!)', 'success');
  };

  // --- Teachers ---
  const handleAddTeacher = (newT: Omit<Teacher, 'id'>) => {
    const teachObj: Teacher = {
      id: `teach_${Date.now()}`,
      ...newT
    };
    const updated = [...teachers, teachObj];
    setTeachers(updated);
    persist('dumki_teachers', updated);
    showToast('সম্মানিত শিক্ষক সফলভাবে নিবন্ধিত হয়েছেন! (Teacher added!)', 'success');
  };

  const handleEditTeacher = (updatedT: Teacher) => {
    const updated = teachers.map(t => t.id === updatedT.id ? updatedT : t);
    setTeachers(updated);
    persist('dumki_teachers', updated);
    showToast('শিক্ষকের তথ্য বিবরণী সফলভাবে পরিবর্তিত হয়েছে! (Teacher profile modified!)', 'success');
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    persist('dumki_teachers', updated);
    showToast('শিক্ষকের সমস্ত তথ্য রেকর্ড মুছে ফেলা হয়েছে! (Teacher record removed!)', 'success');
  };

  // --- Notices ---
  const handleAddNotice = (newN: Omit<Notice, 'id'>) => {
    const noticeObj: Notice = {
      id: `not_${Date.now()}`,
      ...newN
    };
    const updated = [noticeObj, ...notices]; // Prepends for showing newest first
    setNotices(updated);
    persist('dumki_notices', updated);
    showToast('নতুন নোটিশ সফলভাবে বোর্ডে টানানো হয়েছে! (Announcement published!)', 'success');
  };

  const handleDeleteNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    persist('dumki_notices', updated);
    showToast('নোটিশ বোর্ড থেকে মুছে ফেলা হয়েছে! (Notice removed!)', 'success');
  };

  // Backup handlers
  const handleExportBackup = () => {
    try {
      const backupData = {
        students,
        teachers,
        notices,
        attendance,
        fees,
        exams,
        examMarks
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.download = `dumki_madrasha_system_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      showToast('ব্যাকআপ ফাইলটি ডাউনলোড সম্পন্ন হয়েছে! (Export database backup complete!)', 'success');
    } catch (e) {
      showToast('ব্যাকআপ ফাইল তৈরি করতে ব্যর্থ হয়েছে! (Failed to export!)', 'error');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmImport = window.confirm('সতর্কতা: ব্যাকআপটি ইম্পোর্ট করলে বর্তমান সংরক্ষিত সকল তথ্য মুছে যাবে। আপনি কি নিশ্চিত ইম্পোর্ট করতে চান? (Warning: This will overwrite current data. Continue?)');
    if (!confirmImport) {
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Basic schema verification
        if (parsed.students && parsed.teachers && parsed.notices && parsed.attendance && parsed.fees) {
          setStudents(parsed.students);
          setTeachers(parsed.teachers);
          setNotices(parsed.notices);
          setAttendance(parsed.attendance);
          setFees(parsed.fees);
          
          if (parsed.exams) setExams(parsed.exams);
          if (parsed.examMarks) setExamMarks(parsed.examMarks);

          // Save to localStorage
          persist('dumki_students', parsed.students);
          persist('dumki_teachers', parsed.teachers);
          persist('dumki_notices', parsed.notices);
          persist('dumki_attendance', parsed.attendance);
          persist('dumki_fees', parsed.fees);
          if (parsed.exams) persist('dumki_exams', parsed.exams);
          if (parsed.examMarks) persist('dumki_marks', parsed.examMarks);

          showToast('ডেটাবেস সফলভাবে রি-স্টোর হয়েছে! (System backup imported!)', 'success');
        } else {
          showToast('ত্রুটি: ভুল ব্যাকআপ ফাইল ফরমেট! (Invalid database backup file format!)', 'error');
        }
      } catch (err) {
        showToast('ত্রুটি: ফাইলটি পড়তে ব্যর্থ হয়েছে! (Could not read backup file!)', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset value to let repeat imports run
  };

  const handleLogout = () => {
    const isAgree = window.confirm('আপনি কি লগআউট করতে চান? (Are you sure you want to log out?)');
    if (isAgree) {
      localStorage.removeItem('dumki_auth');
      setIsLoggedIn(false);
      showToast('লগআউট সফল হয়েছে! বিদায় নিচ্ছি। (Logged out successfully!)', 'success');
    }
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('dumki_auth', 'true');
    setIsLoggedIn(true);
  };

  // Navigations routing
  const navigateToTab = (tabId: string) => {
    setActiveTab(tabId as TabType);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check login status first
  if (!isLoggedIn) {
    return (
      <>
        {/* Render Toast indicators */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-transform animate-in slide-in-from-top-1/3 duration-300 pointer-events-auto bg-white ${
              t.type === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-red-200 text-red-800'
            }`}>
              {t.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
              <span className="text-xs font-bold leading-tight">{t.message}</span>
            </div>
          ))}
        </div>
        <LoginScreen onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none relative pb-16 md:pb-0 border-t-4 border-madrasha-green-700">
      
      {/* Dynamic Toast Board */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none no-print">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-2xl shadow-xl border-l-4 flex items-center gap-3 transition-transform duration-300 pointer-events-auto bg-white ${
            t.type === 'success' 
              ? 'border-l-madrasha-green-600 border-zinc-200 text-zinc-800' 
              : 'border-l-red-600 border-zinc-200 text-zinc-800'
          }`}>
            {t.type === 'success' 
              ? <CheckCircle className="h-5 w-5 text-madrasha-green-600 shrink-0" /> 
              : <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />}
            <span className="text-xs font-bold leading-tight">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Navigation Bar (No Print) */}
      <header className="bg-madrasha-green-700 text-white shadow-md border-b-2 border-madrasha-gold-500 py-3 px-4 flex justify-between items-center no-print shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-1.5 hover:bg-madrasha-green-600 rounded-lg transition"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 border border-madrasha-gold-500 shrink-0">
              {/* Crescent Star Emblem Representation SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-madrasha-green-700" xmlns="http://www.w3.org/2000/svg">
                <path d="M 45,10 C 25,10 10,25 10,45 C 10,65 25,80 45,80 C 35,75 30,62 30,45 C 30,28 35,15 45,10 Z" />
              </svg>
            </div>
            
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-white tracking-wide pr-2">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</h2>
              <p className="text-[9px] text-emerald-200 font-sans tracking-wide">Dumki Islamia Girls Dakhil Madrasha</p>
            </div>
          </div>
        </div>

        {/* Database backup & utility shortcuts buttons */}
        <div className="flex items-center gap-2">
          {/* Export utility */}
          <button
            onClick={handleExportBackup}
            title="ব্যাংকআপ ডাউনলোড করুন (Export Backup JSON)"
            className="p-2 border border-emerald-400 hover:bg-madrasha-green-600 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline bg-transparent text-white font-semibold">ব্যাকআপ (Export)</span>
          </button>

          {/* Import utility */}
          <label
            title="ব্যাকআপ ফাইল চালনা করুন (Import Backup JSON)"
            className="p-2 border border-emerald-400 hover:bg-madrasha-green-600 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden lg:inline bg-transparent font-semibold">রিস্টোর (Import)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 bg-red-650 hover:bg-red-700 text-white rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-semibold hover:scale-105 duration-100"
          >
            <LogOut className="h-4 w-4 text-red-200" />
            <span className="hidden sm:inline bg-transparent text-white font-semibold">বিদায় (Logout)</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
        
        {/* DESKTOP SIDEBAR NAVIGATION (No Print) */}
        <aside className="hidden md:flex w-64 bg-madrasha-green-700 text-white flex-col no-print shrink-0 sticky top-[58px] h-[calc(100vh-58px)] overflow-hidden justify-between border-r border-madrasha-green-800">
          
          <div className="flex flex-col flex-1">
            {/* High Density Mini Madrasha brand */}
            <div className="p-4 flex flex-col items-center border-b border-madrasha-green-800 bg-madrasha-green-800/45">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
                <svg className="w-8 h-8 text-madrasha-green-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
              </div>
              <h1 className="text-xs font-bold text-center leading-tight text-white mb-0.5">দুমকি ইসলামিয়া গার্লস মাদ্রাসা</h1>
              <p className="text-[9px] text-emerald-300 font-sans tracking-wider uppercase opacity-80 select-all">Dumki, Patuakhali</p>
            </div>

            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
              {[
                { id: 'Dashboard', label: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
                { id: 'Student', label: 'ছাত্রী ব্যবস্থাপনা', labelEn: 'Students', icon: Users },
                { id: 'Attendance', label: 'হাজিরা মডিউল', labelEn: 'Attendance', icon: CalendarCheck2 },
                { id: 'Fees', label: 'বেতন ও ফিস', labelEn: 'Fees Ledger', icon: PiggyBank },
                { id: 'Exam', label: 'পরীক্ষা ও ফলাফল', labelEn: 'Exams & Marks', icon: Award },
                { id: 'Teacher', label: 'শিক্ষক তথ্য', labelEn: 'Teachers profile', icon: UserSquare2 },
                { id: 'Notice', label: 'নোটিশ বোর্ড', labelEn: 'Notice Board', icon: Megaphone },
                { id: 'Bani', label: 'বাণী ও বার্তা', labelEn: 'Bani Messages', icon: Quote },
                { id: 'Gallery', label: 'ছবি গ্যালারি', labelEn: 'Photo Gallery', icon: Image },
                { id: 'Source', label: '⚙️ সোর্স এডিটর', labelEn: 'Source Editor', icon: Code },
                { id: 'FieldManager', label: '🛠️ ফিল্ড ম্যানেজার', labelEn: 'Field Manager', icon: Sliders },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigateToTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer text-left border-l-4 ${
                      isActive 
                        ? 'bg-madrasha-green-600 border-madrasha-gold-500 text-white'
                        : 'bg-transparent border-transparent text-emerald-100 hover:bg-madrasha-green-600/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-madrasha-gold-500' : 'text-emerald-200'}`} />
                    <div>
                      <h4 className="leading-tight">{tab.label}</h4>
                      <p className="text-[9px] font-sans opacity-70 mt-0.5">({tab.labelEn})</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* High Density Sub-footer */}
          <div className="p-3 bg-madrasha-green-900 text-[10px] space-y-1 border-t border-madrasha-green-800 text-emerald-100 select-all">
            <div className="flex justify-between items-center">
              <span>Admin Status:</span> 
              <span className="text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950/40 rounded">Online</span>
            </div>
            <div className="flex justify-between items-center opacity-70">
              <span>Version:</span> 
              <span>v2.0.4</span>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR PANEL (No Print Overlay Drawer) */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex no-print">
            <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setIsMobileSidebarOpen(false)}></div>
            <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col gap-6 shrink-0 z-10 border-r animate-in slide-in-from-left duration-250">
              
              {/* Header drawer */}
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-madrasha-green-700" />
                  <div>
                    <h3 className="font-bold text-xs text-zinc-800 leading-tight">মেন্যু (Navigations)</h3>
                    <p className="text-[9px] text-zinc-400">দুমকি দাখিল মাদ্রাসা</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="bg-zinc-100 p-1.5 rounded-full text-zinc-500">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="space-y-1.5 flex-1 overflow-y-auto">
                {[
                  { id: 'Dashboard', label: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
                  { id: 'Student', label: 'ছাত্রী ব্যবস্থাপনা', labelEn: 'Students', icon: Users },
                  { id: 'Attendance', label: 'হাজিরা মডিউল', labelEn: 'Attendance', icon: CalendarCheck2 },
                  { id: 'Fees', label: 'বেতন ও ফিস', labelEn: 'Fees Ledger', icon: PiggyBank },
                  { id: 'Exam', label: 'পরীক্ষা ও ফলাফল', labelEn: 'Exams & Marks', icon: Award },
                  { id: 'Teacher', label: 'শিক্ষক তথ্য', labelEn: 'Teachers profile', icon: UserSquare2 },
                  { id: 'Notice', label: 'নোটিশ বোর্ড', labelEn: 'Notice Board', icon: Megaphone },
                  { id: 'Bani', label: 'বাণী ও বার্তা', labelEn: 'Bani Messages', icon: Quote },
                  { id: 'Gallery', label: 'ছবি গ্যালারি', labelEn: 'Photo Gallery', icon: Image },
                  { id: 'Source', label: '⚙️ সোর্স এডিটর', labelEn: 'Source Editor', icon: Code },
                  { id: 'FieldManager', label: '🛠️ ফিল্ড ম্যানেজার', labelEn: 'Field Manager', icon: Sliders },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => navigateToTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                        isActive 
                          ? 'bg-madrasha-green-50 text-madrasha-green-700 font-bold border border-madrasha-green-200'
                          : 'hover:bg-zinc-50 text-zinc-650'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-madrasha-green-600' : 'text-zinc-400'}`} />
                      <div>
                        <h4 className="leading-tight">{tab.label}</h4>
                        <p className="text-[9px] font-sans text-zinc-400 mt-0.5">({tab.labelEn})</p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t text-center text-[10px] text-zinc-400 font-sans leading-relaxed">
                Applet: a482505e-db2c-4ba3...<br />
                Patuakhali, Bangladesh
              </div>
            </div>
          </div>
        )}

        {/* CORE APPLICATION CONTAINER MAIN VIEWS */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
          
          {/* Sub-view router container (with strict print filters) */}
          <div className="max-w-6xl mx-auto h-full">
            <div className="no-print">
              {activeTab === 'Dashboard' && (
                <DashboardTab 
                  students={students}
                  teachers={teachers}
                  notices={notices}
                  attendance={attendance}
                  fees={fees}
                  exams={exams}
                  onNavigate={navigateToTab}
                />
              )}

              {activeTab === 'Student' && (
                <StudentTab 
                  students={students}
                  onAddStudent={handleAddStudent}
                  onEditStudent={handleEditStudent}
                  onDeleteStudent={handleDeleteStudent}
                  showToast={showToast}
                />
              )}

              {activeTab === 'Attendance' && (
                <AttendanceTab 
                  students={students}
                  attendance={attendance}
                  onSaveAttendance={handleSaveAttendance}
                  showToast={showToast}
                />
              )}

              {activeTab === 'Fees' && (
                <FeesTab 
                  students={students}
                  fees={fees}
                  onAddFeePayment={handleAddFeePayment}
                  onUpdateFeeStatus={handleUpdateFeeStatus}
                  onDeleteFeePayment={handleDeleteFeePayment}
                  showToast={showToast}
                />
              )}

              {activeTab === 'Exam' && (
                <ExamTab 
                  students={students}
                  exams={exams}
                  examMarks={examMarks}
                  onAddExam={handleAddExam}
                  onSaveMarks={handleSaveMarks}
                  showToast={showToast}
                />
              )}

              {activeTab === 'Teacher' && (
                <TeacherTab 
                  teachers={teachers}
                  onAddTeacher={handleAddTeacher}
                  onEditTeacher={handleEditTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  showToast={showToast}
                />
              )}

              {activeTab === 'Notice' && (
                <NoticeTab 
                  notices={notices}
                  onAddNotice={handleAddNotice}
                  onDeleteNotice={handleDeleteNotice}
                  showToast={showToast}
                />
              )}

              {activeTab === 'Bani' && (
                <BaniTab 
                  showToast={showToast}
                />
              )}

              {activeTab === 'Gallery' && (
                <GalleryTab 
                  showToast={showToast}
                />
              )}

              {activeTab === 'Source' && (
                <SourceEditorTab 
                  showToast={showToast}
                />
              )}

              {activeTab === 'FieldManager' && (
                <FieldManagerTab 
                  showToast={showToast}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE STICKY BOTTOM MENU PANEL (No Print) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-1 px-1 flex justify-around items-center no-print z-40 shadow-lg overflow-x-auto">
        {[
          { id: 'Dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
          { id: 'Student', label: 'ছাত্রী', icon: Users },
          { id: 'Attendance', label: 'হাজিরা', icon: CalendarCheck2 },
          { id: 'Fees', label: 'ফি', icon: PiggyBank },
          { id: 'Exam', label: 'পরীক্ষা', icon: Award },
          { id: 'Source', label: 'সোর্স', icon: Code },
          { id: 'FieldManager', label: 'ফিল্ড', icon: Sliders },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigateToTab(tab.id as TabType)}
              className={`flex flex-col items-center p-1.5 rounded-lg transition shrink-0 ${
                isActive ? 'text-madrasha-green-700 scale-105' : 'text-zinc-400'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="text-[10px] font-bold mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </footer>
    </div>
  );
}
