import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  Key,
  Globe,
  Code2,
  HelpCircle,
  Eye,
  EyeOff,
  Check,
  FileCode,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  pushStudentsToSupabase,
  pullStudentsFromSupabase,
  analyzeKeyFormat,
  ConnectionTestResult,
  SUPABASE_SQL_SCHEMA,
  SupabaseConfig,
} from '../services/supabaseClient.ts';
import { storage } from '../services/storage.ts';

interface SupabaseSyncManagerProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const SupabaseSyncManager: React.FC<SupabaseSyncManagerProps> = ({ onClose, isModal }) => {
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'guide'>('config');

  // Key format analysis
  const keyAnalysis = analyzeKeyFormat(config.anonKey);

  // Check connection on mount if config exists
  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveSupabaseConfig(config);
    setConfig(updated);
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (err: unknown) {
      setTestResult({
        ok: false,
        status: 'network_error',
        message: 'Lỗi kiểm tra kết nối',
        details: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePushData = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const localStudents = storage.getStudents();
      const res = await pushStudentsToSupabase(localStudents);
      if (res.error) {
        setSyncMessage({
          type: 'error',
          text: `Đồng bộ thất bại: ${res.error}. Vui lòng đảm bảo bạn đã chạy mã SQL tạo bảng trên Supabase.`,
        });
      } else {
        const now = new Date().toLocaleTimeString('vi-VN');
        saveSupabaseConfig({ lastSyncTime: now });
        setConfig(getSupabaseConfig());
        setSyncMessage({
          type: 'success',
          text: `Đã đồng bộ thành công ${res.count} học sinh lên cơ sở dữ liệu Supabase lúc ${now}!`,
        });
        storage.logActivity('Đồng bộ Supabase', `Đã đẩy ${res.count} học sinh lên Supabase`, 'system');
      }
    } catch (err: unknown) {
      setSyncMessage({
        type: 'error',
        text: `Lỗi đồng bộ: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handlePullData = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await pullStudentsFromSupabase();
      if (res.error) {
        setSyncMessage({
          type: 'error',
          text: `Kéo dữ liệu thất bại: ${res.error}`,
        });
      } else if (res.students.length === 0) {
        setSyncMessage({
          type: 'error',
          text: 'Trên Supabase chưa có học sinh nào. Bạn hãy bấm nút "Đẩy dữ liệu lên Supabase" trước.',
        });
      } else {
        localStorage.setItem('learnbridge_students_v1', JSON.stringify(res.students));
        storage.ensureInitialized();
        // trigger reactivity
        const now = new Date().toLocaleTimeString('vi-VN');
        saveSupabaseConfig({ lastSyncTime: now });
        setConfig(getSupabaseConfig());
        setSyncMessage({
          type: 'success',
          text: `Đã tải về và cập nhật thành công ${res.students.length} học sinh từ Supabase lúc ${now}!`,
        });
        storage.logActivity('Đồng bộ Supabase', `Đã tải ${res.students.length} học sinh từ Supabase về máy`, 'system');
      }
    } catch (err: unknown) {
      setSyncMessage({
        type: 'error',
        text: `Lỗi kéo dữ liệu: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'khoi_tao_bang_supabase_learnbridge.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 font-serif ${isModal ? 'max-w-3xl w-full mx-auto' : ''}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17365D] via-[#1A457D] to-[#1E569C] text-white p-5 rounded-2xl shadow-sm border border-[#3b6ea8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Quản lý kết nối Cơ sở dữ liệu Supabase</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                PostgreSQL Cloud
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Đồng bộ 30 học sinh Lớp 1/2, sổ điểm danh và kết quả đánh giá Thông tư 27 lên đám mây Supabase
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-center px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/20"
          >
            Đóng
          </button>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-[#D6E6F7] pb-1 text-xs">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-lg transition-all ${
            activeTab === 'config'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-gray-600 hover:bg-blue-50 hover:text-[#1557A6]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Cấu hình & Trạng thái kết nối</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-lg transition-all ${
            activeTab === 'sql'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-gray-600 hover:bg-blue-50 hover:text-[#1557A6]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>2. Mã SQL tạo bảng trên Supabase</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-lg transition-all ${
            activeTab === 'guide'
              ? 'bg-[#1976D2] text-white shadow-xs'
              : 'text-gray-600 hover:bg-blue-50 hover:text-[#1557A6]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>3. Hướng dẫn chi tiết từng bước</span>
        </button>
      </div>

      {/* TAB 1: Cấu hình & Đồng bộ */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          {/* Diagnostic Status Box */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
              testResult?.status === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : testResult?.status === 'table_missing'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult?.status === 'connected' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    testResult?.status === 'table_missing' ? 'text-amber-600' : 'text-rose-600'
                  }`}
                />
              )}
              <div>
                <div className="font-bold text-sm">
                  {testing
                    ? 'Đang kiểm tra kết nối tới Supabase...'
                    : testResult
                    ? testResult.message
                    : 'Chưa kiểm tra trạng thái'}
                </div>
                {testResult?.details && (
                  <p className="mt-1 text-xs opacity-90 leading-relaxed font-sans">{testResult.details}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Đang kiểm tra...' : 'Kiểm tra lại'}</span>
              </button>
            </div>
          </div>

          {/* Form Cấu hình Supabase */}
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1557A6] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#1976D2]" />
                  <span>Thông số kết nối Supabase của bạn</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bạn có thể cập nhật trực tiếp tại đây mà không cần khởi động lại máy chủ
                </p>
              </div>

              <a
                href="https://supabase.com/dashboard/project/mcngorgybkspuhcfnued/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#1976D2] hover:underline flex items-center gap-1"
              >
                <span>Mở trang API của dự án</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              {/* URL */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>VITE_SUPABASE_URL (Địa chỉ dự án Supabase):</span>
                </label>
                <input
                  type="text"
                  value={config.url}
                  onChange={e => setConfig({ ...config, url: e.target.value.trim() })}
                  placeholder="https://xxxxxx.supabase.co"
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-mono text-xs bg-[#F7FAFF]"
                  required
                />
              </div>

              {/* ANON KEY */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>VITE_SUPABASE_ANON_KEY (Khóa công khai anon):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showKey ? 'Ẩn khóa' : 'Hiện khóa'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={config.anonKey}
                    onChange={e => setConfig({ ...config, anonKey: e.target.value.trim() })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 pr-10 border border-[#D6E6F7] rounded-lg font-mono text-xs bg-[#F7FAFF]"
                    required
                  />
                </div>

                {/* Key Format Helper Warning */}
                {!keyAnalysis.isValidFormat && (
                  <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Lưu ý quan trọng về mã khóa Anon:</p>
                      <p className="font-sans mt-0.5">{keyAnalysis.warning}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-500 italic">
                  Dữ liệu được lưu an toàn trong trình duyệt & tệp môi trường của bạn.
                </span>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu thông tin kết nối</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sync Actions Box */}
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-3">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-[#1557A6] flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <span>Đồng bộ 2 chiều giữa Ứng dụng & Supabase</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Đẩy dữ liệu 30 học sinh Lớp 1/2 hiện có lên đám mây Supabase hoặc kéo dữ liệu từ Supabase về
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Push Button */}
              <div className="p-3.5 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] flex flex-col justify-between gap-3">
                <div>
                  <div className="font-bold text-[#17365D] flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                    <span>Đẩy dữ liệu lên Supabase (Push)</span>
                  </div>
                  <p className="text-gray-500 mt-1 text-[11px]">
                    Lấy toàn bộ 30 học sinh và thông tin lớp hiện có trong máy đẩy lên bảng `students` trên Supabase.
                  </p>
                </div>

                <button
                  onClick={handlePushData}
                  disabled={syncing}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                  <span>{syncing ? 'Đang tải lên Supabase...' : 'Đẩy 30 học sinh lên Supabase'}</span>
                </button>
              </div>

              {/* Pull Button */}
              <div className="p-3.5 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] flex flex-col justify-between gap-3">
                <div>
                  <div className="font-bold text-[#17365D] flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-[#1976D2]" />
                    <span>Kéo dữ liệu từ Supabase về (Pull)</span>
                  </div>
                  <p className="text-gray-500 mt-1 text-[11px]">
                    Tải danh sách học sinh mới nhất từ bảng `students` trên Supabase về lưu vào ứng dụng.
                  </p>
                </div>

                <button
                  onClick={handlePullData}
                  disabled={syncing}
                  className="w-full py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <DownloadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                  <span>{syncing ? 'Đang kéo dữ liệu...' : 'Tải dữ liệu từ Supabase về'}</span>
                </button>
              </div>
            </div>

            {/* Sync feedback notification */}
            {syncMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  syncMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {syncMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{syncMessage.text}</span>
              </div>
            )}

            {config.lastSyncTime && (
              <div className="text-[11px] text-gray-500 text-right">
                Đồng bộ thành công gần nhất: <strong className="text-gray-700">{config.lastSyncTime}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Mã SQL tạo bảng trên Supabase */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1557A6] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#1976D2]" />
                <span>Mã SQL tự động tạo các bảng và phân quyền trên Supabase</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Bao gồm bảng học sinh, chuyên cần, đánh giá Thông tư 27, bài tập và mở quyền truy cập RLS cho khóa Anon.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="px-3.5 py-1.5 bg-[#1976D2] hover:bg-[#1557A6] text-white font-bold rounded-lg text-xs shadow-2xs flex items-center gap-1.5 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Đã sao chép!' : 'Sao chép toàn bộ mã SQL'}</span>
              </button>

              <button
                onClick={handleDownloadSql}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs border border-gray-200 flex items-center gap-1.5 transition-all"
                title="Tải tệp .sql về máy"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Tải tệp .sql</span>
              </button>
            </div>
          </div>

          <div className="bg-[#1E293B] text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-700 select-all">
            <pre>{SUPABASE_SQL_SCHEMA}</pre>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-[#1557A6] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1976D2] flex-shrink-0" />
              <span>
                Sau khi copy mã trên, hãy mở mục <strong>SQL Editor</strong> trên Supabase của bạn, dán vào và nhấn <strong>Run</strong>.
              </span>
            </div>

            <a
              href="https://supabase.com/dashboard/project/mcngorgybkspuhcfnued/sql"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-[#1976D2] text-white rounded-lg font-bold hover:bg-[#1557A6] flex-shrink-0 flex items-center gap-1"
            >
              <span>Mở SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* TAB 3: Hướng dẫn chi tiết từng bước */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1557A6]">
            Hướng dẫn kết nối Supabase hoàn chỉnh từ A đến Z cho Lớp 1/2
          </h3>

          <div className="space-y-4 text-xs">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-[#D6E6F7] bg-[#F7FAFF] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#17365D]">Lấy đúng khóa Anon Key (JWT)</h4>
                <p className="text-gray-600 leading-relaxed font-sans">
                  Khóa bạn vừa nhập <code>mcngorgybkspuhcfnued</code> là mã <strong>Project Reference ID</strong> (ID dự án).
                  Để kết nối thành công, bạn cần lấy mã <strong>`anon public`</strong>:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 font-sans mt-2">
                  <li>Truy cập vào <a href="https://supabase.com/dashboard/project/mcngorgybkspuhcfnued/settings/api" target="_blank" rel="noreferrer" className="text-[#1976D2] font-bold underline">Supabase Dashboard $\rightarrow$ Project Settings $\rightarrow$ API</a>.</li>
                  <li>Tìm phần <strong>Project API keys</strong>.</li>
                  <li>Nhấn nút <strong>Copy</strong> ở dòng có chữ <strong>`anon` `public`</strong> (chuỗi bắt đầu bằng <code>eyJhbGciOi...</code>).</li>
                  <li>Quay lại ứng dụng LearnBridge, dán vào ô <strong>VITE_SUPABASE_ANON_KEY</strong> ở Tab 1 và bấm <strong>Lưu</strong>.</li>
                </ol>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-[#D6E6F7] bg-[#F7FAFF] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#17365D]">Tạo các bảng cơ sở dữ liệu trên Supabase</h4>
                <p className="text-gray-600 leading-relaxed font-sans">
                  1. Chuyển sang <strong>Tab 2 (Mã SQL tạo bảng)</strong> ở trên và bấm <strong>Sao chép toàn bộ mã SQL</strong>.
                </p>
                <p className="text-gray-600 leading-relaxed font-sans">
                  2. Mở <a href="https://supabase.com/dashboard/project/mcngorgybkspuhcfnued/sql" target="_blank" rel="noreferrer" className="text-[#1976D2] font-bold underline">Supabase $\rightarrow$ SQL Editor</a>, dán toàn bộ mã vào khung soạn thảo rồi nhấn <strong>Run</strong>.
                </p>
                <p className="text-gray-600 leading-relaxed font-sans">
                  3. Supabase sẽ tự động tạo bảng <code>students</code>, <code>attendance</code>, <code>assessments</code>, <code>assignments</code>, <code>lessons</code> và thiết lập bảo mật RLS cho phép ứng dụng đọc ghi dữ liệu.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-[#D6E6F7] bg-[#F7FAFF] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#17365D]">Đồng bộ dữ liệu lớp học</h4>
                <p className="text-gray-600 leading-relaxed font-sans">
                  Sau khi bảng đã được tạo và khóa Anon đã chính xác, bạn chỉ cần bấm nút <strong>"Đẩy 30 học sinh lên Supabase"</strong>. Toàn bộ danh sách 30 học sinh Lớp 1/2 sẽ xuất hiện ngay lập tức trong mục Table Editor của Supabase!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
