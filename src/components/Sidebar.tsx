import React, { useState } from 'react';
import {
  Home,
  Users,
  CalendarCheck,
  BookOpen,
  Calculator,
  FileEdit,
  FileText,
  Bot,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Sprout,
} from 'lucide-react';
import { ActiveNavTab } from '../types/index.ts';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onNavigate: (tab: ActiveNavTab) => void;
  collapsed?: boolean;
}

interface MenuItem {
  id: ActiveNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: Array<{ id: ActiveNavTab; label: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    students: true,
    attendance: false,
    vietnamese: false,
    math: false,
    assignments: false,
    lessons: false,
    ai: false,
    reports: false,
    settings: false,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-expand group corresponding to activeTab
  React.useEffect(() => {
    const groupKey = activeTab.split('_')[0];
    if (groupKey) {
      setOpenGroups(prev => ({ ...prev, [groupKey]: true }));
    }
  }, [activeTab]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'students',
      label: 'Quản lý học sinh',
      icon: Users,
      subItems: [
        { id: 'students', label: 'Danh sách học sinh' },
        { id: 'students_add', label: 'Thêm học sinh mới' },
        { id: 'students_import', label: 'Nhập từ Excel/CSV' },
        { id: 'student_profile', label: 'Hồ sơ học sinh' },
      ],
    },
    {
      id: 'attendance',
      label: 'Điểm danh',
      icon: CalendarCheck,
      subItems: [
        { id: 'attendance', label: 'Điểm danh hằng ngày' },
        { id: 'attendance_history', label: 'Lịch sử chuyên cần' },
        { id: 'attendance_absent', label: 'Danh sách học sinh vắng' },
      ],
    },
    {
      id: 'vietnamese_summary',
      label: 'Kết quả Tiếng Việt',
      icon: BookOpen,
      subItems: [
        { id: 'vietnamese_summary', label: 'Bảng tổng hợp' },
        { id: 'vietnamese_entry', label: 'Nhập kết quả' },
        { id: 'vietnamese_support', label: 'Học sinh cần hỗ trợ' },
      ],
    },
    {
      id: 'math_summary',
      label: 'Kết quả Toán',
      icon: Calculator,
      subItems: [
        { id: 'math_summary', label: 'Bảng tổng hợp' },
        { id: 'math_entry', label: 'Nhập kết quả' },
        { id: 'math_support', label: 'Học sinh cần hỗ trợ' },
      ],
    },
    {
      id: 'assignments',
      label: 'Bài tập & Rèn luyện',
      icon: FileEdit,
      subItems: [
        { id: 'assignments', label: 'Danh sách bài tập' },
        { id: 'assignments_create', label: 'Tạo bài tập mới' },
      ],
    },
    {
      id: 'lessons',
      label: 'Nội dung học tập',
      icon: FileText,
      subItems: [
        { id: 'lessons', label: 'Kế hoạch bài học' },
      ],
    },
    {
      id: 'ai_assistant',
      label: 'Trợ lý AI',
      icon: Bot,
      subItems: [
        { id: 'ai_assistant', label: 'Trung tâm Trợ lý AI' },
      ],
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: BarChart3,
      subItems: [
        { id: 'reports', label: 'Báo cáo tổng hợp' },
      ],
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      subItems: [
        { id: 'settings', label: 'Thông tin lớp học' },
      ],
    },
  ];

  const isItemActive = (item: MenuItem) => {
    if (activeTab === item.id) return true;
    if (item.subItems?.some(s => s.id === activeTab)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-[#D6E6F7] flex flex-col justify-between flex-shrink-0 select-none shadow-sm min-h-[calc(100vh-62px)]">
      {/* Navigation list */}
      <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = isItemActive(item);
          const hasSubs = item.subItems && item.subItems.length > 0;
          const groupKey = item.id.split('_')[0];
          const isOpen = !!openGroups[groupKey];

          return (
            <div key={item.id} className="space-y-0.5">
              <div
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1976D2] text-white shadow-sm font-bold'
                    : 'text-[#17365D] hover:bg-[#EAF4FF] hover:text-[#1557A6]'
                }`}
                onClick={() => {
                  if (hasSubs) {
                    setOpenGroups(prev => ({ ...prev, [groupKey]: true }));
                  }
                  onNavigate(item.id);
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#1976D2]'}`} />
                  <span className="font-serif tracking-normal">{item.label}</span>
                </div>

                {hasSubs && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(groupKey);
                    }}
                    className="p-1 hover:bg-white/20 rounded transition-colors text-current opacity-70"
                    title={isOpen ? 'Thu gọn' : 'Mở rộng'}
                  >
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Sub-items */}
              {hasSubs && isOpen && (
                <div className="pl-7 pr-1 py-1 space-y-0.5 border-l-2 border-[#D6E6F7] ml-4 my-0.5">
                  {item.subItems!.map(sub => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-serif transition-colors text-left ${
                          isSubActive
                            ? 'bg-[#EAF4FF] text-[#1557A6] font-bold border-l-2 border-[#1976D2]'
                            : 'text-[#475569] hover:bg-[#F7FAFF] hover:text-[#1976D2]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inspirational Bottom Card */}
      <div className="p-3 m-3 bg-[#EAF4FF]/80 rounded-xl border border-[#D6E6F7] text-center shadow-xs">
        <p className="text-xs italic text-[#17365D] leading-relaxed font-serif">
          “Mỗi đứa trẻ đều có một thế giới riêng để khám phá, hãy cùng nhau thắp sáng ước mơ!”
        </p>
        <div className="flex justify-center mt-2 text-[#1976D2]">
          <Sprout className="w-5 h-5 animate-bounce" />
        </div>
      </div>
    </aside>
  );
};
