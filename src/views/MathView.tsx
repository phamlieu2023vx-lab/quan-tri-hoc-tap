import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
} from 'lucide-react';
import {
  Student,
  AssessmentRecord,
  Criteria,
  RatingLevel,
  ActiveNavTab,
} from '../types/index.ts';
import { storage, getTodayDateString } from '../services/storage.ts';

interface MathViewProps {
  activeTab?: ActiveNavTab;
  students: Student[];
  assessments: AssessmentRecord[];
  criteria: Criteria[];
  onNavigate: (tab: ActiveNavTab) => void;
  onSelectStudent: (id: string) => void;
}

export const MathView: React.FC<MathViewProps> = ({
  activeTab,
  students,
  assessments,
  criteria,
  onNavigate,
  onSelectStudent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'entry' | 'support'>('summary');

  // Synchronize with activeTab from left navigation / right column
  React.useEffect(() => {
    if (activeTab === 'math_entry') {
      setActiveSubTab('entry');
    } else if (activeTab === 'math_support') {
      setActiveSubTab('support');
    } else if (activeTab === 'math_summary') {
      setActiveSubTab('summary');
    }
  }, [activeTab]);
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [weekNumber, setWeekNumber] = useState<number>(8);
  const [lessonName, setLessonName] = useState<string>('Phép cộng trong phạm vi 10');
  const [rating, setRating] = useState<RatingLevel>('T');
  const [teacherComment, setTeacherComment] = useState<string>('Tính nhẩm nhanh, hiểu mối liên hệ gộp số.');
  const [needsReinforcement, setNeedsReinforcement] = useState<boolean>(false);
  const [reinforcedTopic, setReinforcedTopic] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Criteria for Math
  const mathCriteria = criteria.filter(c => c.subject === 'math');
  const mathAssessments = assessments.filter(a => a.subject === 'math');

  // Handle single assessment save
  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Vui lòng chọn một học sinh để ghi nhận kết quả');
      return;
    }

    const currentCrit = mathCriteria.find(c => c.id === selectedCriteriaId) || mathCriteria[0];

    storage.saveAssessment({
      studentId: selectedStudentId,
      subject: 'math',
      date,
      weekNumber,
      lessonName,
      criteriaId: currentCrit.id,
      criteriaName: currentCrit.name,
      rating,
      teacherComment,
      needsReinforcement,
      reinforcedTopic: needsReinforcement ? reinforcedTopic : undefined,
      updatedBy: 'Phạm Thúy Liễu',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Students needing support in Math
  const studentsNeedingSupport = mathAssessments.filter(a => a.rating === 'C' || a.needsReinforcement);

  return (
    <div className="space-y-4 font-serif">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-[#16865C]">
            <Calculator className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1557A6]">
              Theo dõi kết quả học tập môn Toán Lớp 1
            </h2>
            <p className="text-xs text-gray-500">
              Đánh giá theo các mạch kiến thức: Đọc viết số, So sánh số, Phép cộng, Phép trừ, Hình học & Giải quyết vấn đề
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setActiveSubTab('summary');
              onNavigate('math_summary');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'summary'
                ? 'bg-[#16865C] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-[#16865C]'
            }`}
          >
            Bảng tổng hợp cả lớp
          </button>
          <button
            onClick={() => {
              setActiveSubTab('entry');
              onNavigate('math_entry');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'entry'
                ? 'bg-[#16865C] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-[#16865C]'
            }`}
          >
            + Nhập kết quả mới
          </button>
          <button
            onClick={() => {
              setActiveSubTab('support');
              onNavigate('math_support');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'support'
                ? 'bg-[#16865C] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-[#16865C]'
            }`}
          >
            Học sinh cần hỗ trợ ({studentsNeedingSupport.length})
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Summary Matrix Table */}
      {activeSubTab === 'summary' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1557A6]">
                Bảng theo dõi mức đạt từng tiêu chí Toán Lớp 1
              </h3>
              <p className="text-xs text-gray-500">
                Quy ước: <strong>T</strong> = Hoàn thành tốt, <strong>H</strong> = Hoàn thành, <strong>C</strong> = Cần hỗ trợ rèn thêm
              </p>
            </div>

            <button
              onClick={() => setActiveSubTab('entry')}
              className="px-3.5 py-1.5 bg-[#16865C] hover:bg-[#126b49] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi nhận đánh giá</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#D6E6F7] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EAF4FF] text-[#1557A6] font-bold">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3">Học sinh</th>
                  {mathCriteria.map(c => (
                    <th key={c.id} className="p-3 text-center min-w-[120px]" title={c.description}>
                      {c.name}
                    </th>
                  ))}
                  <th className="p-3 text-center">Đánh giá chung</th>
                  <th className="p-3 text-center w-16">Hồ sơ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st, idx) => {
                  const studentRecords = mathAssessments.filter(a => a.studentId === st.id);
                  const hasC = studentRecords.some(a => a.rating === 'C');
                  const hasT = studentRecords.some(a => a.rating === 'T');

                  return (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-[#17365D]">{st.fullName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{st.studentCode}</div>
                      </td>

                      {/* Criteria ratings */}
                      {mathCriteria.map(c => {
                        const rec = studentRecords.find(a => a.criteriaId === c.id);
                        if (!rec) {
                          return (
                            <td key={c.id} className="p-3 text-center text-gray-300">
                              -
                            </td>
                          );
                        }
                        return (
                          <td key={c.id} className="p-3 text-center">
                            <span
                              className={`inline-block w-6 h-6 rounded-md font-bold text-xs leading-6 ${
                                rec.rating === 'T'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.rating === 'H'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                              }`}
                              title={rec.teacherComment}
                            >
                              {rec.rating}
                            </span>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center">
                        {hasC ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Cần rèn thêm
                          </span>
                        ) : hasT ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Hoàn thành tốt
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Đạt chuẩn</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            onSelectStudent(st.id);
                            onNavigate('student_profile');
                          }}
                          className="p-1.5 text-[#1976D2] hover:bg-blue-50 rounded"
                          title="Xem chi tiết hồ sơ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Evaluation Entry Form */}
      {activeSubTab === 'entry' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#1557A6]">
              Nhập đánh giá kết quả Toán cho học sinh
            </h3>
            <p className="text-xs text-gray-500">
              Ghi nhận năng lực tính toán, kỹ năng nhận diện hình học và giải quyết tình huống
            </p>
          </div>

          <form onSubmit={handleSaveAssessment} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              {/* Chọn học sinh */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Chọn học sinh <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D6E6F7] rounded-lg font-serif text-[#17365D] focus:ring-2 focus:ring-[#16865C]"
                  required
                >
                  <option value="">-- Chọn học sinh Lớp 1/2 --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.studentCode} - {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tiêu chí */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mạch kiến thức / Tiêu chí <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCriteriaId}
                  onChange={e => setSelectedCriteriaId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D6E6F7] rounded-lg font-serif text-[#17365D] focus:ring-2 focus:ring-[#16865C]"
                >
                  {mathCriteria.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Ngày */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ngày đánh giá</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-serif"
                />
              </div>

              {/* Tuần */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tuần học</label>
                <input
                  type="number"
                  min={1}
                  max={35}
                  value={weekNumber}
                  onChange={e => setWeekNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-serif"
                />
              </div>

              {/* Mức đạt */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mức đạt (TT 27)</label>
                <select
                  value={rating}
                  onChange={e => setRating(e.target.value as RatingLevel)}
                  className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-bold"
                >
                  <option value="T">Hoàn thành tốt (T)</option>
                  <option value="H">Hoàn thành (H)</option>
                  <option value="C">Cần hỗ trợ (C)</option>
                </select>
              </div>
            </div>

            {/* Tên bài học */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tên bài học</label>
              <input
                type="text"
                value={lessonName}
                onChange={e => setLessonName(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                placeholder="VD: Phép cộng trong phạm vi 10"
              />
            </div>

            {/* Nhận xét giáo viên */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Lời nhận xét của cô giáo
              </label>
              <textarea
                rows={2}
                value={teacherComment}
                onChange={e => setTeacherComment(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg text-xs"
                placeholder="Nhận xét cụ thể, khích lệ kỹ năng tư duy và phản xạ toán học..."
              />
            </div>

            {/* Cần hỗ trợ checkbox */}
            <div className="p-3 bg-[#F7FAFF] rounded-xl border border-[#D6E6F7] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#17365D]">
                <input
                  type="checkbox"
                  checked={needsReinforcement}
                  onChange={e => setNeedsReinforcement(e.target.checked)}
                  className="w-4 h-4 text-[#16865C] rounded"
                />
                <span>Đánh dấu cần kèm thêm nội dung này</span>
              </label>

              {needsReinforcement && (
                <div>
                  <label className="block text-gray-600 mb-1">
                    Nội dung toán học cần rèn thêm cụ thể:
                  </label>
                  <input
                    type="text"
                    value={reinforcedTopic}
                    onChange={e => setReinforcedTopic(e.target.value)}
                    placeholder="VD: Bảng cộng các số có tổng bằng 10, phân biệt dấu > và <"
                    className="w-full px-3 py-1.5 bg-white border border-[#D6E6F7] rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {savedSuccess ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Đã lưu kết quả thành công!
                </span>
              ) : (
                <span></span>
              )}

              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 bg-[#16865C] hover:bg-[#126b49] text-white rounded-lg font-bold shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Lưu kết quả đánh giá</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-VIEW 3: Students Needing Support */}
      {activeSubTab === 'support' && (
        <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1557A6]">
                Danh sách học sinh cần hỗ trợ môn Toán ({studentsNeedingSupport.length} lượt đánh giá)
              </h3>
              <p className="text-xs text-gray-500">
                Các em cần giáo viên hoặc phụ huynh hỗ trợ thêm que tính, thao tác gộp tách số
              </p>
            </div>

            <button
              onClick={() => onNavigate('ai_assistant')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#1976D2] to-[#1557A6] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Dùng Trợ lý AI tạo bài tập rèn Toán</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studentsNeedingSupport.map(rec => {
              const student = students.find(s => s.id === rec.studentId);
              if (!student) return null;

              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#17365D]">{student.fullName}</span>
                      <span className="ml-2 font-mono text-gray-500">({student.studentCode})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                      {rec.criteriaName}
                    </span>
                  </div>

                  <div className="text-amber-950 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                    <strong>Nội dung cần rèn: </strong>
                    {rec.reinforcedTopic || rec.teacherComment}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                    <span>Đánh giá ngày {rec.date} ({rec.lessonName})</span>
                    <button
                      onClick={() => {
                        onSelectStudent(student.id);
                        onNavigate('student_profile');
                      }}
                      className="text-[#1976D2] font-bold hover:underline"
                    >
                      Mở hồ sơ em →
                    </button>
                  </div>
                </div>
              );
            })}

            {studentsNeedingSupport.length === 0 && (
              <div className="col-span-2 p-12 text-center text-gray-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-emerald-800">
                  Cả lớp đều đang theo kịp tốt chương trình môn Toán Lớp 1!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
