import React, { useState } from 'react';
import { BookOpen, Building2, User, ChevronDown, Sparkles, LogOut, Settings, ShieldCheck, Download, Type, Database } from 'lucide-react';
import { ClassSettings } from '../types/index.ts';
import { useNotification } from '../context/NotificationContext.tsx';

interface HeaderProps {
  settings: ClassSettings;
  onNavigate: (tab: string) => void;
  onExportBackup: () => void;
  onToggleFontMode?: () => void;
  onOpenSupabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onNavigate, onExportBackup, onToggleFontMode, onOpenSupabase }) => {
  const { showToast } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSupabaseClick = () => {
    if (onOpenSupabase) {
      onOpenSupabase();
    } else {
      onNavigate('settings');
    }
  };

  return (
    <header className="relative bg-gradient-to-r from-[#1557A6] via-[#1976D2] to-[#2B8BE3] text-white shadow-md border-b border-[#0f4484] select-none z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
          title="Về trang chủ"
        >
          {/* Logo icon container */}
          <div className="relative flex-shrink-0 w-11 h-11 bg-white/10 rounded-lg p-1.5 flex items-center justify-center border border-white/25 shadow-inner group-hover:bg-white/20 transition-all">
            <div className="relative flex items-center justify-center w-full h-full text-white">
              <BookOpen className="w-7 h-7 stroke-[2.2]" />
              <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-normal uppercase text-white drop-shadow-sm font-serif">
                TRI THỨC NỐI TIẾP AI – LEARNBRIDGE
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 italic tracking-normal font-serif">
              Kết nối tri thức – Kiến tạo tương lai
            </p>
          </div>
        </div>

        {/* Center: School & Class Info */}
        <div className="hidden lg:flex items-center gap-6 text-sm border-x border-white/20 px-6 py-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-200" />
            <div className="leading-tight">
              <div className="text-xs text-blue-200">Trường</div>
              <div className="font-semibold text-white">{settings.schoolName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-200" />
            <div className="leading-tight">
              <div className="text-xs text-blue-200">Giáo viên / Lớp</div>
              <div className="font-semibold text-white">
                {settings.teacherName} <span className="text-blue-200 font-normal">|</span> Lớp: {settings.className}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Font Mode Switcher, Supabase Quick Access & Teacher Profile */}
        <div className="flex items-center gap-2">
          {/* Supabase Quick Connection Button */}
          <button
            onClick={handleSupabaseClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-300/40 rounded-full text-xs text-white transition-all shadow-2xs font-serif cursor-pointer"
            title="Quản lý và đồng bộ cơ sở dữ liệu Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] font-bold">Supabase</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {onToggleFontMode && (
            <button
              onClick={onToggleFontMode}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/25 rounded-full text-xs text-white transition-all shadow-2xs font-serif"
              title={`Chuyển đổi phông chữ (Hiện tại: ${settings.fontMode === 'sans' ? 'Be Vietnam Pro - Không chân' : 'Noto Serif - Có chân chuẩn'})`}
            >
              <Type className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] font-medium">
                Font: <strong className="font-bold underline">{settings.fontMode === 'sans' ? 'Be Vietnam Pro' : 'Noto Serif'}</strong>
              </span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/25 rounded-full pl-1.5 pr-3 py-1 transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-expanded={dropdownOpen}
            >
              {/* Teacher avatar circle */}
              <div className="w-8 h-8 rounded-full bg-white text-[#1557A6] flex items-center justify-center overflow-hidden border border-white shadow-sm flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80"
                  alt="Cô Phạm Thúy Liễu"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-bold text-xs">TL</span>
              </div>

              <div className="text-left hidden sm:block leading-tight">
                <div className="text-sm font-bold text-white font-serif">{settings.teacherName}</div>
                <div className="text-[11px] text-blue-100 italic">Giáo viên chủ nhiệm</div>
              </div>

              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-[#D6E6F7] py-1 text-[#17365D] z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-gray-100 bg-[#F7FAFF]">
                  <p className="text-xs text-gray-500 font-serif">Tài khoản giáo viên</p>
                  <p className="text-sm font-bold text-[#1557A6] font-serif">{settings.teacherName}</p>
                  <p className="text-xs text-gray-600 font-serif">Lớp {settings.className} – {settings.schoolName}</p>
                </div>

                {/* Supabase entry */}
                <button
                  onClick={() => { setDropdownOpen(false); handleSupabaseClick(); }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#EAF4FF] flex items-center justify-between gap-2.5 transition-colors font-serif bg-emerald-50/60 border-b border-emerald-100"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900">Cơ sở dữ liệu Supabase</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    mcngorgybkspuhcfnued
                  </span>
                </button>

                {onToggleFontMode && (
                  <button
                    onClick={() => {
                      onToggleFontMode();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#EAF4FF] flex items-center justify-between gap-2.5 transition-colors font-serif border-b border-gray-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Type className="w-4 h-4 text-[#1976D2]" />
                      <span>Đổi phông chữ hiển thị</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1557A6]">
                      {settings.fontMode === 'sans' ? 'Be Vietnam Pro' : 'Noto Serif'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => { setDropdownOpen(false); onNavigate('settings'); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#EAF4FF] flex items-center gap-2.5 transition-colors font-serif"
                >
                  <Settings className="w-4 h-4 text-[#1976D2]" />
                  <span>Cài đặt thông tin lớp học</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onExportBackup(); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#EAF4FF] flex items-center gap-2.5 transition-colors font-serif"
                >
                  <Download className="w-4 h-4 text-[#16865C]" />
                  <span>Sao lưu dữ liệu hệ thống (.json)</span>
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); onNavigate('settings'); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#EAF4FF] flex items-center gap-2.5 transition-colors font-serif"
                >
                  <ShieldCheck className="w-4 h-4 text-[#1976D2]" />
                  <span>Bảo mật & Phân quyền</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    showToast('Hệ thống đang hoạt động ở chế độ Giáo viên chủ nhiệm Lớp 1/2.', 'info');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-serif"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
