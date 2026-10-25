import {
  Student,
  AttendanceRecord,
  AssessmentRecord,
  Criteria,
  Assignment,
  AssignmentResult,
  Lesson,
  ActivityLog,
  ClassSettings,
} from '../types/index.ts';

const STORAGE_KEYS = {
  STUDENTS: 'learnbridge_students_v1',
  ATTENDANCE: 'learnbridge_attendance_v1',
  ASSESSMENTS: 'learnbridge_assessments_v1',
  CRITERIA: 'learnbridge_criteria_v1',
  ASSIGNMENTS: 'learnbridge_assignments_v1',
  ASSIGNMENT_RESULTS: 'learnbridge_assignment_results_v1',
  LESSONS: 'learnbridge_lessons_v1',
  ACTIVITIES: 'learnbridge_activities_v1',
  SETTINGS: 'learnbridge_settings_v1',
};

// Initial 30 students matching Class 1/2 specification
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'hs-1',
    studentCode: 'HS-1.2-001',
    fullName: 'Nguyễn Thị Thảo Anh',
    dateOfBirth: '2020-01-27',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Văn Minh',
    phone: '0903123401',
    address: 'Khu phố 1, Phường 2',
    notes: 'Tiếp thu nhanh, phát âm chuẩn',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-2',
    studentCode: 'HS-1.2-002',
    fullName: 'Nguyễn Hoàng Thiên Ân',
    dateOfBirth: '2020-07-11',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Hoàng Nam',
    phone: '0903123402',
    address: 'Khu phố 2, Phường 2',
    notes: 'Chăm chỉ, hay giơ tay phát biểu',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-3',
    studentCode: 'HS-1.2-003',
    fullName: 'Trương Hồ Tuyết Băng',
    dateOfBirth: '2020-09-27',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Trương Văn Hải',
    phone: '0903123403',
    address: 'Khu phố 1, Phường 3',
    notes: 'Chữ viết cẩn thận, đều nét',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-4',
    studentCode: 'HS-1.2-004',
    fullName: 'Trương Hoàng Hải Đăng',
    dateOfBirth: '2020-09-05',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Trương Hoàng Phúc',
    phone: '0903123404',
    address: 'Khu phố 3, Phường 2',
    notes: 'Cần rèn thêm viết nét khuyết dưới',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-5',
    studentCode: 'HS-1.2-005',
    fullName: 'Nguyễn Thiên Đăng',
    dateOfBirth: '2020-08-15',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Thanh Tùng',
    phone: '0903123405',
    address: 'Khu phố 4, Phường 2',
    notes: 'Toán học tốt, tính nhẩm nhanh',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-6',
    studentCode: 'HS-1.2-006',
    fullName: 'Phạm An Giang',
    dateOfBirth: '2020-08-19',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Phạm Quốc Cường',
    phone: '0903123406',
    address: 'Khu phố 2, Phường 2',
    notes: 'Ngoan, lễ phép',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-7',
    studentCode: 'HS-1.2-007',
    fullName: 'Dương Gia Huy',
    dateOfBirth: '2020-04-07',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Dương Văn Long',
    phone: '0903123407',
    address: 'Khu phố 1, Phường 2',
    notes: 'Đọc trơn tốt, cần chú ý tư thế ngồi viết',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-8',
    studentCode: 'HS-1.2-008',
    fullName: 'Đặng Lê Minh Huy',
    dateOfBirth: '2020-12-31',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Đặng Văn Khoa',
    phone: '0903123408',
    address: 'Khu phố 3, Phường 1',
    notes: 'Còn nhút nhát khi đọc to trước lớp',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-9',
    studentCode: 'HS-1.2-009',
    fullName: 'Nguyễn Minh Huy',
    dateOfBirth: '2020-10-12',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Thế Hùng',
    phone: '0903123409',
    address: 'Khu phố 5, Phường 2',
    notes: 'Nắm chắc các chữ số và phép cộng trong phạm vi 10',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-10',
    studentCode: 'HS-1.2-010',
    fullName: 'Phạm Hồ Nhật Huy',
    dateOfBirth: '2020-09-16',
    gender: 'Nam',
    className: '1/2',
    status: 'Chuyển đi',
    parentName: 'Phạm Hồ Bắc',
    phone: '0903123410',
    address: 'Chuyển theo gia đình về quê',
    notes: 'Đã hoàn tất hồ sơ chuyển trường',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-10-01T08:00:00Z',
  },
  {
    id: 'hs-11',
    studentCode: 'HS-1.2-011',
    fullName: 'Trương Nguyễn Gia Huy',
    dateOfBirth: '2020-01-09',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Trương Văn Nghĩa',
    phone: '0903123411',
    address: 'Khu phố 1, Phường 2',
    notes: 'Năng nổ tham gia hoạt động góc',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-12',
    studentCode: 'HS-1.2-012',
    fullName: 'Trương Đặng Trung Kiên',
    dateOfBirth: '2020-12-22',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Trương Đặng Trí',
    phone: '0903123412',
    address: 'Khu phố 2, Phường 3',
    notes: 'Học lực ổn định',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-13',
    studentCode: 'HS-1.2-013',
    fullName: 'Trần Đặng Cẩm Ly',
    dateOfBirth: '2020-03-24',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Trần Đặng Thuận',
    phone: '0903123413',
    address: 'Khu phố 3, Phường 2',
    notes: 'Chữ viết đẹp, cẩn thận',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-14',
    studentCode: 'HS-1.2-014',
    fullName: 'Nguyễn Ngọc Xuân Mai',
    dateOfBirth: '2020-10-18',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Văn Đạt',
    phone: '0903123414',
    address: 'Khu phố 4, Phường 2',
    notes: 'Đọc diễn cảm tốt',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-15',
    studentCode: 'HS-1.2-015',
    fullName: 'Nguyễn Ngọc Bảo Nghi',
    dateOfBirth: '2020-10-23',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Văn Hòa',
    phone: '0903123415',
    address: 'Khu phố 1, Phường 1',
    notes: 'Cần kèm thêm phân biệt âm c/k',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-16',
    studentCode: 'HS-1.2-016',
    fullName: 'Nguyễn Bảo Ngọc',
    dateOfBirth: '2019-12-31',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Hoàng Lộc',
    phone: '0903123416',
    address: 'Khu phố 2, Phường 2',
    notes: 'Chăm chỉ, tích cực',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-17',
    studentCode: 'HS-1.2-017',
    fullName: 'Dương Hồng Ngọc',
    dateOfBirth: '2020-09-16',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Dương Văn Phú',
    phone: '0903123417',
    address: 'Khu phố 4, Phường 3',
    notes: 'Thích vẽ tranh và giải toán hình học',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-18',
    studentCode: 'HS-1.2-018',
    fullName: 'Nguyễn Thị Ánh Ngoan',
    dateOfBirth: '2020-07-14',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Văn Sơn',
    phone: '0903123418',
    address: 'Khu phố 1, Phường 2',
    notes: 'Tiếp thu bài nhanh',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-19',
    studentCode: 'HS-1.2-019',
    fullName: 'Nguyễn Thị Diệu Nguyên',
    dateOfBirth: '2020-01-02',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Đình Trọng',
    phone: '0903123419',
    address: 'Khu phố 3, Phường 2',
    notes: 'Cần rèn thêm viết nét móc hai đầu',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-20',
    studentCode: 'HS-1.2-020',
    fullName: 'Lê Cao Thiện Nhân',
    dateOfBirth: '2020-08-23',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Lê Cao Thắng',
    phone: '0903123420',
    address: 'Khu phố 5, Phường 2',
    notes: 'Rất sáng dạ, phản xạ toán nhanh',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-21',
    studentCode: 'HS-1.2-021',
    fullName: 'Mai Thạch Văn Nhân',
    dateOfBirth: '2020-01-16',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Mai Thạch Bảo',
    phone: '0903123421',
    address: 'Khu phố 2, Phường 1',
    notes: 'Ngoan ngoãn, hòa đồng với bạn bè',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-22',
    studentCode: 'HS-1.2-022',
    fullName: 'Nguyễn Thành Nhân',
    dateOfBirth: '2020-05-24',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Thành Trung',
    phone: '0903123422',
    address: 'Khu phố 4, Phường 2',
    notes: 'Học đều các môn',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-23',
    studentCode: 'HS-1.2-023',
    fullName: 'Nguyễn Tấn Phát',
    dateOfBirth: '2020-02-17',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Tấn Tài',
    phone: '0903123423',
    address: 'Khu phố 1, Phường 2',
    notes: 'Đọc tốt, viết bài nhanh',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-24',
    studentCode: 'HS-1.2-024',
    fullName: 'Trương Hoàng Thu Thảo',
    dateOfBirth: '2020-06-04',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Trương Hoàng Hùng',
    phone: '0903123424',
    address: 'Khu phố 3, Phường 3',
    notes: 'Hát hay, tự tin trong hoạt động trải nghiệm',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-25',
    studentCode: 'HS-1.2-025',
    fullName: 'Võ Minh Tiến',
    dateOfBirth: '2020-07-27',
    gender: 'Nam',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Võ Văn Kiệt',
    phone: '0903123425',
    address: 'Khu phố 2, Phường 2',
    notes: 'Cần kèm thêm so sánh số lớn hơn, bé hơn',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-26',
    studentCode: 'HS-1.2-026',
    fullName: 'Võ Thị Bảo Trân',
    dateOfBirth: '2020-07-03',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Võ Đình Duy',
    phone: '0903123426',
    address: 'Khu phố 1, Phường 2',
    notes: 'Đọc to rõ ràng, giữ gìn sách vở sạch sẽ',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-27',
    studentCode: 'HS-1.2-027',
    fullName: 'Nguyễn Lê Ngọc Trinh',
    dateOfBirth: '2020-05-24',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Nguyễn Lê Hoàng',
    phone: '0903123427',
    address: 'Khu phố 3, Phường 2',
    notes: 'Tập trung chú ý nghe giảng',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-28',
    studentCode: 'HS-1.2-028',
    fullName: 'Dương Lê Tường Vy',
    dateOfBirth: '2020-08-04',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Dương Văn Thành',
    phone: '0903123428',
    address: 'Khu phố 4, Phường 2',
    notes: 'Có nhiều tiến bộ trong viết chữ',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-29',
    studentCode: 'HS-1.2-029',
    fullName: 'Trương Thị Tường Vy',
    dateOfBirth: '2020-02-23',
    gender: 'Nữ',
    className: '1/2',
    status: 'Đang học',
    parentName: 'Trương Quốc Anh',
    phone: '0903123429',
    address: 'Khu phố 2, Phường 3',
    notes: 'Học lực tốt, nhiệt tình giúp đỡ bạn',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'hs-30',
    studentCode: 'HS-1.2-030',
    fullName: 'Nguyễn Ngọc Yến Vy',
    dateOfBirth: '2020-09-22',
    gender: 'Nữ',
    className: '1/2',
    status: 'Chuyển đi',
    parentName: 'Nguyễn Quốc Tuấn',
    phone: '0903123430',
    address: 'Chuyển đến Quận Ninh Kiều, Cần Thơ',
    notes: 'Đã rút học bạ ngày 15/10/2024',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-10-15T08:00:00Z',
  },
];

export const INITIAL_SETTINGS: ClassSettings = {
  schoolName: 'Tiểu học Phạm Phi Hùng',
  teacherName: 'Phạm Thúy Liễu',
  className: '1/2',
  schoolYear: '2024 - 2025',
  totalStudents: 30,
  initialBoys: 16,
  initialGirls: 14,
  fontMode: 'serif',
};

export const INITIAL_CRITERIA: Criteria[] = [
  // Tiếng Việt Lớp 1 (Theo Chương trình GDPT 2018 & Thông tư 27)
  {
    id: 'crit-tv-1',
    subject: 'vietnamese',
    code: 'TV1-AM-VAN',
    name: 'Nhận diện chữ cái, âm và vần',
    description: 'Nhận biết chính xác các âm, vần, thanh điệu đã học trong tuần',
  },
  {
    id: 'crit-tv-2',
    subject: 'vietnamese',
    code: 'TV1-DOC-TIENG',
    name: 'Đọc thành tiếng',
    description: 'Đọc trơn đúng tốc độ, ngắt nghỉ đúng chỗ, phát âm rõ ràng',
  },
  {
    id: 'crit-tv-3',
    subject: 'vietnamese',
    code: 'TV1-DOC-HIEU',
    name: 'Đọc hiểu từ ngữ, câu văn ngắn',
    description: 'Hiểu nghĩa các từ đơn giản và trả lời được câu hỏi đọc hiểu',
  },
  {
    id: 'crit-tv-4',
    subject: 'vietnamese',
    code: 'TV1-VIET-CHU',
    name: 'Viết chữ và quy tắc chính tả',
    description: 'Viết đúng mẫu chữ, độ cao, khoảng cách và chính tả phân biệt c/k, g/gh, ng/ngh',
  },
  {
    id: 'crit-tv-5',
    subject: 'vietnamese',
    code: 'TV1-VIET-CAU',
    name: 'Viết câu đơn giản',
    description: 'Nhìn tranh viết câu hoặc điền từ hoàn chỉnh câu',
  },

  // Toán Lớp 1
  {
    id: 'crit-toan-1',
    subject: 'math',
    code: 'TOAN1-DOC-SO',
    name: 'Đọc và viết các số',
    description: 'Đếm, đọc, viết đúng các số trong phạm vi 10 và 20',
  },
  {
    id: 'crit-toan-2',
    subject: 'math',
    code: 'TOAN1-SO-SANH',
    name: 'So sánh số và thứ tự các số',
    description: 'Sử dụng thành thạo các dấu >, <, = và sắp xếp thứ tự dãy số',
  },
  {
    id: 'crit-toan-3',
    subject: 'math',
    code: 'TOAN1-PHEP-CONG',
    name: 'Phép cộng trong phạm vi học',
    description: 'Thực hiện chính xác bảng cộng, tính nhẩm và đặt tính',
  },
  {
    id: 'crit-toan-4',
    subject: 'math',
    code: 'TOAN1-PHEP-TRU',
    name: 'Phép trừ trong phạm vi học',
    description: 'Hiểu bản chất phép trừ và vận dụng giải toán nhanh',
  },
  {
    id: 'crit-toan-5',
    subject: 'math',
    code: 'TOAN1-HINH-HOC',
    name: 'Nhận biết hình học và vị trí',
    description: 'Nhận biết hình vuông, hình tròn, hình tam giác, trên/dưới, trái/phải',
  },
  {
    id: 'crit-toan-6',
    subject: 'math',
    code: 'TOAN1-GIAI-QUYET',
    name: 'Giải quyết vấn đề đơn giản',
    description: 'Vận dụng kiến thức toán học vào tình huống thực tế đời sống',
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'les-tv-1',
    week: 8,
    lessonDate: '2024-10-21',
    subject: 'vietnamese',
    title: 'Bài 32: an, ăn, ân',
    objectives: 'Nhận biết và đọc trơn vần an, ăn, ân. Đọc đúng từ ngữ và câu ứng dụng.',
    keyKnowledge: 'Quy tắc ghép âm a, ă, â với âm n. Phân biệt cách phát âm vần an - ăn - ân.',
    requiredCompetencies: 'Đọc đúng tốc độ 30-40 tiếng/phút. Viết đúng cỡ chữ nhỡ.',
    activities: 'Khởi động hát vui, khám phá vần mới, luyện đọc từ ngữ, viết bảng con, đọc câu ứng dụng.',
    status: 'completed',
    makeupContent: 'Luyện đọc trang 72-73 SGK Tiếng Việt 1; làm bài tập nối từ trong Vở bài tập.',
  },
  {
    id: 'les-toan-1',
    week: 8,
    lessonDate: '2024-10-22',
    subject: 'math',
    title: 'Phép cộng trong phạm vi 10 (tiết 1)',
    objectives: 'Hình thành bảng cộng trong phạm vi 10. Biết thao tác gộp đồ vật để tìm kết quả.',
    keyKnowledge: 'Mối quan hệ giữa gộp và phép tính cộng. Các cặp số có tổng bằng 10.',
    requiredCompetencies: 'Tính nhẩm nhanh các phép cộng trong phạm vi 10 không dùng ngón tay.',
    activities: 'Trò chơi chuyền bóng tìm bạn tính, thực hành que tính, bài tập nhóm đôi.',
    status: 'completed',
    makeupContent: 'Thực hành các phép tính 6+4, 7+3, 8+2, 9+1 trên bộ đồ dùng toán học.',
  },
  {
    id: 'les-tv-2',
    week: 8,
    lessonDate: '2024-10-23',
    subject: 'vietnamese',
    title: 'Bài 33: on, ôn, ơn',
    objectives: 'Đọc và viết các vần on, ôn, ơn. Viết câu: "Mẹ bế bé con đi dạo mát."',
    keyKnowledge: 'Âm đệm và âm chính. Ghép vần với các phụ âm đầu đã học.',
    requiredCompetencies: 'Viết liền mạch nét nối từ o sang n, ô sang n, ơ sang n.',
    activities: 'Đọc thơ khởi động, ghép chữ thẻ từ, luyện viết vở ô ly.',
    status: 'completed',
    makeupContent: 'Viết 2 dòng vần on, ôn, ơn và đọc to bài đọc trang 75 SGK cho phụ huynh nghe.',
  },
];

// Initial assessment records for demonstration with realistic educational progress
export const INITIAL_ASSESSMENTS: AssessmentRecord[] = [
  {
    id: 'asm-1',
    studentId: 'hs-4', // Trương Hoàng Hải Đăng
    subject: 'vietnamese',
    date: '2024-10-21',
    weekNumber: 8,
    lessonName: 'Bài 32: an, ăn, ân',
    criteriaId: 'crit-tv-4',
    criteriaName: 'Viết chữ và quy tắc chính tả',
    rating: 'C',
    teacherComment: 'Nét khuyết dưới còn lệch dòng kẻ; cần kiên nhẫn uốn nét tròn đều.',
    needsReinforcement: true,
    reinforcedTopic: 'Rèn luyện nét khuyết dưới và viết cỡ chữ nhỡ',
    updatedBy: 'Phạm Thúy Liễu',
    updatedAt: '2024-10-21T10:30:00Z',
  },
  {
    id: 'asm-2',
    studentId: 'hs-15', // Nguyễn Ngọc Bảo Nghi
    subject: 'vietnamese',
    date: '2024-10-23',
    weekNumber: 8,
    lessonName: 'Bài 33: on, ôn, ơn',
    criteriaId: 'crit-tv-1',
    criteriaName: 'Nhận diện chữ cái, âm và vần',
    rating: 'C',
    teacherComment: 'Đôi lúc còn nhầm lẫn cách dùng c và k trước các nguyên âm e, ê, i.',
    needsReinforcement: true,
    reinforcedTopic: 'Quy tắc chính tả phân biệt c và k',
    updatedBy: 'Phạm Thúy Liễu',
    updatedAt: '2024-10-23T11:15:00Z',
  },
  {
    id: 'asm-3',
    studentId: 'hs-25', // Võ Minh Tiến
    subject: 'math',
    date: '2024-10-22',
    weekNumber: 8,
    lessonName: 'Phép cộng trong phạm vi 10',
    criteriaId: 'crit-toan-2',
    criteriaName: 'So sánh số và thứ tự các số',
    rating: 'C',
    teacherComment: 'Còn lúng túng khi so sánh số lớn hơn 10 với số có một chữ số.',
    needsReinforcement: true,
    reinforcedTopic: 'So sánh các số trong phạm vi 10 và 20',
    updatedBy: 'Phạm Thúy Liễu',
    updatedAt: '2024-10-22T09:40:00Z',
  },
  {
    id: 'asm-4',
    studentId: 'hs-1', // Nguyễn Thị Thảo Anh
    subject: 'vietnamese',
    date: '2024-10-23',
    weekNumber: 8,
    lessonName: 'Bài 33: on, ôn, ơn',
    criteriaId: 'crit-tv-2',
    criteriaName: 'Đọc thành tiếng',
    rating: 'T',
    teacherComment: 'Đọc rất lưu loát, giọng đọc trong sáng, phát âm chuẩn xác.',
    needsReinforcement: false,
    updatedBy: 'Phạm Thúy Liễu',
    updatedAt: '2024-10-23T11:15:00Z',
  },
  {
    id: 'asm-5',
    studentId: 'hs-2', // Nguyễn Hoàng Thiên Ân
    subject: 'math',
    date: '2024-10-22',
    weekNumber: 8,
    lessonName: 'Phép cộng trong phạm vi 10',
    criteriaId: 'crit-toan-3',
    criteriaName: 'Phép cộng trong phạm vi học',
    rating: 'T',
    teacherComment: 'Tính nhẩm xuất sắc, hoàn thành bài tập toán trước thời gian.',
    needsReinforcement: false,
    updatedBy: 'Phạm Thúy Liễu',
    updatedAt: '2024-10-22T09:40:00Z',
  },
  {
    id: 'asm-6',
    studentId: 'hs-3', // Trương Hồ Tuyết Băng
    subject: 'vietnamese',
    date: '2024-10-21',
    weekNumber: 8,
    lessonName: 'Bài 32: an, ăn, ân',
    criteriaId: 'crit-tv-4',
    criteriaName: 'Viết chữ và quy tắc chính tả',
    rating: 'T',
    teacherComment: 'Chữ viết mẫu mực, sạch sẽ, khoảng cách con chữ con đúng chuẩn.',
    needsReinforcement: false,
    updatedBy: 'Phạm Thúy Liễu',
    updatedAt: '2024-10-21T10:30:00Z',
  },
  {
    id: 'asm-7',
    studentId: 'hs-8', // Đặng Lê Minh Huy
    subject: 'vietnamese',
    date: '2024-10-23',
    weekNumber: 8,
    lessonName: 'Bài 33: on, ôn, ơn',
    criteriaId: 'crit-tv-2',
    criteriaName: 'Đọc thành tiếng',
    rating: 'C',
    teacherComment: 'Đọc còn nhỏ tiếng, còn ngắc ngứ khi gặp tiếng có âm đầu khó.',
    needsReinforcement: true,
    reinforcedTopic: 'Rèn phát âm to rõ và tự tin khi đọc bài',
    updatedBy: 'Phạm Thúy Liễu',
    updatedAt: '2024-10-23T11:20:00Z',
  },
];

// Initial assignments
export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    code: 'BT-TV-01',
    title: 'Phiếu rèn âm vần an, ăn, ân và quy tắc c/k',
    subject: 'vietnamese',
    topic: 'Vần an, ăn, ân và phân biệt c/k',
    format: 'multiple_choice',
    targetGroup: 'needs_support',
    targetStudentIds: ['hs-4', 'hs-8', 'hs-15', 'hs-19'],
    assignedDate: '2024-10-23',
    dueDate: '2024-10-26',
    status: 'active',
    notes: 'Dành cho nhóm rèn chữ viết và củng cố vần mới',
    createdAt: '2024-10-23T08:00:00Z',
    questions: [
      {
        id: 'q1',
        prompt: 'Tiếng nào sau đây chứa vần "ăn"?',
        type: 'multiple_choice',
        options: ['A. Khăn rằn', 'B. Bàn học', 'C. Sân trường', 'D. Con mèo'],
        correctAnswer: 'A. Khăn rằn',
        guide: 'Vần "ăn" gồm âm á và âm n.',
      },
      {
        id: 'q2',
        prompt: 'Điền chữ "c" hay "k" vào chỗ chấm: "con ...iến"',
        type: 'multiple_choice',
        options: ['A. c', 'B. k'],
        correctAnswer: 'B. k',
        guide: 'Quy tắc: Đứng trước i, e, ê ta viết chữ k.',
      },
      {
        id: 'q3',
        prompt: 'Nối từ thích hợp: "Đàn cá ..."',
        type: 'fill_in_the_blank',
        correctAnswer: 'bơi lội',
        guide: 'Điền từ chỉ hoạt động của con cá dưới nước.',
      },
    ],
  },
  {
    id: 'assign-2',
    code: 'BT-TOAN-01',
    title: 'Phiếu vui học Toán: Phép cộng và so sánh số',
    subject: 'math',
    topic: 'Phép cộng trong phạm vi 10',
    format: 'multiple_choice',
    targetGroup: 'all',
    targetStudentIds: INITIAL_STUDENTS.filter(s => s.status === 'Đang học').map(s => s.id),
    assignedDate: '2024-10-22',
    dueDate: '2024-10-25',
    status: 'active',
    notes: 'Phiếu ôn tập chung cả lớp cuối tuần',
    createdAt: '2024-10-22T08:00:00Z',
    questions: [
      {
        id: 'qm1',
        prompt: 'Kết quả của phép tính: 6 + 4 = ?',
        type: 'multiple_choice',
        options: ['A. 8', 'B. 9', 'C. 10', 'D. 7'],
        correctAnswer: 'C. 10',
      },
      {
        id: 'qm2',
        prompt: 'Điền dấu thích hợp: 7 + 2 ... 10',
        type: 'multiple_choice',
        options: ['A. >', 'B. <', 'C. ='],
        correctAnswer: 'B. <',
      },
      {
        id: 'qm3',
        prompt: 'Có 5 quả cam, mẹ mua thêm 3 quả nữa. Hỏi có tất cả mấy quả cam?',
        type: 'essay',
        correctAnswer: '8 quả cam',
      },
    ],
  },
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    action: 'Thêm học sinh',
    description: 'Thêm học sinh Nguyễn Thị Lan vào danh sách dự thính',
    timestamp: '10:24',
    type: 'student',
  },
  {
    id: 'act-2',
    action: 'Cập nhật hồ sơ',
    description: 'Cập nhật hồ sơ học sinh Trần Quốc Bảo',
    timestamp: '09:45',
    type: 'student',
  },
  {
    id: 'act-3',
    action: 'Nhập danh sách',
    description: 'Nhập danh sách từ Excel (30 học sinh)',
    timestamp: '08:30',
    type: 'system',
  },
  {
    id: 'act-4',
    action: 'Sửa thông tin',
    description: 'Sửa thông tin ghi chú Lê Thị Cẩm Tú',
    timestamp: '08:15',
    type: 'student',
  },
  {
    id: 'act-5',
    action: 'Đăng nhập hệ thống',
    description: 'Cô Phạm Thúy Liễu đăng nhập hệ thống thành công',
    timestamp: '07:50',
    type: 'system',
  },
];

// Helper to get today's date formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate today's initial attendance records
export function generateDefaultAttendance(students: Student[], date: string = getTodayDateString()): AttendanceRecord[] {
  return students.map((s, idx) => {
    // 2 absent students for demo
    if (idx === 3) {
      return {
        id: `att-${s.id}-${date}`,
        studentId: s.id,
        date,
        status: 'excused',
        notes: 'Gia đình xin phép nghỉ vì bị cảm sốt',
        makeupNeeded: true,
        makeupLessonTitle: 'Bài 33: on, ôn, ơn',
        makeupCompleted: false,
        updatedAt: new Date().toISOString(),
      };
    }
    if (idx === 7) {
      return {
        id: `att-${s.id}-${date}`,
        studentId: s.id,
        date,
        status: 'unexcused',
        notes: 'Chưa rõ lý do (cô đang liên hệ phụ huynh)',
        makeupNeeded: true,
        makeupLessonTitle: 'Bài 33: on, ôn, ơn',
        makeupCompleted: false,
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      id: `att-${s.id}-${date}`,
      studentId: s.id,
      date,
      status: 'present',
      notes: '',
      updatedAt: new Date().toISOString(),
    };
  });
}

// Custom EventEmitter for cross-component reactive updates
class StorageService {
  private listeners: Map<string, Array<() => void>> = new Map();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(key: string, callback: () => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);

    return () => {
      const arr = this.listeners.get(key);
      if (arr) {
        this.listeners.set(key, arr.filter(cb => cb !== callback));
      }
    };
  }

  private notify(key: string) {
    const arr = this.listeners.get(key);
    if (arr) {
      arr.forEach(cb => cb());
    }
    const allArr = this.listeners.get('*');
    if (allArr) {
      allArr.forEach(cb => cb());
    }
  }

  public ensureInitialized(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CRITERIA)) {
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(INITIAL_CRITERIA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      const studs = this.getStudents();
      const today = getTodayDateString();
      const defAtt = generateDefaultAttendance(studs, today);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(defAtt));
    }

    // Attempt remote sync with server database
    this.syncRemoteStudents();
  }

  // --- Remote Server Sync ---
  public async syncRemoteStudents(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.students)) {
          const serverStudents: Student[] = data.students;
          const localStudents = this.getStudents();

          if (serverStudents.length === 0) {
            // If server has no students yet, push current local list to server
            if (localStudents.length > 0) {
              await fetch('/api/students/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: localStudents, updateExisting: true }),
              });
            }
          } else {
            // SMART MERGE: Compare by ID and updatedAt timestamps!
            // Never overwrite local changes if local timestamp is newer or equal
            let hasNewerLocal = false;
            const mergedMap = new Map<string, Student>();

            // Populate from server first
            serverStudents.forEach(s => mergedMap.set(s.id, s));

            // Merge local students
            localStudents.forEach(localS => {
              const serverS = mergedMap.get(localS.id);
              if (!serverS) {
                // Student exists in local storage only
                mergedMap.set(localS.id, localS);
                hasNewerLocal = true;
              } else {
                const localTime = new Date(localS.updatedAt || localS.createdAt || 0).getTime();
                const serverTime = new Date(serverS.updatedAt || serverS.createdAt || 0).getTime();

                // If local has newer update or notes/fields differ and localTime >= serverTime, keep local
                if (localTime > serverTime || (localTime === serverTime && localS.notes !== serverS.notes)) {
                  mergedMap.set(localS.id, {
                    ...serverS,
                    ...localS,
                    updatedAt: localS.updatedAt || new Date().toISOString(),
                  });
                  hasNewerLocal = true;
                }
              }
            });

            const mergedList = Array.from(mergedMap.values());
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(mergedList));
            this.notify(STORAGE_KEYS.STUDENTS);

            // If we have newer local modifications (e.g. notes changed), push to server
            if (hasNewerLocal) {
              fetch('/api/students/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: mergedList, updateExisting: true }),
              }).catch(e => console.warn('Sync newer batch error:', e));
            }
          }
        }
      }
    } catch (e) {
      console.warn('[LearnBridge] Remote sync fallback to localStorage', e);
    }
  }

  // Auto-sync a single student to Supabase cloud if configured
  public async syncStudentToSupabase(student: Student): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const { getSupabaseClient } = await import('./supabaseClient.ts');
      const client = getSupabaseClient();
      if (!client) return;

      await client.from('students').upsert({
        id: student.id,
        student_code: student.studentCode,
        full_name: student.fullName,
        last_name: student.lastName || '',
        middle_name: student.middleName || '',
        first_name: student.firstName || '',
        date_of_birth: student.dateOfBirth,
        gender: student.gender,
        class_name: student.className,
        status: student.status,
        parent_name: student.parentName || '',
        phone: student.phone || '',
        address: student.address || '',
        notes: student.notes || '',
        is_demo: !!student.isDemo,
        created_at: student.createdAt,
        updated_at: student.updatedAt,
      }, { onConflict: 'id' });
    } catch (err) {
      // Silent catch if Supabase is offline
    }
  }

  // --- Students CRUD ---
  public getStudents(): Student[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return raw ? JSON.parse(raw) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  public updateStudentNote(id: string, notes: string): Student | undefined {
    const list = this.getStudents();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const now = new Date().toISOString();
    const updated: Student = {
      ...list[index],
      notes: notes.trim(),
      updatedAt: now,
    };
    list[index] = updated;
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    this.logActivity('Cập nhật ghi chú', `Cập nhật ghi chú học sinh ${updated.fullName}`, 'student');
    this.notify(STORAGE_KEYS.STUDENTS);

    // Sync to server immediately
    fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.warn('Sync student note error:', err));

    this.syncStudentToSupabase(updated);
    return updated;
  }

  public saveStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Student {
    const list = this.getStudents();
    const now = new Date().toISOString();

    if (student.id) {
      // Update
      const index = list.findIndex(s => s.id === student.id);
      if (index >= 0) {
        const updated: Student = {
          ...list[index],
          ...student,
          id: student.id,
          updatedAt: now,
        };
        list[index] = updated;
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
        this.logActivity('Cập nhật hồ sơ', `Cập nhật thông tin học sinh ${updated.fullName}`, 'student');
        this.notify(STORAGE_KEYS.STUDENTS);

        // Async sync to server
        fetch(`/api/students/${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(err => console.warn('Sync student remote error:', err));

        this.syncStudentToSupabase(updated);
        return updated;
      }
    }

    // Create
    const newId = `hs-${Date.now()}`;
    const newStudent: Student = {
      ...student,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    this.logActivity('Thêm học sinh', `Thêm mới học sinh ${newStudent.fullName} (${newStudent.studentCode})`, 'student');
    this.notify(STORAGE_KEYS.STUDENTS);

    // Async sync to server
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    }).catch(err => console.warn('Sync student remote error:', err));

    this.syncStudentToSupabase(newStudent);
    return newStudent;
  }

  public deleteStudent(id: string): boolean {
    const list = this.getStudents();
    const target = list.find(s => s.id === id);
    if (!target) return false;

    const filtered = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
    this.logActivity('Xóa học sinh', `Đã xóa học sinh ${target.fullName}`, 'student');
    this.notify(STORAGE_KEYS.STUDENTS);

    // Async sync to server
    fetch(`/api/students/${id}`, { method: 'DELETE' }).catch(err =>
      console.warn('Sync delete remote error:', err)
    );

    return true;
  }

  public importStudents(newStudents: Array<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>): { added: number; updated: number } {
    const list = this.getStudents();
    const now = new Date().toISOString();
    let added = 0;
    let updated = 0;

    for (const item of newStudents) {
      const existingIndex = list.findIndex(s => s.studentCode.trim().toLowerCase() === item.studentCode.trim().toLowerCase());
      if (existingIndex >= 0) {
        list[existingIndex] = {
          ...list[existingIndex],
          ...item,
          updatedAt: now,
        };
        updated++;
      } else {
        const id = `hs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        list.push({
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
        });
        added++;
      }
    }

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    this.logActivity('Nhập dữ liệu', `Đã nhập ${added} học sinh mới và cập nhật ${updated} học sinh từ tệp CSV/Excel`, 'system');
    this.notify(STORAGE_KEYS.STUDENTS);

    // Async sync batch to server
    fetch('/api/students/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: newStudents, updateExisting: true }),
    }).catch(err => console.warn('Sync batch remote error:', err));

    return { added, updated };
  }

  // Nạp 5 học sinh mẫu có gắn nhãn [DỮ LIỆU DEMO]
  public async loadDemoData(): Promise<Student[]> {
    try {
      const res = await fetch('/api/students/load-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.students)) {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
          this.logActivity('Nạp dữ liệu mẫu', 'Đã nạp 5 học sinh mẫu có gắn cờ [DỮ LIỆU DEMO]', 'system');
          this.notify(STORAGE_KEYS.STUDENTS);
          return data.students;
        }
      }
    } catch (e) {
      console.warn('Error loading demo data from server:', e);
    }
    return this.getStudents();
  }

  // Dọn dẹp danh sách học sinh để cô giáo nhập danh sách lớp thật
  public async clearAllStudents(): Promise<void> {
    try {
      await fetch('/api/students/clear', { method: 'POST' });
    } catch (e) {
      console.warn('Error clearing students on server:', e);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    this.logActivity('Dọn dẹp danh sách', 'Đã xóa toàn bộ học sinh để sẵn sàng nhập danh sách thật', 'system');
    this.notify(STORAGE_KEYS.STUDENTS);
  }

  // --- Attendance ---
  public getAttendance(): AttendanceRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getAttendanceByDate(date: string): AttendanceRecord[] {
    const all = this.getAttendance();
    const forDate = all.filter(a => a.date === date);
    if (forDate.length > 0) return forDate;

    // If no record exists for this date, instantiate default
    const studs = this.getStudents();
    return generateDefaultAttendance(studs, date);
  }

  public saveAttendanceBatch(records: AttendanceRecord[]): void {
    const all = this.getAttendance();
    const map = new Map<string, AttendanceRecord>();

    all.forEach(r => map.set(`${r.studentId}_${r.date}`, r));
    records.forEach(r => map.set(`${r.studentId}_${r.date}`, { ...r, updatedAt: new Date().toISOString() }));

    const updated = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    const firstDate = records[0]?.date || '';
    this.logActivity('Điểm danh', `Cập nhật điểm danh ngày ${firstDate} (${records.length} học sinh)`, 'attendance');
    this.notify(STORAGE_KEYS.ATTENDANCE);
  }

  // --- Assessments ---
  public getAssessments(): AssessmentRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveAssessment(record: Omit<AssessmentRecord, 'id' | 'updatedAt'> & { id?: string }): AssessmentRecord {
    const list = this.getAssessments();
    const now = new Date().toISOString();

    if (record.id) {
      const idx = list.findIndex(a => a.id === record.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...record, updatedAt: now };
        localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(list));
        this.logActivity('Cập nhật đánh giá', `Cập nhật kết quả môn ${record.subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}`, 'assessment');
        this.notify(STORAGE_KEYS.ASSESSMENTS);
        return list[idx];
      }
    }

    const newId = `asm-${Date.now()}`;
    const newRecord: AssessmentRecord = {
      ...record,
      id: newId,
      updatedAt: now,
    };
    list.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(list));
    this.logActivity('Nhập đánh giá', `Đánh giá môn ${record.subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}: ${record.criteriaName}`, 'assessment');
    this.notify(STORAGE_KEYS.ASSESSMENTS);
    return newRecord;
  }

  // --- Criteria ---
  public getCriteria(): Criteria[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      return raw ? JSON.parse(raw) : INITIAL_CRITERIA;
    } catch {
      return INITIAL_CRITERIA;
    }
  }

  public saveCriteria(criteria: Criteria): void {
    const list = this.getCriteria();
    const idx = list.findIndex(c => c.id === criteria.id);
    if (idx >= 0) {
      list[idx] = criteria;
    } else {
      list.push(criteria);
    }
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(list));
    this.notify(STORAGE_KEYS.CRITERIA);
  }

  // --- Assignments ---
  public getAssignments(): Assignment[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      return raw ? JSON.parse(raw) : INITIAL_ASSIGNMENTS;
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  }

  public saveAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'> & { id?: string }): Assignment {
    const list = this.getAssignments();
    const now = new Date().toISOString();

    if (assignment.id) {
      const idx = list.findIndex(a => a.id === assignment.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...assignment };
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
        this.logActivity('Cập nhật bài tập', `Cập nhật bài tập: ${assignment.title}`, 'assignment');
        this.notify(STORAGE_KEYS.ASSIGNMENTS);
        return list[idx];
      }
    }

    const newAssignment: Assignment = {
      ...assignment,
      id: `assign-${Date.now()}`,
      createdAt: now,
    };
    list.unshift(newAssignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    this.logActivity('Giao bài tập', `Tạo bài tập mới: ${newAssignment.title}`, 'assignment');
    this.notify(STORAGE_KEYS.ASSIGNMENTS);
    return newAssignment;
  }

  // --- Lessons ---
  public getLessons(): Lesson[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return raw ? JSON.parse(raw) : INITIAL_LESSONS;
    } catch {
      return INITIAL_LESSONS;
    }
  }

  public saveLesson(lesson: Lesson): void {
    const list = this.getLessons();
    const idx = list.findIndex(l => l.id === lesson.id);
    if (idx >= 0) {
      list[idx] = lesson;
    } else {
      list.push(lesson);
    }
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(list));
    this.notify(STORAGE_KEYS.LESSONS);
  }

  // --- Settings ---
  public getSettings(): ClassSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public saveSettings(settings: ClassSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.logActivity('Cài đặt hệ thống', 'Cập nhật cấu hình thông tin lớp học', 'system');
    this.notify(STORAGE_KEYS.SETTINGS);
  }

  // --- Activities ---
  public getActivities(): ActivityLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return raw ? JSON.parse(raw) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  }

  public logActivity(action: string, description: string, type: ActivityLog['type'] = 'system'): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${hours}:${minutes}`;

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      description,
      timestamp,
      type,
    };

    const current = this.getActivities();
    current.unshift(newLog);
    // Keep top 50 logs
    const trimmed = current.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(trimmed));
    this.notify(STORAGE_KEYS.ACTIVITIES);
  }

  // --- Backup & Restore ---
  public exportBackupJson(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      students: this.getStudents(),
      attendance: this.getAttendance(),
      assessments: this.getAssessments(),
      criteria: this.getCriteria(),
      assignments: this.getAssignments(),
      lessons: this.getLessons(),
      activities: this.getActivities(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.students || !Array.isArray(data.students)) {
        throw new Error('Dữ liệu sao lưu không hợp lệ: Thiếu danh sách học sinh');
      }

      if (data.students) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.attendance) localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
      if (data.assessments) localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(data.assessments));
      if (data.criteria) localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(data.criteria));
      if (data.assignments) localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(data.assignments));
      if (data.lessons) localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(data.lessons));
      if (data.activities) localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));

      this.logActivity('Khôi phục dữ liệu', 'Khôi phục toàn bộ hệ thống từ tệp sao lưu thành công', 'system');
      this.notify('*');
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  public resetToFactoryDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(INITIAL_CRITERIA));
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS));
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    const today = getTodayDateString();
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateDefaultAttendance(INITIAL_STUDENTS, today)));

    this.logActivity('Khôi phục mặc định', 'Đã đặt lại dữ liệu lớp 1/2 chuẩn ban đầu (30 học sinh)', 'system');
    this.notify('*');
  }
}

export const storage = new StorageService();
