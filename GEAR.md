# Bước 3 — trang bị

## Cập nhật đề cử và đổi Veyr — 16/09/2026

Đã đọc lại toàn bộ bốn thẻ nguồn live để rà 74 kit, 114 Mảnh Ký Ức và 22 bộ Thần Vật. `recommendations.mjs` thay cách chấm điểm từ khóa bằng các hồ sơ xét riêng: trấn, Mảnh 5★ thay thế khi có tương tác phù hợp, lựa chọn 4★/3★ và điều kiện của từng phương án bộ. Không coi đây là thứ hạng tối ưu đã chứng minh bằng mô phỏng. `recommendation-review.mjs` lưu danh tính/hash của dữ liệu được đối chiếu; đổi thứ tự catalog không đổi đề cử, dữ liệu đổi hash sẽ bị loại khỏi đề cử đến khi rà lại.

Phân biệt FUA, Phản Kích, sát thương phụ, DoT và Diệt Kích; không đề cử nội tại Chiến Kĩ chọn một đồng minh cho Chiến Kĩ đánh địch/buff toàn đội. Có phối 4+2 và 2+2+2; Astraeus VM4 chuyển sang 4 Thiên Kính + 2 Võ Đài vì thực tiêu 150 Năng Lượng. Hecate VM1 có thêm phương án FUA; Bellona có phương án ATK không cần bản thân bị chọn. Các điều kiện số mục tiêu và đồng đội được ghi trong mô tả, không tự giả định luôn đạt.

Đổi Veyr tại một ô đội hình sẽ bỏ Mảnh Ký Ức, đưa tinh luyện về TL1 và tạo sáu ô Thần Vật trống với dòng phụ/nảy dòng mặc định mới. Không ảnh hưởng trang bị bốn ô khác. Nạp đội đã lưu vẫn khôi phục trang bị trong bản lưu. Áp dụng đề cử Thần Vật chỉ thay tên bộ của sáu món, giữ chỉ số đã chỉnh.

Kiểm tra bổ sung: `recommendations.test.mjs` kiểm tra đủ 74 Veyr ở VM0/1/4/6, Aspect, điều kiện đặc thù và nguồn thay đổi; `browser-recommendations.test.cjs` kiểm tra đổi Apollo → Hades, nảy dòng bị xóa, nạp lại bản lưu, phối 4+2 và giao diện mobile trên Chrome.

Đã hoàn thành tầng thực thi trang bị cho các hành động được khai báo. Nguồn Mảnh Ký Ức / Thần Vật đã đọc lại live; ba sửa đổi thời hạn trong Google Doc đã được đồng bộ. Hai xác nhận bổ sung của người dùng nằm trong `data/gear-clarifications.json`. Không sửa Google Doc.

## Phạm vi

- 114 Mảnh Ký Ức: chỉ số Lv60 cộng vào base, nội tại chỉ chạy khi khớp Aspect, TL1–TL5 nội suy tuyến tính không làm tròn.
- 22 bộ Thần Vật: cộng thưởng 2 món và thực thi điều kiện 4/5 món. Chỉ số chính/phụ và số lần tăng dòng vẫn dùng quy tắc đã chốt.
- Sự kiện trang bị: dùng kỹ năng, gây sát thương, DoT, phá/hồi Sức Bền, hồi máu, tạo/vỡ Khiên, bị chọn làm mục tiêu, tự giảm HP, thanh tẩy, đẩy lượt, hoàn Planck, bắt đầu/kết thúc lượt.
- Theo dõi riêng chủ sở hữu, mục tiêu, thời hạn, tầng, lần sử dụng và chuỗi phản kích. Buff trong lượt thật tính lượt hiện tại, theo Bible §57–59; buff chen ngang không tự mất lượt.
- Hồi Planck chỉ có ở nội tại nguồn cho phép. Overflow bị bỏ và việc hoàn diễn ra sau khi đã trả chi phí.
- Hiển thị nguồn cộng chỉ số đầu trận; nhật ký ghi hiệu ứng thực sự kích hoạt. Thay Mảnh, TL hoặc bộ sẽ tính lại từ chỉ số gốc, không giữ buff trận trước.
- Mỗi quy tắc gắn với hash nội dung nguồn. Nguồn thay đổi sẽ báo cần đối chiếu, không tự áp dụng cơ chế cũ như đã xác nhận.

## Hành động đặc biệt

Đây chưa phải bước tự thực thi toàn bộ kit nhân vật. Với Buff/Heal/Shield, chọn loại kỹ năng gốc là Chiến Kĩ hoặc Tuyệt Kĩ. Hành động có cơ chế đặc biệt cần đánh dấu: cường hóa, cường hóa BA, tiêu hao tầng, sát thương từ giá trị đã ghi, hồi máu trì hoãn, thanh tẩy, kích hoạt DoT ngoài lượt hoặc tự tiêu HP. Các thông tin này là mô tả hành động đang thử, không làm thay đổi canon nhân vật.

Nội tại dựa trên Chí Mạng thực tế yêu cầu chế độ theo seed, luôn Chí Mạng hoặc không Chí Mạng; chế độ kỳ vọng không giả lập kích hoạt bằng một phần tầng. Điều kiện số mục tiêu được đối chiếu lại với mục tiêu thực nhận sát thương. Nếu chuyển mục tiêu sau hạ địch tạo điều kiện tự mâu thuẫn không hội tụ, mô phỏng báo lỗi rõ thay vì xuất kết quả bị cắt hoặc sai.

## Kiểm tra

- `gear.test.mjs`: 510 cấu hình Mảnh/tinh luyện, chỉ số cơ bản, lệch Aspect, tháo trang bị, tỷ lệ cộng và sát thương theo nguồn.
- `gear-integration.test.mjs`: 114 Mảnh và 22 bộ ở cả 2/4/5 món trong chuỗi chiến đấu hỗn hợp; kiểm tra số liệu cho thời hạn/không cộng dồn, chi phí Ult hỗ trợ, giới hạn hồi NL theo mục tiêu, trần NL phân số, chuỗi phản kích, phân loại hành động không gây ST, nguồn Khiên, Đại Triều và hai lượt thật của Dẫn Quỹ.
- `browser-gear.test.cjs`: mở HTML standalone trong Chrome riêng; chọn/tháo Mảnh, đổi Veyr, TL, lệch Aspect, nguồn cộng chỉ số, 5 món và loại kỹ năng hỗ trợ. Không dùng hồ sơ Chrome cá nhân.
- Các kiểm tra combat, engine và dữ liệu cũ vẫn phải đạt.
