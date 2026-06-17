import { useState } from "react";
import Sidebar from "../components/Sidebar";
import UploadBox from "../components/UploadBox";
import ImagePreview from "../components/ImagePreview";
import LoadingSpinner from "../components/LoadingSpinner";
import PredictionResult from "../components/PredictionResult";
import HistoryPage from "./HistoryPage";
import aiService from "../services/aiService";
import { handleExportReport } from "../services/exportResult";
import Header from "../components/Header";

const fruitMapping = {
  Xoai: "Xoài",
  Chuoi: "Chuối",
  Tao: "Táo",
};

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("scan");
  const [highlightedHistoryId, setHighlightedHistoryId] = useState(null); // Quản lý ID cần xem chi tiết

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("fruit_ai_history");
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      // TỰ ĐỘNG CHUẨN HÓA: Sửa lỗi dữ liệu cũ không có ID hoặc thiếu trường dữ liệu mới
      const normalized = parsed.map((item, index) => ({
        ...item,
        id: item.id || `legacy-${Date.now()}-${index}`, // Bù ID
        name: item.name || "Trái cây",
        confidence: item.confidence,
        isGreen: item.isGreen !== undefined ? item.isGreen : true,
        time: item.time || new Date().toLocaleString("vi-VN"),
      }));

      // Cập nhật lại luôn vào localStorage để lần sau không bị lỗi nữa
      localStorage.setItem("fruit_ai_history", JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      console.error("Lỗi đọc cấu trúc localStorage:", error);
      return [];
    }
  });

  const handleImageUpload = async (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      const resData = await aiService.predictImage(file); 
      // Giả sử resData trả về dạng: { class: "Cachua_Chin_Tot", confidence: 99.98 }

      setResult(resData);

      // Tách tên trái cây từ chuỗi class để lưu vào history (Ví dụ: "Cachua_Chin_Tot" -> "Cachua")
      const rawFruitName = resData.class?.split("_")[0] || "TraiCay";

      const historyItem = {
        id: Date.now(),
        name: fruitMapping[rawFruitName] || rawFruitName,
        className: resData.class, // Lưu tên class gốc
        confidence: resData.confidence, // Lấy thẳng confidence từ API
        time: new Date().toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      };

      setHistory((prev) => {
        const updated = [historyItem, ...prev];
        localStorage.setItem("fruit_ai_history", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setError(err.message || "Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };
  const hasResultLayout = result && !isLoading;

  return (
    <div className="flex h-screen bg-brand-dark text-gray-200 font-sans overflow-hidden">
      {/* Sidebar nhận hàm trung gian để gán ID xem chi tiết */}
      <Sidebar
        history={history}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectCatalog={(id) => setHighlightedHistoryId(id)}
      />

      <main className="flex-1 overflow-y-auto w-full">
        {activeTab === "scan" ? (
          <div className="container mx-auto px-6 py-10 w-full lg:px-12 max-w-7xl">
            {/* SỬA DÒNG NÀY: */}
            <Header onExportReport={() => handleExportReport(history)} />
            <div
              className={`grid gap-8 items-start ${
                hasResultLayout
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1 max-w-2xl mx-auto"
              }`}
            >
              <div className="bg-brand-gray/30 p-8 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-sm">
                <UploadBox onUpload={handleImageUpload} />

                {error && (
                  <div className="mt-8 bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-xl text-center font-medium animate-fade-in">
                    {error}
                  </div>
                )}

                <ImagePreview image={selectedImage} />
                {isLoading && <LoadingSpinner />}
              </div>

              {hasResultLayout && (
                <div className="h-full">
                  <PredictionResult
                    result={result}
                    fruitMapping={fruitMapping}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <HistoryPage
            history={history}
            setHistory={setHistory}
            highlightedId={highlightedHistoryId}
            setHighlightedId={setHighlightedHistoryId}
          />
        )}
      </main>
    </div>
  );
}
