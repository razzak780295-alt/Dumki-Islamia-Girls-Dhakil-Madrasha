import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, ClassNameType } from '../types';
import { Calendar, CheckCircle2, XCircle, Clock, Save, Search, Printer, FileSpreadsheet, Sparkles, Filter } from 'lucide-react';

interface AttendanceTabProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const CLASSES: ClassNameType[] = [
  'Ebtedayi 1', 'Ebtedayi 2', 'Ebtedayi 3', 'Ebtedayi 4', 'Ebtedayi 5',
  'Dakhil 6', 'Dakhil 7', 'Dakhil 8', 'Dakhil 9', 'Dakhil 10'
];

type ViewMode = 'Mark' | 'Report';

export default function AttendanceTab({ students, attendance, onSaveAttendance, showToast }: AttendanceTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Mark');
  
  // Mark Mode State
  const [selectedClass, setSelectedClass] = useState<ClassNameType>('Ebtedayi 5');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, 'Present' | 'Absent' | 'Late' | undefined>>({});

  // Report Mode State
  const [reportClass, setReportClass] = useState<ClassNameType>('Ebtedayi 5');
  const [reportMonth, setReportMonth] = useState<string>(new Date().toISOString().split('')[0] ? new Date().toISOString().substring(0, 7) : '2026-05'); // YYYY-MM

  // Filter students for selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.className === selectedClass).sort((a,b) => a.rollNumber - b.rollNumber);
  }, [students, selectedClass]);

  // Load existing records if any
  React.useEffect(() => {
    const existing = attendance.filter(r => r.date === selectedDate);
    const draft: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    existing.forEach(r => {
      draft[r.studentId] = r.status;
    });
    setDraftStatuses(draft);
  }, [selectedDate, selectedClass, attendance]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setDraftStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAll = () => {
    if (classStudents.length === 0) {
      showToast('এই শ্রেণীতে কোনো ছাত্রী ভর্তি নেই! (No students enrolled in this class!)', 'error');
      return;
    }

    const missingStatuses = classStudents.filter(s => !draftStatuses[s.id]);
    if (missingStatuses.length > 0) {
      // Auto assign Present to un-marked just in case for speedy entry!
      const promptConfirm = window.confirm(`কিছু ছাত্রীর হাজিরা দেওয়া হয়নি। তাদের কি উপস্থিত ধরা হবে? (Some students are not marked. Default them to Present?)`);
      if (promptConfirm) {
        const updatedDraft = { ...draftStatuses };
        missingStatuses.forEach(s => {
          updatedDraft[s.id] = 'Present';
        });
        setDraftStatuses(updatedDraft);
        saveRecords(updatedDraft);
      }
    } else {
      saveRecords(draftStatuses);
    }
  };

  const saveRecords = (statusMap: Record<string, 'Present' | 'Absent' | 'Late' | undefined>) => {
    const recordsToSave: Omit<AttendanceRecord, 'id'>[] = classStudents.map(s => ({
      studentId: s.id,
      date: selectedDate,
      status: statusMap[s.id] || 'Present'
    }));

    onSaveAttendance(recordsToSave);
  };

  // Compile monthly statistics
  const reportStats = useMemo(() => {
    const studentsInReport = students.filter(s => s.className === reportClass).sort((a,b) => a.rollNumber - b.rollNumber);
    const yearMonthStr = reportMonth; // YYYY-MM
    
    // Filter records in this month & year
    const monthRecords = attendance.filter(a => a.date.startsWith(yearMonthStr));
    
    const stats = studentsInReport.map(student => {
      const studentRecords = monthRecords.filter(r => r.studentId === student.id);
      const totalDays = studentRecords.length;
      const present = studentRecords.filter(r => r.status === 'Present').length;
      const absent = studentRecords.filter(r => r.status === 'Absent').length;
      const late = studentRecords.filter(r => r.status === 'Late').length;
      const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 100;

      return {
        student,
        present,
        absent,
        late,
        totalDays,
        percentage
      };
    });

    return stats;
  }, [students, attendance, reportClass, reportMonth]);

  const monthLabelBn = useMemo(() => {
    const [year, month] = reportMonth.split('-');
    const bnMonths: Record<string, string> = {
      '01': 'জানুয়ারি (January)', '02': 'ফেব্রুয়ারি (February)', '03': 'মার্চ (March)',
      '04': 'এপ্রিল (April)', '05': 'মে (May)', '06': 'জুন (June)',
      '07': 'জুলাই (July)', '08': 'আগস্ট (August)', '09': 'সেপ্টেম্বর (September)',
      '10': 'অক্টোবর (October)', '11': 'নভেম্বর (November)', '12': 'ডিসেম্বর (December)'
    };
    return `${bnMonths[month] || month} ${year}`;
  }, [reportMonth]);

  const triggerPrintReport = () => {
    window.print();
  };

  return (
    <div id="attendance-management-tab" className="space-y-6">
      
      {/* Printable Area - Monthly Report Table Block */}
      <div className="hidden print-only print:block p-8 bg-white text-black text-sm">
        <div className="text-center pb-4 mb-6 border-b">
          <h2 className="text-xl font-bold text-madrasha-green-700">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</h2>
          <p className="text-xs">দুমকি, পটুয়াখালী, বাংলাদেশ (Est. 1980)</p>
          <h3 className="text-base font-bold mt-3 underline">মাসিক হাজিরা প্রতিবেদন (Monthly Attendance Report)</h3>
          <div className="flex justify-center gap-6 mt-2 text-xs font-semibold text-zinc-600">
            <span>শ্রেণী (Class): {reportClass}</span>
            <span>মাস (Month): {monthLabelBn}</span>
            <span>প্রিন্ট তারিখ (Printed on): {new Date().toLocaleDateString('bn-BD')}</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-zinc-300 text-xs">
          <thead>
            <tr className="bg-zinc-100">
              <th className="border border-zinc-300 p-2 text-center">রোল (Roll)</th>
              <th className="border border-zinc-300 p-2 text-left">নাম (Name)</th>
              <th className="border border-zinc-300 p-2 text-center">উপস্থিত (Present)</th>
              <th className="border border-zinc-300 p-2 text-center">অনুপস্থিত (Absent)</th>
              <th className="border border-zinc-300 p-2 text-center">বিলম্ব (Late)</th>
              <th className="border border-zinc-300 p-2 text-center">মোট দিন (Total Logs)</th>
              <th className="border border-zinc-300 p-2 text-center">শতকরা হার (%)</th>
            </tr>
          </thead>
          <tbody>
            {reportStats.map(stat => (
              <tr key={stat.student.id} className="hover:bg-zinc-50">
                <td className="border border-zinc-300 p-2 text-center font-bold font-sans">#{stat.student.rollNumber}</td>
                <td className="border border-zinc-300 p-2 font-semibold">{stat.student.nameBn}</td>
                <td className="border border-zinc-300 p-2 text-center text-emerald-700 font-bold font-sans">{stat.present}</td>
                <td className="border border-zinc-300 p-2 text-center text-red-600 font-bold font-sans">{stat.absent}</td>
                <td className="border border-zinc-300 p-2 text-center text-amber-600 font-bold font-sans">{stat.late}</td>
                <td className="border border-zinc-300 p-2 text-center font-sans">{stat.totalDays}</td>
                <td className="border border-zinc-300 p-2 text-center font-bold font-sans">{stat.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-16 flex justify-between text-xs pt-8 border-t">
          <div>
            <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
            <p>শ্রেণী শিক্ষক (Class Teacher)</p>
          </div>
          <div>
            <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
            <p>পরীক্ষক (Examiner)</p>
          </div>
          <div className="text-center">
            <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
            <p>সুপারিনটেনডেন্ট (Superintendent)</p>
          </div>
        </div>
      </div>

      {/* Primary header view (No Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-madrasha-green-600" />
            দৈনিক হাজিরা ও প্রতিবেদন (Attendance System)
          </h2>
          <p className="text-sm text-zinc-500">শ্রেণীভিত্তিক দৈনিক হাজিরা গ্রহণ এবং উপস্থিতি প্রতিবেদন (Mark daily attendances & compile monthly summary reports)</p>
        </div>

        {/* View togglers */}
        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 self-start sm:self-center">
          <button
            id="tab-view-mark"
            onClick={() => setViewMode('Mark')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'Mark'
                ? 'bg-madrasha-green-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            হাজিরা দিন (Mark Attendance)
          </button>
          <button
            id="tab-view-report"
            onClick={() => setViewMode('Report')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'Report'
                ? 'bg-madrasha-green-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            মাসিক রিপোর্ট (Monthly Report)
          </button>
        </div>
      </div>

      {/* MARK ATTENDANCE MODE */}
      {viewMode === 'Mark' && (
        <div className="space-y-6 no-print">
          
          {/* Class and Date selection bar */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">শ্রেণী নির্বাচন (Class) *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as ClassNameType)}
                  className="w-full sm:w-48 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-200 text-xs focus:ring-1 focus:ring-madrasha-green-600"
                >
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">তারিখ নির্বাচন (Date) *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-200 text-xs focus:ring-1 focus:ring-madrasha-green-600 font-sans"
                />
              </div>
            </div>

            <div className="w-full sm:w-auto self-stretch sm:self-center flex items-end">
              <button
                id="save-attendance-btn"
                onClick={handleSaveAll}
                className="w-full sm:w-auto bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white text-xs font-bold px-5 py-3 rounded-lg shadow-md hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>আজকের হাজিরা সংরক্ষণ করুন (Save Attendance)</span>
              </button>
            </div>
          </div>

          {/* Student marking grid */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-700">উপস্থিতি তালিকা ({selectedClass})</span>
              <span className="text-[10px] bg-madrasha-green-100 text-madrasha-green-700 px-2.5 py-1 rounded-full font-bold">
                মোট ছাত্রী: {classStudents.length} জন
              </span>
            </div>

            {classStudents.length > 0 ? (
              <div className="divide-y divide-zinc-200">
                {classStudents.map((student) => {
                  const currentStatus = draftStatuses[student.id];
                  return (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-xs font-sans shrink-0 border">
                          #{student.rollNumber}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-zinc-800">{student.nameBn}</p>
                          <p className="text-[11px] text-zinc-400 font-sans">{student.nameEn}</p>
                        </div>
                      </div>

                      {/* Marking radios/badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'bg-white border-zinc-250 hover:bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>উপস্থিত (Present)</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.id, 'Absent')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            currentStatus === 'Absent'
                              ? 'bg-red-600 border-red-600 text-white shadow-xs'
                              : 'bg-white border-zinc-250 hover:bg-red-50 text-red-700'
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>অনুপস্থিত (Absent)</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.id, 'Late')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            currentStatus === 'Late'
                              ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                              : 'bg-white border-zinc-250 hover:bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Clock className="h-4 w-4" />
                          <span>বিলম্ব (Late)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400">
                <p className="text-sm font-medium">এই শ্রেণীতে কোনো ছাত্রী নিবন্ধিত নেই। (No students registered in {selectedClass})</p>
                <p className="text-xs text-zinc-400 mt-1">প্রথমে ছাত্রী মডিউল থেকে ছাত্রী যুক্ত করুন।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MONTHLY ATTENDANCE REPORT MODE */}
      {viewMode === 'Report' && (
        <div className="space-y-6 no-print">
          
          {/* Report configuration selector */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5 flex flex-col sm:flex-row gap-4 items-end justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">শ্রেণী নির্বাচন (Select Class)</label>
                <select
                  value={reportClass}
                  onChange={(e) => setReportClass(e.target.value as ClassNameType)}
                  className="w-full sm:w-48 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-200 text-xs text-zinc-700"
                >
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">মাস নির্বাচন (Select Month)</label>
                <input
                  type="month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-200 text-xs text-zinc-700 font-sans"
                />
              </div>
            </div>

            <button
              onClick={triggerPrintReport}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Printer className="h-4 w-4" />
              <span>রিপোর্ট প্রিন্ট করুন (Print Report)</span>
            </button>
          </div>

          {/* Report Table display */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 bg-zinc-50 border-b border-zinc-250 flex justify-between items-center flex-wrap gap-2">
              <h4 className="text-xs font-bold text-zinc-800">
                শ্রেণী: {reportClass} | মাস: {monthLabelBn}
              </h4>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-full inline-block">
                উপস্থাপনকৃত পরিসংখ্যান (Attendance Summary statistics)
              </span>
            </div>

            <div className="overflow-x-auto">
              {reportStats.length > 0 ? (
                <table className="w-full min-w-[600px] border-collapse text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold text-xs">
                      <th className="p-4 text-center w-20">রোল (Roll)</th>
                      <th className="p-4">ছাত্রী নাম (Student Name)</th>
                      <th className="p-4 text-center">উপস্থিত (Present Flag)</th>
                      <th className="p-4 text-center">অনুপস্থিত (Absent Flag)</th>
                      <th className="p-4 text-center">বিলম্ব (Late Flag)</th>
                      <th className="p-4 text-center">মোট লগ দিন (Total logged)</th>
                      <th className="p-4 text-center">উপস্থিতি হার (Rate)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-xs">
                    {reportStats.map(stat => (
                      <tr key={stat.student.id} className="hover:bg-zinc-50 transition">
                        <td className="p-4 text-center font-bold text-zinc-800">#{stat.student.rollNumber}</td>
                        <td className="p-4">
                          <p className="font-bold text-zinc-800">{stat.student.nameBn}</p>
                          <p className="text-[10px] text-zinc-400 font-sans">{stat.student.nameEn}</p>
                        </td>
                        <td className="p-4 text-center text-emerald-600 font-bold font-sans bg-emerald-50/20">{stat.present} বার</td>
                        <td className="p-4 text-center text-red-500 font-bold font-sans bg-red-50/20">{stat.absent} বার</td>
                        <td className="p-4 text-center text-amber-600 font-bold font-sans bg-amber-50/20">{stat.late} বার</td>
                        <td className="p-4 text-center font-sans text-zinc-650">{stat.totalDays} দিন</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-sans ${
                            stat.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                            stat.percentage >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {stat.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-zinc-400">
                  <p className="text-sm font-medium">কোনো হাজিরা প্রদানের রেকর্ড পাওয়া যায়নি। (No attendance records created for this month.)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
