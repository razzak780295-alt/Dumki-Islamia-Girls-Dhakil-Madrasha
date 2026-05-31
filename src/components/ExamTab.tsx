import React, { useState, useMemo, useEffect } from 'react';
import { Student, Exam, ExamMark, ClassNameType } from '../types';
import { Award, Plus, Printer, Save, Check, FileText, Search, BookOpen, ChevronRight, CircleEllipsis, TrendingUp, X } from 'lucide-react';

interface ExamTabProps {
  students: Student[];
  exams: Exam[];
  examMarks: ExamMark[];
  onAddExam: (exam: Omit<Exam, 'id'>) => void;
  onSaveMarks: (mark: Omit<ExamMark, 'id'>) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const CLASSES: ClassNameType[] = [
  'Ebtedayi 1', 'Ebtedayi 2', 'Ebtedayi 3', 'Ebtedayi 4', 'Ebtedayi 5',
  'Dakhil 6', 'Dakhil 7', 'Dakhil 8', 'Dakhil 9', 'Dakhil 10'
];

const GENERAL_SUBJECTS = [
  'বাংলা (Bangla)',
  'ইংরেজি (English)',
  'গণিত (Mathematics)',
  'আরবি ও কুরআন (Arabic & Quran)',
  'হাদিস শরীফ (Hadith Sharif)',
  'বিজ্ঞান (Science)'
];

type SubTab = 'Exams' | 'InputMarks' | 'MeritList';

export default function ExamTab({ students, exams, examMarks, onAddExam, onSaveMarks, showToast }: ExamTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('InputMarks');
  
  // Create Exam state
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState(new Date().toISOString().split('T')[0]);

  // Input Marks state
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState<ClassNameType>('Dakhil 10');
  
  // Marks input form active state
  const [inputtingForStudent, setInputtingForStudent] = useState<Student | null>(null);
  const [subjectScores, setSubjectScores] = useState<Record<string, number>>({});

  // Custom Fields Configurations
  const [customFieldDefs, setCustomFieldDefs] = useState<any[]>([]);
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, string>>({});

  // View transcript state
  const [transcriptStudent, setTranscriptStudent] = useState<Student | null>(null);
  const [transcriptMarks, setTranscriptMarks] = useState<ExamMark | null>(null);

  // Merit List Class Selection
  const [meritClass, setMeritClass] = useState<ClassNameType>('Dakhil 10');
  const [meritExamId, setMeritExamId] = useState(exams[0]?.id || '');

  // Load custom field configurations
  useEffect(() => {
    const stored = localStorage.getItem('customFields_exam');
    if (stored) {
      try {
        setCustomFieldDefs(JSON.parse(stored));
      } catch (e) {
        setCustomFieldDefs([]);
      }
    } else {
      setCustomFieldDefs([]);
    }
  }, [inputtingForStudent]);

  // Helper: Calculate Grade
  const calculateGrade = (mark: number): string => {
    if (mark >= 80) return 'A+';
    if (mark >= 70) return 'A';
    if (mark >= 60) return 'A-';
    if (mark >= 50) return 'B';
    if (mark >= 40) return 'C';
    if (mark >= 33) return 'D';
    return 'F';
  };

  // Helper: Format Bangladesh overall scorecard
  const compileFinalReport = (marksMap: Record<string, number>) => {
    const subjects = Object.keys(marksMap);
    if (subjects.length === 0) return { total: 0, percentage: 0, grade: 'F' };

    const total = subjects.reduce((sum, s) => sum + marksMap[s], 0);
    const avg = total / subjects.length;
    const percentage = Math.round(avg);
    
    // Bangladesh Rule: Any single F (< 33) results in overall F grade
    const hasFailedSubject = Object.values(marksMap).some(m => m < 33);
    
    let overallGrade = 'F';
    if (!hasFailedSubject) {
      if (percentage >= 80) overallGrade = 'A+';
      else if (percentage >= 70) overallGrade = 'A';
      else if (percentage >= 60) overallGrade = 'A-';
      else if (percentage >= 50) overallGrade = 'B';
      else if (percentage >= 40) overallGrade = 'C';
      else if (percentage >= 33) overallGrade = 'D';
    }

    return {
      total,
      percentage,
      grade: overallGrade
    };
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamDate) {
      showToast('পরীক্ষার নাম ও তারিখ দিন! (Check Exam Name & Date)', 'error');
      return;
    }
    onAddExam({
      name: newExamName.trim(),
      date: newExamDate
    });
    setNewExamName('');
    showToast('পরীক্ষা সফলতা-পূর্বক তৈরি হয়েছে! (Exam successfully scheduled)', 'success');
  };

  const openMarksInput = (student: Student) => {
    setInputtingForStudent(student);
    
    // Look for existing marks
    const existing = examMarks.find(m => m.studentId === student.id && m.examId === selectedExamId);
    const initialScores: Record<string, number> = {};
    GENERAL_SUBJECTS.forEach(sub => {
      initialScores[sub] = existing ? (existing.marks[sub] || 0) : 0;
    });
    setSubjectScores(initialScores);
    setCustomFieldsData(existing?.customFields || {});
  };

  const handleSaveScores = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputtingForStudent) return;

    // Validate scores are correct 0 - 100
    const outOfBounds = Object.values(subjectScores).some((score: any) => score < 0 || score > 100);
    if (outOfBounds) {
      showToast('নম্বর অবশ্যই ০ থেকে ১০০ এর মধ্যে হতে হবে! (Marks must be between 0 and 100!)', 'error');
      return;
    }

    // Validate custom fields required on/off switches
    for (const f of customFieldDefs) {
      if (f.required && (!customFieldsData[f.id] || customFieldsData[f.id].trim() === '')) {
        showToast(`কাস্টম ফিল্ড "${f.label}" পূরণ করা আবশ্যক!`, 'error');
        return;
      }
    }

    onSaveMarks({
      examId: selectedExamId,
      studentId: inputtingForStudent.id,
      marks: subjectScores,
      customFields: customFieldsData
    });

    setInputtingForStudent(null);
  };

  const scoreChange = (subject: string, score: string) => {
    const val = score === '' ? 0 : Math.min(100, Math.max(0, Number(score)));
    setSubjectScores(prev => ({
      ...prev,
      [subject]: val
    }));
  };

  // Class Students & their marks status
  const studentMarksStatus = useMemo(() => {
    const sameClassStudents = students.filter(s => s.className === selectedClass).sort((a,b) => a.rollNumber - b.rollNumber);
    return sameClassStudents.map(student => {
      const markRecord = examMarks.find(m => m.studentId === student.id && m.examId === selectedExamId);
      const compiled = markRecord ? compileFinalReport(markRecord.marks) : null;
      return {
        student,
        markRecord,
        compiled
      };
    });
  }, [students, selectedClass, selectedExamId, examMarks]);

  // Compiled Merit List rankings
  const compiledMeritList = useMemo(() => {
    const sameClassStudents = students.filter(s => s.className === meritClass);
    const scoredList = sameClassStudents.map(student => {
      const record = examMarks.find(m => m.studentId === student.id && m.examId === meritExamId);
      const scorecard = record ? compileFinalReport(record.marks) : null;
      return {
        student,
        scorecard,
        isGraded: !!record
      };
    });

    // Sort by Total Marks Descending. Put ungraded students representing 'F' and empty marks at bottom.
    return scoredList
      .filter(item => item.isGraded)
      .map(item => ({
        ...item,
        total: item.scorecard!.total,
        percentage: item.scorecard!.percentage,
        grade: item.scorecard!.grade
      }))
      .sort((a, b) => b.total - a.total);
  }, [students, examMarks, meritClass, meritExamId]);

  // Current selected exam entity details
  const currentExamObj = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Current reportcard print state
  const handlePrintTranscript = (student: Student, markRecord: ExamMark) => {
    setTranscriptStudent(student);
    setTranscriptMarks(markRecord);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div id="exam-and-results-tab" className="space-y-6">
      
      {/* Dynamic PRINT Overlays for Transcript & Marksheet */}
      {transcriptStudent && transcriptMarks && (
        <div className="hidden print-only print:block p-8 bg-white text-black text-sm max-w-3xl mx-auto border-4 border-madrasha-green-700 rounded-3xl relative">
          
          {/* Floral star corners representing Dakhil islamic design */}
          <div className="text-center pb-4 mb-6 border-b-2 border-madrasha-green-600">
            <h2 className="text-2xl font-bold text-madrasha-green-700 leading-normal">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</h2>
            <p className="text-xs">দুমকি, পটুয়াখালী, বাংলাদেশ</p>
            <p className="text-xs text-zinc-500 font-sans">Est: 1980 | EIIN: 102432</p>
            
            <h3 className="text-lg font-bold mt-4 tracking-wide uppercase text-zinc-800 bg-zinc-50 border py-1.5 px-6 rounded-lg inline-block font-sans">
              একাডেমিক ট্রান্সক্রিপ্ট (Academic Transcript)
            </h3>
            <p className="text-xs text-zinc-500 mt-1 font-semibold">
              পরীক্ষা: {exams.find(e => e.id === transcriptMarks.examId)?.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div className="space-y-1.5">
              <p><strong>ছাত্রী নাম:</strong> {transcriptStudent.nameBn}</p>
              <p className="font-sans"><strong>Student Name:</strong> {transcriptStudent.nameEn}</p>
              <p><strong>পিতার নাম (Father):</strong> {transcriptStudent.fatherName}</p>
              <p><strong>মাতার নাম (Mother):</strong> {transcriptStudent.motherName}</p>
            </div>
            <div className="space-y-1.5 text-right font-sans">
              <p><strong>Class:</strong> {transcriptStudent.className}</p>
              <p><strong>Roll Number:</strong> #{transcriptStudent.rollNumber}</p>
              <p><strong>Admission Date:</strong> {transcriptStudent.admissionDate}</p>
              <p><strong>Date of Birth:</strong> {transcriptStudent.dob}</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-zinc-300 text-xs text-left mb-6 font-sans">
            <thead>
              <tr className="bg-zinc-100">
                <th className="border border-zinc-300 p-2.5 text-left font-bold">বিষয় (Subject Name)</th>
                <th className="border border-zinc-300 p-2.5 text-center w-28 font-bold">প্রাপ্ত নম্বর (Marks)</th>
                <th className="border border-zinc-300 p-2.5 text-center w-28 font-bold">লেটার গ্রেড (Grade)</th>
                <th className="border border-zinc-300 p-2.5 text-center w-28 font-bold">অবস্থা (Remarks)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(transcriptMarks.marks).map((subject) => {
                const mark = transcriptMarks.marks[subject];
                return (
                  <tr key={subject}>
                    <td className="border border-zinc-300 p-2.5 font-semibold text-zinc-850">{subject}</td>
                    <td className="border border-zinc-300 p-2.5 text-center font-bold">{mark}</td>
                    <td className="border border-zinc-300 p-2.5 text-center font-bold text-zinc-900">{calculateGrade(mark)}</td>
                    <td className="border border-zinc-300 p-2.5 text-center font-bold">
                      {mark >= 33 ? (
                        <span className="text-emerald-700">উত্তীর্ণ (Pass)</span>
                      ) : (
                        <span className="text-red-600">অকৃতকার্য (Fail)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Overall statistics */}
          {(() => {
            const compiledObj = compileFinalReport(transcriptMarks.marks);
            return (
              <div className="grid grid-cols-3 gap-4 mb-10 border border-zinc-200 bg-zinc-50 p-4 rounded-xl text-center">
                <div className="border-r border-zinc-200">
                  <p className="text-[11px] text-zinc-500 font-semibold uppercase">সর্বমোট নম্বর (Grand Total)</p>
                  <strong className="text-lg text-zinc-800 font-bold">{compiledObj.total}</strong>
                </div>
                <div className="border-r border-zinc-200">
                  <p className="text-[11px] text-zinc-500 font-semibold uppercase">গড় নম্বর (Percentage %)</p>
                  <strong className="text-lg text-zinc-800 font-bold">{compiledObj.percentage}%</strong>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 font-semibold uppercase">সর্বশেষ গ্রেড (Final Letter Grade)</p>
                  <strong className={`text-lg font-black ${compiledObj.grade === 'F' ? 'text-red-650' : 'text-emerald-700'}`}>{compiledObj.grade}</strong>
                </div>
              </div>
            );
          })()}

          {/* Stamp/Declaration info */}
          <div className="mt-16 flex justify-between pt-8 border-t border-zinc-250 text-xs">
            <div>
              <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
              <p>শ্রেণী শিক্ষক (Class Teacher)</p>
            </div>
            <div>
              <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
              <p>পরীক্ষক (Examiner)</p>
            </div>
            <div className="text-center">
              <div className="h-0.5 w-36 bg-zinc-400 mb-1 mx-auto"></div>
              <p className="font-bold text-zinc-800">মাদ্রাসার প্রধান / সুপারিনটেনডেন্ট</p>
              <p className="text-[10px] text-zinc-500">(Superintendent Head stamp)</p>
            </div>
          </div>
        </div>
      )}

      {/* Printing Merit List Overlay */}
      {activeSubTab === 'MeritList' && (
        <div className="hidden print-only print:block p-8 bg-white text-black text-xs max-w-3xl mx-auto">
          <div className="text-center pb-4 mb-6 border-b">
            <h2 className="text-xl font-bold text-madrasha-green-700">দুমকি ইসলামিয়া গার্লস দাখিল মাদ্রাসা</h2>
            <p className="text-xs">দুমকি, পটুয়াখালী, বাংলাদেশ (Est. 1980)</p>
            <h3 className="text-base font-bold mt-3 underline">শ্রেণী মেধা তালিকা (Class Wise Merit List)</h3>
            <div className="flex justify-center gap-6 mt-2 font-semibold text-zinc-600">
              <span>পরীক্ষা (Exam): {exams.find(e => e.id === meritExamId)?.name}</span>
              <span>শ্রেণী (Class): {meritClass}</span>
              <span>তারিখ (Date): {new Date().toLocaleDateString('bn-BD')}</span>
            </div>
          </div>

          <table className="w-full border-collapse border border-zinc-300">
            <thead>
              <tr className="bg-zinc-100">
                <th className="border border-zinc-300 p-2 text-center w-16">স্থান (Rank)</th>
                <th className="border border-zinc-300 p-2 text-center w-16">রোল (Roll)</th>
                <th className="border border-zinc-350 p-2 text-left">ছাত্রী নাম (Student Name)</th>
                <th className="border border-zinc-300 p-2 text-center">মোট নম্বর (Total)</th>
                <th className="border border-zinc-300 p-2 text-center">শতকরা হার (%)</th>
                <th className="border border-zinc-350 p-2 text-center">প্রাপ্ত গ্রেড (Grade)</th>
              </tr>
            </thead>
            <tbody>
              {compiledMeritList.map((row, index) => (
                <tr key={row.student.id}>
                  <td className="border border-zinc-300 p-2 text-center font-bold text-madrasha-green-700 font-sans">
                    #{index + 1}
                  </td>
                  <td className="border border-zinc-300 p-2 text-center font-sans">#{row.student.rollNumber}</td>
                  <td className="border border-zinc-300 p-2">
                    <p className="font-bold">{row.student.nameBn}</p>
                    <p className="text-[10px] text-zinc-500 font-sans">{row.student.nameEn}</p>
                  </td>
                  <td className="border border-zinc-300 p-2 text-center font-semibold font-sans">{row.total}</td>
                  <td className="border border-zinc-300 p-2 text-center font-semibold font-sans">{row.percentage}%</td>
                  <td className="border border-zinc-300 p-2 text-center font-bold text-zinc-900 font-sans">{row.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-20 flex justify-between pt-8 border-t text-xs">
            <div>
              <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
              <p>পরীক্ষক (Examiner Certificate)</p>
            </div>
            <div className="text-center">
              <div className="h-0.5 w-32 bg-zinc-400 mb-1"></div>
              <p>সুপারিনটেনডেন্ট (Superintendent)</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen view navbar toggles (No Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            <Award className="h-6 w-6 text-madrasha-green-600 animate-pulse" />
            পরীক্ষা ও ফলাফল (Exam & Results Sheet)
          </h2>
          <p className="text-sm text-zinc-500">পরীক্ষার নাম তৈরি, ছাত্রীদের বিষয়ভিত্তিক নম্বর নিবন্ধন ও মেধা তালিকা (Schedule exams, enter grades sheets, compile marksheets & ranks)</p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex bg-zinc-150 p-1 rounded-lg border border-zinc-200">
          <button
            onClick={() => setActiveSubTab('InputMarks')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              activeSubTab === 'InputMarks' ? 'bg-madrasha-green-600 text-white' : 'text-zinc-650 hover:text-zinc-900'
            }`}
          >
            ফলাফল এন্ট্রি (Enter Marks)
          </button>
          <button
            onClick={() => setActiveSubTab('MeritList')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              activeSubTab === 'MeritList' ? 'bg-madrasha-green-600 text-white' : 'text-zinc-650 hover:text-zinc-900'
            }`}
          >
            শ্রেণী মেধা তালিকা (Merit List)
          </button>
          <button
            onClick={() => setActiveSubTab('Exams')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              activeSubTab === 'Exams' ? 'bg-madrasha-green-600 text-white' : 'text-zinc-650 hover:text-zinc-900'
            }`}
          >
            নতুন পরীক্ষা তৈরি (Create Exam)
          </button>
        </div>
      </div>

      {/* SECTION 1: CREATE EXAMS */}
      {activeSubTab === 'Exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          
          {/* Create Exam Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 h-fit space-y-4">
            <h3 className="font-bold text-zinc-800 text-sm border-b pb-3">নতুন পরীক্ষা সংযোজন (Create Exam Period)</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">পরীক্ষার নাম (Exam Term Name) *</label>
                <input
                  type="text"
                  required
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  placeholder="যেমন: অর্ধ-বার্ষিক পরীক্ষা ২০২৬"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-madrasha-green-600 text-xs border-zinc-250"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">পরীক্ষা শুরুর তারিখ (Starting Date) *</label>
                <input
                  type="date"
                  required
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-madrasha-green-600 font-sans text-xs border-zinc-250"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>তৈরি করুন (Add Exam Session)</span>
              </button>
            </form>
          </div>

          {/* Created Exams Listing Table */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 lg:col-span-2 space-y-4">
            <h3 className="font-bold text-zinc-800 text-sm border-b pb-3">তৈরিকৃত পরীক্ষার তালিকা (Created Exams Term list)</h3>
            <div className="divide-y rounded-xl border max-h-96 overflow-y-auto">
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <div key={exam.id} className="p-4 flex justify-between items-center bg-white hover:bg-zinc-50 transition">
                    <div>
                      <p className="font-bold text-zinc-800 text-sm">{exam.name}</p>
                      <p className="text-[10px] text-zinc-400 font-sans">তারিখ (Term Date): {exam.date}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-zinc-150 text-zinc-600 text-[10px] font-semibold rounded-lg font-sans border">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-450 text-xs">কোনো পরীক্ষা শিডিউল করা নেই।</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: INPUT SUBJECT MARKS PROFILE */}
      {activeSubTab === 'InputMarks' && (
        <div className="space-y-6 no-print">
          
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5 flex flex-col md:flex-row gap-4 justify-between items-end">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">পরীক্ষা নির্বাচন (Select Exam) *</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-250 text-xs text-zinc-800 font-semibold"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">শ্রেণী নির্বাচন (Select Class) *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as ClassNameType)}
                  className="w-full sm:w-48 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-250 text-xs text-zinc-800 font-semibold"
                >
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-[11px] text-zinc-450 italic bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 shrink-0">
              * বাংলাদেশ গ্রেডিং পদ্ধতি ব্যবহার করে মার্কশীট ও ফলাফল স্বয়ংক্রিয়ভাবে তৈরি হবে।
            </div>
          </div>

          {/* Student Graded/Ungraded entries table */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-4 bg-zinc-50 border-b font-bold text-zinc-700 text-xs flex justify-between items-center">
              <span>ফলাফল ও নম্বর তালিকা ({selectedClass})</span>
              <span className="text-[10px] font-semibold bg-madrasha-green-100 text-madrasha-green-700 px-3 py-0.5 rounded-full">
                পরীক্ষা: {currentExamObj?.name || 'নির্বাচিত পরীক্ষা'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[650px]">
                <thead>
                  <tr className="bg-zinc-50 border-b text-zinc-500 font-semibold text-xs text-left">
                    <th className="p-4 text-center w-16">রোল (Roll)</th>
                    <th className="p-4 text-left">ছাত্রী নাম (Student Name)</th>
                    <th className="p-4 text-center">নম্বর প্রদানের অবস্থা (Status)</th>
                    <th className="p-4 text-center">সর্বমোট প্রাপ্ত নম্বর (Total)</th>
                    <th className="p-4 text-center">শতকরা হার (%)</th>
                    <th className="p-4 text-center">গ্রেড (Letter Grade)</th>
                    <th className="p-4 text-center w-56">পদক্ষেপ বা অ্যাকশন (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs">
                  {studentMarksStatus.length > 0 ? (
                    studentMarksStatus.map(({ student, markRecord, compiled }) => (
                      <tr key={student.id} className="hover:bg-zinc-50/50">
                        <td className="p-4 text-center font-bold font-sans">#{student.rollNumber}</td>
                        <td className="p-4">
                          <p className="font-bold text-zinc-800">{student.nameBn}</p>
                          <p className="text-[10px] text-zinc-400 font-sans">{student.nameEn}</p>
                        </td>
                        <td className="p-4 text-center text-xs">
                          {compiled ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 inline-block font-sans">
                              Completed (পরিপূর্ণ)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-400 font-semibold border inline-block font-sans">
                              Pending (বকেয়া)
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold font-sans text-sm">
                          {compiled ? `${compiled.total} / 600` : '-'}
                        </td>
                        <td className="p-4 text-center font-bold font-sans text-sm">
                          {compiled ? `${compiled.percentage}%` : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {compiled ? (
                            <span className={`px-2.5 py-1 rounded font-bold font-sans text-xs ${
                              compiled.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {compiled.grade}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => openMarksInput(student)}
                              className="px-2 py-1.5 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white rounded font-bold cursor-pointer transition flex items-center gap-1 shadow-sm text-[10px]"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>নম্বর দিন (Add/Edit Marks)</span>
                            </button>
                            {markRecord && (
                              <button
                                onClick={() => handlePrintTranscript(student, markRecord)}
                                className="px-2 py-1.5 border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded font-bold cursor-pointer transition flex items-center gap-1 text-[10px]"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                <span>মার্কশীট (Transcript)</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-400">
                        এই ক্লাসে কোনো ছাত্রী ভর্তি নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pop-up dialog layer for Subject Marks input */}
          {inputtingForStudent && (
            <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col border border-zinc-100">
                <div className="flex justify-between items-center bg-madrasha-green-700 text-white p-4 shrink-0">
                  <div>
                    <h3 className="font-bold text-sm">বিষয়ভিত্তিক পরীক্ষা নম্বরপত্র (Grade Card Sheet Details)</h3>
                    <p className="text-[11px] text-zinc-100 font-sans mt-0.5">
                      {inputtingForStudent.nameBn} - রোল #{inputtingForStudent.rollNumber} | {selectedClass}
                    </p>
                  </div>
                  <button
                    onClick={() => setInputtingForStudent(null)}
                    className="text-white hover:bg-white/10 p-1 rounded-full cursor-pointer transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveScores} className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div className="bg-amber-50 rounded-lg p-3 text-[11px] text-amber-800 border border-amber-250 flex items-start gap-2 leading-relaxed">
                    <span>*</span>
                    <p>নম্বর অবশ্যই ০ থেকে ১০০ এর মধ্যে হতে হবে। কোনো বিষয়ে ৩৩ এর কম পেলে সামগ্রিক গ্রেড "F" (অনুপস্থিত/ফেইল) আসবে।</p>
                  </div>

                  <div className="divide-y space-y-3.5">
                    {GENERAL_SUBJECTS.map((subject) => {
                      const score = subjectScores[subject] ?? 0;
                      return (
                        <div key={subject} className="flex items-center justify-between pt-3 first:pt-0 gap-4">
                          <label className="text-xs font-semibold text-zinc-700 pr-2">{subject} *</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              required
                              value={score === 0 ? '' : score}
                              onChange={(e) => scoreChange(subject, e.target.value)}
                              placeholder="0"
                              className="w-20 px-2.5 py-1.5 border rounded-lg focus:ring-1 focus:ring-madrasha-green-600 text-sm text-center font-bold font-sans border-zinc-300"
                            />
                            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 w-8 py-1.5 text-center rounded border">
                              {calculateGrade(score)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic Custom Fields Rendering under field manager */}
                  {customFieldDefs.length > 0 && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-madrasha-green-750 uppercase tracking-wide">পরীক্ষার অতিরিক্ত তথ্য (Additional Exam Settings)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onClick={() => setInputtingForStudent(null)}
                      className="px-4 py-2 border border-zinc-200 text-zinc-650 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                    >
                      বাতিল (Cancel)
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>নম্বর সংরক্ষণ করুন (Submit Result)</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SECTION 3: CLASS MERIT LIST VIEW */}
      {activeSubTab === 'MeritList' && (
        <div className="space-y-6 no-print">
          
          {/* selectors bar */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5 flex flex-col sm:flex-row gap-4 items-end justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">পরীক্ষা (Term Exam)</label>
                <select
                  value={meritExamId}
                  onChange={(e) => setMeritExamId(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-200 text-xs font-semibold text-zinc-800"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">শ্রেণী (Class Select)</label>
                <select
                  value={meritClass}
                  onChange={(e) => setMeritClass(e.target.value as ClassNameType)}
                  className="w-full sm:w-48 px-3 py-2 border rounded-lg bg-zinc-50 border-zinc-200 text-xs font-semibold text-zinc-800"
                >
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Printer className="h-4 w-4" />
              <span>মেধা তালিকা প্রিন্ট করুন (Print Merit List)</span>
            </button>
          </div>

          {/* Leaders Board display */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center flex-wrap gap-2">
              <h4 className="text-xs font-bold text-zinc-850">
                শ্রেণী মেধা তালিকা (Class Wise Leaderboard Merit Ranks)
              </h4>
              <span className="text-[10px] bg-madrasha-gold-50 text-madrasha-gold-600 border border-madrasha-gold-200 px-3 py-0.5 rounded-full font-bold">
                RANKINGS LIST
              </span>
            </div>

            <div className="overflow-x-auto">
              {compiledMeritList.length > 0 ? (
                <table className="w-full text-left min-w-[550px]">
                  <thead>
                    <tr className="bg-zinc-50 border-b text-zinc-500 font-semibold text-xs text-left">
                      <th className="p-4 text-center w-20">মেধা স্থান (Rank)</th>
                      <th className="p-4 text-center w-20">রোল (Roll)</th>
                      <th className="p-4">ছাত্রী নাম (Student Name)</th>
                      <th className="p-4 text-center">প্রাপ্ত মোট নম্বর (Grand Total)</th>
                      <th className="p-4 text-center">শতকরা হার (%)</th>
                      <th className="p-4 text-center">সর্বশেষ গ্রেড (Grade)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-xs">
                    {compiledMeritList.map((row, index) => (
                      <tr key={row.student.id} className="hover:bg-zinc-50/50 transition">
                        <td className="p-4 text-center">
                          <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mx-auto shadow-xs border ${
                            index === 0 ? 'bg-amber-100 text-amber-700 border-amber-300' :
                            index === 1 ? 'bg-zinc-100 text-zinc-650 border-zinc-300' :
                            index === 2 ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-gray-50 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-zinc-700 font-sans">#{row.student.rollNumber}</td>
                        <td className="p-4">
                          <p className="font-bold text-zinc-850">{row.student.nameBn}</p>
                          <p className="text-[10px] text-zinc-400 font-sans">{row.student.nameEn}</p>
                        </td>
                        <td className="p-4 text-center font-bold font-sans text-sm text-zinc-800">
                          {row.total} / 600
                        </td>
                        <td className="p-4 text-center font-bold font-sans text-sm text-zinc-800">
                          {row.percentage}%
                        </td>
                        <td className="p-4 text-center font-sans">
                          <span className={`px-2.5 py-0.5 rounded font-black border text-[11px] ${
                            row.grade === 'F' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          }`}>
                            {row.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-zinc-400">
                  <p className="text-sm font-medium">কোনো ছাত্রীর পরীক্ষার ফলাফল এখনো এন্ট্রি করা হয়নি। (No marks entry found for this exam and class.)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
