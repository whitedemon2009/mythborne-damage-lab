# Dữ liệu nguồn Mythborne

- `live-snapshot.json`: kết quả đọc toàn bộ 4 thẻ Google Doc; giữ nguyên đoạn văn và index.
- `normalized.json`: hồ sơ có ID ổn định theo tên, chỉ số Lv1/Lv60, phân loại, kỹ năng/biến thể, A1–A3, mốc phụ, VM1–VM6, nội tại trấn và mốc bộ 2/4/5 món.
- `user-rules.json`: các xác nhận mới của người dùng, được ưu tiên khi khác tài liệu. Không ghi ngược vào Google Doc.
- `combat-bible-source.txt`: bản công thức người dùng đã gửi; đọc cùng các xác nhận mới, không áp dụng bản cũ khi có xung đột.
- `AUDIT.md`: kiểm kê và những trường chưa đủ căn cứ để xác định.

Chạy `python3 damage-simulator/normalize_data.py` để tạo lại dữ liệu và catalog từ snapshot; chạy `python3 damage-simulator/validate_data.py` để kiểm tra. Muốn cập nhật nguồn phải đọc lại live trước khi thay snapshot. Tạo lại web bằng `python3 damage-simulator/build.py`.

## Hợp đồng dữ liệu

Mọi trường chưa rõ để `null`, không dùng giá trị mẫu. Chỉ số cấp trung gian không được tự nội suy. `energy.cap` khác `energy.ultimateCost`; nhiều biến thể có chi phí riêng nằm trong `ultimateVariants`. Các thay đổi do VM vẫn thuộc mục VM, không ghi đè chỉ số gốc.

Mỗi điều khoản giữ nguyên văn và địa chỉ nguồn. `numbers` chỉ là các số xuất hiện trong câu, có vị trí để đối chiếu; không phải danh sách hệ số được engine tự thực thi. `effectNames` nhận diện tên có dấu ngoặc trong nguồn; không tự suy đoán tên không được đánh dấu. Các tham chiếu trùng tên không đồng nghĩa trùng thiết kế.

`CANON_SOURCE` nghĩa là nội dung đang có trong tài liệu; không có nghĩa mọi diễn giải đã được xác nhận hoặc đã lập trình. `NOT_IMPLEMENTED` xác định rõ cơ chế chưa có bộ thực thi. Bước 1 chuẩn hoá nội dung; bước 2–6 mới chuyển điều khoản thành cơ chế chạy được.

Web dùng chỉ số gốc Lv60, CR/CD mặc định chung; trang bị đã được nối ở bước 3. Năm Veyr đã nối kit, Đột Phá/Mốc phụ và VM1/2/4/6; `runtimeStatus` ghi riêng phạm vi triển khai, VM3/VM5 tạm không tăng cấp kỹ năng. Các Veyr khác vẫn dùng cấu hình thủ công.
