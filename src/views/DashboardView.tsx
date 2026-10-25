import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Plus,
  Upload,
  Search,
  Filter,
  Eye,
  Edit2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  X,
  Save,
  Trash2,
} from 'lucide-react';
import { Student, ActiveNavTab, ClassSettings, AttendanceRecord, formatDateDisplay } from '../types/index.ts';
import { StudentIllustration } from '../components/StudentIllustration.tsx';
import { storage } from '../services/storage.ts';

interface DashboardViewProps {
  students: Student[];
  settings: ClassSettings;
  attendanceToday: AttendanceRecord[];
  onNavigate: (tab: ActiveNavTab) => void;
  onSelectStudent: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  settings,
  attendanceToday,
  onNavigate,
  onSelectStudent,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'dob'>('name');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang học' | 'Chuyển đi'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add/Edit Student Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingStudent, setEditingStudent] = useState<Partial<Student>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Statistics calculation
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'Đang học').length;
  const presentToday = attendanceToday.filter(a => a.status === 'present').length;
  const absentToday = attendanceToday.filter(a => a.status === 'excused' || a.status === 'unexcused').length;

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        // Status filter
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = s.fullName.toLowerCase().includes(q);
          const matchCode = s.studentCode.toLowerCase().includes(q);
          return matchName || matchCode;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          // Sort by Vietnamese first name (tách tên để sắp xếp vần chính xác)
          const nameA = a.fullName.split(' ').pop() || '';
          const nameB = b.fullName.split(' ').pop() || '';
          return nameA.localeCompare(nameB, 'vi');
        }
        if (sortBy === 'code') {
          return a.studentCode.localeCompare(b.studentCode);
        }
        if (sortBy === 'dob') {
          return a.dateOfBirth.localeCompare(b.dateOfBirth);
        }
        return 0;
      });
  }, [students, searchQuery, sortBy, statusFilter]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Handle open add modal
  const handleOpenAdd = () => {
    const nextCodeNumber = totalCount + 1;
    const formattedCode = `HS-1.2-${String(nextCodeNumber).padStart(3, '0')}`;
    setEditingStudent({
      studentCode: formattedCode,
      fullName: '',
      dateOfBirth: '2020-01-01',
      gender: 'Nam',
      className: settings.className,
      status: 'Đang học',
      parentName: '',
      phone: '',
      notes: '',
    });
    setFormErrors({});
    setModalMode('add');
  };

  // Handle open edit modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent({ ...student });
    setFormErrors({});
    setModalMode('edit');
    setActiveMenuId(null);
  };

  // Save student (add or update)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!editingStudent.fullName?.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên học sinh';
    }
    if (!editingStudent.studentCode?.trim()) {
      errors.studentCode = 'Vui lòng nhập mã học sinh';
    }
    if (!editingStudent.dateOfBirth) {
      errors.dateOfBirth = 'Vui lòng nhập ngày sinh';
    }

    // Check duplicate code
    const isDup = students.some(
      s => s.id !== editingStudent.id && s.studentCode.toLowerCase() === editingStudent.studentCode?.trim().toLowerCase()
    );
    if (isDup) {
      errors.studentCode = 'Mã học sinh đã tồn tại trong hệ thống';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    storage.saveStudent(editingStudent as Student);
    setModalMode(null);
  };

  const handleToggleStatus = (student: Student) => {
    const nextStatus = student.status === 'Đang học' ? 'Chuyển đi' : 'Đang học';
    storage.saveStudent({
      ...student,
      status: nextStatus,
    });
    setActiveMenuId(null);
  };

  const handleDelete = (student: Student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ học sinh ${student.fullName}? Dữ liệu sẽ được lưu trữ.`)) {
      storage.deleteStudent(student.id);
      setActiveMenuId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Welcome Banner & Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Banner (Left/Center) */}
        <div className="lg:col-span-8 bg-gradient-to-r from-[#EBF4FF] via-[#E1EFFF] to-[#D5E8FD] border border-[#C5DCFA] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/40 rounded-full blur-xl pointer-events-none"></div>

          {/* Left: Illustration */}
          <div className="flex-shrink-0">
            <StudentIllustration className="w-52 h-36" />
          </div>

          {/* Right: Greetings and motivational slogan */}
          <div className="text-center sm:text-left flex-1 space-y-1.5 z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1557A6] font-serif leading-tight">
              Chào mừng cô {settings.teacherName}!
            </h2>
            <p className="text-sm sm:text-base font-semibold text-[#17365D] font-serif">
              Chúc cô một ngày làm việc hiệu quả!
            </p>
            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-white/70 border border-blue-200 text-xs sm:text-sm italic font-serif text-[#1976D2] shadow-2xs">
                “Tri thức hôm nay – Thành công ngày mai”
              </span>
            </div>
          </div>
        </div>

        {/* Top 2 Big Stat Cards (Matching screenshot) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
          {/* Total Students Card */}
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 flex flex-col items-center justify-center text-center shadow-xs hover:border-[#1976D2] transition-colors">
            <div className="w-11 h-11 rounded-full bg-[#1976D2]/10 flex items-center justify-center text-[#1976D2] mb-2">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm text-[#17365D] font-serif font-medium">Tổng số học sinh</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#1557A6] font-serif my-0.5">
              {totalCount}
            </div>
            <span className="text-[11px] text-gray-500 font-serif">học sinh</span>
          </div>

          {/* Active Students Card */}
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 flex flex-col items-center justify-center text-center shadow-xs hover:border-[#16865C] transition-colors">
            <div className="w-11 h-11 rounded-full bg-[#16865C]/10 flex items-center justify-center text-[#16865C] mb-2">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm text-[#17365D] font-serif font-medium">Đang học</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#16865C] font-serif my-0.5">
              {activeCount}
            </div>
            <span className="text-[11px] text-gray-500 font-serif">học sinh</span>
          </div>
        </div>
      </div>

      {/* 2. Main Section: Student List Table */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] shadow-xs overflow-hidden">
        {/* Table Header & Action Buttons */}
        <div className="p-4 sm:p-5 border-b border-[#EAF4FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5 text-[#1557A6]">
            <div className="p-2 bg-[#EAF4FF] rounded-lg">
              <Users className="w-5 h-5 text-[#1976D2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1557A6] font-serif">
                Danh sách học sinh lớp {settings.className}
              </h3>
              <p className="text-xs text-gray-500 font-serif">
                Quản lý hồ sơ, tình trạng học tập và chuyên cần của học sinh
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white text-xs sm:text-sm font-bold font-serif rounded-lg shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Thêm học sinh</span>
            </button>

            <button
              onClick={() => onNavigate('students_import')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#EAF4FF] hover:bg-[#D6E6F7] border border-[#BCE0FD] text-[#1557A6] text-xs sm:text-sm font-bold font-serif rounded-lg transition-all"
            >
              <Upload className="w-4 h-4 text-[#1976D2]" />
              <span>Nhập từ Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 sm:px-5 bg-[#F7FAFF] border-b border-[#EAF4FF] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box with blue button */}
          <div className="flex items-center gap-1.5 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm theo họ tên hoặc mã học sinh..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-[#D6E6F7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]/30 focus:border-[#1976D2] font-serif"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button 
              onClick={() => setCurrentPage(1)}
              className="p-2 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg transition-colors shadow-2xs"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Sort & Filter controls */}
          <div className="flex items-center gap-2.5 justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-serif text-[#17365D]">
              <span className="text-gray-500 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'name' | 'code' | 'dob')}
                className="bg-white border border-[#D6E6F7] rounded-lg px-2.5 py-1.5 text-xs font-serif text-[#17365D] focus:outline-none focus:ring-1 focus:ring-[#1976D2]"
              >
                <option value="name">Theo họ tên</option>
                <option value="code">Theo mã học sinh</option>
                <option value="dob">Theo ngày sinh</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-serif font-semibold transition-all ${
                  statusFilter !== 'all'
                    ? 'bg-[#1976D2] text-white border-[#1976D2]'
                    : 'bg-white border-[#D6E6F7] text-[#17365D] hover:bg-[#EAF4FF]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Bộ lọc {statusFilter !== 'all' ? `(${statusFilter})` : ''}</span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#D6E6F7] rounded-lg shadow-lg p-2 z-20 font-serif text-xs space-y-1">
                  <div className="font-bold text-gray-500 px-2 py-1">Lọc theo trạng thái</div>
                  <button
                    onClick={() => { setStatusFilter('all'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded ${statusFilter === 'all' ? 'bg-[#EAF4FF] text-[#1557A6] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    Tất cả học sinh ({students.length})
                  </button>
                  <button
                    onClick={() => { setStatusFilter('Đang học'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded ${statusFilter === 'Đang học' ? 'bg-[#EAF4FF] text-[#1557A6] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    Đang học ({activeCount})
                  </button>
                  <button
                    onClick={() => { setStatusFilter('Chuyển đi'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded ${statusFilter === 'Chuyển đi' ? 'bg-[#EAF4FF] text-[#1557A6] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    Chuyển đi ({totalCount - activeCount})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-serif text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#EAF4FF]/70 text-[#1557A6] font-bold border-b border-[#D6E6F7]">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3">Mã học sinh</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Ngày sinh</th>
                <th className="py-2.5 px-3">Giới tính</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF4FF]">
              {paginatedStudents.map((st, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                const isMenuOpen = activeMenuId === st.id;

                return (
                  <tr
                    key={st.id}
                    className="hover:bg-[#F7FAFF] transition-colors group text-[#17365D]"
                  >
                    <td className="py-2.5 px-3 text-center font-medium text-gray-500">
                      {globalIndex}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-[#1557A6]">
                      {st.studentCode}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#17365D]">
                      <button
                        onClick={() => {
                          onSelectStudent(st.id);
                          onNavigate('student_profile');
                        }}
                        className="hover:text-[#1976D2] hover:underline transition-colors text-left font-serif"
                      >
                        {st.fullName}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">
                      {formatDateDisplay(st.dateOfBirth)}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={st.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}>
                        {st.gender}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {st.status === 'Đang học' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#16865C] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đang học</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <UserX className="w-3 h-3" />
                          <span>Chuyển đi</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center relative">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Profile */}
                        <button
                          onClick={() => {
                            onSelectStudent(st.id);
                            onNavigate('student_profile');
                          }}
                          className="p-1.5 text-[#1976D2] hover:bg-[#EAF4FF] rounded-md transition-colors"
                          title="Xem hồ sơ chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Student */}
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-[#1557A6] hover:bg-[#EAF4FF] rounded-md transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* More Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : st.id)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                            title="Thao tác khác"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-[#D6E6F7] rounded-lg shadow-lg py-1 z-30 text-left font-serif text-xs">
                              <button
                                onClick={() => handleToggleStatus(st)}
                                className="w-full px-3 py-1.5 hover:bg-[#EAF4FF] flex items-center gap-2 text-gray-700"
                              >
                                {st.status === 'Đang học' ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Chuyển trạng thái nghỉ/chuyển</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Đặt lại "Đang học"</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDelete(st)}
                                className="w-full px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-gray-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Lưu trữ hồ sơ</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-serif">
                    Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar (Matching screenshot: "Hiển thị 1 - 10 trong tổng số 30 học sinh", < 1 2 3 >) */}
        <div className="p-3 sm:px-5 border-t border-[#EAF4FF] bg-[#F7FAFF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif text-[#17365D]">
          <div>
            Hiển thị{' '}
            <span className="font-bold">
              {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-bold">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>{' '}
            trong tổng số <span className="font-bold">{filteredStudents.length}</span> học sinh
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-[#D6E6F7] bg-white hover:bg-[#EAF4FF] disabled:opacity-40 disabled:hover:bg-white text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#1976D2] text-white shadow-2xs'
                    : 'bg-white border border-[#D6E6F7] text-[#17365D] hover:bg-[#EAF4FF]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-[#D6E6F7] bg-white hover:bg-[#EAF4FF] disabled:opacity-40 disabled:hover:bg-white text-gray-600 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Add / Edit Student Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#D6E6F7] shadow-2xl overflow-hidden font-serif">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#1557A6] to-[#1976D2] text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {modalMode === 'add' ? 'Thêm học sinh mới vào Lớp 1/2' : 'Chỉnh sửa hồ sơ học sinh'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                {/* Mã học sinh */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Mã học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.studentCode || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, studentCode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg focus:ring-2 focus:ring-[#1976D2]/30 focus:border-[#1976D2]"
                    placeholder="VD: HS-1.2-031"
                  />
                  {formErrors.studentCode && (
                    <p className="text-red-500 text-xs mt-0.5">{formErrors.studentCode}</p>
                  )}
                </div>

                {/* Họ và tên */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.fullName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg focus:ring-2 focus:ring-[#1976D2]/30 focus:border-[#1976D2]"
                    placeholder="VD: Nguyễn Văn An"
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-xs mt-0.5">{formErrors.fullName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Ngày sinh */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingStudent.dateOfBirth || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg focus:ring-2 focus:ring-[#1976D2]/30 focus:border-[#1976D2]"
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-0.5">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Giới tính</label>
                  <select
                    value={editingStudent.gender || 'Nam'}
                    onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value as 'Nam' | 'Nữ' })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg focus:ring-2 focus:ring-[#1976D2]/30"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Trạng thái</label>
                  <select
                    value={editingStudent.status || 'Đang học'}
                    onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg focus:ring-2 focus:ring-[#1976D2]/30"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Chuyển đi">Chuyển đi</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Tên phụ huynh */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Họ tên phụ huynh</label>
                  <input
                    type="text"
                    value={editingStudent.parentName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                    placeholder="VD: Nguyễn Văn Minh"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Số điện thoại liên lạc</label>
                  <input
                    type="tel"
                    value={editingStudent.phone || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg"
                    placeholder="VD: 0903123456"
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">Ghi chú đặc điểm học sinh</label>
                <textarea
                  rows={2}
                  value={editingStudent.notes || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg text-xs"
                  placeholder="Ghi nhận sở thích, năng khiếu hoặc nội dung cần chú ý rèn thêm..."
                />
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{modalMode === 'add' ? 'Thêm học sinh' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
