# SyncNote Pro Feature Proposals

Dưới đây là các tính năng nâng cao (Pro) giúp dự án SyncNote của anh trở nên xịn xò, chuyên nghiệp và thực chiến hơn hẳn:

## 1. Real-time Collaboration (Siêu cấp)
**Hiện tại**: Phải F5 mới thấy dữ liệu người khác sửa.
**Nâng cấp**:
- **WebSockets (Django Channels)**: Nhìn thấy dữ liệu thay đổi ngay lập tức mà không cần F5.
- **Live Cursors**: Thấy con trỏ chuột/avatar của người khác đang xem cùng ghi chú (giống Google Docs/Notion).
- **Locking**: Khi mình đang sửa dòng này, người khác không được sửa đè lên.

## 2. Rich Content & Smart Editor
**Hiện tại**: Chỉ là text thuần túy.
**Nâng cấp**:
- **Markdown / Rich Text**: Cho phép bôi đậm, in nghiêng, chèn link, code block trong ghi chú.
- **Drag & Drop**: Kéo thả để sắp xếp lại thứ tự Category, Note, và Checklist Item (dùng thư viện như dnd-kit).
- **Tags & Global Search**: Gán nhãn (Tag) màu sắc cho Note và thanh tìm kiếm toàn bộ nội dung (Full-text search) siêu nhanh ngay tại client.

## 3. Offline-First PWA (Biến thành App thật thụ)
**Hiện tại**: Chỉ chạy trên trình duyệt.
**Nâng cấp**:
- **Installable**: Biến web thành App cài đặt được trên điện thoại/máy tính (PWA).
- **Background Sync**: Tự động đồng bộ ngầm ngay cả khi App đang đóng (Service Workers).
- **Push Notifications**: Thông báo khi có người khác sửa ghi chú của mình hoặc nhắc nhở deadline.

## 4. AI Copilot Integration (Trend)
**Nâng cấp**:
- **"Magic Create"**: Gõ "Lên danh sách đi du lịch Đà Lạt", AI tự sinh ra checklist 20 món cần chuẩn bị.
- **Auto Summary**: Tóm tắt nội dung các ghi chú dài.
- **Chat with Note**: Hỏi đáp dựa trên dữ liệu ghi chú cá nhân.

## 5. Thùng rác & Lịch sử (An toàn dữ liệu)
**Hiện tại**: Xóa là mất (soft delete trong DB nhưng UI không cứu được).
**Nâng cấp**:
- **Trash Can**: Mục "Thùng rác" để khôi phục Note đã xóa trong 30 ngày.
- **Version History**: Xem lại lịch sử sửa đổi của Note (Ai sửa gì, vào lúc nào), có thể revert lại phiên bản cũ.

---

### 🔥 Em đề xuất lộ trình:
1. **Drag & Drop** (Dễ làm, trải nghiệm sướng ngay).
2. **Trash Can** (An toàn, cần thiết).
3. **Real-time với WebSockets** (Khó nhất nhưng "Pro" nhất).
