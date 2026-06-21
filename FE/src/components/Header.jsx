import { FileText } from 'lucide-react';

export default function Header({ onExportReport }) {
  const handleDefaultExport = () => {
    alert('Tính năng xuất báo cáo tổng hợp đang được xử lý...');
  };

  return (
    <header className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-gray-800/60 pb-6">
      {/* Bên trái: Tiêu đề và mô tả */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Hệ thống phân loại nông sản</h1>
        <p className="text-gray-400 text-sm">Tải ảnh lên để mô hình phân tích trạng thái chín/xanh của trái cây.</p>
      </div>

      {/* Bên phải: Nút hành động & Avatar giả lập */}
      <div className="flex items-center justify-center lg:justify-end gap-4 shrink-0">
        
        {/* Nút lấy báo cáo */}
        <button 
          onClick={onExportReport || handleDefaultExport}
          className="flex items-center gap-2 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 hover:bg-brand-teal hover:text-brand-dark px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95"
        >
          <FileText size={18} />
          <span>Xuất báo cáo</span>
        </button>

        {/* Vạch ngăn cách nhỏ giữa nút và avatar */}
        <div className="h-8 w-[1px] bg-gray-800 hidden sm:block"></div>

        {/* Ô Avatar giả lập */}
        <div className="flex items-center gap-3">
          {/* <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">Nguyễn Văn A</p>
            <p className="text-xs text-gray-500">Quản trị viên</p>
          </div> */}
          
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-teal to-emerald-500 flex items-center justify-center text-brand-dark font-bold text-sm border border-gray-800 group-hover:ring-2 group-hover:ring-brand-teal/50 transition-all shadow-md">
              NV
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-dark rounded-full animate-pulse"></span>
          </div>
        </div>

      </div>
    </header>
  );
}