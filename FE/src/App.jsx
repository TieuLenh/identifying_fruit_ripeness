import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Routes>
      {/* Trang chủ xử lý toàn bộ Layout gồm Sidebar, Khu quét ảnh và Tab Lịch sử */}
      <Route path="/" element={<HomePage />} />

      {/* Phòng trường hợp user gõ đường dẫn linh tinh, tự động điều hướng về lại Trang Chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;