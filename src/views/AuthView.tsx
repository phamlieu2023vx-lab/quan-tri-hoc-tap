import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Lock,
  Mail,
  User,
  School,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Phone,
  BookmarkCheck,
  Award,
} from 'lucide-react';
import { authService, DEFAULT_TEACHER } from '../services/authService.ts';
import { UserAccount } from '../types/auth.ts';
import { useNotification } from '../context/NotificationContext.tsx';

interface AuthViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const { showToast } = useNotification();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('phamlieu2023vx@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('123456');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register form state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regSchool, setRegSchool] = useState<string>('Trường TH Phạm Phi Hùng');
  const [regClass, setRegClass] = useState<string>('1/2');
  const [regPhone, setRegPhone] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authService.login(loginEmail, loginPassword, rememberMe);
      if (res.success && res.user) {
        showToast(`Chào mừng ${res.user.fullName} quay trở lại!`, 'success');
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Đăng nhập không thành công');
      }
    } catch (err: unknown) {
      setErrorMsg('Có lỗi xảy ra trong quá trình đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Login for Teacher Lieu
  const handleQuickLoginTeacher = () => {
    setErrorMsg('');
    const user = authService.quickLoginTeacher(true);
    showToast(`Chào mừng Cô giáo ${user.fullName} – Lớp 1/2!`, 'success');
    onLoginSuccess(user);
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authService.register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        schoolName: regSchool,
        className: regClass,
        phoneNumber: regPhone,
      });

      if (res.success && res.user) {
        showToast(`Đăng ký tài khoản thành công! Chào mừng ${res.user.fullName}`, 'success');
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Đăng ký tài khoản không thành công');
      }
    } catch (err: unknown) {
      setErrorMsg('Có lỗi xảy ra khi tạo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF4FF] via-[#F4F8FE] to-[#E3EFFF] flex items-center justify-center p-4 sm:p-6 font-serif">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-[#CDE1F8] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Hero & Presentation */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1557A6] via-[#1976D2] to-[#0D47A1] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative glowing circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Info */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chương trình GDPT 2018 & TT 27</span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 text-amber-300 text-sm font-semibold tracking-wide uppercase">
                <School className="w-4 h-4" />
                <span>Trường TH Phạm Phi Hùng</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 leading-snug">
                TRI THỨC NỐI TIẾP AI
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 font-sans">
                Hệ thống quản lý lớp học số và hỗ trợ cá nhân hóa học tập dành cho giáo viên tiểu học
              </p>
            </div>
          </div>

          {/* Middle: Highlights / Classroom info */}
          <div className="relative z-10 my-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-sm font-bold">Lớp chủ nhiệm: 1/2</div>
                <div className="text-xs text-blue-100">Năm học 2024 - 2025 (30 học sinh)</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-blue-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Theo dõi chuyên cần & phiếu học bù tự động</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Đánh giá Tiếng Việt & Toán theo Thông tư 27</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Trợ lý AI soạn phiếu bài tập và kế hoạch kèm cặp</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-[11px] text-blue-200/90 flex items-center justify-between border-t border-white/10 pt-3">
            <span>GVCN: Phạm Thúy Liễu</span>
            <span className="flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Bảo mật cục bộ
            </span>
          </div>
        </div>

        {/* Right Side: Login / Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Tab Selector */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#1976D2] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Đăng nhập giáo viên
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#1976D2] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Đăng ký tài khoản
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email hoặc Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="phamlieu2023vx@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm text-gray-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  <span className="text-xs text-blue-600 hover:underline cursor-pointer" onClick={() => setLoginPassword('123456')}>
                    Mặc định: 123456
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm text-gray-800 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#1976D2] rounded border-gray-300 focus:ring-0"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#1976D2] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>{loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick One-Click Login for Teacher */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="text-center text-xs text-gray-500 font-medium">
                  Truy cập nhanh dành cho giáo viên chủ nhiệm:
                </div>
                <button
                  type="button"
                  onClick={handleQuickLoginTeacher}
                  className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Vào nhanh với tài khoản Cô Phạm Thúy Liễu (Lớp 1/2)</span>
                </button>
              </div>
            </form>
          ) : (
            /* 2. REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Họ và tên giáo viên *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="Cô Nguyễn Thị Mai"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email đăng nhập *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="giaovien@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Trường tiểu học
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <School className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regSchool}
                      onChange={e => setRegSchool(e.target.value)}
                      placeholder="Trường TH Phạm Phi Hùng"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Lớp chủ nhiệm
                  </label>
                  <input
                    type="text"
                    value={regClass}
                    onChange={e => setRegClass(e.target.value)}
                    placeholder="1/2"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mật khẩu khởi tạo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Ít nhất 4 ký tự"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="0903..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>{loading ? 'Đang tạo hồ sơ...' : 'Đăng ký tài khoản giáo viên'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
