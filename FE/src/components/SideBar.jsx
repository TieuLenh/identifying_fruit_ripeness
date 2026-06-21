import { useState } from 'react';
import { Menu, Leaf, History, ChevronLeft, Scan, Tag } from 'lucide-react';

export default function Sidebar({ history, activeTab, setActiveTab, onSelectCatalog }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside 
      className={`bg-brand-gray border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? 'w-72' : 'w-20'
      } h-screen sticky top-0`}
    >
      {/* Header Sidebar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
          <Leaf className="text-brand-teal shrink-0" size={24} />
          <span className="font-bold text-white text-lg tracking-wide">Fruit AI</span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-400 hover:text-brand-teal hover:bg-black/50 rounded-lg transition-colors"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <Menu size={24} className="text-brand-teal" />}
        </button>
      </div>

      {/* Menu Điều Hướng Chính */}
      <div className="p-4 border-b border-gray-800 space-y-1">
        <button
          onClick={() => setActiveTab('scan')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'scan' 
              ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30' 
              : 'text-gray-400 hover:text-white hover:bg-brand-dark/50'
          } ${!isExpanded && 'justify-center'}`}
        >
          <Scan size={20} />
          {isExpanded && <span>Nhận diện ảnh</span>}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'history' 
              ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30' 
              : 'text-gray-400 hover:text-white hover:bg-brand-dark/50'
          } ${!isExpanded && 'justify-center'}`}
        >
          <History size={20} />
          {isExpanded && <span>Lịch sử chi tiết</span>}
        </button>
      </div>

      {/* Danh sách rút gọn ở dưới */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={`flex items-center gap-2 text-gray-400 mb-4 ${!isExpanded && 'justify-center'}`}>
          <History size={16} className="shrink-0" />
          {isExpanded && <span className="font-semibold text-xs uppercase tracking-wider">Mới quét gần đây</span>}
        </div>

        {history.length === 0 ? (
          isExpanded && <p className="text-gray-500 text-sm text-center mt-4">Chưa có dữ liệu</p>
        ) : (
          <ul className="space-y-3">
            {history.slice(0, 4).map((item, index) => {
              // Chuẩn hóa hiển thị phần trăm
              const displayConfidence = typeof item.confidence === "number" && item.confidence <= 1
                ? (item.confidence * 100).toFixed(1)
                : Number(item.confidence || 0).toFixed(1);

              return (
                <li 
                  key={item.id || index} 
                  className="p-3 bg-brand-dark rounded-xl border border-gray-800 hover:border-brand-teal/30 transition-colors cursor-pointer active:scale-[0.98]"
                  onClick={() => {
                    setActiveTab('history');
                    onSelectCatalog(item.id); // Kích hoạt hiệu ứng định vị chi tiết bên HistoryPage
                  }}
                >
                  {isExpanded ? (
                    <div className="space-y-1">
                      {/* Dòng tên loại trái cây */}
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-200 text-sm truncate capitalize">
                          {item.name || "Không rõ"}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {displayConfidence}%
                        </span>
                      </div>
                      
                      {/* Dòng hiển thị Class định danh */}
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono truncate">
                        <Tag size={10} className="shrink-0" />
                        <span className="truncate">{item.className || "N/A"}</span>
                      </div>
                    </div>
                  ) : (
                    /* Khi thu nhỏ sidebar, hiển thị icon Tag nhỏ kèm tooltip */
                    <div 
                      className="flex flex-col items-center gap-0.5 text-amber-400 font-mono text-[11px] font-bold" 
                      title={`${item.name}: ${item.className} (${displayConfidence}%)`}
                    >
                      <Tag size={14} className="text-emerald-400" />
                      <span>{Math.round(displayConfidence)}%</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}