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

## Hybrid Buddy List (2026-11-02)

- Mặc định **Gom chung**; nút **Tách riêng** mở ba danh bạ Yahoo!, Zalo và Facebook. Màn hình nhỏ xếp danh bạ dọc và cuộn. Lựa chọn được lưu cục bộ.
- Huy hiệu Y!/Z/f chọn chính xác tài khoản trò chuyện. Tìm kiếm theo tên, ID hoặc nền tảng.
- **Ghép liên hệ**: tự chọn các tài khoản cùng một người, tối đa một tài khoản mỗi nền tảng; có nút tách hoàn tác. Không suy luận danh tính từ tên trùng nhau. Lịch sử và bản nháp vẫn riêng theo ID tài khoản; bản nháp chỉ tồn tại trong phiên trang.
- Dữ liệu Yahoo cũ giữ nguyên ID và lịch sử. Liên hệ Zalo/Facebook mẫu được thêm một lần. Trạng thái Available/Away/Invisible của từng nền tảng là trạng thái mô phỏng.
- Chuyển `:)`, `:(`, `;)`, `:D` thành emoticon; ding tổng hợp khi bạn mô phỏng trả lời, dùng chung công tắc âm thanh. BUZZ có giới hạn tần suất và chỉ rung/phát âm thanh cục bộ.
- Kiểm thử mô hình danh tính: `node --test tests/hybrid.test.cjs`; kiểm tra cú pháp: `node --check app.js`.

### Ranh giới tích hợp thật

Bản này là **web demo**, chưa phải Chrome Extension và không đăng nhập hoặc đồng bộ Zalo/Facebook. Không có content script, đọc cookie, trích phiên đăng nhập hay gửi tin nhắn đến người thật. Danh bạ, ghép danh tính và lịch sử lưu trong localStorage trên thiết bị; các tệp tĩnh được tải từ nơi triển khai trang.

Nếu phát triển extension MV3, nên tách adapter từng nền tảng → service worker → kho trạng thái → Buddy List. Worker cần kiểm tra nguồn/tab và schema sự kiện, dùng khóa gồm nền tảng + tài khoản đăng nhập + ID liên hệ; lưu snapshot trong chrome.storage.local để khôi phục sau khi worker ngủ. Content script chỉ quan sát vùng cần thiết, debounce thay đổi và gửi phần dữ liệu thay đổi; chỉ yêu cầu quyền host cần thiết khi người dùng bật kết nối. Online/offline không xác định phải thể hiện là “chưa rõ”, không suy ra từ tên. Không dùng thư viện trích cookie hoặc gửi chuỗi tin rỗng để giả BUZZ. Các adapter thật cần kiểm thử riêng với phiên đăng nhập do người dùng chủ động cấp quyền.
