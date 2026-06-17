import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

export default function UploadBox({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);

  // Bắt buộc phải có event.preventDefault() để trình duyệt cho phép thả file
  const handleDragOver = (e) => {
    e.preventDefault(); 
    setIsDragging(true);
  };

  // Trạng thái khi kéo file ra khỏi khu vực
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Xử lý khi người dùng thả file xuống
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Vì hàm handleImageUpload ở HomePage đang nhận tham số là 'event' (event.target.files[0])
      // Nên ta sẽ bọc file vừa thả vào một object giả lập (mock event) để tương thích.
      const mockEvent = {
        target: {
          files: files
        }
      };
      onUpload(mockEvent);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed p-12 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center gap-4 group
        ${isDragging 
          ? 'border-brand-teal bg-brand-gray scale-[1.02]' // Hiệu ứng khi đang kéo file vào
          : 'border-gray-700 bg-brand-gray/50 hover:bg-brand-gray hover:border-brand-teal'
        }
      `}
      onClick={() => document.getElementById('fileUpload').click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`p-4 rounded-full transition-transform ${isDragging ? 'bg-brand-teal/20 scale-110' : 'bg-brand-dark group-hover:scale-110'}`}>
        <UploadCloud size={48} className="text-brand-teal" />
      </div>
      
      <div>
        <p className="text-white font-semibold text-lg transition-colors">
          {isDragging ? 'Thả ảnh vào đây nhé!' : 'Kéo thả hoặc nhấn để chọn ảnh'}
        </p>
        <p className="text-sm text-gray-400 mt-2">Định dạng hỗ trợ: JPG, PNG, WEBP</p>
      </div>
      
      <input 
        type="file" 
        id="fileUpload" 
        className="hidden" 
        accept="image/*" 
        onChange={onUpload} 
      />
    </div>
  );
}