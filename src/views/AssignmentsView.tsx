import React, { useState } from 'react';
import {
  FileEdit,
  Plus,
  Printer,
  CheckCircle2,
  Calendar,
  Users,
  Sparkles,
  BookOpen,
  Calculator,
  X,
  Save,
  HelpCircle,
} from 'lucide-react';
import {
  Student,
  Assignment,
  Question,
  SubjectType,
  ActiveNavTab,
} from '../types/index.ts';
import { storage, getTodayDateString } from '../services/storage.ts';

interface AssignmentsViewProps {
  activeTab?: ActiveNavTab;
  students: Student[];
  assignments: Assignment[];
  onNavigate: (tab: ActiveNavTab) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  activeTab,
  students,
  assignments,
  onNavigate,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    assignments[0] || null
  );
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Sync with activeTab from left navigation / right column
  React.useEffect(() => {
    if (activeTab === 'assignments_create') {
      setShowCreateModal(true);
    }
  }, [activeTab]);

  // New assignment form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('vietnamese');
  const [topic, setTopic] = useState('');
  const [targetGroup, setTargetGroup] = useState<'all' | 'needs_support' | 'custom'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      prompt: 'Điền từ thích hợp vào chỗ chấm:',
      type: 'fill_in_the_blank',
      correctAnswer: '',
    },
  ]);

  // Handle add question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        prompt: `Câu hỏi ${questions.length + 1}:`,
        type: 'multiple_choice',
        options: ['A.', 'B.', 'C.', 'D.'],
        correctAnswer: '',
      },
    ]);
  };

  // Handle save assignment
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên phiếu bài tập');
      return;
    }

    const nextCode = `BT-${subject === 'vietnamese' ? 'TV' : 'TOAN'}-${String(
      assignments.length + 1
    ).padStart(2, '0')}`;

    const studentIds =
      targetGroup === 'all'
        ? students.filter(s => s.status === 'Đang học').map(s => s.id)
        : selectedStudentIds;

    const newAssignment = storage.saveAssignment({
      code: nextCode,
      title,
      subject,
      topic: topic || title,
      format: 'multiple_choice',
      targetGroup,
      targetStudentIds: studentIds,
      assignedDate: getTodayDateString(),
      dueDate,
      questions,
      status: 'active',
      notes: 'Phiếu rèn luyện Lớp 1/2',
    });

    setSelectedAssignment(newAssignment);
    setShowCreateModal(false);
    // Reset
    setTitle('');
    setTopic('');
  };

  return (
    <div className="space-y-4 font-serif">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-[#1976D2]">
            <FileEdit className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1557A6]">
              Quản lý bài tập & Phiếu rèn luyện Lớp 1/2
            </h2>
            <p className="text-xs text-gray-500">
              Soạn thảo, giao bài cá nhân hóa, theo dõi hoàn thành và in ấn phiếu học tập trực tiếp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ai_assistant')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#1976D2] to-[#1557A6] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Trợ lý AI tạo bài tập</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#16865C] hover:bg-[#126b49] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài tập thủ công</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Assignment List (Left) + Detail & Printable (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Assignment List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-4 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#1557A6] border-b border-gray-100 pb-2">
              Danh sách phiếu bài tập ({assignments.length})
            </h3>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {assignments.map(asg => {
                const isSelected = selectedAssignment?.id === asg.id;
                return (
                  <div
                    key={asg.id}
                    onClick={() => setSelectedAssignment(asg)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#EAF4FF] border-[#1976D2] shadow-xs'
                        : 'bg-white border-[#D6E6F7] hover:bg-[#F7FAFF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`p-1 rounded ${
                            asg.subject === 'vietnamese'
                              ? 'bg-blue-100 text-[#1557A6]'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {asg.subject === 'vietnamese' ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : (
                            <Calculator className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="font-bold text-[#1557A6]">{asg.code}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          asg.targetGroup === 'all'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {asg.targetGroup === 'all'
                          ? 'Cả lớp'
                          : `Nhóm riêng (${asg.targetStudentIds.length} em)`}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#17365D] line-clamp-1">{asg.title}</h4>
                    <p className="text-gray-500 mt-1 line-clamp-1">Chủ đề: {asg.topic}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                      <span>{asg.questions.length} câu hỏi</span>
                      <span>Hạn: {asg.dueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Assignment Details & Printable Worksheet */}
        <div className="lg:col-span-7">
          {selectedAssignment ? (
            <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-[#1557A6] rounded font-bold text-xs">
                      {selectedAssignment.code}
                    </span>
                    <h3 className="text-base font-bold text-[#1557A6]">
                      {selectedAssignment.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Môn: {selectedAssignment.subject === 'vietnamese' ? 'Tiếng Việt 1' : 'Toán 1'} • Hạn nộp: {selectedAssignment.dueDate}
                  </p>
                </div>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1976D2] hover:bg-[#1557A6] text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Xem & In phiếu bài tập</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-gray-600">
                  NỘI DUNG CÁC CÂU HỎI TRONG PHIẾU ({selectedAssignment.questions.length} CÂU):
                </div>

                {selectedAssignment.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] space-y-2 text-xs"
                  >
                    <div className="font-bold text-[#17365D] text-sm">
                      Câu {idx + 1}: {q.prompt}
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pl-2">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-lg border ${
                              opt === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.guide && (
                      <div className="text-gray-500 italic bg-white p-2 rounded border border-gray-100 text-[11px]">
                        Gợi ý cho bé: {q.guide}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Target Students */}
              <div className="pt-3 border-t border-gray-100 text-xs">
                <span className="font-bold text-gray-700">Học sinh được giao bài: </span>
                <span className="text-gray-600">
                  {selectedAssignment.targetGroup === 'all'
                    ? 'Tất cả học sinh trong lớp 1/2'
                    : `${selectedAssignment.targetStudentIds.length} học sinh trong danh sách rèn thêm`}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#D6E6F7] p-12 text-center text-gray-400">
              Vui lòng chọn hoặc tạo bài tập mới.
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Create Manual Assignment */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#D6E6F7] shadow-2xl overflow-hidden font-serif">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#1557A6] to-[#1976D2] text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Tạo phiếu bài tập mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="p-5 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tên phiếu bài tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Phiếu rèn vần an - ăn - ân tuần 8"
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Môn học</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  >
                    <option value="vietnamese">Tiếng Việt</option>
                    <option value="math">Toán</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hạn nộp bài</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Đối tượng giao bài</label>
                <select
                  value={targetGroup}
                  onChange={e => setTargetGroup(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                >
                  <option value="all">Cả lớp 1/2</option>
                  <option value="needs_support">Học sinh cần rèn thêm</option>
                </select>
              </div>

              {/* Questions */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Các câu hỏi trong phiếu:</span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-[#1976D2] font-bold hover:underline"
                  >
                    + Thêm câu hỏi
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-[#F7FAFF] rounded-lg border border-[#D6E6F7] space-y-1.5">
                    <label className="font-bold text-gray-700">Câu {idx + 1}:</label>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={e => {
                        const copy = [...questions];
                        copy[idx].prompt = e.target.value;
                        setQuestions(copy);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#D6E6F7] rounded text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1976D2] hover:bg-[#1557A6] text-white font-bold rounded-lg"
                >
                  Lưu & Giao bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Printable A4 Worksheet Preview */}
      {showPrintModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border shadow-2xl p-6 font-serif space-y-6">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="font-bold text-sm text-[#1557A6]">Xem trước phiếu bài tập A4 để in</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#1976D2] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>In ngay</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* A4 Sheet Format */}
            <div className="border-2 border-dashed border-gray-300 p-8 rounded-xl bg-white space-y-6 text-black">
              {/* Header of paper */}
              <div className="flex justify-between items-start text-xs border-b-2 border-black pb-3">
                <div>
                  <div className="font-bold uppercase">Trường Tiểu học Phạm Phi Hùng</div>
                  <div>Lớp: 1/2 • GV: Phạm Thúy Liễu</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">NĂM HỌC 2024 - 2025</div>
                  <div>Ngày giao: {selectedAssignment.assignedDate}</div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold uppercase tracking-wider">
                  {selectedAssignment.title}
                </h2>
                <div className="text-xs italic">
                  Chủ đề: {selectedAssignment.topic}
                </div>
              </div>

              {/* Student info box */}
              <div className="text-xs flex justify-between py-1 border border-gray-400 p-2 rounded">
                <span>Họ và tên học sinh: ................................................................</span>
                <span>Lớp: 1/2</span>
                <span>Điểm: ...........</span>
              </div>

              {/* Questions */}
              <div className="space-y-5 text-sm">
                {selectedAssignment.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <div className="font-bold">
                      Câu {idx + 1}: {q.prompt}
                    </div>

                    {q.options && (
                      <div className="grid grid-cols-2 gap-4 pl-4 text-xs">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-gray-600 inline-block"></span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-1">
                      Bài làm: ............................................................................................................................
                    </div>
                  </div>
                ))}
              </div>

              {/* Teacher signature area */}
              <div className="flex justify-between pt-8 text-xs">
                <div className="text-center">
                  <div className="font-bold">Ý kiến phụ huynh</div>
                  <div className="text-[10px] text-gray-400 mt-6">(Ký và ghi rõ họ tên)</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">Giáo viên chấm bài</div>
                  <div className="text-[10px] text-gray-400 mt-6">Cô Phạm Thúy Liễu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
