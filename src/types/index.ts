export type StudentGender = 'Nam' | 'Nữ';
export type StudentStatus = 'Đang học' | 'Chuyển đi' | 'Nghỉ học';

export interface Student {
  id: string; // Internal stable identifier
  studentCode: string; // e.g. HS-1.2-001 or HS001 (bắt buộc, không trùng)
  lastName?: string; // Họ (e.g. Nguyễn)
  middleName?: string; // Tên đệm (e.g. Thị)
  firstName?: string; // Tên (e.g. Thảo Anh)
  fullName: string; // Họ và tên đầy đủ
  dateOfBirth: string; // YYYY-MM-DD chuẩn lưu trữ
  gender: StudentGender;
  className: string;
  status: StudentStatus;
  parentName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isDemo?: boolean; // Đánh dấu nếu là dữ liệu mẫu
  createdAt: string;
  updatedAt: string;
}

// Chuyển đổi định dạng ngày YYYY-MM-DD sang DD/MM/YYYY hiển thị giao diện
export function formatDateDisplay(dateStr: string | undefined): string {
  if (!dateStr) return '---';
  const trimmed = dateStr.trim();
  // Nếu đã là DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  // Nếu là YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
}

// Chuyển đổi từ DD/MM/YYYY sang YYYY-MM-DD để lưu trữ chuẩn
export function parseDateToStorage(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return trimmed;
}

// Tách họ, tên đệm và tên tiếng Việt chuẩn mực
export function splitVietnameseName(fullName: string): {
  lastName: string;
  middleName: string;
  firstName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) {
    return { lastName: '', middleName: '', firstName: '' };
  }
  if (parts.length === 1) {
    return { lastName: '', middleName: '', firstName: parts[0] };
  }
  if (parts.length === 2) {
    return { lastName: parts[0], middleName: '', firstName: parts[1] };
  }
  const lastName = parts[0];
  const firstName = parts[parts.length - 1];
  const middleName = parts.slice(1, parts.length - 1).join(' ');
  return { lastName, middleName, firstName };
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  makeupNeeded?: boolean;
  makeupLessonTitle?: string;
  makeupCompleted?: boolean;
  updatedAt: string;
}

export type SubjectType = 'vietnamese' | 'math';
export type RatingLevel = 'T' | 'H' | 'C'; // Hoàn thành tốt, Hoàn thành, Cần hỗ trợ (Thông tư 27)

export interface Criteria {
  id: string;
  subject: SubjectType;
  code: string;
  name: string;
  description: string;
}

export interface AssessmentRecord {
  id: string;
  studentId: string;
  subject: SubjectType;
  date: string;
  weekNumber: number;
  lessonName: string;
  criteriaId: string;
  criteriaName: string;
  rating: RatingLevel;
  teacherComment: string;
  needsReinforcement: boolean;
  reinforcedTopic?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  prompt: string;
  type: 'multiple_choice' | 'fill_in_the_blank' | 'matching' | 'essay';
  options?: string[]; // For multiple choice
  correctAnswer?: string;
  guide?: string;
}

export interface Assignment {
  id: string;
  code: string;
  title: string;
  subject: SubjectType;
  topic: string;
  format: 'multiple_choice' | 'fill_in_the_blank' | 'matching' | 'essay';
  targetGroup: 'all' | 'needs_support' | 'advanced' | 'custom';
  targetStudentIds: string[];
  assignedDate: string;
  dueDate: string;
  questions: Question[];
  status: 'active' | 'completed' | 'draft';
  notes?: string;
  createdAt: string;
}

export interface AssignmentResult {
  id: string;
  assignmentId: string;
  studentId: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number; // e.g. 10
  rating?: RatingLevel;
  feedback?: string;
  submittedAt?: string;
}

export interface Lesson {
  id: string;
  week: number;
  lessonDate: string;
  subject: SubjectType;
  title: string;
  objectives: string;
  keyKnowledge: string;
  requiredCompetencies: string;
  activities: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  makeupContent?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string; // e.g. 10:24 or ISO string
  type?: 'student' | 'attendance' | 'assessment' | 'assignment' | 'system';
}

export interface ClassSettings {
  schoolName: string;
  teacherName: string;
  className: string;
  schoolYear: string;
  totalStudents: number;
  initialBoys: number;
  initialGirls: number;
  fontMode?: 'serif' | 'sans'; // 'serif': Noto Serif (Chuẩn văn bản GD), 'sans': Be Vietnam Pro (Hiện đại không chân)
}

export type ActiveNavTab =
  | 'dashboard'
  | 'students'
  | 'students_add'
  | 'students_import'
  | 'student_profile'
  | 'attendance'
  | 'attendance_history'
  | 'attendance_absent'
  | 'vietnamese_entry'
  | 'vietnamese_summary'
  | 'vietnamese_criteria'
  | 'vietnamese_support'
  | 'math_entry'
  | 'math_summary'
  | 'math_criteria'
  | 'math_support'
  | 'assignments'
  | 'assignments_create'
  | 'lessons'
  | 'ai_assistant'
  | 'reports'
  | 'settings';
