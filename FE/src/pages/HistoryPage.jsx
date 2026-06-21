import { useState, useEffect } from 'react';
import { Trash2, Calendar, BarChart3, Carrot, FileText } from 'lucide-react';
import classConfig from '../services/classTranslation';

// Bảng ánh xạ từ className sang trạng thái tiếng Việt rõ nghĩa
const classTranslation = classConfig;

export default function HistoryPage({ history, setHistory, highlightedId, setHighlightedId }) {
  const [filter, setFilter] = useState('all');

  // Lắng nghe xem có ID nào được kích hoạt từ Sidebar không
  useEffect(() => {
    if (highlightedId) {
      setFilter('all'); // Đưa bộ lọc về 'Tất cả' để chắc chắn item đó xuất hiện
      
      // Đợi DOM cập nhật xong rồi cuộn mượt mà tới thẻ đó
      setTimeout(() => {
        const element = document.getElementById(`card-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [highlightedId]);

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử quét không?')) {
      setHistory([]);
      localStorage.removeItem('fruit_ai_history');
      if (setHighlightedId) setHighlightedId(null);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'tao') return item.name === 'Táo';
    if (filter === 'chuoi') return item.name === 'Chuối';
     if (filter === 'xoai') return item.name === 'Xoài';
    return true;
  });

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Nhật ký phân tích</h1>
          <p className="text-gray-400">Xem lại toàn bộ kết quả phân tích phân lớp đối tượng.</p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="flex items-center gap-2 bg-red-950/40 text-red-400 border border-red-900/50 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-900/30 hover:text-red-300 transition-all shadow-lg"
          >
            <Trash2 size={16} />
            Xóa sạch lịch sử
          </button>
        )}
      </header>

      {/* Bộ lọc */}
      <div className="flex gap-2 p-1 bg-brand-gray/40 border border-gray-800 rounded-xl mb-8 w-max max-w-full overflow-x-auto">
        {['all', 'tao', 'chuoi', 'xoai'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              if (setHighlightedId) setHighlightedId(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize ${
              filter === type 
                ? 'bg-brand-teal text-brand-dark font-bold shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {type === 'all' ? 'Tất cả' : type === 'tao' ? 'Táo' : type === 'chuoi' ? 'Chuối' : 'Xoài'}
          </button>
        ))}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-brand-gray/10 rounded-3xl border border-gray-800/50">
          <Carrot size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy dữ liệu quét nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => {
            const isHighlighted = item.id === highlightedId;
            
            // Xử lý hiển thị phần trăm độ tin cậy
            const displayConfidence = typeof item.confidence === "number" && item.confidence <= 1
              ? (item.confidence * 100).toFixed(2)
              : item.confidence?.toFixed(2);

            // Dịch giá trị className sang tiếng Việt
            const vietnameseStatus = classTranslation[item.className] || item.className || 'Không xác định';

            return (
              <div 
                key={item.id}
                id={`card-${item.id}`}
                className={`bg-brand-gray/30 p-6 rounded-2xl relative overflow-hidden shadow-xl hover:border-brand-teal/20 flex flex-col justify-between transition-all duration-500 border
                  ${isHighlighted 
                    ? 'border-brand-teal ring-4 ring-brand-teal/20 scale-[1.04] bg-brand-teal/5 shadow-brand-teal/5' 
                    : 'border-gray-800'
                  }
                `}
                onClick={() => {
                  if (isHighlighted && setHighlightedId) setHighlightedId(null);
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-2xl font-bold text-white capitalize">{item.name}</span>
                  </div>

                  <div className="space-y-3 bg-brand-dark/40 p-4 rounded-xl border border-gray-900 mb-4">
                    {/* Hiển thị Trạng thái dịch từ className */}
                    <div className="flex justify-between items-center text-xs gap-4">
                      <span className="flex items-center gap-1 text-gray-400 shrink-0">
                        <FileText size={12} /> Trạng thái:
                      </span>
                      <span className="font-bold text-emerald-400 truncate text-right">{vietnameseStatus}</span>
                    </div>
                    
                    {/* Hiển thị Độ tin cậy dịch từ Confidence */}
                    <div className="flex justify-between items-center text-xs border-t border-gray-900/50 pt-2.5">
                      <span className="flex items-center gap-1 text-gray-400 shrink-0">
                        <BarChart3 size={12} /> Độ tin cậy:
                      </span>
                      <span className="font-mono font-bold text-amber-400">{displayConfidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 border-t border-gray-900 pt-3 mt-2">
                  <Calendar size={12} />
                  <span>{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}