import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import classConfig from "./classTranslation";

export const handleExportReport = async (history) => {
  if (!history?.length) {
    alert("Hiện tại chưa có dữ liệu lịch sử quét nào để xuất báo cáo!");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Lịch sử quét");

  const total = history.length;
  const greenCount = history.filter(item => item.isGreen).length;
  const ripeCount = total - greenCount;
  const avgConfidence = history.reduce((sum, item) => sum + item.confidence, 0) / total;

  worksheet.addRow(["BÁO CÁO KẾT QUẢ PHÂN LOẠI NÔNG SẢN"]);
  worksheet.addRow([]);

  worksheet.addRow([`Ngày xuất: ${new Date().toLocaleString("vi-VN")}`]);
  worksheet.addRow([`Tổng số mẫu: ${total}`]);
  worksheet.addRow([`Số mẫu còn xanh: ${greenCount}`]);
  worksheet.addRow([`Số mẫu đã chín: ${ripeCount}`]);
  worksheet.addRow([`Độ tin cậy trung bình: ${avgConfidence.toFixed(2)}%`]);
  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    "STT",
    "ID",
    "Tên quả",
    "Kết quả phân loại",
    "Độ tin cậy (%)",
    "Thời gian quét"
  ]);

  headerRow.font = { bold: true };

  history.forEach((item, index) => {
    worksheet.addRow([
      index + 1,
      item.id,
      item.name,
      classConfig[item.className] || item.className,
      item.confidence,
      item.time
    ]);
  });

  worksheet.columns = [
    { width: 10 },
    { width: 18 },
    { width: 20 },
    { width: 40 },
    { width: 18 },
    { width: 25 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    `Bao_cao_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};