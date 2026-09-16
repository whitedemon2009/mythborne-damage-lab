# Bước 6 — báo cáo sát thương và so sánh đội hình

## Báo cáo trận hiện tại

Sau khi chạy mô phỏng, phần **Báo cáo sát thương** hiển thị:

- Đóng góp của năm Veyr, phần trăm tổng sát thương, Năng Lượng cuối và số lượt thực tế.
- Tổng theo kỹ năng và nguồn: BA, Chiến Kĩ, Tuyệt Kĩ, FUA, Phản Kích, DoT, Phá Vỡ, Diệt Kích, Sát Thương Chuẩn và sát thương phụ.
- Danh sách hit có bộ lọc Veyr / nguồn và phân trang. **Xem công thức** mở chỉ số, hệ số đòn, các hệ số nhân, DEF/Kháng, HP mục tiêu trước hit và kết quả thực tế.
- Các lần thiếu Planck, chuyển sang BA, thiếu NL khi yêu cầu Tuyệt Kĩ, mục tiêu không hợp lệ, khống chế, thiếu HP, tràn tài nguyên và hiệu ứng hết hạn.

Ảnh chụp hệ số được lấy lúc tính hit, trước khi sự kiện của hit thay đổi trạng thái. Phần hiệu ứng là danh sách đang tồn tại; các hệ số tổng đã phản ánh điều kiện áp dụng. Đây không phải phép quy đổi riêng mức đóng góp của từng buff.

Sát thương thực tế cộng vào tổng trận là `min(HP còn lại, sát thương tính được)`. Phần vượt HP được ghi riêng, không cộng vào tổng. Nó không mặc nhiên là sát thương lãng phí: Athena có thể chuyển tiếp phần dư. Các đòn dùng giá trị đã ghi được trình bày như giá trị cố định, không giả lập thêm một lượt DEF/Kháng; Quang Tích ghi rõ giá trị đã tích và trần theo ATK. Phá Vỡ bổ sung có bảng hệ số Phá Vỡ riêng.

Mỗi hit chỉ thuộc một nhóm đóng góp. Ví dụ Hỏa Táng nằm trong nhóm DoT, đồng thời ghi chú khả năng kích hoạt Diệt Kích; không cộng hai lần vào tổng. Khi nguồn kích hoạt và loại sát thương khác nhau, phần chi tiết hiển thị cả hai.

Sự kiện hết hạn hoặc tràn tài nguyên là thông tin để kiểm tra rotation, không phải kết luận rằng đội hình yếu. Chẩn đoán thiếu NL chỉ ghi khi một Tuyệt Kĩ thực sự được yêu cầu nhưng không đủ chi phí; trạng thái tự động chờ đủ NL không bị tính là hành động thất bại.

## So sánh các đội khác nhau

1. Dựng đội thứ nhất, trang bị và rotation; chạy mô phỏng hợp lệ.
2. Nhập tên và bấm **Lưu đội & rotation**.
3. Dựng đội tiếp theo rồi lưu bằng tên khác.
4. Chọn cấu hình Myrk, thời lượng và seed chung, bấm **So sánh các đội đã lưu**.

Mỗi bản lưu giữ riêng chỉ số, 5 Veyr, Mảnh Ký Ức/tinh luyện, 6 Thần Vật với chỉ số và các lần nảy dòng, Đột Phá, Mốc phụ, Vận Mệnh, chính sách Tuyệt Kĩ, chuỗi rotation và các lựa chọn từng lượt. **Nạp đội** khôi phục cấu hình này lên giao diện để sửa tiếp. Tối đa 10 đội được lưu trong trình duyệt; việc lưu không sửa Google Doc hoặc nguồn đồng bộ.

So sánh dùng Myrk, Kháng, Điểm Yếu, số mục tiêu, chế độ Chí Mạng, số cycle, seed và các tham số trận hiện tại chung cho tất cả đội. Trang bị, chỉ số và rotation lấy từ từng bản lưu. Chế độ chạy rotation cố định / tự sinh cũng được giữ theo bản lưu.

Bảng gồm tổng sát thương, ST/100 AV, thời điểm dọn xong hoặc số Myrk còn lại, sát thương từng Veyr, số Veyr sống, tài nguyên/lượt cuối và số hành động bị chặn/chuyển thành BA. ST/100 AV luôn chia cho toàn bộ thời lượng thử nghiệm chung `150 + 100 × (cycle − 1)`, kể cả khi trận kết thúc sớm. Tổng sát thương chịu trần HP; khi các đội đều dọn xong, cần xem thêm thời điểm dọn xong.

Đổi cấu hình xóa bảng so sánh cũ; bấm so sánh để chạy lại. Bản lưu có hash kit hoặc nguồn trang bị đã thay đổi bị chặn và yêu cầu lưu lại. Đội dùng hàng thủ công vẫn có thể thử nhưng bảng hiển thị rõ số Veyr bật kit tự động.

## Kiểm tra

- `report.test.mjs`: đối chiếu bật/tắt báo cáo cho 61 Veyr VM6, tái tạo công thức từng hit, tổng đóng góp, overkill, các chẩn đoán và tách bản đội đã lưu khỏi cấu hình hiện tại; kiểm tra công thức với 102 Mảnh Ký Ức và 22 bộ Thần Vật.
- `browser-report.test.cjs`: mở chi tiết hit, lọc Veyr, lưu hai đội khác nhau, giữ trang bị/chỉ số khi nạp, so sánh chung điều kiện, xóa kết quả cũ và nạp sau khi tải lại trang.
- Kiểm tra engine, kit, trang bị và rotation tiếp tục chạy độc lập.

VM3/VM5 vẫn tạm hoãn tăng cấp kỹ năng. Các bảng này so sánh phương án đã nhập; chưa tự tìm đội hình hoặc rotation tối ưu.
