import { CheckCircle2, Sparkles } from 'lucide-react';
import classConfig from '../services/classTranslation';

// Bảng ánh xạ từ className sang kết luận tiếng Việt rõ nghĩa
const classTranslation = classConfig;

export default function PredictionResult({ result }) {
  if (!result) return null;

  // Xử lý hiển thị phần trăm độ tin cậy đẹp mắt
  const displayConfidence = typeof result.confidence === "number" && result.confidence <= 1
    ? (result.confidence * 100).toFixed(2)
    : Number(result.confidence || 0).toFixed(2);

  // Lấy kết luận tiếng Việt tương ứng
  const vietnameseConclusion = classTranslation[result.class] || result.class || "Không xác định";

  return (
    <div className="bg-brand-gray/50 border border-brand-teal/20 p-8 rounded-3xl shadow-xl flex flex-col h-full relative overflow-hidden animate-fade-in">
      {/* Vệt sáng trang trí nền nhẹ nhàng */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-teal/5 rounded-full blur-3xl"></div>

      {/* Tiêu đề kết quả */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800/60 pb-5">
        <div className="p-2.5 bg-brand-dark/60 rounded-xl shrink-0 border border-gray-800">
          <CheckCircle2 size={24} className="text-brand-teal" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">Phân tích hình ảnh</h3>
      </div>
      
      {/* Khối hiển thị văn bản rõ dần */}
      <div className="flex-1 flex flex-col justify-center space-y-6 py-4">
        
        {/* Dòng kết luận tự nhiên - Xuất hiện ngay lập tức sau 0.6s */}
        <div className="opacity-0 animate-[fadeIn_0.6s_ease-out_forwards] text-gray-300 text-lg leading-relaxed">
          <span className="text-gray-400 font-medium block text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand-teal" /> Kết quả nhận diện
          </span>
          Mô hình xác định đây là <span className="text-brand-teal font-extrabold text-xl underline decoration-brand-teal/40 decoration-2 underline-offset-4">{vietnameseConclusion}</span>.
        </div>

        {/* Dòng độ tự tin tự nhiên - Trì hoãn 0.3s rồi mới chạy hiệu ứng rõ dần */}
        <div className="opacity-0 animate-[fadeIn_0.6s_ease-out_0.3s_forwards] text-gray-300 text-base border-t border-gray-800/40 pt-5">
          Mức độ tin cậy của phân tích: {' '}
          <span className="font-mono font-bold text-amber-400 text-lg">
            {displayConfidence}%
          </span>
          .
        </div>

      </div>
    </div>
  );
}