import React from 'react';
import {
  Star,
  Users,
  Upload,
  CalendarCheck,
  BookOpen,
  Calculator,
  BarChart3,
} from 'lucide-react';
import { ActiveNavTab } from '../types/index.ts';

interface BottomQuickAccessProps {
  onNavigate: (tab: ActiveNavTab) => void;
}

export const BottomQuickAccess: React.FC<BottomQuickAccessProps> = ({ onNavigate }) => {
  const quickLinks: Array<{ id: ActiveNavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'students', label: 'Danh sách học sinh', icon: Users },
    { id: 'students_import', label: 'Nhập từ Excel/CSV', icon: Upload },
    { id: 'attendance', label: 'Điểm danh', icon: CalendarCheck },
    { id: 'vietnamese_summary', label: 'Tiếng Việt', icon: BookOpen },
    { id: 'math_summary', label: 'Toán', icon: Calculator },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  return (
    <div className="bg-white border border-[#D6E6F7] rounded-xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2 select-none">
      {/* Title */}
      <div className="flex items-center gap-2 px-3 py-1 text-[#1557A6] font-bold text-sm font-serif">
        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
        <span>Truy cập nhanh</span>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#D6E6F7] bg-[#F7FAFF] hover:bg-[#EAF4FF] hover:border-[#1976D2] text-[#17365D] hover:text-[#1557A6] text-xs font-serif font-semibold transition-all shadow-2xs"
            >
              <Icon className="w-3.5 h-3.5 text-[#1976D2]" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
