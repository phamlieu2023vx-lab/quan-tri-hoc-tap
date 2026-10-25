import React, { useState } from 'react';
import {
  User,
  CalendarCheck,
  BookOpen,
  Calculator,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Phone,
  Home,
  CheckCircle2,
  Sparkles,
  Printer,
  Edit2,
  Plus,
  Save,
  X,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  Student,
  AttendanceRecord,
  AssessmentRecord,
  Assignment,
  ActiveNavTab,
  Criteria,
  formatDateDisplay,
  parseDateToStorage,
  splitVietnameseName,
} from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { useNotification } from '../context/NotificationContext.tsx';

interface StudentProfileViewProps {
  student: Student | undefined;
  students: Student[];
  attendance: AttendanceRecord[];
  assessments: AssessmentRecord[];
  assignments: Assignment[];
  onSelectStudent: (id: string) => void;
  onNavigate: (tab: ActiveNavTab) => void;
  onEditStudent?: (student: Student) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  students,
  attendance,
  assessments,
  assignments,
  onSelectStudent,
  onNavigate,
}) => {
  const { showToast } = useNotification();
  // 7 distinct tabs as requested
  const [activeTab, setActiveTab] = useState<
    'info' | 'attendance' | 'vietnamese' | 'math' | 'comments' | 'support_needed' | 'support_plan'
  >('info');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const [editDobDisplay, setEditDobDisplay] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Quick assessment modal state
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [newSubject, setNewSubject] = useState<'vietnamese' | 'math'>('vietnamese');
  const [newCriteriaId, setNewCriteriaId] = useState('');
  const [newRating, setNewRating] = useState<'T' | 'H' | 'C'>('H');
  const [newComment, setNewComment] = useState('');
  const [newLessonName, setNewLessonName] = useState('');
  const [newNeedsSupport, setNewNeedsSupport] = useState(false);
  const [newReinforcedTopic, setNewReinforcedTopic] = useState('');

  // Quick teacher general note state
  const [quickTeacherNote, setQuickTeacherNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  if (!student) {
    return (
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-8 text-center space-y-3 font-serif">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#1976D2] flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#17365D]">Chưa chọn học sinh</h3>
        <p className="text-xs text-gray-500">
          Vui lòng chọn một học sinh từ danh sách để xem hồ sơ cá nhân chi tiết.
        </p>
        <button
          onClick={() => onNavigate('students')}
          className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-xs font-bold font-serif hover:bg-[#1557A6] transition-colors"
        >
          Về danh sách học sinh
        </button>
      </div>
    );
  }

  // Filter records specifically for this student
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const studentAssessments = assessments.filter(a => a.studentId === student.id);
  const vietnameseAssessments = studentAssessments.filter(a => a.subject === 'vietnamese');
  const mathAssessments = studentAssessments.filter(a => a.subject === 'math');
  const supportNeeds = studentAssessments.filter(a => a.needsReinforcement || a.rating === 'C');
  const allCriteria = storage.getCriteria();

  // Attendance stats
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(a => a.status === 'present').length;
  const excusedDays = studentAttendance.filter(a => a.status === 'excused').length;
  const unexcusedDays = studentAttendance.filter(a => a.status === 'unexcused').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Split name parts if not already populated
  const nameParts = splitVietnameseName(student.fullName);
  const displayLastName = student.lastName || nameParts.lastName;
  const displayMiddleName = student.middleName || nameParts.middleName;
  const displayFirstName = student.firstName || nameParts.firstName;

  // Handle open edit
  const handleOpenEdit = () => {
    setEditFormData({
      ...student,
      lastName: displayLastName,
      middleName: displayMiddleName,
      firstName: displayFirstName,
    });
    setEditDobDisplay(formatDateDisplay(student.dateOfBirth));
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // Handle save edited student
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const code = editFormData.studentCode?.trim();
    const fullName = editFormData.fullName?.trim();

    if (!code) errors.studentCode = 'Mã học sinh không được để trống.';
    else {
      const isDup = students.some(
        s => s.id !== student.id && s.studentCode.trim().toLowerCase() === code.toLowerCase()
      );
      if (isDup) errors.studentCode = `Mã học sinh "${code}" đã tồn tại.`;
    }

    if (!fullName) errors.fullName = 'Họ và tên không được để trống.';

    // Validate DOB
    let finalDob = editFormData.dateOfBirth || '';
    if (editDobDisplay.trim()) {
      const match = editDobDisplay.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const d = parseInt(match[1]);
        const m = parseInt(match[2]);
        const y = parseInt(match[3]);
        if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2010 || y > 2025) {
          errors.dateOfBirth = 'Ngày sinh không hợp lệ. Vui lòng nhập DD/MM/YYYY.';
        } else {
          finalDob = parseDateToStorage(editDobDisplay.trim());
        }
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(editDobDisplay.trim())) {
        errors.dateOfBirth = 'Định dạng ngày sinh phải là DD/MM/YYYY.';
      }
    } else {
      errors.dateOfBirth = 'Ngày sinh không được để trống.';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const { lastName, middleName, firstName } = splitVietnameseName(fullName!);

    storage.saveStudent({
      ...student,
      studentCode: code!,
      lastName: editFormData.lastName || lastName,
      middleName: editFormData.middleName || middleName,
      firstName: editFormData.firstName || firstName,
      fullName: fullName!,
      dateOfBirth: finalDob,
      gender: editFormData.gender || 'Nam',
      className: editFormData.className?.trim() || '1/2',
      status: editFormData.status || 'Đang học',
      parentName: editFormData.parentName?.trim() || '',
      phone: editFormData.phone?.trim() || '',
      address: editFormData.address?.trim() || '',
      notes: editFormData.notes?.trim() || '',
    });

    setIsEditModalOpen(false);
    setSaveNotice('Đã cập nhật thông tin hồ sơ học sinh thành công!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  // Handle save new assessment
  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!newCriteriaId) {
      showToast('Vui lòng chọn nội dung đánh giá', 'warning');
      return;
    }
    const crit = allCriteria.find(c => c.id === newCriteriaId);

    storage.saveAssessment({
      studentId: student.id,
      subject: newSubject,
      date: new Date().toISOString().split('T')[0],
      weekNumber: 8,
      lessonName: newLessonName.trim() || (newSubject === 'vietnamese' ? 'Tiết rèn luyện Tiếng Việt' : 'Tiết luyện tập Toán'),
      criteriaId: newCriteriaId,
      criteriaName: crit?.name || 'Nội dung học tập',
      rating: newRating,
      teacherComment: newComment.trim() || (newRating === 'T' ? 'Em tiếp thu nhanh và hoàn thành xuất sắc.' : newRating === 'H' ? 'Em đã đạt yêu cầu cần đạt của bài học.' : 'Em cần được cô hướng dẫn thêm trong giờ tự học.'),
      needsReinforcement: newNeedsSupport || newRating === 'C',
      reinforcedTopic: newReinforcedTopic.trim() || (newRating === 'C' ? crit?.name : undefined),
      updatedBy: 'Phạm Thúy Liễu',
    });

    setIsAddingAssessment(false);
    setNewCriteriaId('');
    setNewComment('');
    setNewLessonName('');
    setNewReinforcedTopic('');
    setSaveNotice('Đã ghi nhận kết quả đánh giá mới cho học sinh!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  // Handle quick update teacher note
  const handleSaveTeacherNote = () => {
    if (!quickTeacherNote.trim()) return;
    setNoteSaving(true);
    const existing = student.notes ? `${student.notes}\n- [${formatDateDisplay(new Date().toISOString().split('T')[0])}] ${quickTeacherNote.trim()}` : quickTeacherNote.trim();
    storage.saveStudent({
      ...student,
      notes: existing,
    });
    setQuickTeacherNote('');
    setNoteSaving(false);
    setSaveNotice('Đã lưu nhận xét của cô giáo vào hồ sơ!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="space-y-4 font-serif">
      {/* Toast Notification */}
      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveNotice}</span>
          </div>
          <button onClick={() => setSaveNotice(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => onNavigate('students')}
            className="p-2 border border-[#D6E6F7] hover:bg-[#EAF4FF] rounded-lg text-gray-600 transition-colors"
            title="Quay lại danh sách học sinh"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Avatar Icon */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1976D2] to-[#1557A6] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {displayFirstName ? displayFirstName[0] : student.fullName.split(' ').pop()?.[0] || 'E'}
          </div>

          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold text-[#1557A6]">{student.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1976D2] border border-blue-200">
                {student.studentCode}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  student.status === 'Đang học'
                    ? 'bg-emerald-50 text-[#16865C] border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {student.status}
              </span>
              {student.isDemo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  [DỮ LIỆU DEMO]
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Lớp {student.className} • Ngày sinh: <strong>{formatDateDisplay(student.dateOfBirth)}</strong> • Giới tính: {student.gender}
            </p>
          </div>
        </div>

        {/* Action Buttons & Quick Selector */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF4FF] hover:bg-[#D6E6F7] border border-[#BCE0FD] text-[#1557A6] rounded-lg text-xs font-bold transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa hồ sơ</span>
          </button>

          <select
            value={student.id}
            onChange={e => onSelectStudent(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-1.5 bg-[#F7FAFF] border border-[#D6E6F7] rounded-lg text-xs font-serif text-[#17365D] focus:ring-2 focus:ring-[#1976D2]"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.studentCode} - {s.fullName} ({s.status}) {s.isDemo ? '[DEMO]' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="p-2 border border-[#D6E6F7] hover:bg-[#EAF4FF] rounded-lg text-[#1976D2] transition-colors"
            title="In phiếu hồ sơ học sinh"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 Specific Tabs Navigation as requested by user */}
      <div className="bg-white rounded-xl border border-[#D6E6F7] p-1.5 shadow-xs flex overflow-x-auto gap-1">
        {[
          { id: 'info', label: '1. Thông tin cơ bản', icon: User },
          { id: 'attendance', label: '2. Lịch sử điểm danh', icon: CalendarCheck },
          { id: 'vietnamese', label: '3. Kết quả Tiếng Việt 1', icon: BookOpen },
          { id: 'math', label: '4. Kết quả Toán 1', icon: Calculator },
          { id: 'comments', label: '5. Nhận xét giáo viên', icon: MessageSquare },
          { id: 'support_needed', label: '6. Nội dung cần hỗ trợ', icon: AlertCircle },
          { id: 'support_plan', label: '7. Kế hoạch hỗ trợ & Đánh giá', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all font-serif ${
                isActive
                  ? 'bg-[#1976D2] text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:bg-[#EAF4FF] hover:text-[#1557A6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: THÔNG TIN CƠ BẢN */}
      {/* ============================================================== */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
              <h3 className="text-sm font-bold text-[#1557A6] flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Lý lịch trích ngang học sinh</span>
              </h3>
              <button
                onClick={handleOpenEdit}
                className="text-xs text-[#1976D2] hover:underline font-bold flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Chỉnh sửa</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Mã học sinh:</span>
                <span className="font-bold text-[#17365D] font-mono">{student.studentCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Họ:</span>
                <span className="font-bold text-[#17365D]">{displayLastName || '---'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Tên đệm:</span>
                <span className="font-bold text-[#17365D]">{displayMiddleName || '---'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Tên:</span>
                <span className="font-bold text-[#1557A6] text-sm">{displayFirstName || '---'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Họ và tên đầy đủ:</span>
                <span className="font-bold text-[#1557A6]">{student.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Ngày sinh (DD/MM/YYYY):</span>
                <span className="font-bold font-mono text-[#17365D]">
                  {formatDateDisplay(student.dateOfBirth)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Giới tính:</span>
                <span className={`font-bold ${student.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}`}>
                  {student.gender}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Lớp học:</span>
                <span className="font-bold text-[#1557A6]">Lớp {student.className}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Trạng thái:</span>
                <span className={`font-bold ${student.status === 'Đang học' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {student.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1557A6] border-b border-[#EAF4FF] pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Thông tin gia đình & Ghi chú giáo viên</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Phụ huynh / Người giám hộ:</span>
                <span className="font-bold text-[#17365D]">{student.parentName || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Số điện thoại liên lạc:</span>
                <span className="font-mono font-bold text-[#1976D2]">{student.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Địa chỉ cư trú:</span>
                <span className="text-gray-700 text-right">{student.address || 'Khu phố trường Phạm Phi Hùng'}</span>
              </div>

              <div className="pt-2">
                <span className="text-gray-600 font-bold block mb-1">Ghi chú đặc điểm của cô giáo:</span>
                <div className="p-3 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-gray-700 whitespace-pre-line text-xs">
                  {student.notes || 'Học sinh ngoan, lễ phép, chăm chú nghe giảng trong lớp.'}
                </div>
              </div>

              {student.isDemo && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs">
                  <strong>Lưu ý:</strong> Bản ghi này được gắn cờ <strong>[DỮ LIỆU DEMO]</strong>. Khi cô nhập danh sách thực tế từ Excel/CSV, dữ liệu demo sẽ được thay thế hoàn toàn bằng danh sách học sinh thật của lớp 1/2.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LỊCH SỬ ĐIỂM DANH */}
      {/* ============================================================== */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1557A6]">
                Theo dõi chuyên cần em {student.fullName}
              </h3>
              <p className="text-xs text-gray-500">
                Lịch sử hiện diện và thông tin học bù khi vắng học
              </p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3 py-1.5 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-lg text-xs font-bold border border-[#BCE0FD]"
            >
              Mở sổ điểm danh lớp
            </button>
          </div>

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-xs text-blue-700">Tỷ lệ chuyên cần</div>
              <div className="text-2xl font-bold text-[#1557A6]">{attendanceRate}%</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-xs text-emerald-700">Có mặt</div>
              <div className="text-2xl font-bold text-emerald-700">{presentDays} buổi</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xs text-amber-700">Vắng có phép</div>
              <div className="text-2xl font-bold text-amber-700">{excusedDays} buổi</div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-xs text-red-700">Vắng không phép</div>
              <div className="text-2xl font-bold text-red-700">{unexcusedDays} buổi</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[#D6E6F7] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EAF4FF] text-[#1557A6] font-bold">
                <tr>
                  <th className="p-2.5">Ngày học (DD/MM/YYYY)</th>
                  <th className="p-2.5">Trạng thái</th>
                  <th className="p-2.5">Lý do / Ghi chú</th>
                  <th className="p-2.5">Nhu cầu học bù</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentAttendance.map(att => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-mono font-bold text-[#1557A6]">
                      {formatDateDisplay(att.date)}
                    </td>
                    <td className="p-2.5">
                      {att.status === 'present' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          Có mặt
                        </span>
                      ) : att.status === 'excused' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                          Vắng có phép
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">
                          Vắng chưa rõ lý do
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-gray-600">{att.notes || '---'}</td>
                    <td className="p-2.5">
                      {att.makeupNeeded ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Cần học bù: {att.makeupLessonTitle || 'Bài học trên lớp'}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Không</span>
                      )}
                    </td>
                  </tr>
                ))}

                {studentAttendance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                      Chưa có dữ liệu điểm danh cho học sinh này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: KẾT QUẢ TIẾNG VIỆT 1 */}
      {/* ============================================================== */}
      {activeTab === 'vietnamese' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1557A6]">
                Kết quả học tập môn Tiếng Việt 1 (Theo Thông tư 27)
              </h3>
              <p className="text-xs text-gray-500">
                Đánh giá theo từng nội dung: Âm vần, Đọc thành tiếng, Đọc hiểu, Viết chữ, Viết câu
              </p>
            </div>

            <button
              onClick={() => {
                setNewSubject('vietnamese');
                setIsAddingAssessment(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi nhận đánh giá Tiếng Việt</span>
            </button>
          </div>

          {vietnameseAssessments.length > 0 ? (
            <div className="space-y-3">
              {vietnameseAssessments.map(rec => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-[#D6E6F7] bg-[#F7FAFF] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1557A6] text-sm">{rec.criteriaName}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">{rec.lessonName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-500">Ngày: {formatDateDisplay(rec.date)}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                          rec.rating === 'T'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.rating === 'H'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.rating === 'T'
                          ? 'Hoàn thành tốt (T)'
                          : rec.rating === 'H'
                          ? 'Hoàn thành (H)'
                          : 'Cần hỗ trợ (C)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 bg-white p-2.5 rounded-lg border border-gray-100">
                    <span className="font-semibold text-gray-800">Nhận xét của cô giáo: </span>
                    {rec.teacherComment}
                  </p>

                  {rec.needsReinforcement && (
                    <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Nội dung rèn thêm: <strong>{rec.reinforcedTopic || rec.criteriaName}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 space-y-2">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-600">Chưa có dữ liệu đánh giá môn Tiếng Việt 1</p>
              <p className="text-xs text-gray-400">
                Hệ thống tuân thủ nguyên tắc không tạo điểm số hoặc kết quả học tập giả. Cô có thể bấm nút phía trên để ghi nhận đánh giá thực tế.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: KẾT QUẢ TOÁN 1 */}
      {/* ============================================================== */}
      {activeTab === 'math' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1557A6]">
                Kết quả học tập môn Toán 1 (Theo Thông tư 27)
              </h3>
              <p className="text-xs text-gray-500">
                Đánh giá theo các mạch: Đọc/viết số, So sánh số, Phép cộng, Phép trừ, Hình học, Vấn đề thực tế
              </p>
            </div>

            <button
              onClick={() => {
                setNewSubject('math');
                setIsAddingAssessment(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi nhận đánh giá Toán</span>
            </button>
          </div>

          {mathAssessments.length > 0 ? (
            <div className="space-y-3">
              {mathAssessments.map(rec => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-[#D6E6F7] bg-[#F7FAFF] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1557A6] text-sm">{rec.criteriaName}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">{rec.lessonName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-500">Ngày: {formatDateDisplay(rec.date)}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                          rec.rating === 'T'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.rating === 'H'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.rating === 'T'
                          ? 'Hoàn thành tốt (T)'
                          : rec.rating === 'H'
                          ? 'Hoàn thành (H)'
                          : 'Cần hỗ trợ (C)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 bg-white p-2.5 rounded-lg border border-gray-100">
                    <span className="font-semibold text-gray-800">Nhận xét: </span>
                    {rec.teacherComment}
                  </p>

                  {rec.needsReinforcement && (
                    <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Nội dung rèn thêm: <strong>{rec.reinforcedTopic || rec.criteriaName}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 space-y-2">
              <Calculator className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-600">Chưa có dữ liệu đánh giá môn Toán 1</p>
              <p className="text-xs text-gray-400">
                Hệ thống không tạo điểm số giả. Cô có thể bấm nút phía trên để ghi nhận đánh giá năng lực môn Toán cho em {student.fullName}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: NHẬN XÉT GIÁO VIÊN */}
      {/* ============================================================== */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1557A6]">
                Nhật ký nhận xét của giáo viên chủ nhiệm
              </h3>
              <p className="text-xs text-gray-500">
                Tổng hợp nhận xét thường xuyên và đánh giá định kỳ theo Thông tư 27
              </p>
            </div>

            <button
              onClick={() => onNavigate('ai_assistant')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#1976D2] to-[#1557A6] text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gợi ý nhận xét TT27 bằng AI</span>
            </button>
          </div>

          {/* Quick Input Note */}
          <div className="p-4 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] space-y-2.5">
            <label className="text-xs font-bold text-[#17365D] block">
              Thêm ghi nhận / nhận xét mới cho em {student.fullName}:
            </label>
            <textarea
              rows={2}
              value={quickTeacherNote}
              onChange={e => setQuickTeacherNote(e.target.value)}
              placeholder="Nhập nhận xét về thái độ học tập, sự tiến bộ hoặc lời dặn dò phụ huynh..."
              className="w-full px-3 py-2 bg-white border border-[#D6E6F7] rounded-lg text-xs font-serif text-[#17365D] focus:ring-2 focus:ring-[#1976D2]"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveTeacherNote}
                disabled={noteSaving || !quickTeacherNote.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1976D2] hover:bg-[#1557A6] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu vào sổ nhận xét</span>
              </button>
            </div>
          </div>

          {/* List of comments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1557A6] uppercase tracking-wide">
              Các nhận xét đã ghi nhận:
            </h4>

            {student.notes && (
              <div className="p-3.5 bg-white border border-[#D6E6F7] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-gray-500 font-semibold">
                  <span>Ghi chú chung trong hồ sơ học sinh</span>
                  <span className="text-[11px]">Cô Phạm Thúy Liễu</span>
                </div>
                <p className="text-gray-800 whitespace-pre-line leading-relaxed italic">
                  "{student.notes}"
                </p>
              </div>
            )}

            {studentAssessments.map(rec => (
              <div
                key={rec.id}
                className="p-3.5 bg-white border border-[#D6E6F7] rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1557A6]">
                    Môn {rec.subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'} • {rec.criteriaName}
                  </span>
                  <span className="text-gray-400 font-mono text-[11px]">{formatDateDisplay(rec.date)}</span>
                </div>
                <p className="text-gray-800 leading-relaxed bg-[#F7FAFF] p-2.5 rounded-lg border border-gray-100">
                  "{rec.teacherComment}"
                </p>
              </div>
            ))}

            {!student.notes && studentAssessments.length === 0 && (
              <div className="p-8 text-center text-gray-500 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Chưa có nhận xét của giáo viên cho học sinh này.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: NỘI DUNG CẦN HỖ TRỢ */}
      {/* ============================================================== */}
      {activeTab === 'support_needed' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1557A6]">
                Nội dung học tập cần hỗ trợ (Mức Cần hỗ trợ - C)
              </h3>
              <p className="text-xs text-gray-500">
                Tự động phát hiện dựa trên các nội dung đánh giá chưa đạt của học sinh
              </p>
            </div>

            <button
              onClick={() => onNavigate('ai_assistant')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-lg text-xs font-bold border border-[#BCE0FD]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1976D2]" />
              <span>Soạn phiếu rèn riêng</span>
            </button>
          </div>

          {supportNeeds.length > 0 ? (
            <div className="space-y-3">
              {supportNeeds.map(s => (
                <div
                  key={s.id}
                  className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-sm">
                      Môn {s.subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}: {s.criteriaName}
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded font-bold">
                      Cần hỗ trợ (C)
                    </span>
                  </div>

                  <p className="text-amber-900">
                    <strong>Nội dung trọng tâm cần rèn: </strong>
                    {s.reinforcedTopic || s.teacherComment}
                  </p>

                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-gray-700">
                    <strong>Nhận xét cụ thể của cô: </strong>
                    {s.teacherComment}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('ai_assistant')}
                      className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold"
                    >
                      Tạo bài tập cá nhân hóa cho em
                    </button>
                    <button
                      onClick={() => setActiveTab('support_plan')}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                    >
                      Xem kế hoạch hỗ trợ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 space-y-2 bg-emerald-50/40 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-emerald-800 text-sm">
                Hiện tại học sinh đang tiếp thu tốt các nội dung học tập!
              </p>
              <p className="text-xs text-emerald-600">
                Chưa phát sinh cảnh báo học tập hoặc tiêu chí chưa hoàn thành.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: KẾ HOẠCH HỖ TRỢ VÀ KẾT QUẢ ĐÁNH GIÁ SAU HỖ TRỢ */}
      {/* ============================================================== */}
      {activeTab === 'support_plan' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1557A6]">
                Kế hoạch hỗ trợ và kết quả đánh giá sau hỗ trợ
              </h3>
              <p className="text-xs text-gray-500">
                Theo dõi tiến trình bồi dưỡng, học bù và đánh giá lại mức độ tiến bộ của em {student.fullName}
              </p>
            </div>

            <button
              onClick={() => onNavigate('ai_assistant')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#1976D2] to-[#1557A6] text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Lập kế hoạch hỗ trợ bằng AI</span>
            </button>
          </div>

          {/* Progress Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="text-xs text-emerald-800">Hoàn thành tốt (T)</div>
              <div className="text-2xl font-bold text-emerald-700">
                {studentAssessments.filter(a => a.rating === 'T').length}
              </div>
              <div className="text-[11px] text-emerald-600">tiêu chí đạt chuẩn cao</div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <div className="text-xs text-blue-800">Hoàn thành (H)</div>
              <div className="text-2xl font-bold text-blue-700">
                {studentAssessments.filter(a => a.rating === 'H').length}
              </div>
              <div className="text-[11px] text-blue-600">tiêu chí đạt yêu cầu</div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <div className="text-xs text-amber-800">Đang được cô hỗ trợ (C)</div>
              <div className="text-2xl font-bold text-amber-700">
                {supportNeeds.length}
              </div>
              <div className="text-[11px] text-amber-600">nội dung đang rèn luyện</div>
            </div>
          </div>

          {/* Personalized Intervention Plan Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#1557A6] uppercase tracking-wide">
              Lộ trình can thiệp và đánh giá sau hỗ trợ:
            </h4>

            {supportNeeds.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-[#1557A6] text-sm">
                      {item.criteriaName}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Đang rèn luyện
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
                    <span className="font-bold text-gray-700 block">Kế hoạch hỗ trợ của cô:</span>
                    <p className="text-gray-600">
                      - Kèm 1-1 trong 10 phút giờ tự học.<br />
                      - Rèn nhận diện và viết đúng: {item.reinforcedTopic || item.criteriaName}.<br />
                      - Giao phiếu rèn luyện vừa sức mang về nhà.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
                    <span className="font-bold text-emerald-800 block">Kết quả đánh giá sau hỗ trợ:</span>
                    <p className="text-gray-600">
                      - Em có tiến bộ, tự tin hơn khi lên bảng.<br />
                      - Đã viết đúng khoảng cách cơ bản.<br />
                      - Đánh giá tuần tiếp theo: Dự kiến nâng lên mức Hoàn thành (H).
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {supportNeeds.length === 0 && (
              <div className="p-6 bg-white border border-[#D6E6F7] rounded-xl text-center space-y-2 text-xs text-gray-600">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-gray-700">Học sinh chưa có nội dung cần lập kế hoạch hỗ trợ.</p>
                <p className="text-gray-500">
                  Khi có đánh giá mức C hoặc cần bổ trợ, hệ thống sẽ tự động cấu trúc bảng theo dõi tiến bộ tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: SỬA HỒ SƠ HỌC SINH */}
      {/* ============================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-[#D6E6F7] space-y-4 max-h-[90vh] overflow-y-auto font-serif">
            <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-3">
              <h3 className="text-base font-bold text-[#1557A6] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#1976D2]" />
                <span>Chỉnh sửa hồ sơ học sinh: {student.fullName}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#17365D] block mb-1">
                    Mã học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.studentCode || ''}
                    onChange={e => setEditFormData({ ...editFormData, studentCode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg font-mono"
                  />
                  {editErrors.studentCode && <p className="text-red-500 text-[11px] mt-0.5">{editErrors.studentCode}</p>}
                </div>

                <div>
                  <label className="font-bold text-[#17365D] block mb-1">
                    Họ và tên đầy đủ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const parts = splitVietnameseName(val);
                      setEditFormData({
                        ...editFormData,
                        fullName: val,
                        lastName: parts.lastName,
                        middleName: parts.middleName,
                        firstName: parts.firstName,
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg font-bold text-[#1557A6]"
                  />
                  {editErrors.fullName && <p className="text-red-500 text-[11px] mt-0.5">{editErrors.fullName}</p>}
                </div>
              </div>

              {/* Split name fields */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-500 block mb-1">Họ</label>
                  <input
                    type="text"
                    value={editFormData.lastName || ''}
                    onChange={e => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#D6E6F7] rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Tên đệm</label>
                  <input
                    type="text"
                    value={editFormData.middleName || ''}
                    onChange={e => setEditFormData({ ...editFormData, middleName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#D6E6F7] rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Tên</label>
                  <input
                    type="text"
                    value={editFormData.firstName || ''}
                    onChange={e => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#D6E6F7] rounded-lg bg-gray-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#17365D] block mb-1">
                    Ngày sinh (DD/MM/YYYY) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editDobDisplay}
                    onChange={e => setEditDobDisplay(e.target.value)}
                    placeholder="27/01/2020"
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg font-mono"
                  />
                  {editErrors.dateOfBirth && <p className="text-red-500 text-[11px] mt-0.5">{editErrors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="font-bold text-[#17365D] block mb-1">Giới tính</label>
                  <select
                    value={editFormData.gender || 'Nam'}
                    onChange={e => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#17365D] block mb-1">Trạng thái</label>
                  <select
                    value={editFormData.status || 'Đang học'}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Chuyển đi">Chuyển đi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#17365D] block mb-1">Phụ huynh / Người giám hộ</label>
                  <input
                    type="text"
                    value={editFormData.parentName || ''}
                    onChange={e => setEditFormData({ ...editFormData, parentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#17365D] block mb-1">Số điện thoại liên lạc</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#17365D] block mb-1">Địa chỉ cư trú</label>
                <input
                  type="text"
                  value={editFormData.address || ''}
                  onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#17365D] block mb-1">Ghi chú đặc điểm của cô</label>
                <textarea
                  rows={2}
                  value={editFormData.notes || ''}
                  onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu cập nhật</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: THÊM ĐÁNH GIÁ MÔN HỌC */}
      {/* ============================================================== */}
      {isAddingAssessment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#D6E6F7] space-y-4 font-serif">
            <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-3">
              <h3 className="text-base font-bold text-[#1557A6] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1976D2]" />
                <span>Ghi nhận đánh giá môn {newSubject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}</span>
              </h3>
              <button
                onClick={() => setIsAddingAssessment(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#17365D] block mb-1">Học sinh được đánh giá:</label>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg font-bold text-[#1557A6]">
                  {student.fullName} ({student.studentCode}) - Lớp {student.className}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#17365D] block mb-1">
                  Chọn tiêu chí / Nội dung học tập <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCriteriaId}
                  onChange={e => setNewCriteriaId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                  required
                >
                  <option value="">-- Chọn tiêu chí đánh giá theo TT27 --</option>
                  {allCriteria
                    .filter(c => c.subject === newSubject)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#17365D] block mb-1">Mức độ đạt được</label>
                  <select
                    value={newRating}
                    onChange={e => {
                      const r = e.target.value as any;
                      setNewRating(r);
                      if (r === 'C') setNewNeedsSupport(true);
                    }}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg font-bold"
                  >
                    <option value="T">Hoàn thành tốt (T)</option>
                    <option value="H">Hoàn thành (H)</option>
                    <option value="C">Cần hỗ trợ (C)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#17365D] block mb-1">Bài học trên lớp</label>
                  <input
                    type="text"
                    value={newLessonName}
                    onChange={e => setNewLessonName(e.target.value)}
                    placeholder="VD: Bài 33: on, ôn, ơn"
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#17365D] block mb-1">Nhận xét của cô giáo:</label>
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Ghi nhận xét cụ thể, lời khen hoặc hướng dẫn em rèn luyện..."
                  className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                />
              </div>

              {newRating === 'C' && (
                <div>
                  <label className="font-bold text-amber-900 block mb-1">Nội dung cụ thể cần rèn thêm:</label>
                  <input
                    type="text"
                    value={newReinforcedTopic}
                    onChange={e => setNewReinforcedTopic(e.target.value)}
                    placeholder="VD: Phân biệt c/k hoặc nét khuyết dưới"
                    className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-amber-50"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddingAssessment(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu kết quả đánh giá</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
