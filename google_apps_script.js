/**
 * Google Apps Script - RSVP API Backend (Rút gọn)
 * 
 * Hướng dẫn sử dụng:
 * 1. Mở trang Google Sheet của bạn.
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa mọi code cũ và dán toàn bộ đoạn mã này vào.
 * 4. Nhấn Lưu (Save - biểu tượng đĩa mềm).
 * 5. Nhấn Triển khai (Deploy) -> Triển khai mới (New deployment).
 *    - Chọn loại: Ứng dụng web (Web app).
 *    - Mô tả: RSVP Handler
 *    - Thực thi dưới dạng: Tôi (Me).
 *    - Ai có quyền truy cập: Mọi người (Anyone).
 * 6. Bấm Triển khai, cấp quyền truy cập Google Drive/Google Sheets khi được hỏi.
 * 7. Sao chép URL ứng dụng web được cấp (dạng https://script.google.com/macros/s/.../exec).
 * 8. Dán URL đó vào biến SCRIPT_URL ở dòng 9 của file `script.js` của bạn.
 */

function doPost(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    
    // Đọc dữ liệu gửi lên (Hỗ trợ parse JSON ngay cả khi content-type bị trình duyệt đổi thành text/plain)
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    // Chuẩn bị dữ liệu ghi nhận
    var timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    var name = data.name || "";
    var attendance = data.attendance || "";
    var message = data.message || "";
    
    // Ghi dữ liệu vào hàng tiếp theo trong Sheet
    // Thứ tự cột: Thời gian gửi | Họ và tên | Tham dự | Lời nhắn
    sheet.appendRow([
      timestamp, 
      name, 
      attendance,
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
