/**
 * Google Apps Script - RSVP API Backend
 * 
 * Hướng dẫn sử dụng:
 * 1. Mở trang Google Sheet của bạn.
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa mọi code cũ và dán toàn bộ đoạn mã này vào.
 * 4. Nhấn Lưu (Save - biểu tượng đĩa mềm).
 * 5. Nhấn Triển khai (Deploy) -> Triển khai mới (New deployment).
 *    - Chọn loại: Ứng dụng web (Web app).
 *    - Thực thi dưới dạng: Tôi (Me).
 *    - Ai có quyền truy cập: Mọi người (Anyone).
 * 6. Sao chép URL ứng dụng web được cấp và dán vào file `app.js` của bạn.
 */

function doPost(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    
    // Đọc dữ liệu gửi lên (Hỗ trợ cả JSON và Form URL-Encoded)
    var data = {};
    if (e.postData && e.postData.type === "application/json") {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    // Chuẩn bị các dòng dữ liệu để ghi
    var timestamp = new Date();
    var name = data.name || "";
    var status = data.status || "";
    var phone = data.phone || "";
    var guests = data.guests || "0";
    var message = data.message || "";
    
    // Ghi dữ liệu vào hàng tiếp theo trong Sheet
    // Thứ tự cột: Thời gian | Họ tên | Trạng thái | Số điện thoại | Số người đi cùng | Lời nhắn
    sheet.appendRow([
      timestamp, 
      name, 
      status, 
      phone, 
      guests, 
      message
    ]);
    
    // Trả về kết quả JSON thành công
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "Đã lưu thông tin đăng ký thành công!"
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    
  } catch (error) {
    // Trả về lỗi nếu có sự cố xảy ra
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "message": error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*"
    });
  }
}

// Xử lý các yêu cầu OPTIONS preflight nếu trình duyệt yêu cầu CORS nâng cao
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
}
