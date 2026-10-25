import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  CalendarCheck,
  BookOpen,
  Calculator,
  Download,
  Printer,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Student,
  AttendanceRecord,
  AssessmentRecord,
  Assignment,
  ClassSettings,
  Criteria,
  ActiveNavTab,
} from '../types/index.ts';

interface ReportsViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  assessments: AssessmentRecord[];
  assignments: Assignment[];
  settings: ClassSettings;
  criteria: Criteria[];
  onNavigate: (tab: ActiveNavTab) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  attendance,
  assessments,
  assignments,
  settings,
  criteria,
  onNavigate,
}) => {
  const [reportType, setReportType] = useState<
    'overview' | 'attendance' | 'vietnamese' | 'math' | 'support'
  >('overview');

  // Calculations
  const total = students.length;
  const active = students.filter(s => s.status === 'Đang học').length;
  const boys = students.filter(s => s.gender === 'Nam').length;
  const girls = students.filter(s => s.gender === 'Nữ').length;

  const totalAttendance = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const excusedCount = attendance.filter(a => a.status === 'excused').length;
  const unexcusedCount = attendance.filter(a => a.status === 'unexcused').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

  // Vietnamese stats
  const vnAssessments = assessments.filter(a => a.subject === 'vietnamese');
  const vnT = vnAssessments.filter(a => a.rating === 'T').length;
  const vnH = vnAssessments.filter(a => a.rating === 'H').length;
  const vnC = vnAssessments.filter(a => a.rating === 'C').length;

  // Math stats
  const mathAssessments = assessments.filter(a => a.subject === 'math');
  const mathT = mathAssessments.filter(a => a.rating === 'T').length;
  const mathH = mathAssessments.filter(a => a.rating === 'H').length;
  const mathC = mathAssessments.filter(a => a.rating === 'C').length;

  // Export CSV summary
  const handleExportCsv = () => {
    let csv = `\uFEFFBÁO CÁO TỔNG HỢP LỚP ${settings.className} - ${settings.schoolName}\n`;
    csv += `Giáo viên chủ nhiệm: ${settings.teacherName}\n`;
    csv += `Năm học: ${settings.schoolYear}\n\n`;

    csv += `Mã HS,Họ và tên,Ngày sinh,Giới tính,Trạng thái,Đánh giá Tiếng Việt,Đánh giá Toán\n`;
    students.forEach(s => {
      const vn = vnAssessments.filter(a => a.studentId === s.id);
      const mt = mathAssessments.filter(a => a.studentId === s.id);
      const vnSummary = vn.some(a => a.rating === 'C') ? 'Cần hỗ trợ' : 'Đạt chuẩn';
      const mtSummary = mt.some(a => a.rating === 'C') ? 'Cần hỗ trợ' : 'Đạt chuẩn';
      csv += `"${s.studentCode}","${s.fullName}","${s.dateOfBirth}","${s.gender}","${s.status}","${vnSummary}","${mtSummary}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_hoc_tap_Lop_${settings.className}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-serif">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-[#1976D2]">
            <BarChart3 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1557A6]">
              Trung tâm báo cáo & Thống kê tiến bộ học tập
            </h2>
            <p className="text-xs text-gray-500">
              Tổng hợp số liệu thực tế về sĩ số, chuyên cần, chất lượng môn Tiếng Việt và Toán Lớp 1/2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-xl text-xs font-bold border border-[#BCE0FD] transition-all"
          >
            <Download className="w-4 h-4 text-[#1976D2]" />
            <span>Xuất file Excel/CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Big Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Sĩ số */}
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Sĩ số lớp</span>
            <Users className="w-4 h-4 text-[#1976D2]" />
          </div>
          <div className="text-2xl font-bold text-[#1557A6] mt-1">{total} học sinh</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {boys} Nam • {girls} Nữ (Đang học: {active})
          </div>
        </div>

        {/* Chuyên cần */}
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Tỷ lệ chuyên cần</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{attendanceRate}%</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {excusedCount} vắng có phép • {unexcusedCount} chưa rõ
          </div>
        </div>

        {/* Tiếng Việt */}
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Tiếng Việt (Đạt T/H)</span>
            <BookOpen className="w-4 h-4 text-[#1557A6]" />
          </div>
          <div className="text-2xl font-bold text-[#1557A6] mt-1">
            {vnT + vnH} / {vnAssessments.length || 1}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            {vnC} lượt cần rèn thêm âm vần/chính tả
          </div>
        </div>

        {/* Toán */}
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Toán (Đạt T/H)</span>
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {mathT + mathH} / {mathAssessments.length || 1}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            {mathC} lượt cần kèm thêm phép tính/so sánh
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tiếng Việt Distribution Bar */}
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-[#1557A6] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Phân bố kết quả môn Tiếng Việt</span>
            </h3>
            <span className="text-xs text-gray-400">{vnAssessments.length} đánh giá</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* T */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-800">Hoàn thành tốt (T)</span>
                <span className="font-bold">{vnT} lượt</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${(vnT / (vnAssessments.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* H */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-blue-800">Hoàn thành (H)</span>
                <span className="font-bold">{vnH} lượt</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(vnH / (vnAssessments.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* C */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-800">Cần hỗ trợ (C)</span>
                <span className="font-bold">{vnC} lượt</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(vnC / (vnAssessments.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Math Distribution Bar */}
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-[#16865C] flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>Phân bố kết quả môn Toán</span>
            </h3>
            <span className="text-xs text-gray-400">{mathAssessments.length} đánh giá</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* T */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-800">Hoàn thành tốt (T)</span>
                <span className="font-bold">{mathT} lượt</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${(mathT / (mathAssessments.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* H */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-blue-800">Hoàn thành (H)</span>
                <span className="font-bold">{mathH} lượt</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(mathH / (mathAssessments.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* C */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-800">Cần hỗ trợ (C)</span>
                <span className="font-bold">{mathC} lượt</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(mathC / (mathAssessments.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
