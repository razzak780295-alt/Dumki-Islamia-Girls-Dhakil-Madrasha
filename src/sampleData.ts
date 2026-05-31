import { Student, Teacher, Notice, AttendanceRecord, FeePayment, Exam, ExamMark } from './types';

export const initialStudents: Student[] = [
  {
    id: 'stud_1',
    nameBn: 'ফাতিমা খাতুন',
    nameEn: 'Fatima Khatun',
    fatherName: 'আব্দুর রহমান',
    motherName: 'মরিয়ম বেগম',
    className: 'Dakhil 10',
    rollNumber: 1,
    dob: '2010-04-12',
    address: 'দুমকি, পটুয়াখালী',
    guardianMobile: '01712345678',
    admissionDate: '2020-01-05'
  },
  {
    id: 'stud_2',
    nameBn: 'আয়েশা সিদ্দিকা',
    nameEn: 'Ayesha Siddika',
    fatherName: 'নুরুল ইসলাম',
    motherName: 'ফরিদা ইয়াসমিন',
    className: 'Dakhil 9',
    rollNumber: 1,
    dob: '2011-08-20',
    address: 'লেবুখালী, দুমকি, পটুয়াখালী',
    guardianMobile: '01898765432',
    admissionDate: '2021-01-10'
  },
  {
    id: 'stud_3',
    nameBn: 'নুসরাত জাহান',
    nameEn: 'Nusrat Jahan',
    fatherName: 'রফিকুল ইসলাম',
    motherName: 'শাহানাজ পারভীন',
    className: 'Dakhil 8',
    rollNumber: 1,
    dob: '2012-11-03',
    address: 'আংগারিয়া, দুমকি, পটুয়াখালী',
    guardianMobile: '01511223344',
    admissionDate: '2022-01-15'
  },
  {
    id: 'stud_4',
    nameBn: 'সুমাইয়া আক্তার',
    nameEn: 'Sumaiya Akter',
    fatherName: 'দেলোয়ার হোসেন',
    motherName: 'জাহানারা বেগম',
    className: 'Ebtedayi 5',
    rollNumber: 1,
    dob: '2015-05-15',
    address: 'দুমকি সদর, পটুয়াখালী',
    guardianMobile: '01922334455',
    admissionDate: '2023-01-10'
  },
  {
    id: 'stud_5',
    nameBn: 'মারিয়া আক্তার রিয়া',
    nameEn: 'Mariya Akter Riya',
    fatherName: 'কামাল হোসেন',
    motherName: 'সালমা আক্তার',
    className: 'Ebtedayi 3',
    rollNumber: 1,
    dob: '2017-02-18',
    address: 'কার্তিকপাশা, দুমকি',
    guardianMobile: '01399887766',
    admissionDate: '2025-01-08'
  }
];

export const initialTeachers: Teacher[] = [
  {
    id: 'teach_1',
    name: 'মাওলানা মো: ওবায়দুল্লাহ',
    subject: 'আরবি ও হাদিস শরীফ (Arabic & Hadith)',
    qualification: 'কামিল, এম.এ (ইসলামিক স্টাডিজ)',
    mobile: '01711122233',
    joinDate: '2015-03-01',
    salary: 22000
  },
  {
    id: 'teach_2',
    name: 'মোসাম্মৎ রেহেনা পারভীন',
    subject: 'বাংলা ও ইংরেজি (Bangla & English)',
    qualification: 'এম.এ, বি.এড (ইংরেজি)',
    mobile: '01822334455',
    joinDate: '2018-06-15',
    salary: 18500
  },
  {
    id: 'teach_3',
    name: 'মো: জাহিদুল ইসলাম',
    subject: 'সাধারণ গণিত ও বিজ্ঞান (Math & Science)',
    qualification: 'বি.এসসি (অনার্স), এম.এসসি (গণিত)',
    mobile: '01933445566',
    joinDate: '2020-01-10',
    salary: 19000
  }
];

export const initialNotices: Notice[] = [
  {
    id: 'not_1',
    title: 'বার্ষিক মিলাদ মাহফিল ও সভা',
    description: 'আগামী ৫ই জুন ২০২৬ রোজ শুক্রবার মাদ্রাসার হল রুমে বার্ষিক মিলাদ মাহফিল ও দোয়া সভা অনুষ্ঠিত হইবে। সকল ছাত্রী ও অভিভাবকদের উপস্থিত থাকার জন্য অনুরোধ করা হলো।',
    date: '2026-05-28',
    category: 'General'
  },
  {
    id: 'not_2',
    title: 'অর্ধ-वार्षिक পরীক্ষার সময়সূচী ২০২৬',
    description: 'আগামী ১৫ই জুন ২০২৬ হইতে সকল ক্লাসের অর্ধ-বার্ষিক পরীক্ষা শুরু হইবে। পরীক্ষার রুটিন মাদ্রাসা নোটিশ বোর্ডে ও প্রতিটি ক্লাসে দেওয়া হইয়াছে। সকল বকেয়া ফি পরিশোধ করিয়া প্রবেশপত্র সংগ্রহ করিতে বলা হইল।',
    date: '2026-05-30',
    category: 'Exam'
  }
];

export const initialExams: Exam[] = [
  {
    id: 'exam_1',
    name: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬ (Half-Yearly Exam 2026)',
    date: '2026-06-15'
  },
  {
    id: 'exam_2',
    name: 'বার্ষিক পরীক্ষা ২০২৬ (Annual Exam 2026)',
    date: '2026-11-20'
  }
];

// Prepopulated marks for Fatima Khatun (stud_1) and Ayesha Siddika (stud_2) for testing
export const initialExamMarks: ExamMark[] = [
  {
    id: 'mark_1',
    examId: 'exam_1',
    studentId: 'stud_1',
    marks: {
      'বাংলা (Bangla)': 82,
      'ইংরেজি (English)': 78,
      'গণিত (Mathematics)': 85,
      'আরবি ও কুরআন (Arabic & Quran)': 90,
      'হাদিস শরীফ (Hadith Sharif)': 88,
      'বিজ্ঞান (Science)': 77
    }
  },
  {
    id: 'mark_2',
    examId: 'exam_1',
    studentId: 'stud_2',
    marks: {
      'বাংলা (Bangla)': 72,
      'ইংরেজি (English)': 70,
      'গণিত (Mathematics)': 65,
      'আরবি ও কুরআন (Arabic & Quran)': 85,
      'হাদিস শরীফ (Hadith Sharif)': 80,
      'বিজ্ঞান (Science)': 74
    }
  }
];

export const initialAttendance: AttendanceRecord[] = [
  { id: 'att_1', studentId: 'stud_1', date: '2026-05-31', status: 'Present' },
  { id: 'att_2', studentId: 'stud_2', date: '2026-05-31', status: 'Present' },
  { id: 'att_3', studentId: 'stud_3', date: '2026-05-31', status: 'Late' },
  { id: 'att_4', studentId: 'stud_4', date: '2026-05-31', status: 'Absent' },
  { id: 'att_5', studentId: 'stud_5', date: '2026-05-31', status: 'Present' }
];

export const initialFees: FeePayment[] = [
  {
    id: 'fee_1',
    studentId: 'stud_1',
    feeType: 'Monthly Tuition',
    amount: 500,
    paymentDate: '2026-05-10',
    monthName: 'মে ২০২৬ (May 2026)',
    status: 'Paid',
    notes: 'Paid on time'
  },
  {
    id: 'fee_2',
    studentId: 'stud_2',
    feeType: 'Exam Fee',
    amount: 300,
    paymentDate: '2026-05-15',
    monthName: 'মে ২০২৬ (May 2026)',
    status: 'Paid',
    notes: 'Half-yearly exam fee'
  },
  {
    id: 'fee_3',
    studentId: 'stud_3',
    feeType: 'Monthly Tuition',
    amount: 400,
    paymentDate: '',
    monthName: 'মে ২০২৬ (May 2026)',
    status: 'Due',
    notes: 'Pending tuition'
  }
];
