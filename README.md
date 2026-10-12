# Yahoo! Messenger — Một thời để nhớ

Desktop Windows XP chạy hoàn toàn trong trình duyệt, do Long Ngo phát triển (2026).

## Chạy
Mở `index.html`, hoặc chạy `python -m http.server 8080` trong thư mục dự án. Không cần npm, tài khoản hay API. Tài nguyên giao diện và âm thanh được lưu cùng mã nguồn.

- Nền Bliss, cửa sổ kéo thả bằng chuột/cảm ứng, phóng to, thu nhỏ, taskbar, Start menu.
- Danh sách bạn bè, tìm/thêm nickname, trạng thái, hội thoại **mô phỏng** với trả lời tự động.
- BUZZ với âm thanh gốc từ skin và rung desktop; tôn trọng thiết lập giảm chuyển động.
- 24 mặt cười Yahoo, màu/chữ đậm/nghiêng, xuất và xóa hội thoại.
- Winamp: bản nhạc tổng hợp nguyên gốc đi kèm, mở nhiều tệp nhạc từ máy, playlist, phát/tạm dừng/dừng/tua/âm lượng.
- Notepad; tên, trạng thái, ghi chú, danh bạ, hội thoại lưu bằng localStorage (tối đa 250 tin mỗi bạn).
- Bố cục điện thoại mở danh bạ trước; chạm bạn để mở hội thoại. Mở Winamp từ desktop/Start.

Không kết nối Yahoo hay người dùng khác. Để nhắn tin nhiều người cần backend, xác thực và cơ chế truyền tin; không đặt khóa bí mật trong frontend. Nhạc chọn trên máy không được tải lên máy chủ. Dữ liệu localStorage không được mã hóa, có thể mất khi xóa dữ liệu trình duyệt.

## Triển khai
Workflow `.github/workflows/pages.yml` triển khai nhánh `main` lên GitHub Pages. Nếu kho chưa bật Pages, chọn Settings → Pages → Source: GitHub Actions rồi chạy lại workflow.

## Tài nguyên và giấy phép
Mã nguồn HTML/CSS/JS mới: MIT, © 2026 Long Ngo (xem LICENSE).
Các tệp hình nền, biểu tượng, avatar, mặt cười và buzz trong `assets/` được trích từ gói `yahoo-messenger-skin-0.4.3.zip` do người dùng cung cấp. Không khẳng định các tài nguyên này thuộc giấy phép MIT. Nhãn hiệu Yahoo!, Windows, Winamp và các tài nguyên bên thứ ba thuộc chủ sở hữu tương ứng. Đây là bản phục dựng độc lập, không phải dịch vụ chính thức.
`assets/memory.wav` là giai điệu tổng hợp được tạo cho dự án, theo MIT.
