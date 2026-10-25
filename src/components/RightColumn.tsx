import React, { useState } from 'react';
import {
  GraduationCap,
  Building,
  User,
  Users2,
  Calendar,
  BookOpen,
  Calculator,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  Users,
  CalendarCheck,
  FileEdit,
  FileText,
  Bot,
  BarChart3,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Check,
  Zap,
  Sliders,
  ChevronRight,
  Layers,
  CheckSquare,
  Type,
} from 'lucide-react';
import {
  ClassSettings,
  ActivityLog,
  ActiveNavTab,
  Student,
  AttendanceRecord,
  AssessmentRecord,
  Assignment,
  Lesson,
} from '../types/index.ts';

interface RightColumnProps {
  activeTab: ActiveNavTab;
  settings: ClassSettings;
  activities: ActivityLog[];
  onNavigate: (tab: ActiveNavTab) => void;
  students?: Student[];
  attendance?: AttendanceRecord[];
  assessments?: AssessmentRecord[];
  assignments?: Assignment[];
  lessons?: Lesson[];
  actualTotalStudents?: number;
  vietnameseStats?: { assessed: number; needsSupport: number };
  mathStats?: { assessed: number; needsSupport: number };
  onExportBackup?: () => void;
  onToggleFontMode?: () => void;
  onTriggerMakeup?: (studentName: string, date: string) => void;
}

export const RightColumn: React.FC<RightColumnProps> = ({
  activeTab,
  settings,
  activities,
  onNavigate,
  students = [],
  attendance = [],
  assessments = [],
  assignments = [],
  lessons = [],
  actualTotalStudents,
  vietnameseStats,
  mathStats,
  onExportBackup,
  onToggleFontMode,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'module_functions' | 'class_info'>('module_functions');

  const currentTotal = actualTotalStudents !== undefined ? actualTotalStudents : (students.length || settings.totalStudents);
  const boysCount = students.filter(s => s.gender === 'Nam').length;
  const girlsCount = students.filter(s => s.gender === 'Nữ').length;

  // Attendance metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = attendance.filter(a => a.date === todayStr);
  const presentCount = todayRecords.filter(a => a.status === 'present').length;
  const absentCount = todayRecords.filter(a => a.status !== 'present').length;
  const attendanceRate = currentTotal > 0 ? Math.round((presentCount / currentTotal) * 100) : 100;

  // Assessments metrics
  const vnAssessed = vietnameseStats?.assessed ?? assessments.filter(a => a.subject === 'vietnamese').length;
  const vnNeedsSupport = vietnameseStats?.needsSupport ?? assessments.filter(a => a.subject === 'vietnamese' && (a.rating === 'C' || a.needsReinforcement)).length;
  const mathAssessed = mathStats?.assessed ?? assessments.filter(a => a.subject === 'math').length;
  const mathNeedsSupport = mathStats?.needsSupport ?? assessments.filter(a => a.subject === 'math' && (a.rating === 'C' || a.needsReinforcement)).length;

  // Identify current module category from activeTab
  const getModuleCategory = (tab: ActiveNavTab): {
    key: string;
    name: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgSoft: string;
    borderColor: string;
    description: string;
  } => {
    if (tab.startsWith('students')) {
      return {
        key: 'students',
        name: 'Quản lý học sinh',
        badge: 'Phân hệ Học sinh',
        icon: Users,
        accentColor: 'text-[#1976D2]',
        bgSoft: 'bg-[#EAF4FF]',
        borderColor: 'border-[#B8D8F8]',
        description: 'Quản lý thông tin, danh sách và hồ sơ học bạ học sinh',
      };
    }
    if (tab.startsWith('attendance')) {
      return {
        key: 'attendance',
        name: 'Điểm danh & Chuyên cần',
        badge: 'Phân hệ Điểm danh',
        icon: CalendarCheck,
        accentColor: 'text-[#1976D2]',
        bgSoft: 'bg-[#EAF4FF]',
        borderColor: 'border-[#B8D8F8]',
        description: 'Ghi nhận sĩ số, theo dõi học sinh vắng và kích hoạt học bù',
      };
    }
    if (tab.startsWith('vietnamese')) {
      return {
        key: 'vietnamese',
        name: 'Kết quả môn Tiếng Việt',
        badge: 'Phân hệ Tiếng Việt',
        icon: BookOpen,
        accentColor: 'text-[#1976D2]',
        bgSoft: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Đánh giá định kỳ theo Thông tư 27 (Đọc, Viết, Nói & Nghe)',
      };
    }
    if (tab.startsWith('math')) {
      return {
        key: 'math',
        name: 'Kết quả môn Toán',
        badge: 'Phân hệ Toán học',
        icon: Calculator,
        accentColor: 'text-[#16865C]',
        bgSoft: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        description: 'Đánh giá các mạch kiến thức: Số học, Hình học & Đo lường',
      };
    }
    if (tab.startsWith('assignments')) {
      return {
        key: 'assignments',
        name: 'Bài tập & Rèn luyện',
        badge: 'Phân hệ Bài tập',
        icon: FileEdit,
        accentColor: 'text-indigo-600',
        bgSoft: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        description: 'Giao bài tập, tạo phiếu rèn luyện và theo dõi kết quả làm bài',
      };
    }
    if (tab === 'lessons') {
      return {
        key: 'lessons',
        name: 'Nội dung học tập',
        badge: 'Phân hệ Giáo án',
        icon: FileText,
        accentColor: 'text-amber-600',
        bgSoft: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description: 'Kế hoạch bài học theo tuần và phân phối chương trình',
      };
    }
    if (tab === 'ai_assistant') {
      return {
        key: 'ai_assistant',
        name: 'Trợ lý AI Giáo viên',
        badge: 'Phân hệ Trí tuệ AI',
        icon: Bot,
        accentColor: 'text-purple-600',
        bgSoft: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Soạn bài học bù tự động, gợi ý nhận xét học bạ TT27',
      };
    }
    if (tab === 'reports') {
      return {
        key: 'reports',
        name: 'Báo cáo & Thống kê',
        badge: 'Phân hệ Báo cáo',
        icon: BarChart3,
        accentColor: 'text-teal-600',
        bgSoft: 'bg-teal-50',
        borderColor: 'border-teal-200',
        description: 'Tổng hợp số liệu chất lượng giáo dục, chuyên cần & in báo cáo',
      };
    }
    if (tab === 'settings') {
      return {
        key: 'settings',
        name: 'Cài đặt hệ thống',
        badge: 'Phân hệ Cài đặt',
        icon: Settings,
        accentColor: 'text-slate-600',
        bgSoft: 'bg-slate-50',
        borderColor: 'border-slate-200',
        description: 'Thông tin lớp học, cấu hình hiển thị và sao lưu dữ liệu',
      };
    }

    // Default: Dashboard
    return {
      key: 'dashboard',
      name: 'Trang chủ hệ thống',
      badge: 'Bảng điều khiển',
      icon: Layers,
      accentColor: 'text-[#1976D2]',
      bgSoft: 'bg-[#EAF4FF]',
      borderColor: 'border-[#B8D8F8]',
      description: 'Tổng quan tất cả các phân hệ chức năng và hoạt động lớp học',
    };
  };

  const moduleInfo = getModuleCategory(activeTab);
  const ModuleIcon = moduleInfo.icon;

  return (
    <div className="w-80 flex-shrink-0 space-y-4">
      {/* 1. Header Mode Switcher: "Chức năng phân hệ" VS "Thông tin lớp & Nhật ký" */}
      <div className="bg-white rounded-xl border border-[#D6E6F7] p-1.5 shadow-xs flex items-center gap-1 font-serif text-xs">
        <button
          type="button"
          onClick={() => setActiveTabMode('module_functions')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTabMode === 'module_functions'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#1557A6] hover:bg-[#F7FAFF]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Chức năng phân hệ</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTabMode('class_info')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTabMode === 'class_info'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#1557A6] hover:bg-[#F7FAFF]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Thông tin & Nhật ký</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DYNAMIC MODULE FUNCTIONS & TOOLS (PRIMARY FOCUS) */}
      {/* ======================================================== */}
      {activeTabMode === 'module_functions' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Active Module Header Card */}
          <div className={`rounded-xl border ${moduleInfo.borderColor} ${moduleInfo.bgSoft} p-3.5 shadow-xs`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white shadow-2xs flex items-center justify-center flex-shrink-0 border border-white/60">
                  <ModuleIcon className={`w-5 h-5 ${moduleInfo.accentColor}`} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200/60 inline-block">
                    {moduleInfo.badge}
                  </span>
                  <h3 className="font-bold text-sm text-[#17365D] font-serif leading-tight mt-0.5">
                    {moduleInfo.name}
                  </h3>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 mt-2 font-serif leading-relaxed">
              {moduleInfo.description}
            </p>
          </div>

          {/* Module-Specific Features & Interactive Action Panels */}
          {/* --- A. QUẢN LÝ HỌC SINH --- */}
          {moduleInfo.key === 'students' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-[#1557A6] uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#1976D2]" />
                  Chức năng Quản lý học sinh
                </span>
                <span className="text-[11px] bg-blue-50 text-[#1976D2] px-2 py-0.5 rounded-full font-bold">
                  {students.length} HS
                </span>
              </div>

              {/* Functional Sub-menu items */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('students')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'students'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1976D2]" />
                    <span>Danh sách học sinh lớp</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('students_add')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'students_add'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Thêm học sinh mới</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Mới</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('students_import')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'students_import'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Nhập từ file Excel / CSV</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-[#1976D2] px-1.5 py-0.5 rounded font-bold">Tải lên</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student_profile')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'student_profile'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Hồ sơ & học bạ chi tiết</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Quick Actions & Metric Bar */}
              <div className="pt-2 border-t border-[#EAF4FF] space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                  Tác vụ & Thống kê nhanh
                </span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="text-[11px] text-gray-600 block">Nam</span>
                    <strong className="text-sm font-bold text-[#1976D2]">{boysCount} em</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-pink-50/70 border border-pink-100">
                    <span className="text-[11px] text-gray-600 block">Nữ</span>
                    <strong className="text-sm font-bold text-pink-600">{girlsCount} em</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('students_add')}
                  className="w-full py-2 px-3 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm học sinh vào lớp</span>
                </button>
              </div>
            </div>
          )}

          {/* --- B. ĐIỂM DANH & CHUYÊN CẦN --- */}
          {moduleInfo.key === 'attendance' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-[#1557A6] uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#1976D2]" />
                  Chức năng Điểm danh
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  {attendanceRate}% Có mặt
                </span>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('attendance')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'attendance'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#1976D2]" />
                    <span>Điểm danh hằng ngày</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('attendance_absent')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'attendance_absent'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Danh sách học sinh vắng</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${absentCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                    {absentCount} vắng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('attendance_history')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'attendance_history'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Lịch sử chuyên cần</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-[#EAF4FF] space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                  Tiện ích chuyên cần hôm nay
                </span>
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-gray-600 block">Đã có mặt:</span>
                    <strong className="text-emerald-800 font-bold">{presentCount} / {currentTotal} học sinh</strong>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('ai_assistant')}
                  className="w-full py-2 px-3 bg-gradient-to-r from-[#1976D2] to-[#1557A6] hover:opacity-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Soạn bài học bù tự động với AI</span>
                </button>
              </div>
            </div>
          )}

          {/* --- C. KẾT QUẢ TIẾNG VIỆT --- */}
          {moduleInfo.key === 'vietnamese' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-[#1557A6] uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#1976D2]" />
                  Chức năng môn Tiếng Việt
                </span>
                <span className="text-[11px] bg-blue-50 text-[#1976D2] px-2 py-0.5 rounded-full font-bold">
                  TT 27
                </span>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('vietnamese_summary')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'vietnamese_summary'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#1976D2]" />
                    <span>Bảng tổng hợp cả lớp</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('vietnamese_entry')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'vietnamese_entry'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Nhập kết quả đánh giá</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Ghi nhận</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('vietnamese_support')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'vietnamese_support'
                      ? 'border-[#1976D2] bg-[#EAF4FF] text-[#1557A6] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Học sinh cần hỗ trợ</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    {vnNeedsSupport} em
                  </span>
                </button>
              </div>

              {/* Quick Actions & Stats */}
              <div className="pt-2 border-t border-[#EAF4FF] space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                  Tiến độ môn Tiếng Việt
                </span>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Đã ghi nhận:</span>
                    <strong className="text-[#1557A6] font-bold">{vnAssessed} lượt đánh giá</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('vietnamese_entry')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#1976D2] font-bold rounded border border-blue-300 text-xs"
                  >
                    + Nhập ngay
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('assignments_create')}
                  className="w-full py-2 px-3 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Tạo bài tập rèn chữ Tiếng Việt</span>
                </button>
              </div>
            </div>
          )}

          {/* --- D. KẾT QUẢ TOÁN --- */}
          {moduleInfo.key === 'math' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-[#16865C] uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#16865C]" />
                  Chức năng môn Toán
                </span>
                <span className="text-[11px] bg-emerald-50 text-[#16865C] px-2 py-0.5 rounded-full font-bold">
                  Lớp 1
                </span>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('math_summary')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'math_summary'
                      ? 'border-[#16865C] bg-emerald-50 text-[#16865C] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#16865C] hover:bg-emerald-50/40 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#16865C]" />
                    <span>Bảng tổng hợp cả lớp</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('math_entry')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'math_entry'
                      ? 'border-[#16865C] bg-emerald-50 text-[#16865C] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#16865C] hover:bg-emerald-50/40 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Nhập kết quả đánh giá Toán</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Ghi nhận</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('math_support')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'math_support'
                      ? 'border-[#16865C] bg-emerald-50 text-[#16865C] font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-[#16865C] hover:bg-emerald-50/40 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Học sinh cần bồi dưỡng</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    {mathNeedsSupport} em
                  </span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#EAF4FF] space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                  Tiến độ môn Toán
                </span>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Đã ghi nhận:</span>
                    <strong className="text-emerald-800 font-bold">{mathAssessed} lượt đánh giá</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('math_entry')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-[#16865C] font-bold rounded border border-emerald-300 text-xs"
                  >
                    + Nhập ngay
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('assignments_create')}
                  className="w-full py-2 px-3 bg-[#16865C] hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Tạo bài tập phép tính Toán</span>
                </button>
              </div>
            </div>
          )}

          {/* --- E. BÀI TẬP & RÈN LUYỆN --- */}
          {moduleInfo.key === 'assignments' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Chức năng Bài tập
                </span>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {assignments.length} bài
                </span>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('assignments')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'assignments'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-indigo-600" />
                    <span>Danh sách bài tập & phiếu ôn</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('assignments_create')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeTab === 'assignments_create'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Tạo bài tập mới</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Soạn mới</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#EAF4FF] space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('assignments_create')}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Soạn bài tập mới ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* --- F. NỘI DUNG HỌC TẬP (GIÁO ÁN) --- */}
          {moduleInfo.key === 'lessons' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  Chức năng Kế hoạch bài dạy
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                  {lessons.length} bài
                </span>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('lessons')}
                  className="w-full text-left p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-bold text-xs shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Kế hoạch bài học theo tuần</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                </button>
              </div>

              <div className="pt-2 border-t border-[#EAF4FF] space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('ai_assistant')}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Nhờ AI gợi ý ý tưởng dạy học</span>
                </button>
              </div>
            </div>
          )}

          {/* --- G. TRỢ LÝ AI --- */}
          {moduleInfo.key === 'ai_assistant' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  Chức năng Trợ lý AI
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                  Thông minh
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 space-y-1">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>1. Soạn bài học bù</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Tự động tạo phiếu tóm tắt bài học và bài tập rèn luyện cho học sinh vắng.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1">
                  <div className="font-bold text-[#1557A6] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#1976D2]" />
                    <span>2. Nhận xét học bạ Thông tư 27</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Gợi ý lời nhận xét chuẩn mực, động viên, phản ánh đúng năng lực học sinh Lớp 1.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <FileEdit className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Sinh đề kiểm tra & ôn tập</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Tạo nhanh câu hỏi trắc nghiệm, nối chữ, điền từ cho môn Tiếng Việt và Toán.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- H. BÁO CÁO & THỐNG KÊ --- */}
          {moduleInfo.key === 'reports' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wide flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                  Chức năng Báo cáo
                </span>
                <span className="text-[11px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                  Xuất dữ liệu
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200">
                  <strong className="text-teal-900 block font-bold">Báo cáo chất lượng giáo dục</strong>
                  <span className="text-[11px] text-gray-600">Tổng hợp kết quả môn Tiếng Việt và Toán học kỳ.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200">
                  <strong className="text-[#1557A6] block font-bold">Báo cáo chuyên cần</strong>
                  <span className="text-[11px] text-gray-600">Tỷ lệ đi học và thống kê học sinh nghỉ nhiều ngày.</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAF4FF]">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>In / Xuất báo cáo này</span>
                </button>
              </div>
            </div>
          )}

          {/* --- I. CÀI ĐẶT HỆ THỐNG --- */}
          {moduleInfo.key === 'settings' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  Chức năng Cài đặt
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  Hệ thống
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {onToggleFontMode && (
                  <button
                    type="button"
                    onClick={onToggleFontMode}
                    className="w-full p-2.5 rounded-lg border border-gray-200 hover:border-[#1976D2] hover:bg-[#F7FAFF] flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-[#1976D2]" />
                      <span>Đổi phông chữ</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-[#1557A6] px-1.5 py-0.5 rounded font-bold">
                      {settings.fontMode === 'sans' ? 'Không chân' : 'Có chân'}
                    </span>
                  </button>
                )}

                {onExportBackup && (
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="w-full p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Sao lưu dữ liệu (.JSON)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* --- J. TRANG CHỦ / DASHBOARD (Phím tắt tất cả phân hệ) --- */}
          {moduleInfo.key === 'dashboard' && (
            <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs space-y-3 font-serif">
              <div className="flex items-center justify-between border-b border-[#EAF4FF] pb-2">
                <span className="text-xs font-bold text-[#1557A6] uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#1976D2]" />
                  Phím tắt các phân hệ chức năng
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('students')}
                  className="p-2.5 rounded-lg border border-[#D6E6F7] bg-[#F7FAFF] hover:bg-[#EAF4FF] text-left transition-all flex flex-col gap-1"
                >
                  <Users className="w-4 h-4 text-[#1976D2]" />
                  <span className="font-bold text-[#17365D]">Học sinh</span>
                  <span className="text-[10px] text-gray-500">{students.length} em</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('attendance')}
                  className="p-2.5 rounded-lg border border-[#D6E6F7] bg-[#F7FAFF] hover:bg-[#EAF4FF] text-left transition-all flex flex-col gap-1"
                >
                  <CalendarCheck className="w-4 h-4 text-[#1976D2]" />
                  <span className="font-bold text-[#17365D]">Điểm danh</span>
                  <span className="text-[10px] text-gray-500">{presentCount}/{currentTotal}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('vietnamese_summary')}
                  className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-left transition-all flex flex-col gap-1"
                >
                  <BookOpen className="w-4 h-4 text-[#1976D2]" />
                  <span className="font-bold text-[#1557A6]">Tiếng Việt</span>
                  <span className="text-[10px] text-gray-500">{vnAssessed} đánh giá</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('math_summary')}
                  className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left transition-all flex flex-col gap-1"
                >
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-800">Toán</span>
                  <span className="text-[10px] text-gray-500">{mathAssessed} đánh giá</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('assignments')}
                  className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-left transition-all flex flex-col gap-1"
                >
                  <FileEdit className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-indigo-900">Bài tập</span>
                  <span className="text-[10px] text-gray-500">{assignments.length} bài</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('ai_assistant')}
                  className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-left transition-all flex flex-col gap-1"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-purple-900">Trợ lý AI</span>
                  <span className="text-[10px] text-purple-600 font-bold">Tự động</span>
                </button>
              </div>
            </div>
          )}

          {/* Compact Class Info Snippet pinned below */}
          <div className="bg-white rounded-xl border border-[#D6E6F7] p-3 shadow-xs text-xs font-serif space-y-1.5">
            <div className="flex items-center justify-between text-gray-500">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#1976D2]" />
                Lớp học:
              </span>
              <strong className="text-[#1557A6]">{settings.className} – {settings.schoolName}</strong>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1976D2]" />
                Giáo viên:
              </span>
              <strong className="text-[#17365D]">{settings.teacherName}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CLASS INFO & RECENT ACTIVITIES LOG                */}
      {/* ======================================================== */}
      {activeTabMode === 'class_info' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Class Information Card */}
          <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#EAF4FF] text-[#1557A6]">
              <div className="p-1.5 bg-[#EAF4FF] rounded-lg">
                <GraduationCap className="w-5 h-5 text-[#1976D2]" />
              </div>
              <h2 className="font-bold text-base text-[#1557A6] font-serif">Thông tin lớp học</h2>
            </div>

            <div className="space-y-2.5 text-sm font-serif">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4 text-[#1976D2]" />
                  <span>Lớp:</span>
                </div>
                <span className="font-bold text-[#17365D]">{settings.className}</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4 text-[#1976D2]" />
                  <span>Trường:</span>
                </div>
                <span className="font-semibold text-right text-[#17365D] max-w-[170px]">{settings.schoolName}</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-[#1976D2]" />
                  <span>Giáo viên:</span>
                </div>
                <span className="font-bold text-[#1557A6]">{settings.teacherName}</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users2 className="w-4 h-4 text-[#1976D2]" />
                  <span>Sĩ số:</span>
                </div>
                <span className="font-bold text-[#17365D]">{currentTotal} học sinh</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-[#1976D2]" />
                  <span>Năm học:</span>
                </div>
                <span className="font-semibold text-[#17365D]">{settings.schoolYear}</span>
              </div>
            </div>
          </div>

          {/* Academic Results Overview */}
          <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#EAF4FF] text-[#1557A6]">
              <div className="p-1.5 bg-[#EAF4FF] rounded-lg">
                <Users2 className="w-5 h-5 text-[#1976D2]" />
              </div>
              <h2 className="font-bold text-base text-[#1557A6] font-serif">Kết quả học tập</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Vietnamese Box */}
              <div className="p-3 rounded-lg border border-[#D6E6F7] bg-[#F7FAFF] flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-[#1976D2]/10 flex items-center justify-center text-[#1976D2] mb-1.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#17365D] font-serif">Tiếng Việt</span>
                <span className="text-[11px] text-gray-500 my-1 font-serif">
                  {vnAssessed > 0 ? `${vnAssessed} đã đánh giá` : 'Đang cập nhật'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTabMode('module_functions');
                    onNavigate('vietnamese_summary');
                  }}
                  className="mt-1 w-full py-1 px-2 text-[11px] font-bold text-[#1976D2] bg-white hover:bg-[#EAF4FF] rounded border border-[#D6E6F7] transition-all flex items-center justify-center gap-1 font-serif"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Math Box */}
              <div className="p-3 rounded-lg border border-[#D6E6F7] bg-[#F7FAFF] flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-[#16865C]/10 flex items-center justify-center text-[#16865C] mb-1.5">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#17365D] font-serif">Toán</span>
                <span className="text-[11px] text-gray-500 my-1 font-serif">
                  {mathAssessed > 0 ? `${mathAssessed} đã đánh giá` : 'Đang cập nhật'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTabMode('module_functions');
                    onNavigate('math_summary');
                  }}
                  className="mt-1 w-full py-1 px-2 text-[11px] font-bold text-[#16865C] bg-white hover:bg-emerald-50 rounded border border-[#D6E6F7] transition-all flex items-center justify-center gap-1 font-serif"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-xl border border-[#D6E6F7] p-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#EAF4FF] text-[#1557A6]">
              <div className="p-1.5 bg-[#EAF4FF] rounded-lg">
                <Clock className="w-5 h-5 text-[#1976D2]" />
              </div>
              <h2 className="font-bold text-base text-[#1557A6] font-serif">Hoạt động gần đây</h2>
            </div>

            <div className="space-y-3 font-serif">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1976D2] mt-1.5 flex-shrink-0"></span>
                    <span className="text-[#17365D] leading-tight hover:text-[#1557A6] transition-colors">
                      {act.description}
                    </span>
                  </div>
                  <span className="text-gray-400 font-mono text-[11px] flex-shrink-0">{act.timestamp}</span>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400">
                  Chưa có hoạt động ghi nhận
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
