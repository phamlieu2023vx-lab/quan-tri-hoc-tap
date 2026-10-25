import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  RotateCcw,
  Info,
  Calendar,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Student,
  ActiveNavTab,
  formatDateDisplay,
  parseDateToStorage,
  splitVietnameseName,
} from '../types/index.ts';
import { storage } from '../services/storage.ts';

interface StudentsViewProps {
  activeTab?: ActiveNavTab;
  students: Student[];
  onNavigate: (tab: ActiveNavTab) => void;
  onSelectStudent: (id: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  activeTab,
  students,
  onNavigate,
  onSelectStudent,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang học' | 'Chuyển đi'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'dob'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student>>({});
  const [inputDobDisplay, setInputDobDisplay] = useState(''); // DD/MM/YYYY input
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync with activeTab from navigation
  React.useEffect(() => {
    if (activeTab === 'students_add') {
      setEditingStudent({});
      setInputDobDisplay('');
      setFormErrors({});
      setIsModalOpen(true);
    }
  }, [activeTab]);

  // Delete Confirmation Modal State
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Live Statistics based strictly on real current student data
  const totalCount = students.length;
  const boysCount = students.filter(s => s.gender === 'Nam').length;
  const girlsCount = students.filter(s => s.gender === 'Nữ').length;
  const activeCount = students.filter(s => s.status === 'Đang học').length;
  const transferredCount = students.filter(s => s.status === 'Chuyển đi').length;
  const demoCount = students.filter(s => s.isDemo).length;

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        // Gender filter
        if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
        // Status filter
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        // Search query (search studentCode and fullName)
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
          // Sort by Vietnamese first name (Tên), then middle and last name
          const nameA = a.firstName || a.fullName.split(' ').pop() || '';
          const nameB = b.firstName || b.fullName.split(' ').pop() || '';
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
  }, [students, searchQuery, genderFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Show status notification
  const showNotice = (type: 'success' | 'error', message: string) => {
    setStatusNotification({ type, message });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Open Add Student Modal
  const handleOpenAdd = () => {
    const nextNum = students.length + 1;
    const defaultCode = `HS-1.2-${String(nextNum).padStart(3, '0')}`;
    setEditingStudent({
      studentCode: defaultCode,
      lastName: '',
      middleName: '',
      firstName: '',
      fullName: '',
      dateOfBirth: '2020-01-01',
      gender: 'Nam',
      className: '1/2',
      status: 'Đang học',
      parentName: '',
      phone: '',
      address: '',
      notes: '',
      isDemo: false,
    });
    setInputDobDisplay('01/01/2020');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Student Modal
  const handleOpenEdit = (student: Student) => {
    const names = splitVietnameseName(student.fullName);
    setEditingStudent({
      ...student,
      lastName: student.lastName || names.lastName,
      middleName: student.middleName || names.middleName,
      firstName: student.firstName || names.firstName,
    });
    setInputDobDisplay(formatDateDisplay(student.dateOfBirth));
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Synchronize Full Name and Split Names
  const handleFullNameChange = (val: string) => {
    const { lastName, middleName, firstName } = splitVietnameseName(val);
    setEditingStudent(prev => ({
      ...prev,
      fullName: val,
      lastName,
      middleName,
      firstName,
    }));
  };

  const handleSubNameChange = (field: 'lastName' | 'middleName' | 'firstName', val: string) => {
    setEditingStudent(prev => {
      const updated = { ...prev, [field]: val };
      const full = [updated.lastName || '', updated.middleName || '', updated.firstName || '']
        .filter(Boolean)
        .join(' ');
      return { ...updated, fullName: full };
    });
  };

  // Save student (Add / Edit) with rigorous validation
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const code = editingStudent.studentCode?.trim();
    const fullName = editingStudent.fullName?.trim();

    if (!code) {
      errors.studentCode = 'Mã học sinh là trường bắt buộc.';
    } else {
      // Check duplicate code against other students
      const isDup = students.some(
        s => s.id !== editingStudent.id && s.studentCode.trim().toLowerCase() === code.toLowerCase()
      );
      if (isDup) {
        errors.studentCode = `Mã học sinh "${code}" đã tồn tại. Vui lòng chọn mã khác.`;
      }
    }

    if (!fullName) {
      errors.fullName = 'Họ và tên học sinh là trường bắt buộc.';
    }

    // Validate Date of Birth
    let finalDob = editingStudent.dateOfBirth || '';
    if (inputDobDisplay.trim()) {
      const match = inputDobDisplay.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const d = parseInt(match[1]);
        const m = parseInt(match[2]);
        const y = parseInt(match[3]);
        if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2010 || y > 2025) {
          errors.dateOfBirth = 'Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY (ví dụ: 15/08/2020).';
        } else {
          finalDob = parseDateToStorage(inputDobDisplay.trim());
        }
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(inputDobDisplay.trim())) {
        errors.dateOfBirth = 'Định dạng ngày sinh phải là DD/MM/YYYY (ví dụ: 27/01/2020).';
      }
    } else {
      errors.dateOfBirth = 'Ngày sinh không được để trống.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const { lastName, middleName, firstName } = splitVietnameseName(fullName!);

    storage.saveStudent({
      id: editingStudent.id,
      studentCode: code!,
      lastName: editingStudent.lastName || lastName,
      middleName: editingStudent.middleName || middleName,
      firstName: editingStudent.firstName || firstName,
      fullName: fullName!,
      dateOfBirth: finalDob,
      gender: editingStudent.gender || 'Nam',
      className: editingStudent.className?.trim() || '1/2',
      status: editingStudent.status || 'Đang học',
      parentName: editingStudent.parentName?.trim() || '',
      phone: editingStudent.phone?.trim() || '',
      address: editingStudent.address?.trim() || '',
      notes: editingStudent.notes?.trim() || '',
      isDemo: false, // User saved is considered real data
    });

    setIsModalOpen(false);
    showNotice('success', `Đã lưu thành công hồ sơ học sinh ${fullName}`);
  };

  // Confirm delete student
  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    const name = deletingStudent.fullName;
    storage.deleteStudent(deletingStudent.id);
    setDeletingStudent(null);
    showNotice('success', `Đã xóa học sinh ${name} khỏi danh sách`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredStudents.length === 0) {
      alert('Không có học sinh nào trong danh sách để xuất tệp.');
      return;
    }

    let csv = `\uFEFFSTT,Mã Học Sinh,Họ Và Tên,Ngày Sinh (DD/MM/YYYY),Giới Tính,Lớp,Trạng Thái,Phụ Huynh,Số Điện Thoại,Ghi Chú\n`;
    filteredStudents.forEach((st, idx) => {
      csv += `"${idx + 1}","${st.studentCode}","${st.fullName}","${formatDateDisplay(st.dateOfBirth)}","${st.gender}","${st.className}","${st.status}","${st.parentName || ''}","${st.phone || ''}","${st.notes || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_sach_hoc_sinh_Lop_1_2_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('success', `Đã xuất ${filteredStudents.length} học sinh ra tệp CSV thành công`);
  };

  // Load Demo Data
  const handleLoadDemo = () => {
    if (window.confirm('Bạn có muốn nạp 5 học sinh mẫu có gắn nhãn [DỮ LIỆU DEMO] để kiểm thử giao diện?')) {
      storage.loadDemoData();
      showNotice('success', 'Đã nạp danh sách học sinh thử nghiệm [DỮ LIỆU DEMO]');
    }
  };

  // Clear All
  const handleClearAll = () => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ danh sách để bắt đầu nhập hồ sơ thực tế của lớp 1/2? Thao tác này sẽ xóa tất cả học sinh hiện tại.')) {
      storage.clearAllStudents();
      showNotice('success', 'Đã dọn dẹp danh sách. Bạn có thể thêm hoặc nhập danh sách thật ngay bây giờ.');
    }
  };

  return (
    <div className="space-y-4 font-serif">
      {/* Top Banner / Notification */}
      {statusNotification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold animate-in fade-in duration-200 ${
            statusNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusNotification.message}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header and Live Statistic Cards */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EAF4FF] rounded-xl text-[#1976D2]">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1557A6]">
                  Quản lý học sinh Lớp 1/2
                </h2>
                {demoCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Chứa {demoCount} hồ sơ [DỮ LIỆU DEMO]
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Trường Tiểu học Phạm Phi Hùng • GVCN: Phạm Thúy Liễu • Năm học 2024 - 2025
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCsv}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-xl text-xs font-bold border border-[#BCE0FD] transition-all"
              title="Xuất tệp CSV danh sách lớp"
            >
              <Download className="w-4 h-4 text-[#1976D2]" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => onNavigate('students_import')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-xl text-xs font-bold border border-[#BCE0FD] transition-all"
              title="Nhập danh sách từ Excel hoặc CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#1976D2]" />
              <span>Nhập Excel/CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Thêm học sinh</span>
            </button>
          </div>
        </div>

        {/* Live Counters - Strictly calculated from real data */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="p-3 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] flex flex-col justify-between">
            <span className="text-gray-500 font-semibold">Tổng sĩ số thực tế</span>
            <div className="text-2xl font-bold text-[#1557A6] mt-1">{totalCount} <span className="text-xs font-normal text-gray-500">em</span></div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col justify-between">
            <span className="text-blue-700 font-semibold">Học sinh Nam</span>
            <div className="text-2xl font-bold text-blue-800 mt-1">{boysCount} <span className="text-xs font-normal text-blue-600">em</span></div>
          </div>

          <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-200 flex flex-col justify-between">
            <span className="text-pink-700 font-semibold">Học sinh Nữ</span>
            <div className="text-2xl font-bold text-pink-800 mt-1">{girlsCount} <span className="text-xs font-normal text-pink-600">em</span></div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col justify-between">
            <span className="text-emerald-700 font-semibold">Đang học</span>
            <div className="text-2xl font-bold text-[#16865C] mt-1">{activeCount} <span className="text-xs font-normal text-emerald-600">em</span></div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col justify-between">
            <span className="text-amber-700 font-semibold">Chuyển đi / Nghỉ</span>
            <div className="text-2xl font-bold text-amber-800 mt-1">{transferredCount} <span className="text-xs font-normal text-amber-600">em</span></div>
          </div>
        </div>
      </div>

      {/* Search, Filters, and Sorting Toolbar */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm theo mã học sinh hoặc họ tên..."
            className="w-full pl-9 pr-8 py-2 bg-[#F7FAFF] border border-[#D6E6F7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]/25 text-xs text-[#17365D]"
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

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 text-gray-600 font-semibold">
            <span>Giới tính:</span>
            <select
              value={genderFilter}
              onChange={e => {
                setGenderFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#F7FAFF] border border-[#D6E6F7] rounded-lg text-xs font-serif text-[#17365D] focus:ring-1 focus:ring-[#1976D2]"
            >
              <option value="all">Tất cả ({totalCount})</option>
              <option value="Nam">Nam ({boysCount})</option>
              <option value="Nữ">Nữ ({girlsCount})</option>
            </select>
          </div>

          {/* Sort By Name */}
          <div className="flex items-center gap-1 text-gray-600 font-semibold">
            <span>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#F7FAFF] border border-[#D6E6F7] rounded-lg text-xs font-serif text-[#17365D] focus:ring-1 focus:ring-[#1976D2]"
            >
              <option value="name">Theo tên (A - Z)</option>
              <option value="code">Theo mã học sinh</option>
              <option value="dob">Theo ngày sinh</option>
            </select>
          </div>

          {/* Page size */}
          <div className="flex items-center gap-1 text-gray-600 font-semibold">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 bg-[#F7FAFF] border border-[#D6E6F7] rounded-lg text-xs font-serif text-[#17365D]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#EAF4FF] text-[#1557A6] font-bold border-b border-[#D6E6F7]">
              <tr>
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-3 w-28">Mã học sinh</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3 w-28">Ngày sinh</th>
                <th className="py-3 px-3 w-20">Giới tính</th>
                <th className="py-3 px-3 w-16">Lớp</th>
                <th className="py-3 px-3">Ghi chú</th>
                <th className="py-3 px-3 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF4FF]">
              {paginatedStudents.map((st, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr key={st.id} className="hover:bg-[#F7FAFF] transition-colors group">
                    <td className="py-2.5 px-3 text-center text-gray-500 font-mono">
                      {globalIndex}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#1557A6]">
                      {st.studentCode}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelectStudent(st.id);
                            onNavigate('student_profile');
                          }}
                          className="font-bold text-[#17365D] hover:text-[#1976D2] hover:underline text-left text-xs sm:text-sm font-serif"
                        >
                          {st.fullName}
                        </button>

                        {st.isDemo && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            DEMO
                          </span>
                        )}

                        {st.status === 'Chuyển đi' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Chuyển đi
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-gray-700">
                      {formatDateDisplay(st.dateOfBirth)}
                    </td>

                    <td className="py-2.5 px-3 font-semibold">
                      <span className={st.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}>
                        {st.gender}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-gray-700">
                      {st.className || '1/2'}
                    </td>

                    <td className="py-2.5 px-3 text-gray-500 max-w-xs truncate" title={st.notes || ''}>
                      {st.notes || '---'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Xem hồ sơ */}
                        <button
                          onClick={() => {
                            onSelectStudent(st.id);
                            onNavigate('student_profile');
                          }}
                          className="p-1.5 text-[#1976D2] hover:bg-[#EAF4FF] rounded-lg transition-colors"
                          title="Xem hồ sơ học sinh"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Sửa */}
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-[#1557A6] hover:bg-[#EAF4FF] rounded-lg transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Xóa */}
                        <button
                          onClick={() => setDeletingStudent(st)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-serif">
                    <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-[#17365D]">Không có học sinh nào</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchQuery ? 'Không tìm thấy học sinh phù hợp với từ khóa tìm kiếm.' : 'Lớp chưa có học sinh nào được lưu trữ.'}
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        + Thêm học sinh đầu tiên
                      </button>
                      <button
                        onClick={() => onNavigate('students_import')}
                        className="px-4 py-2 bg-[#EAF4FF] text-[#1557A6] border border-[#BCE0FD] rounded-lg text-xs font-bold"
                      >
                        Nhập từ Excel/CSV
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-3.5 px-5 border-t border-[#EAF4FF] bg-[#F7FAFF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div>
            Hiển thị <strong>{filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
            <strong>{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> trên{' '}
            <strong>{filteredStudents.length}</strong> học sinh
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

      {/* Demo Data Management Footer Bar */}
      <div className="p-3 bg-white rounded-xl border border-[#D6E6F7] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <Info className="w-4 h-4 text-[#1976D2]" />
          <span>Dữ liệu thực tế được lưu trữ bền vững trên máy chủ và đồng bộ trình duyệt.</span>
        </div>

        <div className="flex items-center gap-2">
          {totalCount === 0 && (
            <button
              onClick={handleLoadDemo}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold transition-colors"
            >
              + Nạp 5 hồ sơ minh họa [DỮ LIỆU DEMO]
            </button>
          )}

          {totalCount > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              Dọn dẹp danh sách để nhập thật
            </button>
          )}
        </div>
      </div>

      {/* MODAL 1: Add / Edit Student Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#D6E6F7] shadow-2xl overflow-hidden font-serif">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#1557A6] to-[#1976D2] text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingStudent.id ? 'Chỉnh sửa hồ sơ học sinh' : 'Thêm học sinh mới vào Lớp 1/2'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs">
              {/* Row 1: Mã học sinh & Lớp */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Mã học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.studentCode || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, studentCode: e.target.value })}
                    placeholder="VD: HS-1.2-001"
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-bold text-[#1557A6] focus:ring-2 focus:ring-[#1976D2]/25"
                    required
                  />
                  {formErrors.studentCode && (
                    <p className="text-red-500 text-[11px] mt-0.5">{formErrors.studentCode}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Lớp học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.className || '1/2'}
                    onChange={e => setEditingStudent({ ...editingStudent, className: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-bold text-gray-700"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Họ và tên đầy đủ */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Họ và tên đầy đủ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingStudent.fullName || ''}
                  onChange={e => handleFullNameChange(e.target.value)}
                  placeholder="VD: Nguyễn Thị Thảo Anh"
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg text-sm font-bold text-[#17365D] focus:ring-2 focus:ring-[#1976D2]/25"
                  required
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-[11px] mt-0.5">{formErrors.fullName}</p>
                )}
              </div>

              {/* Row 3: Chi tiết Họ, Tên đệm, Tên riêng */}
              <div className="grid grid-cols-3 gap-3 p-2.5 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7]">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1 text-[11px]">Họ</label>
                  <input
                    type="text"
                    value={editingStudent.lastName || ''}
                    onChange={e => handleSubNameChange('lastName', e.target.value)}
                    placeholder="VD: Nguyễn"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D6E6F7] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1 text-[11px]">Tên đệm</label>
                  <input
                    type="text"
                    value={editingStudent.middleName || ''}
                    onChange={e => handleSubNameChange('middleName', e.target.value)}
                    placeholder="VD: Thị"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D6E6F7] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1 text-[11px]">Tên</label>
                  <input
                    type="text"
                    value={editingStudent.firstName || ''}
                    onChange={e => handleSubNameChange('firstName', e.target.value)}
                    placeholder="VD: Thảo Anh"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D6E6F7] rounded text-xs font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Ngày sinh, Giới tính, Trạng thái */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Ngày sinh (DD/MM/YYYY) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inputDobDisplay}
                    onChange={e => setInputDobDisplay(e.target.value)}
                    placeholder="27/01/2020"
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-mono"
                    required
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-red-500 text-[11px] mt-0.5">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Giới tính</label>
                  <select
                    value={editingStudent.gender || 'Nam'}
                    onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={editingStudent.status || 'Đang học'}
                    onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-semibold"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Chuyển đi">Chuyển đi</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Phụ huynh & Số điện thoại */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Họ tên người giám hộ / Phụ huynh</label>
                  <input
                    type="text"
                    value={editingStudent.parentName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    placeholder="VD: Nguyễn Văn Minh"
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    value={editingStudent.phone || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    placeholder="VD: 0903123456"
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Row 6: Địa chỉ & Ghi chú */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú đặc điểm học sinh</label>
                <textarea
                  rows={2}
                  value={editingStudent.notes || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  placeholder="Ghi nhận về năng khiếu, sức khỏe hoặc điểm cần rèn thêm..."
                  className="w-full px-3 py-1.5 border border-[#D6E6F7] rounded-lg text-xs"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg font-bold shadow-xs transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingStudent.id ? 'Lưu thay đổi' : 'Thêm vào danh sách'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-2xl p-5 font-serif space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Xác nhận xóa hồ sơ học sinh</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ học sinh{' '}
              <strong className="text-red-600">{deletingStudent.fullName}</strong> (Mã:{' '}
              <span className="font-mono font-bold">{deletingStudent.studentCode}</span>)? Thao tác này sẽ xóa hồ sơ khỏi danh sách lớp 1/2.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
