import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  BookOpen,
  Calculator,
  UserX,
  FileCheck,
  TrendingUp,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Student, ActiveNavTab, SubjectType } from '../types/index.ts';

interface AiAssistantViewProps {
  students: Student[];
  initialStudentName?: string;
  initialMissedDate?: string;
  onNavigate: (tab: ActiveNavTab) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  students,
  initialStudentName,
  initialMissedDate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'worksheet' | 'makeup' | 'comments' | 'support_plan' | 'summary'
  >('worksheet');

  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Form states
  // 1. Worksheet
  const [wsSubject, setWsSubject] = useState<SubjectType>('vietnamese');
  const [wsTopic, setWsTopic] = useState('Vần an, ăn, ân và phân biệt c/k');
  const [wsLevel, setWsLevel] = useState('Vừa sức (Chuẩn kiến thức lớp 1)');
  const [wsCount, setWsCount] = useState(4);

  // 2. Makeup Lesson
  const [makeupStudent, setMakeupStudent] = useState(initialStudentName || (students[3]?.fullName || 'Trương Hoàng Hải Đăng'));
  const [makeupSubject, setMakeupSubject] = useState<SubjectType>('vietnamese');
  const [makeupLesson, setMakeupLesson] = useState('Bài 33: on, ôn, ơn');
  const [missedDate, setMissedDate] = useState(initialMissedDate || '2024-10-23');

  // 3. Comments (Circular 27)
  const [commentStudent, setCommentStudent] = useState(students[0]?.fullName || 'Nguyễn Thị Thảo Anh');
  const [commentSubject, setCommentSubject] = useState<SubjectType>('vietnamese');
  const [commentRating, setCommentRating] = useState('Hoàn thành tốt (T)');
  const [commentStrengths, setCommentStrengths] = useState('Đọc trơn to rõ, chữ viết đều nét');
  const [commentWeaknesses, setCommentWeaknesses] = useState('Cần chú ý tư thế ngồi ngay ngắn');

  // 4. Support Plan
  const [supportCriteria, setSupportSupportCriteria] = useState('Quy tắc chính tả phân biệt c và k');
  const [supportSubject, setSupportSubject] = useState<SubjectType>('vietnamese');

  // Copy result
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Generate Worksheet
  const handleGenerateWorksheet = async () => {
    setLoading(true);
    setGeneratedText('');
    try {
      const res = await fetch('/api/ai/worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: wsSubject,
          topic: wsTopic,
          level: wsLevel,
          questionCount: wsCount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.result);
      } else {
        throw new Error('API returned ' + res.status);
      }
    } catch {
      // Fallback Primary Worksheet Template
      const fallback = `PHIẾU HỌC TẬP CÁ NHÂN HÓA - ${wsSubject === 'vietnamese' ? 'TIẾNG VIỆT 1' : 'TOÁN 1'}
Trường Tiểu học Phạm Phi Hùng - Lớp 1/2
Giáo viên chủ nhiệm: Phạm Thúy Liễu
Họ và tên học sinh: ................................................................ Lớp 1/2
Chủ đề: ${wsTopic} (Mức độ: ${wsLevel})

--------------------------------------------------------------------------------------
CÂU 1 (Nhận biết):
${wsSubject === 'vietnamese' 
  ? 'Bé hãy khoanh tròn vào từ có chứa vần "' + wsTopic.split(' ')[1] + '":\n   A. Khăn rằn       B. Bàn học       C. Sân bóng' 
  : 'Tính nhẩm nhanh kết quả phép tính sau:\n   4 + 3 = .....          5 + 5 = .....          6 + 2 = .....'}

CÂU 2 (Vận dụng):
${wsSubject === 'vietnamese'
  ? 'Điền chữ thích hợp vào chỗ chấm:\n   - Con .....iến (c hay k?)\n   - Quả .....am (c hay k?)'
  : 'Điền dấu thích hợp ( >, <, = ) vào ô trống:\n   5 + 3 [   ] 7          6 + 4 [   ] 10          8 - 2 [   ] 5'}

CÂU 3 (Thực hành viết/giải toán):
${wsSubject === 'vietnamese'
  ? 'Nối từ ở cột A với từ ở cột B cho phù hợp:\n   Cột A: Mẹ đi làm | Đàn cá | Bé rửa\n   Cột B: bơi lội dưới hồ | về muộn | tay sạch sẽ'
  : 'Có 6 bông hoa cúc, bé hái thêm 4 bông hoa hồng. Hỏi bé có tất cả bao nhiêu bông hoa?\n   Phép tính: ..... + ..... = .....\n   Trả lời: Bé có tất cả ..... bông hoa.'}

--------------------------------------------------------------------------------------
Ý kiến của cô giáo: ............................................................................................
Khen ngợi bé: [ ★ Xuất sắc ]    [ ★ Cố gắng thêm ]`;
      setGeneratedText(fallback);
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Makeup Lesson
  const handleGenerateMakeup = async () => {
    setLoading(true);
    setGeneratedText('');
    try {
      const res = await fetch('/api/ai/makeup-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: makeupStudent,
          lessonTitle: makeupLesson,
          subject: makeupSubject,
          missedDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.result);
      } else {
        throw new Error('API offline');
      }
    } catch {
      const fallback = `PHIẾU HỌC BÙ KIẾN THỨC TẠI NHÀ
Trường Tiểu học Phạm Phi Hùng - Lớp 1/2
Giáo viên gửi: Cô Phạm Thúy Liễu
Kính gửi Quý phụ huynh em: ${makeupStudent}

Chào ba mẹ em ${makeupStudent},
Hôm nay ngày ${missedDate}, lớp 1/2 đã học bài "${makeupLesson}" môn ${makeupSubject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'}. Vì em vắng học, cô Liễu tóm tắt lại 3 kiến thức trọng tâm để ba mẹ đồng hành kèm con tại nhà khoảng 20 phút nhé:

1. KIẾN THỨC CỐT LÕI BÀI HỌC:
   - Cách nhận diện và đọc trơn các âm/vần hoặc công thức tính của bài.
   - Chú ý nét nối con chữ hoặc thao tác gộp/tách số với que tính.

2. BÀI TẬP BÉ TỰ LUYỆN:
   - Bài 1: Mở SGK trang bài học, đọc to cho ba mẹ nghe 2 lần.
   - Bài 2: Viết vào vở ô ly 3 dòng chữ sạch đẹp.
   - Bài 3: Hoàn thành 2 câu hỏi trong Vở bài tập.

3. DẶN DÒ:
   Sáng mai đến lớp, em hãy mang vở đến bàn cô Liễu để cô chấm và tặng sao khen thưởng nhé. Chúc em mau khỏe và học thật vui!`;
      setGeneratedText(fallback);
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate Comments (Circular 27)
  const handleGenerateComments = async () => {
    setLoading(true);
    setGeneratedText('');
    try {
      const res = await fetch('/api/ai/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: commentStudent,
          subject: commentSubject,
          strengths: commentStrengths,
          difficulties: commentWeaknesses,
          rating: commentRating,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.result);
      } else {
        throw new Error('API offline');
      }
    } catch {
      const fallback = `GỢI Ý NHẬN XÉT HỌC TẬP THEO THÔNG TƯ 27/2020/TT-BGDĐT
Học sinh: ${commentStudent} - Lớp 1/2
Môn học: ${commentSubject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'} (${commentRating})

PHƯƠNG ÁN 1 (Ghi Sổ theo dõi đánh giá học sinh):
"Em ${commentStudent} ${commentStrengths.toLowerCase()}, nắm chắc kiến thức trọng tâm. Cần chú ý rèn thêm ${commentWeaknesses.toLowerCase()} để hoàn thiện hơn."

PHƯƠNG ÁN 2 (Gửi qua Sổ liên lạc điện tử / Zalo cho Phụ huynh):
"Chào ba mẹ em ${commentStudent}, tuần này em học tập rất tích cực, ${commentStrengths.toLowerCase()}. Để giúp con tiến bộ hơn nữa, kính nhờ ba mẹ nhắc nhở con rèn thêm ${commentWeaknesses.toLowerCase()} mỗi ngày 10 phút. Cô giáo cảm ơn sự đồng hành của gia đình!"

PHƯƠNG ÁN 3 (Lời nhận xét trực tiếp động viên bé trên phiếu bài làm):
"Cô Liễu khen con đã hoàn thành bài rất tốt! Chữ viết đã có tiến bộ, nếu con nắn nót hơn nữa thì bài làm sẽ đạt điểm 10 tròn trĩnh đấy. Cố lên con nhé!"`;
      setGeneratedText(fallback);
    } finally {
      setLoading(false);
    }
  };

  // 4. Generate Support Plan
  const handleGenerateSupportPlan = async () => {
    setLoading(true);
    setGeneratedText('');
    try {
      const res = await fetch('/api/ai/support-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteriaName: supportCriteria,
          subject: supportSubject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.result);
      } else {
        throw new Error('API offline');
      }
    } catch {
      const fallback = `KẾ HOẠCH HỖ TRỢ CÁ NHÂN HÓA TRONG TUẦN
Giáo viên thực hiện: Cô Phạm Thúy Liễu - Lớp 1/2
Nội dung bồi dưỡng: "${supportCriteria}" (Môn ${supportSubject === 'vietnamese' ? 'Tiếng Việt' : 'Toán'})

1. NGUYÊN NHÂN TÂM LÝ & KỸ NĂNG:
   Học sinh lớp 1 đang trong giai đoạn chuyển từ trực quan sinh động sang tư duy chữ viết và phép tính trừu tượng. Việc nhầm lẫn là hoàn toàn bình thường ở lứa tuổi này.

2. HOẠT ĐỘNG TƯƠNG TÁC 5 PHÚT TẠI LỚP (Giờ tự học / sinh hoạt đầu giờ):
   - Trò chơi 1: "Thẻ chữ thần kỳ" - Bé giơ nhanh thẻ chữ c hoặc k khi cô đọc từ.
   - Trò chơi 2: "Bạn đồng hành" - Xếp đôi học sinh đã thành thạo ngồi cạnh hướng dẫn nhẹ nhàng.
   - Trò chơi 3: "Viết bảng con lấy sao" - Cô nắn tay trực tiếp cho từng bé 2 lượt.

3. PHỐI HỢP GIA ĐÌNH:
   - Gửi phiếu bài tập ngắn (tối đa 3 câu sinh động, có hình vẽ).
   - Dặn phụ huynh khen ngợi ngay khi con đọc/viết đúng, không trách phạt.

4. ĐÁNH GIÁ LẠI:
   Kiểm tra nhanh sau 5 ngày. Nếu học sinh đạt 80% độ chính xác sẽ nâng mức đánh giá lên "Hoàn thành (H)".`;
      setGeneratedText(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-serif">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1557A6] via-[#1976D2] to-[#2B8BE3] rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 rounded-xl border border-white/25">
            <Bot className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Trợ lý AI Giáo dục – LearnBridge</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-blue-950">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-blue-100">
              Công cụ hỗ trợ cô Phạm Thúy Liễu soạn bài tập cá nhân hóa, bài học bù và nhận xét chuẩn Thông tư 27
            </p>
          </div>
        </div>

        <div className="text-xs text-blue-100 italic bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
          “AI hỗ trợ gợi ý – Cô giáo là người quyết định cuối cùng”
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#D6E6F7] p-1.5 shadow-xs flex overflow-x-auto gap-1">
        {[
          { id: 'worksheet', label: '1. Tạo phiếu bài tập', icon: BookOpen },
          { id: 'makeup', label: '2. Tạo bài học bù', icon: UserX },
          { id: 'comments', label: '3. Gợi ý nhận xét (TT 27)', icon: FileCheck },
          { id: 'support_plan', label: '4. Kế hoạch hỗ trợ', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setGeneratedText('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1976D2] text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:bg-[#EAF4FF] hover:text-[#1557A6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form Input (Left) & Output Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs space-y-3.5 text-xs">
            {/* TAB 1: Worksheet Controls */}
            {activeTab === 'worksheet' && (
              <>
                <h3 className="font-bold text-sm text-[#1557A6] border-b pb-2">
                  Cấu hình phiếu bài tập Lớp 1
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Môn học</label>
                  <select
                    value={wsSubject}
                    onChange={e => setWsSubject(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  >
                    <option value="vietnamese">Tiếng Việt 1 (Âm vần, đọc, viết)</option>
                    <option value="math">Toán 1 (Phép tính, so sánh, hình học)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Chủ đề kiến thức trọng tâm
                  </label>
                  <input
                    type="text"
                    value={wsTopic}
                    onChange={e => setWsTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                    placeholder="VD: Phép cộng trong phạm vi 10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Mức độ bài tập</label>
                    <select
                      value={wsLevel}
                      onChange={e => setWsLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                    >
                      <option value="Vừa sức">Vừa sức (Đại trà)</option>
                      <option value="Hỗ trợ rèn thêm">Hỗ trợ rèn thêm (Dễ)</option>
                      <option value="Phát triển tư duy">Phát triển tư duy (Khá giỏi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Số câu hỏi</label>
                    <select
                      value={wsCount}
                      onChange={e => setWsCount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                    >
                      <option value={3}>3 câu (Ngắn gọn)</option>
                      <option value={4}>4 câu (Chuẩn 1 trang)</option>
                      <option value={5}>5 câu</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateWorksheet}
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-[#1976D2] hover:bg-[#1557A6] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Đang tạo bài tập với AI...' : 'Tạo phiếu bài tập ngay'}</span>
                </button>
              </>
            )}

            {/* TAB 2: Makeup Lesson Controls */}
            {activeTab === 'makeup' && (
              <>
                <h3 className="font-bold text-sm text-[#1557A6] border-b pb-2">
                  Phiếu học bù cho học sinh vắng
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Học sinh vắng học</label>
                  <select
                    value={makeupStudent}
                    onChange={e => setMakeupStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-bold"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.fullName}>
                        {s.studentCode} - {s.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Môn học</label>
                    <select
                      value={makeupSubject}
                      onChange={e => setMakeupSubject(e.target.value as SubjectType)}
                      className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                    >
                      <option value="vietnamese">Tiếng Việt</option>
                      <option value="math">Toán</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ngày vắng</label>
                    <input
                      type="date"
                      value={missedDate}
                      onChange={e => setMissedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bài học trên lớp bị lỡ</label>
                  <input
                    type="text"
                    value={makeupLesson}
                    onChange={e => setMakeupLesson(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  />
                </div>

                <button
                  onClick={handleGenerateMakeup}
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-[#1976D2] hover:bg-[#1557A6] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Đang soạn bài học bù...' : 'Soạn phiếu học bù gửi gia đình'}</span>
                </button>
              </>
            )}

            {/* TAB 3: Comments Controls */}
            {activeTab === 'comments' && (
              <>
                <h3 className="font-bold text-sm text-[#1557A6] border-b pb-2">
                  Gợi ý nhận xét học sinh (Thông tư 27)
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Học sinh</label>
                  <select
                    value={commentStudent}
                    onChange={e => setCommentStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg font-bold"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.fullName}>
                        {s.studentCode} - {s.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Môn học</label>
                    <select
                      value={commentSubject}
                      onChange={e => setCommentSubject(e.target.value as SubjectType)}
                      className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                    >
                      <option value="vietnamese">Tiếng Việt</option>
                      <option value="math">Toán</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Mức đạt</label>
                    <select
                      value={commentRating}
                      onChange={e => setCommentRating(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                    >
                      <option value="Hoàn thành tốt (T)">Hoàn thành tốt (T)</option>
                      <option value="Hoàn thành (H)">Hoàn thành (H)</option>
                      <option value="Cần hỗ trợ (C)">Cần hỗ trợ (C)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ưu điểm nổi bật</label>
                  <input
                    type="text"
                    value={commentStrengths}
                    onChange={e => setCommentStrengths(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Khó khăn / Điểm cần rèn</label>
                  <input
                    type="text"
                    value={commentWeaknesses}
                    onChange={e => setCommentWeaknesses(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  />
                </div>

                <button
                  onClick={handleGenerateComments}
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-[#1976D2] hover:bg-[#1557A6] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Đang tạo nhận xét...' : 'Gợi ý nhận xét theo TT 27'}</span>
                </button>
              </>
            )}

            {/* TAB 4: Support Plan Controls */}
            {activeTab === 'support_plan' && (
              <>
                <h3 className="font-bold text-sm text-[#1557A6] border-b pb-2">
                  Kế hoạch hỗ trợ cá nhân hóa trong tuần
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Môn học</label>
                  <select
                    value={supportSubject}
                    onChange={e => setSupportSubject(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  >
                    <option value="vietnamese">Tiếng Việt</option>
                    <option value="math">Toán</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tiêu chí / Nội dung học sinh đang gặp khó khăn
                  </label>
                  <input
                    type="text"
                    value={supportCriteria}
                    onChange={e => setSupportSupportCriteria(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6E6F7] rounded-lg"
                  />
                </div>

                <button
                  onClick={handleGenerateSupportPlan}
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-[#1976D2] hover:bg-[#1557A6] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Đang lập kế hoạch...' : 'Lập kế hoạch hỗ trợ'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Output Preview with Copy & Print */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-[#D6E6F7] p-5 shadow-xs flex flex-col h-full min-h-[460px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-sm text-[#1557A6]">
                  Kết quả do Trợ lý AI tạo ra (Có thể chỉnh sửa & in ấn)
                </span>
              </div>

              {generatedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1 bg-[#EAF4FF] hover:bg-[#D6E6F7] text-[#1557A6] rounded-lg text-xs font-bold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In</span>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#1976D2]" />
                <p className="text-xs font-bold text-[#1557A6]">
                  Trợ lý AI đang xử lý theo chuẩn giáo dục tiểu học Việt Nam...
                </p>
              </div>
            ) : generatedText ? (
              <div className="flex-1 flex flex-col">
                <textarea
                  value={generatedText}
                  onChange={e => setGeneratedText(e.target.value)}
                  className="flex-1 w-full p-4 bg-[#F7FAFF] border border-[#D6E6F7] rounded-xl text-xs sm:text-sm font-serif leading-relaxed text-[#17365D] focus:ring-1 focus:ring-[#1976D2] resize-y min-h-[380px]"
                />
                <div className="pt-2 text-[11px] text-gray-400 italic">
                  * Cô giáo có thể sửa đổi trực tiếp văn bản ở trên trước khi sao chép hoặc in.
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400 space-y-3">
                <Bot className="w-12 h-12 text-blue-200" />
                <p className="text-sm font-semibold text-gray-500">
                  Hãy chọn các tham số bên trái và nhấn nút để Trợ lý AI tạo nội dung cho cô giáo.
                </p>
                <p className="text-xs text-gray-400 max-w-sm">
                  Dữ liệu tạo ra được thiết kế đặc biệt cho học sinh Lớp 1/2 tại Trường Tiểu học Phạm Phi Hùng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
