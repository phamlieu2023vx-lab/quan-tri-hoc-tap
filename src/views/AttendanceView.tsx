import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Check,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus, ActiveNavTab } from '../types/index.ts';
import { storage, getTodayDateString } from '../services/storage.ts';

interface AttendanceViewProps {
  activeTab?: ActiveNavTab;
  students: Student[];
  onNavigate: (tab: ActiveNavTab) => void;
  onMakeUpRequest?: (studentName: string, date: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  activeTab,
  students,
  onNavigate,
  onMakeUpRequest,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [currentViewTab, setCurrentViewTab] = useState<'daily' | 'history' | 'absent_list'>('daily');

  // Sync with activeTab from navigation
  useEffect(() => {
    if (activeTab === 'attendance_history') {
      setCurrentViewTab('history');
    } else if (activeTab === 'attendance_absent') {
      setCurrentViewTab('absent_list');
    } else if (activeTab === 'attendance') {
      setCurrentViewTab('daily');
    }
  }, [activeTab]);

  // Load records for selected date
  useEffect(() => {
    const list = storage.getAttendanceByDate(selectedDate);
    setRecords(list);
    setIsSaved(false);
  }, [selectedDate]);

  // Mark all present
  const handleMarkAllPresent = () => {
    setRecords(prev =>
      prev.map(r => ({
        ...r,
        status: 'present' as AttendanceStatus,
      }))
    );
    setIsSaved(false);
  };

  // Update single student status
  const handleUpdateStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev =>
      prev.map(r => (r.studentId === studentId ? { ...r, status } : r))
    );
    setIsSaved(false);
  };

  // Update note
  const handleUpdateNote = (studentId: string, notes: string) => {
    setRecords(prev =>
      prev.map(r => (r.studentId === studentId ? { ...r, notes } : r))
    );
    setIsSaved(false);
  };

  // Update makeup lesson title
  const handleToggleMakeup = (studentId: string) => {
    setRecords(prev =>
      prev.map(r =>
        r.studentId === studentId
          ? {
              ...r,
              makeupNeeded: !r.makeupNeeded,
              makeupLessonTitle: !r.makeupNeeded ? 'Bài 33: on, ôn, ơn (Tiếng Việt)' : '',
            }
          : r
      )
    );
    setIsSaved(false);
  };

  // Save batch
  const handleSaveAttendance = () => {
    storage.saveAttendanceBatch(records);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Stats for selected date
  const totalInClass = students.filter(s => s.status === 'Đang học').length;
  const presentCount = records.filter(r => r.status === 'present').length;
  const excusedCount = records.filter(r => r.status === 'excused').length;
  const unexcusedCount = records.filter(r => r.status === 'unexcused').length;
  const absentCount = excusedCount + unexcusedCount;

  // Absent students list
  const absentStudents = records.filter(r => r.status === 'excused' || r.status === 'unexcused');

  return (
    <div className="space-y-4 font-serif">
      {/* Header & Sub-nav */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#EAF4FF] rounded-xl text-[#1976D2]">
            <CalendarCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1557A6]">
              Điểm danh & Theo dõi chuyên cần Lớp 1/2
            </h2>
            <p className="text-xs text-gray-500">
              Ghi nhận sĩ số hằng ngày, phát hiện vắng học và tự động kích hoạt học bù kiến thức
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setCurrentViewTab('daily');
              onNavigate('attendance');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentViewTab === 'daily'
                ? 'bg-[#1976D2] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-[#1557A6]'
            }`}
          >
            Điểm danh hôm nay
          </button>
          <button
            onClick={() => {
              setCurrentViewTab('absent_list');
              onNavigate('attendance_absent');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentViewTab === 'absent_list'
                ? 'bg-[#1976D2] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-[#1557A6]'
            }`}
          >
            Học sinh vắng ({absentCount})
          </button>
          <button
            onClick={() => {
              setCurrentViewTab('history');
              onNavigate('attendance_history');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentViewTab === 'history'
                ? 'bg-[#1976D2] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-[#1557A6]'
            }`}
          >
            Lịch sử chuyên cần
          </button>
        </div>
      </div>

      {/* Date bar & Quick Stats */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1557A6]">
            <Calendar className="w-4 h-4 text-[#1976D2]" />
            <span>Ngày điểm danh:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-[#D6E6F7] rounded-lg text-xs font-bold font-serif text-[#17365D] bg-[#F7FAFF]"
          />
        </div>

        {/* 4 Stat Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold">
            Sĩ số: {totalInClass}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            Có mặt: {presentCount}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold">
            Vắng có phép: {excusedCount}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800 font-bold">
            Vắng chưa rõ lý do: {unexcusedCount}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-1.5 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-lg text-xs font-bold border border-[#BCE0FD] transition-all"
          >
            Tất cả có mặt
          </button>

          <button
            onClick={handleSaveAttendance}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1976D2] hover:bg-[#1557A6] text-white active:scale-95'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Đã lưu điểm danh' : 'Lưu điểm danh'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Daily Table */}
      {currentViewTab === 'daily' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-serif">
              <thead className="bg-[#EAF4FF] text-[#1557A6] font-bold">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3">Mã HS</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3 text-center">Trạng thái điểm danh</th>
                  <th className="p-3">Ghi chú lý do vắng</th>
                  <th className="p-3 text-center">Học bù kiến thức</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st, idx) => {
                  const record = records.find(r => r.studentId === st.id) || {
                    id: `att-${st.id}-${selectedDate}`,
                    studentId: st.id,
                    date: selectedDate,
                    status: 'present' as AttendanceStatus,
                    notes: '',
                    updatedAt: '',
                  };

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-[#F7FAFF] transition-colors ${
                        record.status !== 'present' ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-medium text-gray-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-[#1557A6]">{st.studentCode}</td>
                      <td className="p-3 font-bold text-[#17365D]">
                        {st.fullName}
                        {st.status !== 'Đang học' && (
                          <span className="ml-1 text-[10px] text-gray-400">({st.status})</span>
                        )}
                      </td>

                      {/* 3 Status Buttons */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-gray-50 border border-gray-200 rounded-xl">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(st.id, 'present')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              record.status === 'present'
                                ? 'bg-[#16865C] text-white shadow-2xs'
                                : 'text-gray-600 hover:bg-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Có mặt</span>
                          </button>

                          {/* Excused */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(st.id, 'excused')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              record.status === 'excused'
                                ? 'bg-[#E99A24] text-white shadow-2xs'
                                : 'text-gray-600 hover:bg-white'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Có phép</span>
                          </button>

                          {/* Unexcused */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(st.id, 'unexcused')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              record.status === 'unexcused'
                                ? 'bg-[#D64545] text-white shadow-2xs'
                                : 'text-gray-600 hover:bg-white'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Chưa rõ lý do</span>
                          </button>
                        </div>
                      </td>

                      {/* Notes input */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={record.notes || ''}
                          onChange={e => handleUpdateNote(st.id, e.target.value)}
                          placeholder={
                            record.status === 'present'
                              ? ''
                              : 'Ghi lý do vắng (cảm sốt, việc gia đình...)'
                          }
                          className="w-full px-2.5 py-1 bg-white border border-[#D6E6F7] rounded-lg text-xs focus:ring-1 focus:ring-[#1976D2]"
                        />
                      </td>

                      {/* Makeup lesson link */}
                      <td className="p-3 text-center">
                        {record.status !== 'present' ? (
                          <button
                            onClick={() => handleToggleMakeup(st.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto ${
                              record.makeupNeeded
                                ? 'bg-blue-100 text-[#1557A6] border border-blue-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{record.makeupNeeded ? 'Cần học bù' : 'Gán học bù'}</span>
                          </button>
                        ) : (
                          <span className="text-gray-300">---</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Absent Students & Makeup Planning */}
      {currentViewTab === 'absent_list' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1557A6]">
                Danh sách học sinh vắng ngày {selectedDate} ({absentStudents.length} em)
              </h3>
              <p className="text-xs text-gray-500">
                Lên kế hoạch gửi phiếu ôn tập và bài học bù cho gia đình học sinh
              </p>
            </div>

            <button
              onClick={() => onNavigate('ai_assistant')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1976D2] to-[#1557A6] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Tạo phiếu học bù tự động với AI</span>
            </button>
          </div>

          <div className="space-y-3">
            {absentStudents.map(att => {
              const student = students.find(s => s.id === att.studentId);
              if (!student) return null;

              return (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#17365D]">{student.fullName}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-gray-600 font-mono border">
                        {student.studentCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          att.status === 'excused'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {att.status === 'excused' ? 'Vắng có phép' : 'Vắng chưa rõ lý do'}
                      </span>
                    </div>

                    <p className="text-gray-600">
                      <strong>Lý do: </strong>
                      {att.notes || 'Chưa có thông tin cụ thể'} • Phụ huynh: {student.parentName || '---'} ({student.phone || 'Chưa có SĐT'})
                    </p>

                    <div className="text-[#1557A6] font-semibold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Bài học cần học bù: {att.makeupLessonTitle || 'Bài 33: on, ôn, ơn (Tiếng Việt 1)'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onMakeUpRequest) {
                        onMakeUpRequest(student.fullName, selectedDate);
                      }
                      onNavigate('ai_assistant');
                    }}
                    className="flex-shrink-0 px-3.5 py-1.5 bg-white hover:bg-blue-50 text-[#1976D2] font-bold rounded-lg border border-[#D6E6F7] shadow-2xs"
                  >
                    Tạo phiếu học bù gửi Zalo/In
                  </button>
                </div>
              );
            })}

            {absentStudents.length === 0 && (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-base font-bold text-emerald-800">
                  Tuyệt vời! Ngày hôm nay toàn bộ {totalInClass} học sinh đều có mặt đầy đủ.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Attendance History */}
      {currentViewTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div>
              <h3 className="text-base font-bold text-[#1557A6]">
                Lịch sử chuyên cần & Thống kê theo học sinh
              </h3>
              <p className="text-xs text-gray-500">
                Theo dõi chuyên cần tổng thể cả lớp và số buổi vắng học
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentViewTab('daily');
                onNavigate('attendance');
              }}
              className="px-3.5 py-1.5 bg-[#EAF4FF] text-[#1557A6] hover:bg-[#D6E6F7] rounded-xl text-xs font-bold transition-all"
            >
              ← Trở về điểm danh hôm nay
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-serif">
              <thead className="bg-[#EAF4FF] text-[#1557A6] font-bold">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3">Mã HS</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3 text-center">Giới tính</th>
                  <th className="p-3 text-center">Trạng thái lớp</th>
                  <th className="p-3 text-center">Chuyên cần hôm nay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st, idx) => {
                  const todayRec = records.find(r => r.studentId === st.id);
                  const isPres = !todayRec || todayRec.status === 'present';

                  return (
                    <tr key={st.id} className="hover:bg-[#F7FAFF] transition-colors">
                      <td className="p-3 text-center font-medium text-gray-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-[#1557A6]">{st.studentCode}</td>
                      <td className="p-3 font-bold text-[#17365D]">{st.fullName}</td>
                      <td className="p-3 text-center">{st.gender}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          st.status === 'Đang học' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          isPres
                            ? 'bg-emerald-100 text-emerald-800'
                            : todayRec?.status === 'excused'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isPres ? 'Có mặt' : todayRec?.status === 'excused' ? 'Vắng có phép' : 'Vắng không phép'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
