import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  BookOpen,
  Calculator,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Lesson, SubjectType, ActiveNavTab } from '../types/index.ts';
import { storage } from '../services/storage.ts';

interface LessonsViewProps {
  lessons: Lesson[];
  onNavigate: (tab: ActiveNavTab) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ lessons, onNavigate }) => {
  const [selectedSubject, setSelectedSubject] = useState<'all' | SubjectType>('all');
  const [selectedWeek, setSelectedWeek] = useState<number>(8);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0]);

  const filteredLessons = lessons.filter(l => {
    if (selectedSubject !== 'all' && l.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="space-y-4 font-serif">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-[#1976D2]">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1557A6]">
              Kế hoạch bài học & Nội dung học tập Lớp 1/2
            </h2>
            <p className="text-xs text-gray-500">
              Quản lý tiến độ giảng dạy theo tuần, mục tiêu cần đạt và liên kết nội dung học bù cho học sinh vắng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value as any)}
            className="px-3 py-1.5 bg-[#F7FAFF] border border-[#D6E6F7] rounded-lg text-xs font-bold text-[#17365D]"
          >
            <option value="all">Tất cả môn học</option>
            <option value="vietnamese">Tiếng Việt 1</option>
            <option value="math">Toán 1</option>
          </select>
        </div>
      </div>

      {/* Grid: Lesson List (Left) & Lesson Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Lessons List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs space-y-2.5">
            <h3 className="text-sm font-bold text-[#1557A6] border-b border-gray-100 pb-2">
              Danh mục bài học ({filteredLessons.length})
            </h3>

            <div className="space-y-2">
              {filteredLessons.map(les => {
                const isSelected = selectedLesson?.id === les.id;
                return (
                  <div
                    key={les.id}
                    onClick={() => setSelectedLesson(les)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#EAF4FF] border-[#1976D2] shadow-xs'
                        : 'bg-white border-[#D6E6F7] hover:bg-[#F7FAFF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`p-1 rounded ${
                            les.subject === 'vietnamese'
                              ? 'bg-blue-100 text-[#1557A6]'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {les.subject === 'vietnamese' ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : (
                            <Calculator className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="font-bold text-[#1557A6]">Tuần {les.week}</span>
                      </div>
                      <span className="font-mono text-gray-400">{les.lessonDate}</span>
                    </div>

                    <div className="font-bold text-sm text-[#17365D] mt-1">{les.title}</div>
                    <p className="text-gray-500 line-clamp-1 mt-0.5">{les.objectives}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Lesson Plan Detail */}
        <div className="lg:col-span-7">
          {selectedLesson ? (
            <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-[#1557A6] rounded-md font-bold text-xs">
                      Tuần {selectedLesson.week} • Môn {selectedLesson.subject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}
                    </span>
                    <span className="font-mono text-xs text-gray-500">
                      Ngày dạy: {selectedLesson.lessonDate}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1557A6] mt-1">
                    {selectedLesson.title}
                  </h3>
                </div>

                <button
                  onClick={() => onNavigate('ai_assistant')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-lg text-xs font-bold transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#1976D2]" />
                  <span>Tạo bài học bù từ bài này</span>
                </button>
              </div>

              {/* Objectives */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#17365D] uppercase text-[11px] text-[#1976D2]">
                  1. Mục tiêu bài học:
                </div>
                <div className="p-3 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-gray-800 leading-relaxed">
                  {selectedLesson.objectives}
                </div>
              </div>

              {/* Key Knowledge */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#17365D] uppercase text-[11px] text-[#1976D2]">
                  2. Kiến thức trọng tâm:
                </div>
                <div className="p-3 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-gray-800 leading-relaxed">
                  {selectedLesson.keyKnowledge}
                </div>
              </div>

              {/* Required Competencies */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#17365D] uppercase text-[11px] text-[#1976D2]">
                  3. Yêu cầu cần đạt (Chương trình GDPT 2018):
                </div>
                <div className="p-3 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-gray-800 leading-relaxed">
                  {selectedLesson.requiredCompetencies}
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#17365D] uppercase text-[11px] text-[#1976D2]">
                  4. Các hoạt động dạy học chính:
                </div>
                <div className="p-3 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-gray-800 leading-relaxed">
                  {selectedLesson.activities}
                </div>
              </div>

              {/* Makeup content */}
              {selectedLesson.makeupContent && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Nội dung hướng dẫn học bù cho học sinh vắng:</span>
                  </div>
                  <p className="text-amber-800">{selectedLesson.makeupContent}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">Chọn một bài học để xem chi tiết.</div>
          )}
        </div>
      </div>
    </div>
  );
};
