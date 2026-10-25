import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for Primary Education Class 1
const PRIMARY_TEACHER_PROMPT = `Bạn là Trợ lý AI giáo dục tiểu học chuyên sâu cho cô giáo Phạm Thúy Liễu, chủ nhiệm lớp 1/2 tại Trường Tiểu học Phạm Phi Hùng.
Các hướng dẫn bắt buộc:
1. Đối tượng là học sinh Lớp 1 (6 tuổi). Từ ngữ phải đơn giản, trong sáng, dễ hiểu, font chữ chuẩn tiếng Việt.
2. Tuân thủ Chương trình Giáo dục Phổ thông 2018 và Thông tư 27/2020/TT-BGDĐT về đánh giá học sinh tiểu học.
3. Không chẩn đoán bệnh tật, không dùng từ ngữ tiêu cực hay so sánh xúc phạm học sinh. Nhận xét phải động viên, chỉ ra ưu điểm và hướng dẫn cụ thể cách khắc phục khó khăn.
4. Luôn trả về định dạng rõ ràng, sẵn sàng để cô giáo in ra hoặc sử dụng ngay trong lớp học.`;

// Endpoint 1: Health check & AI status
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    available: !!ai,
    model: 'gemini-3.8-flash',
    school: 'Trường Tiểu học Phạm Phi Hùng',
    teacher: 'Phạm Thúy Liễu',
    className: '1/2',
  });
});

// Endpoint 2: Generate Worksheet
app.post('/api/ai/worksheet', async (req: Request, res: Response) => {
  try {
    const { subject, topic, level, questionCount, format } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình API Key Gemini. Vui lòng cấu hình trong panel Secrets.',
      });
    }

    const prompt = `Hãy soạn một phiếu bài tập hoàn chỉnh cho học sinh Lớp 1/2:
- Môn học: ${subject === 'vietnamese' ? 'Tiếng Việt Lớp 1' : 'Toán Lớp 1'}
- Chủ đề/Nội dung: ${topic || 'Âm vần hoặc Phép tính cơ bản'}
- Mức độ: ${level || 'Vừa sức'}
- Số lượng câu hỏi: ${questionCount || 4} câu
- Hình thức: ${format || 'Trắc nghiệm kết hợp điền khuyết'}

Yêu cầu định dạng phiếu bài tập:
[TIÊU ĐỀ PHIẾU BÀI TẬP]
Trường Tiểu học Phạm Phi Hùng - Lớp 1/2
Giáo viên: Phạm Thúy Liễu
Họ và tên học sinh: .................................................... Lớp 1/2
---
[NỘI DUNG BÀI TẬP]
Ghi rõ từng câu hỏi 1, 2, 3... kèm hình ảnh gợi ý (dưới dạng mô tả chữ hoặc biểu tượng ngộ nghĩnh) và dòng kẻ chấm chấm để học sinh điền.
---
[ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM]
Ghi vắn tắt cho giáo viên.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: PRIMARY_TEACHER_PROMPT,
      },
    });

    const text = response.text || '';
    return res.json({ result: text });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Worksheet error:', errorMsg);
    return res.status(500).json({ error: errorMsg });
  }
});

// Endpoint 3: Generate Makeup Lesson
app.post('/api/ai/makeup-lesson', async (req: Request, res: Response) => {
  try {
    const { studentName, lessonTitle, subject, missedDate } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình API Key Gemini. Vui lòng cấu hình trong panel Secrets.',
      });
    }

    const prompt = `Học sinh Lớp 1/2 tên là "${studentName}" đã vắng học vào ngày ${missedDate}.
Bài học trên lớp bị lỡ: "${lessonTitle}" (Môn ${subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}).

Hãy soạn một "PHIẾU HƯỚNG DẪN HỌC BÙ TẠI NHÀ" gửi cho phụ huynh học sinh gồm:
1. Lời nhắn gửi thân thiện, ấm áp của cô giáo Phạm Thúy Liễu gửi đến phụ huynh và em ${studentName}.
2. Tóm tắt 3 kiến thức trọng tâm nhất của bài học mà phụ huynh có thể kèm con trong 20 phút.
3. 3 bài tập thực hành nhỏ kèm ví dụ sinh động.
4. Lời dặn dò mang bài đến lớp để cô kiểm tra và khen thưởng vào buổi học tiếp theo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: PRIMARY_TEACHER_PROMPT,
      },
    });

    const text = response.text || '';
    return res.json({ result: text });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Makeup lesson error:', errorMsg);
    return res.status(500).json({ error: errorMsg });
  }
});

// Endpoint 4: Generate Assessment Comments (Circular 27)
app.post('/api/ai/comments', async (req: Request, res: Response) => {
  try {
    const { studentName, subject, strengths, difficulties, rating } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình API Key Gemini.',
      });
    }

    const prompt = `Gợi ý 3 phương án nhận xét học tập theo Thông tư 27/2020/TT-BGDĐT cho học sinh Lớp 1:
- Học sinh: ${studentName || 'Em học sinh'}
- Môn: ${subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}
- Mức độ đạt: ${rating || 'Hoàn thành tốt (T)'}
- Điểm mạnh: ${strengths || 'Ngoan, chăm chỉ'}
- Khó khăn/Nội dung cần rèn thêm: ${difficulties || 'Chữ viết cần nắn nót hơn'}

Đưa ra 3 gợi ý nhận xét khác nhau (1 nhận xét ngắn gọn ghi sổ theo dõi, 1 nhận xét chi tiết gửi sổ liên lạc điện tử cho phụ huynh, 1 lời động viên trực tiếp khi trả bài cho học sinh). Ngôn từ tích cực, truyền cảm hứng!`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: PRIMARY_TEACHER_PROMPT,
      },
    });

    const text = response.text || '';
    return res.json({ result: text });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Comments error:', errorMsg);
    return res.status(500).json({ error: errorMsg });
  }
});

// Endpoint 5: Personalized Intervention / Support Plan
app.post('/api/ai/support-plan', async (req: Request, res: Response) => {
  try {
    const { criteriaName, students, subject } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình API Key Gemini.',
      });
    }

    const prompt = `Một nhóm học sinh Lớp 1/2 đang cần hỗ trợ ở nội dung: "${criteriaName}" (Môn ${subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}).
Số lượng học sinh cần hỗ trợ: ${students?.length || 3} em.

Hãy đề xuất cho cô giáo Phạm Thúy Liễu một "KẾ HOẠCH HỖ TRỢ CÁ NHÂN HÓA TRONG TUẦN":
1. Phân tích nguyên nhân tâm lý/kỹ năng thường gặp ở học sinh lớp 1 đối với nội dung này.
2. 3 trò chơi học tập hoặc hoạt động tương tác 1-kèm-1 trong giờ tự học (mỗi hoạt động 5-7 phút).
3. Biện pháp phối hợp hiệu quả với phụ huynh tại nhà mà không gây áp lực cho trẻ.
4. Tiêu chí kiểm tra đánh giá lại sự tiến bộ sau 1 tuần.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: PRIMARY_TEACHER_PROMPT,
      },
    });

    const text = response.text || '';
    return res.json({ result: text });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Support plan error:', errorMsg);
    return res.status(500).json({ error: errorMsg });
  }
});

// --- Server-side Persistent Storage ---
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      students: [],
      attendance: [],
      assessments: [],
      assignments: [],
      lessons: [],
      settings: {
        schoolName: 'Tiểu học Phạm Phi Hùng',
        teacherName: 'Phạm Thúy Liễu',
        className: '1/2',
        schoolYear: '2024 - 2025',
      },
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
  }
}

interface DatabaseSchema {
  students: any[];
  attendance: any[];
  assessments: any[];
  assignments: any[];
  lessons: any[];
  settings: Record<string, any>;
  updatedAt: string;
}

function readDb(): DatabaseSchema {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return {
      students: [],
      attendance: [],
      assessments: [],
      assignments: [],
      lessons: [],
      settings: {},
      updatedAt: new Date().toISOString(),
    };
  }
}

function writeDb(data: DatabaseSchema) {
  ensureDataDir();
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// REST API 1: Get all students with live stats
app.get('/api/students', (_req: Request, res: Response) => {
  const db = readDb();
  const students = db.students || [];
  const total = students.length;
  const boys = students.filter((s: any) => s.gender === 'Nam').length;
  const girls = students.filter((s: any) => s.gender === 'Nữ').length;
  const active = students.filter((s: any) => s.status === 'Đang học').length;
  const transferred = students.filter((s: any) => s.status === 'Chuyển đi').length;
  const demoCount = students.filter((s: any) => s.isDemo).length;

  res.json({
    students,
    stats: {
      total,
      boys,
      girls,
      active,
      transferred,
      demoCount,
      isRealData: demoCount === 0 && total > 0,
    },
    updatedAt: db.updatedAt,
  });
});

// REST API 2: Create a student
app.post('/api/students', (req: Request, res: Response) => {
  const db = readDb();
  const student = req.body;

  if (!student.fullName || !student.fullName.trim()) {
    return res.status(400).json({ error: 'Họ và tên không được để trống.' });
  }
  if (!student.studentCode || !student.studentCode.trim()) {
    return res.status(400).json({ error: 'Mã học sinh không được để trống.' });
  }
  if (!student.dateOfBirth) {
    return res.status(400).json({ error: 'Ngày sinh không được để trống.' });
  }

  const codeClean = student.studentCode.trim().toLowerCase();
  const isDuplicate = db.students.some((s: any) => s.studentCode.trim().toLowerCase() === codeClean);
  if (isDuplicate) {
    return res.status(400).json({ error: `Mã học sinh "${student.studentCode.trim()}" đã tồn tại trong hệ thống!` });
  }

  const now = new Date().toISOString();
  const newStudent = {
    ...student,
    id: student.id || `hs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentCode: student.studentCode.trim(),
    fullName: student.fullName.trim(),
    className: student.className?.trim() || '1/2',
    status: student.status || 'Đang học',
    createdAt: now,
    updatedAt: now,
  };

  db.students.push(newStudent);
  writeDb(db);
  res.status(201).json(newStudent);
});

// REST API 3: Update an existing student
app.put('/api/students/:id', (req: Request, res: Response) => {
  const db = readDb();
  const { id } = req.params;
  const updates = req.body;

  let index = db.students.findIndex((s: any) => s.id === id);
  if (index === -1 && updates.studentCode) {
    const codeClean = updates.studentCode.trim().toLowerCase();
    index = db.students.findIndex((s: any) => s.studentCode?.trim().toLowerCase() === codeClean);
  }

  if (index === -1) {
    // If not found, upsert as new record so changes are never dropped
    const newStudent = {
      ...updates,
      id: id || `hs-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    db.students.push(newStudent);
    writeDb(db);
    return res.status(201).json(newStudent);
  }

  if (updates.studentCode) {
    const codeClean = updates.studentCode.trim().toLowerCase();
    const isDuplicate = db.students.some((s: any) => s.id !== db.students[index].id && s.studentCode.trim().toLowerCase() === codeClean);
    if (isDuplicate) {
      return res.status(400).json({ error: `Mã học sinh "${updates.studentCode}" đã được dùng bởi học sinh khác!` });
    }
  }

  const updatedStudent = {
    ...db.students[index],
    ...updates,
    id: db.students[index].id,
    updatedAt: new Date().toISOString(),
  };

  db.students[index] = updatedStudent;
  writeDb(db);
  res.json(updatedStudent);
});

// REST API 4: Delete a student
app.delete('/api/students/:id', (req: Request, res: Response) => {
  const db = readDb();
  const { id } = req.params;

  const target = db.students.find((s: any) => s.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Học sinh không tồn tại.' });
  }

  db.students = db.students.filter((s: any) => s.id !== id);
  writeDb(db);
  res.json({ message: `Đã xóa học sinh ${target.fullName}`, id });
});

// REST API 5: Batch import students with update or skip option
app.post('/api/students/batch', (req: Request, res: Response) => {
  const db = readDb();
  const { students: incoming, updateExisting } = req.body;

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: 'Danh sách nhập vào rỗng.' });
  }

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  incoming.forEach((item: any) => {
    if (!item.fullName || !item.studentCode) {
      skipped++;
      return;
    }

    const codeClean = item.studentCode.trim().toLowerCase();
    const existingIndex = db.students.findIndex((s: any) => s.studentCode.trim().toLowerCase() === codeClean);

    if (existingIndex >= 0) {
      if (updateExisting) {
        db.students[existingIndex] = {
          ...db.students[existingIndex],
          ...item,
          updatedAt: now,
        };
        updated++;
      } else {
        skipped++;
      }
    } else {
      db.students.push({
        ...item,
        id: item.id || `hs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentCode: item.studentCode.trim(),
        fullName: item.fullName.trim(),
        className: item.className?.trim() || '1/2',
        status: item.status || 'Đang học',
        createdAt: now,
        updatedAt: now,
      });
      added++;
    }
  });

  writeDb(db);
  res.json({ added, updated, skipped, total: db.students.length });
});

// REST API 6: Load labeled demo data (DỮ LIỆU DEMO)
app.post('/api/students/load-demo', (_req: Request, res: Response) => {
  const db = readDb();
  const demoList = [
    { studentCode: 'HS-DEMO-01', lastName: 'Nguyễn', middleName: 'Thị', firstName: 'Thảo Anh', fullName: 'Nguyễn Thị Thảo Anh', dateOfBirth: '2020-01-27', gender: 'Nữ', className: '1/2', status: 'Đang học', notes: 'Học sinh tiếp thu nhanh', isDemo: true },
    { studentCode: 'HS-DEMO-02', lastName: 'Nguyễn', middleName: 'Hoàng', firstName: 'Thiên Ân', fullName: 'Nguyễn Hoàng Thiên Ân', dateOfBirth: '2020-07-11', gender: 'Nam', className: '1/2', status: 'Đang học', notes: 'Chăm chỉ phát biểu', isDemo: true },
    { studentCode: 'HS-DEMO-03', lastName: 'Trương', middleName: 'Hồ Tuyết', firstName: 'Băng', fullName: 'Trương Hồ Tuyết Băng', dateOfBirth: '2020-09-27', gender: 'Nữ', className: '1/2', status: 'Đang học', notes: 'Chữ viết cẩn thận', isDemo: true },
    { studentCode: 'HS-DEMO-04', lastName: 'Trương', middleName: 'Hoàng Hải', firstName: 'Đăng', fullName: 'Trương Hoàng Hải Đăng', dateOfBirth: '2020-09-05', gender: 'Nam', className: '1/2', status: 'Đang học', notes: 'Cần rèn nét khuyết dưới', isDemo: true },
    { studentCode: 'HS-DEMO-05', lastName: 'Phạm', middleName: 'An', firstName: 'Giang', fullName: 'Phạm An Giang', dateOfBirth: '2020-08-19', gender: 'Nam', className: '1/2', status: 'Đang học', notes: 'Ngoan ngoãn', isDemo: true },
  ];

  const now = new Date().toISOString();
  db.students = demoList.map((d, idx) => ({
    ...d,
    id: `demo-${idx + 1}`,
    createdAt: now,
    updatedAt: now,
  }));

  writeDb(db);
  res.json({ message: 'Đã nạp 5 học sinh mẫu (DỮ LIỆU DEMO)', students: db.students });
});

// REST API 7: Clear all students (to start with a clean real class roster)
app.post('/api/students/clear', (_req: Request, res: Response) => {
  const db = readDb();
  const count = db.students.length;
  db.students = [];
  writeDb(db);
  res.json({ message: `Đã dọn dẹp ${count} hồ sơ. Danh sách hiện đang trống sẵn sàng nhập danh sách thật.`, count: 0 });
});

// REST API 8: Database full backup & restore
app.get('/api/database/backup', (_req: Request, res: Response) => {
  const db = readDb();
  res.json(db);
});

app.post('/api/database/restore', (req: Request, res: Response) => {
  const incoming = req.body;
  if (!incoming || !Array.isArray(incoming.students)) {
    return res.status(400).json({ error: 'Cấu trúc tệp sao lưu không hợp lệ.' });
  }
  writeDb(incoming);
  res.json({ message: 'Khôi phục cơ sở dữ liệu thành công!', totalStudents: incoming.students.length });
});

// Start server with Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development mode, load Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LearnBridge Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
});
