import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  RefreshCw,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Student,
  ActiveNavTab,
  formatDateDisplay,
  parseDateToStorage,
  splitVietnameseName,
} from '../types/index.ts';
import { storage } from '../services/storage.ts';

interface ImportCsvViewProps {
  existingStudents: Student[];
  onNavigate: (tab: ActiveNavTab) => void;
}

interface ParsedRow {
  rowIndex: number;
  raw: Record<string, string>;
  mapped: {
    studentCode: string;
    lastName: string;
    middleName: string;
    firstName: string;
    fullName: string;
    dateOfBirth: string; // YYYY-MM-DD storage format
    className: string;
    gender: 'Nam' | 'Nữ';
    notes: string;
  };
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
}

export const ImportCsvView: React.FC<ImportCsvViewProps> = ({ existingStudents, onNavigate }) => {
  // Wizard steps: 1. Chọn tệp -> 2. Ánh xạ cột -> 3. Xem trước & Kiểm tra -> 4. Kết quả
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'csv' | 'xlsx' | 'xls'>('csv');
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Array<Record<string, string>>>([]);

  // Duplicate handling option: 'update' | 'skip'
  const [duplicateAction, setDuplicateAction] = useState<'update' | 'skip'>('update');

  // Column mapping (System field -> File Header)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    studentCode: '',
    fullName: '',
    lastName: '',
    middleName: '',
    firstName: '',
    dateOfBirth: '',
    gender: '',
    className: '',
    notes: '',
  });

  // Validated rows
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importResult, setImportResult] = useState<{
    added: number;
    updated: number;
    skipped: number;
    failed: number;
  } | null>(null);

  // Helper to parse date from string or Excel serial number
  const normalizeDateInput = (val: any): { formatted: string; isValid: boolean } => {
    if (val === null || val === undefined) return { formatted: '', isValid: false };
    const str = String(val).trim();
    if (!str) return { formatted: '', isValid: false };

    // Check if it's an Excel numeric date serial (e.g. 43831 for 2020)
    if (!isNaN(Number(str)) && Number(str) > 20000 && Number(str) < 60000) {
      try {
        const dateObj = XLSX.SSF.parse_date_code(Number(str));
        if (dateObj) {
          const y = String(dateObj.y);
          const m = String(dateObj.m).padStart(2, '0');
          const d = String(dateObj.d).padStart(2, '0');
          return { formatted: `${y}-${m}-${d}`, isValid: true };
        }
      } catch {
        // Continue to text parsing
      }
    }

    // Check YYYY-MM-DD or YYYY/MM/DD
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
      const parts = str.split(/[-/]/);
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return { formatted: `${y}-${m}-${d}`, isValid: true };
    }

    // Check DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
      const parts = str.split(/[-/]/);
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2];
      return { formatted: `${y}-${m}-${d}`, isValid: true };
    }

    return { formatted: str, isValid: false };
  };

  // Handle file upload (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    setFileType(isExcel ? 'xlsx' : 'csv');

    const reader = new FileReader();

    if (isExcel) {
      reader.onload = evt => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Read header and rows as JSON
          const sheetJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

          if (sheetJson.length === 0) {
            alert('Tệp Excel không có dòng dữ liệu nào.');
            return;
          }

          const headers = Object.keys(sheetJson[0]);
          const stringRows = sheetJson.map(row => {
            const mappedRow: Record<string, string> = {};
            headers.forEach(h => {
              mappedRow[h] = row[h] !== undefined && row[h] !== null ? String(row[h]).trim() : '';
            });
            return mappedRow;
          });

          setFileHeaders(headers);
          setRawRows(stringRows);
          autoDetectColumns(headers);
          setCurrentStep(2);
        } catch (err) {
          console.error('Error reading Excel:', err);
          alert('Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng tệp.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV reading with UTF-8 BOM handling and delimiter detection
      reader.onload = evt => {
        try {
          let text = evt.target?.result as string;
          // Strip BOM
          if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
          }

          // Use XLSX sheet parser for CSV to ensure quotes, line breaks, and commas/tabs are parsed properly
          const workbook = XLSX.read(text, { type: 'string' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const sheetJson = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

          if (sheetJson.length === 0) {
            alert('Tệp CSV không có dòng dữ liệu nào.');
            return;
          }

          const headers = Object.keys(sheetJson[0]);
          const stringRows = sheetJson.map(row => {
            const mappedRow: Record<string, string> = {};
            headers.forEach(h => {
              mappedRow[h] = row[h] !== undefined && row[h] !== null ? String(row[h]).trim() : '';
            });
            return mappedRow;
          });

          setFileHeaders(headers);
          setRawRows(stringRows);
          autoDetectColumns(headers);
          setCurrentStep(2);
        } catch (err) {
          console.error('Error reading CSV:', err);
          alert('Không thể đọc tệp CSV. Vui lòng đảm bảo tệp có định dạng UTF-8.');
        }
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  // Auto-detect column mappings based on Vietnamese keywords
  const autoDetectColumns = (headers: string[]) => {
    const autoMap: Record<string, string> = {
      studentCode: '',
      fullName: '',
      lastName: '',
      middleName: '',
      firstName: '',
      dateOfBirth: '',
      gender: '',
      className: '',
      notes: '',
    };

    headers.forEach(h => {
      const lower = h.toLowerCase().trim();

      if (lower.includes('mã') || lower.includes('code') || lower.includes('id') || lower.includes('mshs')) {
        autoMap.studentCode = h;
      } else if (lower.includes('họ và tên') || lower.includes('họ tên') || lower.includes('họ & tên') || lower === 'tên' || lower === 'full name') {
        autoMap.fullName = h;
      } else if (lower === 'họ' || lower.includes('họ đệm') || lower.includes('last name')) {
        autoMap.lastName = h;
      } else if (lower.includes('tên đệm') || lower.includes('đệm') || lower.includes('chữ lót')) {
        autoMap.middleName = h;
      } else if (lower === 'tên' || lower.includes('first name')) {
        autoMap.firstName = h;
      } else if (lower.includes('sinh') || lower.includes('birth') || lower.includes('dob') || lower.includes('ngày')) {
        autoMap.dateOfBirth = h;
      } else if (lower.includes('tính') || lower.includes('gender') || lower.includes('nam/nữ') || lower.includes('phái')) {
        autoMap.gender = h;
      } else if (lower.includes('lớp') || lower.includes('class')) {
        autoMap.className = h;
      } else if (lower.includes('chú') || lower.includes('note') || lower.includes('đặc điểm')) {
        autoMap.notes = h;
      }
    });

    setColumnMapping(autoMap);
  };

  // Run validation and preview (Step 3)
  const processValidation = () => {
    const existingCodeMap = new Map<string, Student>();
    existingStudents.forEach(s => existingCodeMap.set(s.studentCode.trim().toLowerCase(), s));

    const seenCodesInBatch = new Set<string>();

    const processed: ParsedRow[] = rawRows.map((row, idx) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const rawCode = columnMapping.studentCode ? row[columnMapping.studentCode] || '' : '';
      const rawFullName = columnMapping.fullName ? row[columnMapping.fullName] || '' : '';
      const rawLastName = columnMapping.lastName ? row[columnMapping.lastName] || '' : '';
      const rawMiddleName = columnMapping.middleName ? row[columnMapping.middleName] || '' : '';
      const rawFirstName = columnMapping.firstName ? row[columnMapping.firstName] || '' : '';
      const rawDob = columnMapping.dateOfBirth ? row[columnMapping.dateOfBirth] || '' : '';
      const rawGender = columnMapping.gender ? row[columnMapping.gender] || '' : '';
      const rawClass = columnMapping.className ? row[columnMapping.className] || '1/2' : '1/2';
      const rawNotes = columnMapping.notes ? row[columnMapping.notes] || '' : '';

      // Determine Full Name and split parts
      let fullName = rawFullName.trim();
      let lastName = rawLastName.trim();
      let middleName = rawMiddleName.trim();
      let firstName = rawFirstName.trim();

      if (!fullName && (lastName || firstName)) {
        // Combine from parts
        fullName = [lastName, middleName, firstName].filter(Boolean).join(' ');
      } else if (fullName && (!lastName || !firstName)) {
        // Split from full name
        const parts = splitVietnameseName(fullName);
        lastName = lastName || parts.lastName;
        middleName = middleName || parts.middleName;
        firstName = firstName || parts.firstName;
      }

      // 1. Validate full name
      if (!fullName) {
        errors.push('Họ và tên học sinh không được để trống.');
      }

      // 2. Validate student code
      const code = rawCode.trim();
      if (!code) {
        errors.push('Mã học sinh không được để trống.');
      } else {
        const lowerCode = code.toLowerCase();
        if (seenCodesInBatch.has(lowerCode)) {
          errors.push(`Mã học sinh "${code}" bị trùng lặp nhiều lần trong chính tệp tải lên.`);
        } else {
          seenCodesInBatch.add(lowerCode);
        }
      }

      // 3. Validate Date of Birth
      const { formatted: dob, isValid: isDateValid } = normalizeDateInput(rawDob);
      if (!isDateValid) {
        errors.push(`Ngày sinh "${rawDob}" không đúng định dạng (cần DD/MM/YYYY hoặc YYYY-MM-DD).`);
      }

      // 4. Normalize gender
      let gender: 'Nam' | 'Nữ' = 'Nam';
      const gLower = rawGender.toLowerCase().trim();
      if (
        gLower === 'nữ' ||
        gLower === 'nu' ||
        gLower === 'f' ||
        gLower === 'female' ||
        gLower === 'gái' ||
        gLower === 'con gái'
      ) {
        gender = 'Nữ';
      }

      // 5. Check duplicate with existing database
      const isDuplicate = code ? existingCodeMap.has(code.toLowerCase()) : false;
      if (isDuplicate) {
        if (duplicateAction === 'update') {
          warnings.push(`Mã học sinh "${code}" đã có trong hệ thống (sẽ cập nhật lại thông tin mới).`);
        } else {
          warnings.push(`Mã học sinh "${code}" đã có trong hệ thống (sẽ bỏ qua không nhập).`);
        }
      }

      return {
        rowIndex: idx + 2, // 1-based header is row 1
        raw: row,
        mapped: {
          studentCode: code,
          lastName,
          middleName,
          firstName,
          fullName,
          dateOfBirth: dob,
          className: rawClass.trim() || '1/2',
          gender,
          notes: rawNotes.trim(),
        },
        isValid: errors.length === 0,
        errors,
        warnings,
        isDuplicate,
      };
    });

    setParsedRows(processed);
    setCurrentStep(3);
  };

  // Perform Final Import
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Không có bản ghi hợp lệ nào để nhập.');
      return;
    }

    const studentsToImport = validRows.map(r => ({
      studentCode: r.mapped.studentCode,
      lastName: r.mapped.lastName,
      middleName: r.mapped.middleName,
      firstName: r.mapped.firstName,
      fullName: r.mapped.fullName,
      dateOfBirth: r.mapped.dateOfBirth,
      gender: r.mapped.gender,
      className: r.mapped.className,
      status: 'Đang học' as const,
      notes: r.mapped.notes,
      isDemo: false, // Imported students are real data
    }));

    try {
      const res = await fetch('/api/students/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: studentsToImport,
          updateExisting: duplicateAction === 'update',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local storage directly
        storage.importStudents(studentsToImport);

        setImportResult({
          added: data.added ?? 0,
          updated: data.updated ?? 0,
          skipped: data.skipped ?? 0,
          failed: parsedRows.length - validRows.length,
        });
      } else {
        // Fallback local import
        const result = storage.importStudents(studentsToImport);
        setImportResult({
          added: result.added,
          updated: result.updated,
          skipped: 0,
          failed: parsedRows.length - validRows.length,
        });
      }
    } catch {
      // Local fallback
      const result = storage.importStudents(studentsToImport);
      setImportResult({
        added: result.added,
        updated: result.updated,
        skipped: 0,
        failed: parsedRows.length - validRows.length,
      });
    }

    setCurrentStep(4);
  };

  // Download Error Report CSV with UTF-8 BOM
  const handleDownloadErrorReport = () => {
    const invalidRows = parsedRows.filter(r => !r.isValid);
    let csv = '\uFEFFDòng,Mã học sinh,Họ và tên,Ngày sinh,Giới tính,Lỗi phát hiện\n';
    invalidRows.forEach(r => {
      csv += `"${r.rowIndex}","${r.mapped.studentCode}","${r.mapped.fullName}","${r.raw[columnMapping.dateOfBirth] || ''}","${r.mapped.gender}","${r.errors.join('; ')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_loi_nhap_lieu_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Sample Template CSV (UTF-8 with BOM)
  const handleDownloadSampleCsv = () => {
    const sample = `\uFEFFMã Học Sinh,Họ Và Tên,Lớp,Ngày Sinh (DD/MM/YYYY),Giới Tính (Nam/Nữ),Ghi Chú
HS-1.2-031,Phan Gia Hân,1/2,15/03/2020,Nữ,Học tập chăm chỉ
HS-1.2-032,Lê Minh Trí,1/2,20/06/2020,Nam,Tiếp thu nhanh môn Toán
HS-1.2-033,Trần Bảo Anh,1/2,08/11/2020,Nữ,Chữ viết nắn nót
HS-1.2-034,Võ Hoàng Long,1/2,12/04/2020,Nam,Năng nổ phát biểu`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mau_nhap_danh_sach_Lop_1_2.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Sample Template Excel (.xlsx)
  const handleDownloadSampleExcel = () => {
    const data = [
      ['Mã Học Sinh', 'Họ Và Tên', 'Lớp', 'Ngày Sinh', 'Giới Tính', 'Ghi Chú'],
      ['HS-1.2-031', 'Phan Gia Hân', '1/2', '15/03/2020', 'Nữ', 'Học tập chăm chỉ'],
      ['HS-1.2-032', 'Lê Minh Trí', '1/2', '20/06/2020', 'Nam', 'Tiếp thu nhanh môn Toán'],
      ['HS-1.2-033', 'Trần Bảo Anh', '1/2', '08/11/2020', 'Nữ', 'Chữ viết nắn nót'],
      ['HS-1.2-034', 'Võ Hoàng Long', '1/2', '12/04/2020', 'Nam', 'Năng nổ phát biểu'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh');
    XLSX.writeFile(wb, `Mau_nhap_danh_sach_Lop_1_2.xlsx`);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const errorCount = parsedRows.length - validCount;

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-serif">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#EAF4FF] rounded-xl text-[#1976D2]">
            <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1557A6]">
              Nhập danh sách học sinh từ Excel / CSV
            </h2>
            <p className="text-xs text-gray-500">
              Hỗ trợ tệp Excel (.xlsx, .xls) và CSV chuẩn UTF-8 có dấu, bảo toàn chính xác dữ liệu lớp 1/2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSampleExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-lg text-xs font-bold border border-[#BCE0FD] transition-all"
            title="Tải tệp mẫu Excel .xlsx"
          >
            <Download className="w-3.5 h-3.5 text-[#1976D2]" />
            <span>Tải mẫu Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleDownloadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-300 transition-all"
            title="Tải tệp mẫu CSV chuẩn UTF-8"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu CSV</span>
          </button>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-3 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          {[
            { step: 1, label: '1. Chọn tệp Excel / CSV' },
            { step: 2, label: '2. Đối chiếu & Ánh xạ cột' },
            { step: 3, label: '3. Xem trước & Kiểm tra' },
            { step: 4, label: '4. Kết quả nhập liệu' },
          ].map(s => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                className={`p-2 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-[#1976D2] text-white font-bold border-[#1976D2] shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                <div className="font-semibold">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: CHỌN TỆP */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-8 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF4FF] flex items-center justify-center text-[#1976D2]">
            <Upload className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-[#17365D]">Chọn tệp danh sách học sinh để tải lên</h3>
            <p className="text-xs text-gray-500">
              Định dạng hỗ trợ: Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) hoặc CSV (<strong>.csv</strong> chuẩn UTF-8).
            </p>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-xl text-sm font-bold shadow-xs cursor-pointer transition-all active:scale-95">
              <Upload className="w-4 h-4" />
              <span>Duyệt tệp tin từ máy tính</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Check className="w-4 h-4" /> Bảo toàn tiếng Việt có dấu 100%
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Check className="w-4 h-4" /> Nhận diện ngày sinh DD/MM/YYYY
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Check className="w-4 h-4" /> Kiểm tra trùng mã học sinh
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: ĐỐI CHIẾU & ÁNH XẠ CỘT */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#1557A6]">
                Bước 2: Ánh xạ cột từ tệp "{fileName}" ({rawRows.length} dòng dữ liệu)
              </h3>
              <p className="text-xs text-gray-500">
                Hãy đối chiếu các cột trong tệp của cô với các trường thông tin của hệ thống LearnBridge
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-[#1976D2] rounded-full text-xs font-bold border border-blue-200">
              Đã phát hiện {fileHeaders.length} cột
            </span>
          </div>

          {/* Options: Duplicate action */}
          <div className="p-3 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-[#17365D]">Xử lý khi phát hiện học sinh đã có mã trong hệ thống:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="dupAction"
                  checked={duplicateAction === 'update'}
                  onChange={() => setDuplicateAction('update')}
                  className="text-[#1976D2]"
                />
                <span className="font-semibold text-[#1557A6]">Cập nhật thông tin mới</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="dupAction"
                  checked={duplicateAction === 'skip'}
                  onChange={() => setDuplicateAction('skip')}
                  className="text-[#1976D2]"
                />
                <span className="font-semibold text-gray-600">Bỏ qua bản ghi trùng mã</span>
              </label>
            </div>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'studentCode', label: 'Mã học sinh', required: true, desc: 'Mã định danh duy nhất (VD: HS-1.2-001)' },
              { key: 'fullName', label: 'Họ và tên đầy đủ', required: true, desc: 'Nếu tệp có cột Họ và tên chung' },
              { key: 'lastName', label: 'Họ (tùy chọn)', required: false, desc: 'Nếu tệp tách riêng cột Họ' },
              { key: 'middleName', label: 'Tên đệm (tùy chọn)', required: false, desc: 'Nếu tệp tách riêng cột Tên đệm' },
              { key: 'firstName', label: 'Tên (tùy chọn)', required: false, desc: 'Nếu tệp tách riêng cột Tên' },
              { key: 'dateOfBirth', label: 'Ngày sinh', required: true, desc: 'Hỗ trợ định dạng DD/MM/YYYY hoặc YYYY-MM-DD' },
              { key: 'gender', label: 'Giới tính', required: false, desc: 'Nam hoặc Nữ' },
              { key: 'className', label: 'Lớp học', required: false, desc: 'Mặc định: 1/2' },
              { key: 'notes', label: 'Ghi chú / Đặc điểm', required: false, desc: 'Đặc điểm học tập của học sinh' },
            ].map(f => (
              <div key={f.key} className="p-3 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17365D]">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-[11px] text-gray-500">{f.desc}</span>
                </div>

                <select
                  value={columnMapping[f.key] || ''}
                  onChange={e => setColumnMapping({ ...columnMapping, [f.key]: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-[#D6E6F7] rounded-lg text-xs font-serif text-[#17365D] focus:ring-2 focus:ring-[#1976D2]/30"
                >
                  <option value="">-- Chọn cột tương ứng trong tệp --</option>
                  {fileHeaders.map(h => (
                    <option key={h} value={h}>
                      Cột: {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Chọn lại tệp khác</span>
            </button>

            <button
              onClick={processValidation}
              disabled={!columnMapping.studentCode || (!columnMapping.fullName && !columnMapping.firstName)}
              className="flex items-center gap-1.5 px-6 py-2 bg-[#1976D2] hover:bg-[#1557A6] disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              <span>Xem trước & Kiểm tra dữ liệu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: XEM TRƯỚC & KIỂM TRA DỮ LIỆU */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1557A6]">
                Bước 3: Xem trước và đối chiếu từng dòng dữ liệu ({parsedRows.length} dòng)
              </h3>
              <p className="text-xs text-gray-500">
                Ngày sinh được kiểm tra chuẩn xác định dạng DD/MM/YYYY. Các dòng bị lỗi sẽ được giữ lại để cô xuất báo cáo sửa chữa.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{validCount} dòng hợp lệ</span>
              </span>

              {errorCount > 0 && (
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{errorCount} dòng có lỗi</span>
                </span>
              )}
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto max-h-96 border border-[#D6E6F7] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EAF4FF] text-[#1557A6] font-bold sticky top-0 shadow-xs">
                <tr>
                  <th className="p-2.5 text-center w-12">STT</th>
                  <th className="p-2.5">Mã HS</th>
                  <th className="p-2.5">Họ và tên</th>
                  <th className="p-2.5">Ngày sinh (DD/MM/YYYY)</th>
                  <th className="p-2.5">Giới tính</th>
                  <th className="p-2.5">Lớp</th>
                  <th className="p-2.5">Tình trạng kiểm tra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedRows.map(row => (
                  <tr
                    key={row.rowIndex}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      !row.isValid ? 'bg-red-50/50' : row.isDuplicate ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-2.5 text-center text-gray-500 font-mono">{row.rowIndex - 1}</td>
                    <td className="p-2.5 font-bold font-mono text-[#1557A6]">
                      {row.mapped.studentCode || '---'}
                    </td>
                    <td className="p-2.5 font-bold text-[#17365D]">
                      {row.mapped.fullName || '---'}
                    </td>
                    <td className="p-2.5 font-mono text-gray-700">
                      {formatDateDisplay(row.mapped.dateOfBirth)}
                    </td>
                    <td className="p-2.5 font-semibold">
                      <span className={row.mapped.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}>
                        {row.mapped.gender}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600">{row.mapped.className}</td>
                    <td className="p-2.5">
                      {row.isValid ? (
                        row.isDuplicate ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {duplicateAction === 'update' ? 'Trùng mã (Sẽ cập nhật)' : 'Trùng mã (Sẽ bỏ qua)'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Hợp lệ (Thêm mới)</span>
                          </span>
                        )
                      ) : (
                        <div className="text-red-600 font-semibold space-y-0.5">
                          {row.errors.map((err, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                              <span>{err}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Chỉnh lại ánh xạ</span>
              </button>

              {errorCount > 0 && (
                <button
                  onClick={handleDownloadErrorReport}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải báo cáo {errorCount} dòng lỗi</span>
                </button>
              )}
            </div>

            <button
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#16865C] hover:bg-[#126b49] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Xác nhận nhập {validCount} học sinh hợp lệ vào hệ thống</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: KẾT QUẢ NHẬP LIỆU */}
      {/* ============================================================== */}
      {currentStep === 4 && importResult && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-8 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-[#1557A6]">
              Nhập danh sách học sinh thành công!
            </h3>
            <p className="text-xs text-gray-600">
              Dữ liệu danh sách lớp 1/2 đã được lưu vào hệ thống máy chủ và bộ nhớ trình duyệt của cô.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-2xl font-bold text-emerald-700">{importResult.added}</div>
              <div className="text-xs text-emerald-800">Thêm mới</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">{importResult.updated}</div>
              <div className="text-xs text-blue-800">Cập nhật</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-2xl font-bold text-amber-700">{importResult.skipped}</div>
              <div className="text-xs text-amber-800">Bỏ qua (trùng)</div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-2xl font-bold text-red-700">{importResult.failed}</div>
              <div className="text-xs text-red-800">Lỗi không nhập</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('students')}
              className="px-6 py-2.5 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              Xem danh sách học sinh
            </button>

            <button
              onClick={() => {
                setCurrentStep(1);
                setParsedRows([]);
                setImportResult(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 text-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nhập tệp khác</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
