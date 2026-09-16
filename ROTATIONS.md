# Bước 5 — lập và so sánh rotation

## Cách dùng

1. Chọn 5 Veyr, trang bị, chỉ số và cấu hình Myrk.
2. Bấm **Tính lịch & chỉnh từng lượt**. Nếu chưa bật kit, web dùng luồng tạo rotation từ kit để chuẩn bị chuỗi mẫu.
3. Xem số lượt của từng Veyr và sửa BA / Chiến Kĩ / Chờ, mục tiêu Myrk, đồng minh nhận hiệu ứng, cách xử lý thiếu Planck. Ares có chọn cấp Chiến Kĩ riêng mỗi lượt.
4. Đặt điều kiện dùng Tuyệt Kĩ cho từng Veyr. Web luôn kiểm tra Năng Lượng và điều kiện kit trước khi thi triển.
5. Nhập tên, bấm **Lưu rotation**. Thử lựa chọn khác và lưu thêm, rồi bấm **So sánh các bản đã lưu**.

## Lịch và điều kiện

Lịch lấy trực tiếp từ bộ máy chiến đấu, tính cả Tốc Độ, buff tốc độ, đẩy/trì hoãn lượt, khống chế, hạ địch và lượt thêm. Mỗi lựa chọn gắn với vị trí Veyr và số lượt thực tế của Veyr đó, không gắn cứng vào AV. Nếu đổi quyết định làm mất một lượt, lựa chọn của lượt đó được giữ để có thể dùng lại khi lượt xuất hiện.

Các lượt chưa chỉnh tiếp tục dùng chuỗi lặp đã đặt ở phần Rotation. **Dùng lại chuỗi lặp** tắt các lựa chọn từng lượt và điều kiện bổ sung. Hàng Tuyệt Kĩ chen ngang đặt thủ công trong rotation gốc vẫn giữ AV và được kiểm tra chi phí.

Điều kiện Tuyệt Kĩ gồm: kế thừa lựa chọn thẻ nhân vật; dùng ngay; giữ lại; chờ dạng đầy đủ; chờ BA/Chiến Kĩ cường hóa sẵn sàng; chờ hiệu ứng có tên trên một Veyr; ngay trước/sau lượt của Veyr đã chọn, từ lượt số N; giữ lại X Năng Lượng sau khi dùng. Mốc trước/sau cho phép tối đa một Tuyệt Kĩ của người đặt điều kiện tại mỗi mốc lượt. Điều kiện cường hóa kiểm tra dạng BA/Chiến Kĩ thực tế, không tạo trạng thái cường hóa mới.

Tên hiệu ứng cần khớp với tên đang tồn tại trong mô phỏng. Trường này có gợi ý các hiệu ứng đã quan sát được trong lịch hiện tại. Nếu chưa có hiệu ứng hoặc không đủ Năng Lượng, Tuyệt Kĩ tiếp tục được giữ lại.

Timeline đầy đủ gồm lượt Myrk, lượt thật, Tuyệt Kĩ chen ngang và các đòn tự kích hoạt. Thứ tự cùng AV giữ thứ tự xử lý của bộ máy chiến đấu. Bảng trước/sau hành động hiển thị Planck, Năng Lượng và Tốc Độ để đối chiếu.

## Lưu và so sánh

Tối đa 20 bản được lưu trong trình duyệt hiện tại. Bản lưu gồm quyết định mỗi lượt, chính sách Tuyệt Kĩ và chuỗi hành động gốc. Các lựa chọn Tuyệt Kĩ kế thừa được chốt thành chính sách cụ thể khi lưu. Nạp rotation bật kit của đội hiện tại và giữ chỉ số, trang bị, Đột Phá, Mốc phụ, Vận Mệnh đang chọn.

So sánh chạy lại mọi bản tương thích bằng **cùng đội hình, chỉ số, trang bị, Vận Mệnh, Myrk, số cycle và seed hiện tại**. Bảng gồm tổng sát thương, sát thương từng Veyr, Planck cuối, Năng Lượng và số lượt từng Veyr, Sức Bền cuối và số lần Phá Vỡ. Đổi cấu hình sẽ xóa bảng cũ để tránh dùng kết quả cũ. Bản thuộc đội khác không được nạp hoặc so sánh.

Đây là trình lập và so sánh các quyết định của người dùng, chưa phải bộ tự tìm rotation tối ưu. VM3/VM5 vẫn chưa tăng cấp kỹ năng theo yêu cầu tạm hoãn.

## Kiểm tra

### Xu hướng hành động từng Veyr

Thẻ Veyr có lựa chọn: theo chuỗi đang thiết lập, BA–Skill, Skill–BA, luôn Skill, Skill–BA–BA, Skill–Skill–BA và luôn BA. Chuỗi bắt đầu từ phần tử đầu ở lượt 1 rồi lặp theo lượt Veyr, bao gồm lượt thêm; lượt bị khống chế vẫn chiếm một bước, Tuyệt Kĩ/FUA chen ngang không chiếm bước. Skill thiếu Planck chuyển thành BA mà không giữ lại bước Skill. Skill/BA cường hóa vẫn do kit quyết định.

Chỉ áp dụng khi bật kit và chạy timeline tự sinh theo cycle. Hàng thủ công theo AV giữ nguyên. Quyết định chỉnh riêng từng lượt ưu tiên cao hơn xu hướng. Bản lưu đội giữ `kitPattern`; bản lưu cũ thiếu trường này dùng `inherit` để giữ chuỗi cũ. `action-patterns.test.mjs` và `browser-patterns.test.cjs` kiểm tra thứ tự, lặp chuỗi, fallback, lưu/nạp và ưu tiên chỉnh từng lượt.

### Tự chọn chủ lực và Chí Mạng — 16/09/2026

Ô **Chủ lực nhận buff** mặc định tự động. Chọn trong đồng minh còn sống thuộc Gungnir, Mjolnir, Trishula, Fragarach, Vajra, Pandora; nếu không có thì xét các đồng minh còn sống khác. Có nhiều ứng viên thì so tổng sát thương ước tính từ một mô phỏng sơ bộ cùng cấu hình/seed (gồm các nguồn sát thương, trước khi cắt theo HP còn lại). Lượt sơ bộ dùng thứ tự ô để phá hòa; kết quả chốt điểm cho lượt mô phỏng chính. Đây là lựa chọn theo dự báo, chưa phải tìm tối ưu toàn bộ tổ hợp buff/rotation. Sau khi mục tiêu chết, chọn lại trong ứng viên sống bằng cùng bảng điểm.

Ưu tiên quyết định: người nhận cụ thể trong hàng/lượt → chủ lực chỉ định ở thẻ Veyr → tự động. Giá trị `recipient: -1` kế thừa thẻ; `kitRecipient: -1` bật tự chọn. Các bản lưu cũ có người nhận cụ thể giữ nguyên lựa chọn. Chuỗi mới mặc định luân phiên Skill/Basic và đổi sang Basic khi thiếu Planck; bộ tạo chuỗi riêng vẫn giữ các biến thể Apollo/Agni. Bảng **Hành động và người nhận buff** hiển thị số BA/Skill/Ult thực thi và người nhận thật, không đếm lượt bị chặn.

Hermes từ VM4 cần đếm Chí Mạng thực tế. Nếu UI đang chọn kỳ vọng và đội có kit/trang bị cần đếm Chí Mạng, UI chuyển sang `sampled`, hiển thị thông báo và dùng seed đã chọn. Không sửa điều kiện nội tại; kiểm tra chặn kỳ vọng ở engine vẫn giữ cho các lệnh gọi trực tiếp. Đội Poseidon–Amphitrite–Hermes–Hephaestus–Hera VM6 đã được kiểm tra trên Chrome, kể cả đặt Poseidon ở ô 3 và đổi người nhận thủ công.

- `support-targeting.test.mjs`: nhiều/không có chủ lực, Pandora, mục tiêu chết, ưu tiên thủ công, cả đội VM6, BA Hermes, dự báo tái lập.
- `browser-support.test.cjs`: chọn cả đội VM6 trên UI, tự chuyển chế độ Chí Mạng, buff đúng chủ lực ở ô 3, đếm BA và sửa người nhận từng lượt.

- `rotation.test.mjs`: đổi người nhận theo lượt, tính lại AV khi đổi tốc độ, mốc trước/sau, giữ NL, điều kiện hiệu ứng, so sánh tái lập, lượt thêm và chặn đội khác.
- `browser-rotation.test.cjs`: sửa lượt trên Chrome, lưu/nạp/tải lại trang, so sánh, xóa kết quả cũ khi cấu hình đổi và khóa bản thuộc đội khác.
- Các kiểm tra engine, kit 61 Veyr và tương tác trang bị tiếp tục chạy độc lập.
