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

Danh bạ Hybrid không kết nối Yahoo/Zalo/Facebook. Phòng chat ẩn danh riêng kết nối nhiều người qua backend Socket.IO; không đặt khóa bí mật trong frontend. Nhạc chọn trên máy không được tải lên máy chủ. Dữ liệu localStorage không được mã hóa, có thể mất khi xóa dữ liệu trình duyệt.

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

## Phòng chat ẩn danh (AnonChat)

Tái sử dụng và mở rộng luồng Express + Socket.IO trong [opsbest/AnonChat](https://github.com/opsbest/AnonChat), bản gốc `eefb7371c52495c6e853dc942ff3bfa39947427b`. Giữ thông báo MIT trong `licenses/AnonChat-MIT.txt`. Socket.IO client 4.8.1 đóng gói cục bộ, giấy phép ở `licenses/Socket.IO-client-MIT.txt`.

- Mở **Phòng chat thật**, nhập biệt danh và tên phòng. Cùng tên phòng (có phân biệt hoa/thường) để gặp nhau; tên mới tự tạo phòng.
- Link mời chỉ chứa tên phòng, không chứa biệt danh hoặc nội dung tin nhắn.
- Không đăng ký. Biệt danh không chứng minh danh tính; phòng không có mật khẩu.
- Tin nhắn không lưu trong database, file, localStorage hay sessionStorage; chỉ phát tới thành viên đang trong phòng. Giao diện giữ tối đa 250 dòng trong RAM. Reload, rời phòng hoặc tải trang mới không nhận lại lịch sử. Điều này không xóa tin ở máy người khác, bản chụp hoặc bản sao do người nhận giữ.
- Giới hạn 2.000 ký tự/tin, 10 tin/5 giây/kết nối, 50 người/phòng và 200 phòng/máy chủ. Đây là giới hạn cơ bản theo kết nối, chưa phải hệ thống chống lạm dụng ở quy mô lớn.
- Chỉ nội dung phòng mới có tính chất tạm thời. Hội thoại mô phỏng, danh bạ Hybrid và Notepad cũ vẫn giữ cơ chế lưu cục bộ.

### Chạy và kiểm thử

```sh
npm ci
npm test
npm start
```

Mở `http://localhost:3000` bằng hai trình duyệt, vào cùng tên phòng để kiểm tra gửi nhận. Mở phòng khác để kiểm tra cách ly; reload để kiểm tra không có lịch sử. Backend không tự ghi log nội dung tin nhắn. Nhà cung cấp hạ tầng vẫn có thể có log kết nối; đây không phải mã hóa đầu cuối.

### Backend cho GitHub Pages

GitHub Pages không chạy Node.js. Tạo một Node Web Service từ repository này:

- Build: `npm ci --omit=dev`
- Start: `npm start`
- Biến `ALLOWED_ORIGINS=https://xulytiengviet.github.io`
- Health check: `/health`; port dùng biến `PORT` của nhà cung cấp.
- Một instance duy nhất: trạng thái phòng chỉ ở RAM. Khởi động lại sẽ ngắt phòng; không tự phát lại tin.
- Sau triển khai, đặt `window.YAHOO_CHAT_SERVER = 'https://<backend-host>';` trong `chat-config.js` rồi đẩy lên main. Không có secret trong URL này.

Khi backend chưa được cấu hình, trang thông báo rõ và không giả lập kết nối thành công. Đóng/thu nhỏ cửa sổ không rời phòng; dùng **Rời phòng** hoặc tải lại trang. Khi mất mạng, nhấn **Tạo / Vào phòng** để kết nối lại; không tự gửi lại tin để tránh trùng lặp.
