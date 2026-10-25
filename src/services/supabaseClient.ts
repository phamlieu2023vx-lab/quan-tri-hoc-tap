import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Student,
  AttendanceRecord,
  AssessmentRecord,
  Assignment,
  Lesson,
  ClassSettings,
} from '../types/index.ts';
import { INITIAL_STUDENTS, INITIAL_SETTINGS, INITIAL_LESSONS, INITIAL_ASSESSMENTS, INITIAL_ASSIGNMENTS } from './storage.ts';

const SUPABASE_CONFIG_STORAGE_KEY = 'learnbridge_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastSyncTime?: string;
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://mcngorgybkspuhcfnued.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'mcngorgybkspuhcfnued',
  autoSync: false,
};

// Retrieve saved configuration from localStorage or default
export function getSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') return DEFAULT_SUPABASE_CONFIG;
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || DEFAULT_SUPABASE_CONFIG.url,
        anonKey: parsed.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey,
        autoSync: !!parsed.autoSync,
        lastSyncTime: parsed.lastSyncTime,
      };
    }
  } catch (e) {
    console.warn('Error reading Supabase config:', e);
  }
  return DEFAULT_SUPABASE_CONFIG;
}

// Save configuration to localStorage
export function saveSupabaseConfig(config: Partial<SupabaseConfig>): SupabaseConfig {
  const current = getSupabaseConfig();
  const updated: SupabaseConfig = {
    ...current,
    ...config,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(updated));
  }
  cachedClient = null; // Invalidate cached client to recreate with new credentials
  return updated;
}

// Check if key appears to be a valid Supabase JWT or publishable key
export function analyzeKeyFormat(key: string): { isValidFormat: boolean; warning?: string } {
  const clean = key.trim();
  if (!clean) {
    return { isValidFormat: false, warning: 'Khóa API không được để trống.' };
  }
  if (clean === 'mcngorgybkspuhcfnued') {
    return {
      isValidFormat: false,
      warning:
        'Bạn đang dùng mã Project Reference ID (mcngorgybkspuhcfnued) thay vì khóa "anon public". Khóa anon của Supabase là một chuỗi JWT dài bắt đầu bằng "eyJ...". Bạn hãy vào Supabase Dashboard -> Project Settings -> API -> Project API keys để sao chép khóa "anon public".',
    };
  }
  if (clean.startsWith('ey') || clean.startsWith('sb_publishable_')) {
    return { isValidFormat: true };
  }
  // If key has 3 dot-separated JWT parts
  if (clean.split('.').length === 3) {
    return { isValidFormat: true };
  }
  return {
    isValidFormat: false,
    warning:
      'Định dạng khóa có vẻ chưa đúng. Khóa "anon public" thông thường là chuỗi ký tự JWT dài bắt đầu bằng "eyJ...".',
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

// Get or initialize the Supabase client
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  const configKey = `${config.url}_${config.anonKey}`;

  if (cachedClient && cachedConfigKey === configKey) {
    return cachedClient;
  }

  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url.trim(), config.anonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedConfigKey = configKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface ConnectionTestResult {
  ok: boolean;
  status: 'connected' | 'auth_error' | 'table_missing' | 'network_error';
  message: string;
  details?: string;
  hasStudentsTable?: boolean;
}

// Live connection & health check
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const config = getSupabaseConfig();
  const formatCheck = analyzeKeyFormat(config.anonKey);

  if (!formatCheck.isValidFormat && formatCheck.warning) {
    return {
      ok: false,
      status: 'auth_error',
      message: 'Khóa Anon Key chưa đúng định dạng JWT',
      details: formatCheck.warning,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      status: 'network_error',
      message: 'Không thể khởi tạo kết nối với Supabase URL',
      details: 'Vui lòng kiểm tra lại địa chỉ URL dự án của bạn.',
    };
  }

  try {
    // Try to query the students table
    const { data, error } = await client.from('students').select('id').limit(1);

    if (error) {
      // 401/403 or JWT signature error
      if (
        error.code === '401' ||
        error.code === 'PGRST301' ||
        error.message?.includes('JWT') ||
        error.message?.includes('Invalid API key') ||
        error.message?.includes('signature')
      ) {
        return {
          ok: false,
          status: 'auth_error',
          message: 'Khóa Anon Key không hợp lệ hoặc hết hạn (Lỗi xác thực 401)',
          details:
            'Vui lòng vào Supabase Dashboard -> Project Settings -> API -> Project API keys để sao chép chính xác khóa "anon public" (bắt đầu bằng eyJ...).',
        };
      }

      // Relation/table doesn't exist yet (table_missing)
      if (
        error.code === '42P01' ||
        error.message?.includes('relation "students" does not exist') ||
        error.message?.includes('does not exist')
      ) {
        return {
          ok: true, // Connected to Supabase project, but tables need to be created!
          status: 'table_missing',
          hasStudentsTable: false,
          message: 'Đã kết nối thành công đến dự án Supabase, nhưng chưa tạo bảng "students"',
          details:
            'Bạn chỉ cần sao chép mã SQL khởi tạo ở tab "Mã SQL Supabase", dán vào mục SQL Editor trên Supabase và nhấn RUN để tạo toàn bộ bảng.',
        };
      }

      return {
        ok: false,
        status: 'network_error',
        message: `Lỗi truy vấn Supabase: ${error.message}`,
        details: error.details || error.hint || error.code,
      };
    }

    return {
      ok: true,
      status: 'connected',
      hasStudentsTable: true,
      message: 'Kết nối Supabase hoàn toàn thành công và bảng dữ liệu đã sẵn sàng!',
      details: `Đã liên kết với dự án tại ${config.url}. Bảng "students" phản hồi bình thường.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 'network_error',
      message: 'Không thể kết nối đến máy chủ Supabase',
      details: errorMsg,
    };
  }
}

// Convert Student to Supabase row format
function studentToRow(s: Student) {
  return {
    id: s.id,
    student_code: s.studentCode,
    full_name: s.fullName,
    last_name: s.lastName || '',
    middle_name: s.middleName || '',
    first_name: s.firstName || '',
    date_of_birth: s.dateOfBirth,
    gender: s.gender,
    class_name: s.className,
    status: s.status,
    parent_name: s.parentName || '',
    phone: s.phone || '',
    address: s.address || '',
    notes: s.notes || '',
    is_demo: !!s.isDemo,
    created_at: s.createdAt || new Date().toISOString(),
    updated_at: s.updatedAt || new Date().toISOString(),
  };
}

// Convert Supabase row to Student format
function rowToStudent(r: any): Student {
  return {
    id: r.id,
    studentCode: r.student_code || r.studentCode || '',
    fullName: r.full_name || r.fullName || '',
    lastName: r.last_name || r.lastName || '',
    middleName: r.middle_name || r.middleName || '',
    firstName: r.first_name || r.firstName || '',
    dateOfBirth: r.date_of_birth || r.dateOfBirth || '',
    gender: r.gender === 'Nữ' ? 'Nữ' : 'Nam',
    className: r.class_name || r.className || '1/2',
    status: r.status || 'Đang học',
    parentName: r.parent_name || r.parentName || '',
    phone: r.phone || '',
    address: r.address || '',
    notes: r.notes || '',
    isDemo: !!r.is_demo,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

// Push all students to Supabase
export async function pushStudentsToSupabase(students: Student[]): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { count: 0, error: 'Chưa cấu hình Supabase Client' };

  try {
    const rows = students.map(studentToRow);
    const { error } = await client.from('students').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return { count: rows.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('pushStudentsToSupabase error:', msg);
    return { count: 0, error: msg };
  }
}

// Pull all students from Supabase
export async function pullStudentsFromSupabase(): Promise<{ students: Student[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { students: [], error: 'Chưa cấu hình Supabase Client' };

  try {
    const { data, error } = await client.from('students').select('*').order('student_code', { ascending: true });
    if (error) throw error;
    const students = (data || []).map(rowToStudent);
    return { students };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('pullStudentsFromSupabase error:', msg);
    return { students: [], error: msg };
  }
}

// Complete SQL Schema script ready to run in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- LEARNBRIDGE AI - LỚP 1/2 TRƯỜNG TH PHẠM PHI HÙNG
-- TỆP LỆNH SQL KHỞI TẠO TOÀN BỘ CƠ SỞ DỮ LIỆU TRÊN SUPABASE
-- Hướng dẫn: Mở Supabase -> SQL Editor -> Dán toàn bộ mã này -> Bấm Run
-- =========================================================================

-- 1. BẢNG HỌC SINH (students)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    student_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    last_name TEXT DEFAULT '',
    middle_name TEXT DEFAULT '',
    first_name TEXT DEFAULT '',
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Nam', 'Nữ')),
    class_name TEXT NOT NULL DEFAULT '1/2',
    status TEXT NOT NULL DEFAULT 'Đang học' CHECK (status IN ('Đang học', 'Chuyển đi', 'Nghỉ học')),
    parent_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_students_code ON public.students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- 2. BẢNG ĐIỂM DANH & CHUYÊN CẦN (attendance)
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- Định dạng chuẩn YYYY-MM-DD
    status TEXT NOT NULL CHECK (status IN ('present', 'excused', 'unexcused')),
    notes TEXT DEFAULT '',
    makeup_needed BOOLEAN DEFAULT FALSE,
    makeup_lesson_title TEXT DEFAULT '',
    makeup_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);

-- 3. BẢNG TIÊU CHÍ ĐÁNH GIÁ THÔNG TƯ 27 (criteria)
CREATE TABLE IF NOT EXISTS public.criteria (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL CHECK (subject IN ('vietnamese', 'math')),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT DEFAULT ''
);

-- 4. BẢNG ĐÁNH GIÁ THƯỜNG XUYÊN (assessments)
CREATE TABLE IF NOT EXISTS public.assessments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('vietnamese', 'math')),
    date TEXT NOT NULL,
    week_number INT DEFAULT 1,
    lesson_name TEXT NOT NULL,
    criteria_id TEXT REFERENCES public.criteria(id) ON DELETE SET NULL,
    criteria_name TEXT NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('T', 'H', 'C')), -- Hoàn thành tốt, Hoàn thành, Cần hỗ trợ
    teacher_comment TEXT DEFAULT '',
    needs_reinforcement BOOLEAN DEFAULT FALSE,
    reinforced_topic TEXT DEFAULT '',
    updated_by TEXT DEFAULT 'Phạm Thúy Liễu',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_student ON public.assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON public.assessments(subject);

-- 5. BẢNG BÀI TẬP VÀ PHIẾU HỌC TẬP (assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    code TEXT DEFAULT '',
    title TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('vietnamese', 'math')),
    topic TEXT DEFAULT '',
    format TEXT DEFAULT 'multiple_choice',
    target_group TEXT DEFAULT 'all',
    target_student_ids JSONB DEFAULT '[]'::jsonb,
    assigned_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'draft')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG KẾ HOẠCH BÀI DẠY / GIÁO ÁN (lessons)
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    week INT NOT NULL,
    lesson_date TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('vietnamese', 'math')),
    title TEXT NOT NULL,
    objectives TEXT DEFAULT '',
    key_knowledge TEXT DEFAULT '',
    required_competencies TEXT DEFAULT '',
    activities TEXT DEFAULT '',
    status TEXT DEFAULT 'completed',
    makeup_content TEXT DEFAULT ''
);

-- 7. BẢNG CÀI ĐẶT THÔNG TIN LỚP HỌC (class_settings)
CREATE TABLE IF NOT EXISTS public.class_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_settings',
    school_name TEXT NOT NULL DEFAULT 'Tiểu học Phạm Phi Hùng',
    teacher_name TEXT NOT NULL DEFAULT 'Phạm Thúy Liễu',
    class_name TEXT NOT NULL DEFAULT '1/2',
    school_year TEXT NOT NULL DEFAULT '2024 - 2025',
    total_students INT DEFAULT 30,
    initial_boys INT DEFAULT 16,
    initial_girls INT DEFAULT 14,
    font_mode TEXT DEFAULT 'serif',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. THIẾT LẬP ROW LEVEL SECURITY (RLS) CHO PHÉP TRUY XUẤT CÔNG KHAI QUA ANON KEY
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_settings ENABLE ROW LEVEL SECURITY;

-- Cấp quyền Đọc, Thêm, Sửa, Xóa cho anon role
DROP POLICY IF EXISTS "Anon public access students" ON public.students;
CREATE POLICY "Anon public access students" ON public.students FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access attendance" ON public.attendance;
CREATE POLICY "Anon public access attendance" ON public.attendance FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access criteria" ON public.criteria;
CREATE POLICY "Anon public access criteria" ON public.criteria FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access assessments" ON public.assessments;
CREATE POLICY "Anon public access assessments" ON public.assessments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access assignments" ON public.assignments;
CREATE POLICY "Anon public access assignments" ON public.assignments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access lessons" ON public.lessons;
CREATE POLICY "Anon public access lessons" ON public.lessons FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access class_settings" ON public.class_settings;
CREATE POLICY "Anon public access class_settings" ON public.class_settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- 9. NẠP DỮ LIỆU CÀI ĐẶT BAN ĐẦU
INSERT INTO public.class_settings (id, school_name, teacher_name, class_name, school_year, total_students, initial_boys, initial_girls, font_mode)
VALUES ('default_settings', 'Tiểu học Phạm Phi Hùng', 'Phạm Thúy Liễu', '1/2', '2024 - 2025', 30, 16, 14, 'serif')
ON CONFLICT (id) DO NOTHING;

-- 10. NẠP TIÊU CHÍ ĐÁNH GIÁ MẪU
INSERT INTO public.criteria (id, subject, code, name, description) VALUES
('crit-tv-1', 'vietnamese', 'TV1-AM-VAN', 'Nhận diện chữ cái, âm và vần', 'Nhận biết chính xác các âm, vần, thanh điệu đã học trong tuần'),
('crit-tv-2', 'vietnamese', 'TV1-DOC-TIENG', 'Đọc thành tiếng', 'Đọc trơn đúng tốc độ, ngắt nghỉ đúng chỗ, phát âm rõ ràng'),
('crit-tv-3', 'vietnamese', 'TV1-DOC-HIEU', 'Đọc hiểu từ ngữ, câu văn ngắn', 'Hiểu nghĩa các từ đơn giản và trả lời được câu hỏi đọc hiểu'),
('crit-tv-4', 'vietnamese', 'TV1-VIET-CHU', 'Viết chữ và quy tắc chính tả', 'Viết đúng mẫu chữ, độ cao, khoảng cách và chính tả phân biệt c/k, g/gh, ng/ngh'),
('crit-tv-5', 'vietnamese', 'TV1-VIET-CAU', 'Viết câu đơn giản', 'Nhìn tranh viết câu hoặc điền từ hoàn chỉnh câu'),
('crit-toan-1', 'math', 'TOAN1-DOC-SO', 'Đọc và viết các số', 'Đếm, đọc, viết đúng các số trong phạm vi 10 và 20'),
('crit-toan-2', 'math', 'TOAN1-SO-SANH', 'So sánh số và thứ tự các số', 'Sử dụng thành thạo các dấu >, <, = và sắp xếp thứ tự dãy số'),
('crit-toan-3', 'math', 'TOAN1-PHEP-CONG', 'Phép cộng trong phạm vi học', 'Thực hiện chính xác bảng cộng, tính nhẩm và đặt tính'),
('crit-toan-4', 'math', 'TOAN1-PHEP-TRU', 'Phép trừ trong phạm vi học', 'Hiểu bản chất phép trừ và vận dụng giải toán nhanh'),
('crit-toan-5', 'math', 'TOAN1-HINH-HOC', 'Nhận biết hình học và vị trí', 'Nhận biết hình vuông, hình tròn, hình tam giác, trên/dưới, trái/phải'),
('crit-toan-6', 'math', 'TOAN1-GIAI-QUYET', 'Giải quyết vấn đề đơn giản', 'Vận dụng kiến thức toán học vào tình huống thực tế đời sống')
ON CONFLICT (id) DO NOTHING;
`;
