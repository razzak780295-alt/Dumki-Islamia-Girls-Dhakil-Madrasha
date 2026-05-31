export type ClassNameType = 
  | 'Ebtedayi 1' 
  | 'Ebtedayi 2' 
  | 'Ebtedayi 3' 
  | 'Ebtedayi 4' 
  | 'Ebtedayi 5' 
  | 'Dakhil 6' 
  | 'Dakhil 7' 
  | 'Dakhil 8' 
  | 'Dakhil 9' 
  | 'Dakhil 10';

export interface Student {
  id: string;
  nameBn: string; // ছাত্রী বাংলা নাম
  nameEn: string; // Student English Name
  fatherName: string;
  motherName: string;
  className: ClassNameType;
  rollNumber: number;
  dob: string; // YYYY-MM-DD
  address: string;
  guardianMobile: string;
  admissionDate: string; // YYYY-MM-DD
  customFields?: Record<string, string>;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late';
}

export type FeeType = 'Monthly Tuition' | 'Exam Fee' | 'Registration Fee';

export interface FeePayment {
  id: string;
  studentId: string;
  feeType: FeeType;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  monthName: string; // e.g., "জানুয়ারি 2026 (January 2026)"
  status: 'Paid' | 'Due';
  notes?: string;
  customFields?: Record<string, string>;
}

export interface Exam {
  id: string;
  name: string; // e.g. "প্রথম সাময়িক পরীক্ষা (First Term Exam)"
  date: string; // YYYY-MM-DD
}

export interface SubjectMarks {
  subjectName: string;
  marksObtained: number | '';
}

export interface ExamMark {
  id: string;
  examId: string;
  studentId: string;
  marks: Record<string, number>; // Subject Name -> Mark
  totalMarks?: number;
  percentage?: number;
  grade?: string;
  comment?: string;
  customFields?: Record<string, string>;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  mobile: string;
  joinDate: string; // YYYY-MM-DD
  salary: number;
  customFields?: Record<string, string>;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: 'General' | 'Exam' | 'Holiday' | 'Fee';
  pdfBase64?: string;
  pdfName?: string;
}
