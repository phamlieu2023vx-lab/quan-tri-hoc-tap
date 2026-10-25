import React, { useState } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Building,
  User,
  Calendar,
  AlertTriangle,
  Database,
  Sliders,
  HardDrive,
} from 'lucide-react';
import { ClassSettings, ActiveNavTab } from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { SupabaseSyncManager } from '../components/SupabaseSyncManager.tsx';

interface SettingsViewProps {
  settings: ClassSettings;
  onNavigate: (tab: ActiveNavTab) => void;
  defaultSubTab?: 'class_info' | 'supabase' | 'backup';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onNavigate, defaultSubTab = 'supabase' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'class_info' | 'supabase' | 'backup'>(defaultSubTab);
  const [formData, setFormData] = useState<ClassSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [restoreSuccess, setRestoreSuccess] = useState<boolean>(false);
  const [restoreError, setRestoreError] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export full backup
  const handleExportBackup = () => {
    const json = storage.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_luu_LearnBridge_Lop_${formData.className}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore backup from JSON
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = storage.importBackupJson(content);
      if (success) {
        setRestoreSuccess(true);
        setRestoreError('');
        setTimeout(() => setRestoreSuccess(false), 3000);
      } else {
        setRestoreError('Tệp sao lưu không hợp lệ hoặc bị lỗi cấu trúc dữ liệu.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to factory defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn đặt lại dữ liệu về trạng thái ban đầu của Lớp 1/2 (30 học sinh chuẩn)?'
      )
    ) {
      storage.resetToFactoryDefaults();
      setFormData(storage.getSettings());
      alert('Đã khôi phục dữ liệu ban đầu thành công!');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-serif">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-[#1976D2]">
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1557A6]">
              Cài đặt & Quản lý hệ thống LearnBridge
            </h2>
            <p className="text-xs text-gray-500">
              Kết nối cơ sở dữ liệu Supabase, thông tin lớp học, sao lưu và kiểm soát bảo mật
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-[#D6E6F7] pb-1 text-xs">
        <button
          onClick={() => setActiveSubTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'supabase'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-[#17365D] hover:bg-blue-50 hover:text-[#1976D2]'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Cơ sở dữ liệu Supabase</span>
          <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded text-[10px] font-mono">
            Mới
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('class_info')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'class_info'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-[#17365D] hover:bg-blue-50 hover:text-[#1976D2]'
          }`}
        >
          <Sliders className="w-4 h-4 text-blue-500" />
          <span>Thông tin lớp học & Phông chữ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'backup'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-[#17365D] hover:bg-blue-50 hover:text-[#1976D2]'
          }`}
        >
          <HardDrive className="w-4 h-4 text-indigo-500" />
          <span>Sao lưu tệp JSON & Đặt lại</span>
        </button>
      </div>

      {/* Subtab 1: Supabase Manager */}
      {activeSubTab === 'supabase' && (
        <SupabaseSyncManager />
      )}

      {/* Subtab 2: Class Info & Typography */}
      {activeSubTab === 'class_info' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1557A6]">Thông tin lớp học & Giáo viên</h3>
              <p className="text-xs text-gray-500">
                Các thông tin này sẽ được đồng bộ và hiển thị trên toàn bộ thanh tiêu đề và các báo cáo
              </p>
            </div>

            {saveSuccess && (
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã cập nhật thành công!
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tên trường học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-serif"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Họ và tên giáo viên chủ nhiệm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-serif"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Lớp phụ trách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-serif"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Năm học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={e => setFormData({ ...formData, schoolYear: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-serif"
                  required
                />
              </div>
            </div>

            {/* Phông chữ hiển thị hệ thống */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block font-bold text-gray-700 mb-2">
                Phông chữ hiển thị (Khắc phục hoàn toàn lỗi dãn cách dấu tiếng Việt):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    (formData.fontMode || 'serif') === 'serif'
                      ? 'border-[#1976D2] bg-[#EAF4FF]/60 shadow-xs ring-1 ring-[#1976D2]'
                      : 'border-[#D6E6F7] bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="fontMode"
                    value="serif"
                    checked={(formData.fontMode || 'serif') === 'serif'}
                    onChange={() => setFormData({ ...formData, fontMode: 'serif' })}
                    className="mt-1 text-[#1976D2]"
                  />
                  <div className="space-y-1">
                    <div className="font-bold text-[#1557A6] text-sm">
                      Noto Serif (Có chân – Chuẩn văn bản Sư phạm)
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Tương tự phong cách Times New Roman truyền thống, chuẩn Unicode tiếng Việt, dấu bỏ chuẩn xác không bị ngắt khoảng.
                    </p>
                    <div className="text-xs font-semibold text-gray-700 bg-white p-2 rounded border border-[#D6E6F7]/60">
                      “Tri thức nối tiếp AI – Kết nối tri thức – Kiến tạo tương lai”
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.fontMode === 'sans'
                      ? 'border-[#1976D2] bg-[#EAF4FF]/60 shadow-xs ring-1 ring-[#1976D2]'
                      : 'border-[#D6E6F7] bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="fontMode"
                    value="sans"
                    checked={formData.fontMode === 'sans'}
                    onChange={() => setFormData({ ...formData, fontMode: 'sans' })}
                    className="mt-1 text-[#1976D2]"
                  />
                  <div className="space-y-1">
                    <div className="font-bold text-[#1557A6] text-sm">
                      Be Vietnam Pro (Không chân – Hiện đại & Sắc nét)
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Thiết kế chuyên biệt cho Tiếng Việt, tối ưu trải nghiệm đọc trên màn hình máy tính, máy chiếu và điện thoại.
                    </p>
                    <div 
                      className="text-xs font-semibold text-gray-700 bg-white p-2 rounded border border-[#D6E6F7]/60"
                      style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}
                    >
                      “Tri thức nối tiếp AI – Kết nối tri thức – Kiến tạo tương lai”
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin lớp học</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subtab 3: Backup & Danger Zone */}
      {activeSubTab === 'backup' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#1557A6]">Sao lưu & Phục hồi tệp JSON ngoại tuyến</h3>
              <p className="text-xs text-gray-500">
                Xuất toàn bộ học sinh, kết quả đánh giá, chuyên cần và bài tập thành tệp tin an toàn (.json)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Export Box */}
              <div className="p-4 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-[#17365D] flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#1976D2]" />
                    <span>Xuất tệp sao lưu dữ liệu</span>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Tải xuống toàn bộ hồ sơ lớp học để lưu trữ trên máy tính hoặc chuyển sang thiết bị khác.
                  </p>
                </div>

                <button
                  onClick={handleExportBackup}
                  className="w-full py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file sao lưu (.json)</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="p-4 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-[#17365D] flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Phục hồi từ tệp sao lưu</span>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Tải tệp sao lưu .json đã lưu trước đó để khôi phục toàn bộ dữ liệu.
                  </p>
                </div>

                <label className="w-full py-2 bg-[#16865C] hover:bg-[#126b49] text-white font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center">
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp sao lưu để phục hồi</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {restoreSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Phục hồi toàn bộ dữ liệu từ tệp sao lưu thành công!</span>
              </div>
            )}

            {restoreError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{restoreError}</span>
              </div>
            )}
          </div>

          {/* Danger Zone: Factory Reset */}
          <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold">Khôi phục trạng thái chuẩn ban đầu</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Thao tác này sẽ đặt lại danh sách học sinh về 30 học sinh chuẩn ban đầu của Lớp 1/2 Trường TH Phạm Phi Hùng (16 nam, 14 nữ), đồng thời nạp lại các tiêu chuẩn đánh giá môn Tiếng Việt và Toán.
            </p>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Đặt lại về danh sách mẫu ban đầu (30 học sinh)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
