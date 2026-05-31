import React, { useMemo } from 'react';
import { Student, Teacher, Notice, AttendanceRecord, FeePayment, Exam } from '../types';
import { LayoutDashboard, Users, UserCheck, CalendarDays, Megaphone, DollarSign, ArrowUpRight, GraduationCap, PlusCircle, CheckSquare, Bell, Search } from 'lucide-react';

interface DashboardTabProps {
  students: Student[];
  teachers: Teacher[];
  notices: Notice[];
  attendance: AttendanceRecord[];
  fees: FeePayment[];
  exams: Exam[];
  onNavigate: (tabId: string) => void;
}

export default function DashboardTab({ students, teachers, notices, attendance, fees, exams, onNavigate }: DashboardTabProps) {
  
  // 1. Math/Aggregation metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  // Today attendance metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = useMemo(() => {
    return attendance.filter(a => a.date === todayStr);
  }, [attendance, todayStr]);

  const attendanceRate = useMemo(() => {
    if (todayLogs.length === 0) return 0;
    const presents = todayLogs.filter(l => l.status === 'Present' || l.status === 'Late').length;
    return Math.round((presents / todayLogs.length) * 100);
  }, [todayLogs]);

  // Pending collection metrics
  const totalDueFees = useMemo(() => {
    return fees.filter(f => f.status === 'Due').reduce((sum, f) => sum + f.amount, 0);
  }, [fees]);

  // Upcoming Exams
  const upcomingExams = useMemo(() => {
    const sorted = [...exams].sort((a,b) => a.date.localeCompare(b.date));
    return sorted.slice(0, 3);
  }, [exams]);

  // Recent Notices
  const recentNotices = useMemo(() => {
    const sorted = [...notices].sort((a,b) => b.date.localeCompare(a.date));
    return sorted.slice(0, 3);
  }, [notices]);

  return (
    <div id="dashboard-tab" className="space-y-6 select-none animate-fade-in">
      
      {/* Welcome Banner Card (High Density) */}
      <div className="bg-gradient-to-r from-madrasha-green-700 via-madrasha-green-800 to-emerald-900 rounded-2xl p-5 md:p-6 text-white relative overflow-hidden shadow-sm border-b-4 border-madrasha-gold-500">
        
        {/* Subtle crescent star layout backdrop overlay */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-80 h-80 fill-white">
            <path d="M 45,10 C 25,10 10,25 10,45 C 10,65 25,80 45,80 C 35,75 30,62 30,45 C 30,28 35,15 45,10 Z" />
          </svg>
        </div>

        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="bg-madrasha-gold-500 text-zinc-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans leading-none">
              Admin Panel Active
            </span>
            <span className="text-zinc-200 text-[10px] font-sans font-medium">/{todayStr} (পটুয়াখালী, বাংলাদেশ)</span>
          </div>
          
          <h1 className="text-xl md:text-3xl font-black tracking-tight leading-snug">
            দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা
          </h1>
          <p className="text-xs md:text-sm text-zinc-100 max-w-xl leading-relaxed opacity-95">
            শিক্ষা ব্যবস্থাপনা ড্যাশবোর্ডে আপনাকে স্বাগতম। এখান থেকে ছাত্রীদের ভর্তি, হাজিরা, ফিস, পরীক্ষা এবং শিক্ষকদের যাবতীয় তথ্য নিপুণভাবে পর্যবেক্ষণ ও নিয়ন্ত্রণ করুন।
          </p>

          <div className="h-0.5 w-12 bg-madrasha-gold-500"></div>

          <div className="flex flex-wrap gap-4 text-[10px] font-sans text-emerald-100 pt-0.5">
            <span>স্থাপিত: ১৯৮০ খ্রিষ্টাব্দ</span>
            <span>•</span>
            <span>EIIN: ১০২৪৩২</span>
            <span>•</span>
            <span>দুমকি, পটুয়াখালী</span>
          </div>
        </div>
      </div>

      {/* Aggregate Analytical Stats cards (High Density layout pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition duration-200 flex flex-col justify-between hover:border-madrasha-green-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">মোট ছাত্রী (Total Students)</p>
            <div className="w-7 h-7 bg-madrasha-green-50 text-madrasha-green-700 rounded-lg flex items-center justify-center border border-madrasha-green-100 shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-2xl font-black text-madrasha-green-700 font-sans leading-none">{totalStudents} জন</h3>
            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">সক্রিয় ছাত্রী</span>
          </div>
        </div>

        {/* Card 2: Attendance Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition duration-200 flex flex-col justify-between hover:border-madrasha-green-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">আজকের হাজিরা (Today Attend)</p>
            <div className="w-7 h-7 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center border border-emerald-100 shrink-0">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-2xl font-black text-madrasha-green-700 font-sans leading-none">
              {todayLogs.length > 0 ? `${attendanceRate}%` : '০%'}
            </h3>
            <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
              {todayLogs.length > 0 ? `সংরক্ষিত (${todayLogs.length} জন)` : 'হাজিরা বাকি'}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Fees */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition duration-200 flex flex-col justify-between hover:border-madrasha-green-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">বকেয়া বেতন (Pending Fees)</p>
            <div className="w-7 h-7 bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center border border-rose-100 shrink-0">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-2xl font-black text-rose-600 font-sans leading-none">৳{totalDueFees}</h3>
            <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">অনিষ্পন্ন রসিদ</span>
          </div>
        </div>

        {/* Card 4: Teachers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition duration-200 flex flex-col justify-between hover:border-madrasha-green-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">শিক্ষক মন্ডলী (Total Teachers)</p>
            <div className="w-7 h-7 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center border border-amber-100 shrink-0">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-2xl font-black text-madrasha-green-700 font-sans leading-none">{totalTeachers} জন</h3>
            <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">নিবন্ধিত মন্ডলী</span>
          </div>
        </div>

      </div>

      {/* Grid: Actions, Exams & Notices (High Density spacing) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Quick Action and Upcoming Exams */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Action Block (High Density structure) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
            <h3 className="font-bold text-zinc-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <CheckSquare className="h-4 w-4 text-madrasha-green-600" />
              দ্রুত অ্যাকশন প্যানেল (Quick Action Panel)
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('Student')}
                className="p-3 bg-zinc-50 hover:bg-madrasha-green-50 border border-zinc-200 hover:border-madrasha-green-200 rounded-lg transition text-center space-y-1.5 cursor-pointer group"
              >
                <div className="mx-auto w-8 h-8 bg-madrasha-green-50 text-madrasha-green-700 rounded-full flex items-center justify-center border border-madrasha-green-100 group-hover:scale-105 duration-150">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <p className="text-[11px] font-bold text-zinc-700 leading-tight">ভর্তি ও ছাত্রী</p>
                <p className="text-[8px] text-zinc-400 font-sans truncate">Enroll Student</p>
              </button>

              <button
                onClick={() => onNavigate('Attendance')}
                className="p-3 bg-zinc-50 hover:bg-madrasha-green-50 border border-zinc-200 hover:border-madrasha-green-200 rounded-lg transition text-center space-y-1.5 cursor-pointer group"
              >
                <div className="mx-auto w-8 h-8 bg-madrasha-green-50 text-madrasha-green-700 rounded-full flex items-center justify-center border border-madrasha-green-100 group-hover:scale-105 duration-150">
                  <UserCheck className="h-4.5 w-4.5" />
                </div>
                <p className="text-[11px] font-bold text-zinc-700 leading-tight">হাজিরা গ্রহণ</p>
                <p className="text-[8px] text-zinc-400 font-sans truncate">Attendance Sheet</p>
              </button>

              <button
                onClick={() => onNavigate('Exam')}
                className="p-3 bg-zinc-50 hover:bg-madrasha-green-50 border border-zinc-200 hover:border-madrasha-green-200 rounded-lg transition text-center space-y-1.5 cursor-pointer group"
              >
                <div className="mx-auto w-8 h-8 bg-madrasha-green-50 text-madrasha-green-700 rounded-full flex items-center justify-center border border-madrasha-green-100 group-hover:scale-105 duration-150">
                  <CalendarDays className="h-4.5 w-4.5" />
                </div>
                <p className="text-[11px] font-bold text-zinc-700 leading-tight">পরীক্ষার ফল</p>
                <p className="text-[8px] text-zinc-400 font-sans truncate">Export Marks</p>
              </button>

              <button
                onClick={() => onNavigate('Fees')}
                className="p-3 bg-zinc-50 hover:bg-madrasha-green-50 border border-zinc-200 hover:border-madrasha-green-200 rounded-lg transition text-center space-y-1.5 cursor-pointer group"
              >
                <div className="mx-auto w-8 h-8 bg-madrasha-green-50 text-madrasha-green-700 rounded-full flex items-center justify-center border border-madrasha-green-100 group-hover:scale-105 duration-150">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
                <p className="text-[11px] font-bold text-zinc-700 leading-tight">বেতন ও ফিস</p>
                <p className="text-[8px] text-zinc-400 font-sans truncate">Collect Fees</p>
              </button>
            </div>
          </div>

          {/* Upcoming Examinations Card (High Density style) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <h3 className="font-bold text-zinc-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <CalendarDays className="h-4 w-4 text-madrasha-green-600" />
              আসন্ন পরীক্ষার সময়সূচী (Upcoming Exams)
            </h3>

            <div className="divide-y rounded-lg border border-slate-100 overflow-hidden">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((ex) => (
                  <div key={ex.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition bg-white gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-slate-100 flex flex-col justify-center items-center shrink-0 border border-slate-200">
                        <span className="text-[8px] text-zinc-400 font-bold uppercase leading-none">Exam</span>
                        <span className="text-[10px] font-bold text-madrasha-green-700 leading-none">EX</span>
                      </div>
                      <div>
                        <p className="font-bold text-zinc-700 text-xs leading-none">{ex.name}</p>
                        <p className="text-[9px] text-zinc-400 mt-1 font-sans">পরীক্ষা শুরুর প্রস্তাবিত তারিখ: {ex.date}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onNavigate('Exam')}
                      className="text-madrasha-green-600 hover:text-madrasha-green-800 font-bold text-[11px] flex items-center gap-0.5 whitespace-nowrap cursor-pointer transition"
                    >
                      <span>কার্যভার</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-zinc-400 text-xs">কোনো পরীক্ষা তৈরি করা হয়নি।</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Announcements / Notice board preview (High Density alternate line outline style) */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 h-full flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2.5 text-madrasha-green-700">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="h-4 w-4 text-madrasha-green-600 animate-bounce" />
                  সাম্প্রতিক নোটিশ বোর্ড (Notice Board)
                </h4>
                <span className="h-2 w-2 rounded-full bg-madrasha-gold-500 animate-pulse"></span>
              </div>

              <div className="space-y-3.5 overflow-y-auto max-h-[320px] pr-1">
                {recentNotices.length > 0 ? (
                  recentNotices.map((n, idx) => {
                    // alternate visual highlights
                    const colorBorders = ['border-madrasha-gold-500', 'border-madrasha-green-600', 'border-slate-300'];
                    const borderClass = colorBorders[idx % colorBorders.length];
                    return (
                      <div key={n.id} className={`border-l-2 ${borderClass} pl-3 py-1 space-y-1 relative`}>
                        <div className="flex justify-between items-center text-[9px] text-zinc-405 font-mono">
                          <span className="text-zinc-400">{n.date}</span>
                          <span className="bg-emerald-50 text-madrasha-green-700 font-extrabold px-1 py-0.5 rounded text-[8px] tracking-wide border border-madrasha-green-100 uppercase">
                            {n.category}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-[11px] text-zinc-800 leading-tight mt-0.5">{n.title}</h5>
                        <p className="text-[10px] text-zinc-550 leading-relaxed line-clamp-2">{n.description}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-zinc-405 text-xs">কোনো নোটিশ প্রকাশ করা হয়নি।</div>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigate('Notice')}
              className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-zinc-600 hover:text-zinc-800 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5 text-zinc-500" />
              <span>সকল নোটিশ দেখুন (Show All Bulletins)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
