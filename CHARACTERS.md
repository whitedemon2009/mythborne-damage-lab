# Bước 4 — bộ thực thi nhân vật

Đã nối 61/61 Veyr vào bộ thực thi riêng trong `characters/`. Nguồn đối chiếu với thẻ nhân vật live và các xác nhận của người dùng; bản kiểm chứng lưu ở `data/step4-live-verification.json`, xác nhận bổ sung trong `data/user-rules.json`. Registry giữ hash nguồn cho từng nhân vật để chặn việc dùng kit cũ khi nguồn thay đổi.

## Phạm vi bộ thực thi

- Tấn Công Thường, Chiến Kĩ, Tuyệt Kĩ, các biến thể, Thiên Phú, A1–A3, Mốc phụ và VM1/2/4/6. VM3/5 không tăng cấp kỹ năng theo quyết định tạm hoãn của người dùng.
- Apollo: luân phiên Chiến Kĩ, Thiên Đỉnh, ba đợt Tuyệt Kĩ, ghi Quang Tích sau hit phá, aura Mjolnir, giới hạn sạc riêng từng đồng minh, các nhánh Vận Mệnh.
- Agni: chọn đồng minh khác, chuyển và làm mới Đồng Hỏa theo lượt Agni, giữ Hỏa Chủng dư, FUA thường/cường hóa, VM6 tức thời không tiêu Hỏa Chủng hoặc Thần Hỏa. Khi đồng minh bị hạ, cặp buff kết thúc.
- Astraeus: hai dạng Tuyệt Kĩ, ngưỡng/chi phí VM4, đòn AoE rồi sáu hit nảy, hồi Năng Lượng và các buff theo lượng Năng Lượng hiện tại.
- Nemesis: Cáo Trạng → Bản Án, Quy Cân, Chiến Kĩ cường hóa, Công Lý Dội Âm là sát thương phụ không tự lặp hoặc tự sạc Thiên Phú Apollo.
- Durga: Khiên trước sát thương, Hổ Văn kiểm tra Chính Xác/Kháng Hiệu Ứng, Hổ Thế, FUA và phục hồi Khiên còn tồn tại đến trần ban đầu. VM6 dùng công thức Sát Thương Chuẩn.

## Các xác nhận mới

- Bào mặc định: BA 30, Chiến Kĩ 60, Tuyệt Kĩ 120 cho Vajra/Gungnir và 90 cho Aspect khác, FUA 20. Giá trị riêng trong kit được ưu tiên, kể cả 0.
- Kỹ năng AoE rồi đánh nảy: đợt AoE dùng mức của kỹ năng; mỗi hit nảy bào thêm 10 Sức Bền. Không nhân phần bào AoE lên theo số hit nảy.
- Apollo A1 tính Chí Mạng từ Năng Lượng hiện có lúc vào trận, chụp một lần; 200 NL nhận 10%.
- Durga VM1: 5 Myrk = 25%; 3–4 = 35%; 1–2 = 75%.

## Sử dụng

1. Chọn năm Veyr bất kỳ trong roster hiện tại, trang bị và chỉ số tùy ý.
2. Bấm **Tạo rotation từ kit**. Nút này bật kit, Đột Phá, Mốc phụ và tự dùng Tuyệt Kĩ; Astraeus mặc định chờ dạng II. Đây là rotation mẫu để kiểm tra, chưa phải trình tối ưu đội hình.
3. Mỗi Veyr có lựa chọn Vận Mệnh và chính sách Tuyệt Kĩ. Mỗi hàng rotation chọn BA/Chiến Kĩ/Tuyệt Kĩ từ kit, đồng minh nhận buff và mục tiêu chính. Có thể chọn dùng BA khi thiếu Planck, hoặc bỏ hành động.
4. Hệ số, tài nguyên và hiệu ứng của hàng từ kit được bộ thực thi quyết định; các ô công thức thủ công bị khóa để không cộng nhầm số mẫu.
5. Xem nhật ký tên kỹ năng, sát thương, tài nguyên và trạng thái cuối mô phỏng. Các FUA và Tuyệt Kĩ tự chèn không cần thêm hàng giả.

Nếu hàng từ kit trỏ tới Veyr chưa bật/chưa hỗ trợ hoặc hash nguồn không còn khớp, kết quả bị chặn thay vì tính bằng kit cũ.

## Kiểm tra

- `character-rules.test.mjs`: mặc định bào, ngoại lệ và công thức Apollo A1.
- `character-runtime.test.mjs`: biến thể, tài nguyên, giới hạn theo hành động, thời hạn theo lượt chủ sở hữu, chuyển buff, Quang Tích và chặn nguồn cũ.
- `character-team.test.mjs`: đội năm Veyr cùng trấn/Thần Vật, VM0–VM6, 1–5 Myrk, tự dùng Tuyệt Kĩ và các giới hạn tài nguyên.
- `browser-character.test.cjs`: bản HTML mở trực tiếp bằng Chrome, tạo rotation, kỹ năng cường hóa, FUA, chọn Vận Mệnh đổi nhân vật, chặn kit đã tắt, chọn người nhận Tuyệt Kĩ và cấp Chiến Kĩ Ares.

Các kiểm tra trang bị/công thức cũ vẫn chạy độc lập. Không có benchmark DPS hay xếp hạng đội hình được suy ra từ rotation mẫu này.

## Xác nhận và kiểm tra bổ sung

- Theo: Tuyệt Kĩ bào thêm 15% Sức Bền tối đa khi mục tiêu có Sơ Hở.
- Veylen VM2 chỉ dùng cho Chiến Kĩ Cường Hoá.
- Seren: buff theo ATK người nhận, giới hạn 20% DEF Seren; hồi khiên riêng của Seren.
- Lucan: giữ lớp khiên Chiến Kĩ khi dùng Tuyệt Kĩ; VM6 kéo dài 2 lượt.
- Rhydan VM1 lấy lớp khiên lớn nhất trước đòn đánh.
- Asclepius: xử lý Dự Trữ một lần sau toàn bộ hành động Myrk, trước khi giải quyết phản kích/FUA đang chờ.
- `character-roster.test.mjs`: 183 trường hợp, 61 Veyr ở VM0/2/6 với đội hỗn hợp.
- Eris giữ hai cách Hất Tung riêng: trì hoãn trong kit và khống chế khi Phá Vỡ Phong. Hecate VM2 kéo dài 2 lượt, không cộng dồn; VM6 cho phép tối đa hai lần tự lặp FUA.
- Lugh cường hóa Phản Kích thành 300% / 170%; Nemty cấp Thuận Lộ trước khi giải quyết phản kích, Bellona kiểm tra toàn bộ mục tiêu được Myrk chọn.
- Hades cho Chết Chóc đi qua buff/DEF/Kháng lần nữa; Thor VM6 dùng Lôi Áp hiện tại và bao gồm VM2.
- Athena chuyển sát thương dư về trước DEF/Kháng rồi tính theo mục tiêu mới. Twin Decree tăng 10% Chí Mạng trong 2 lượt, không cộng dồn. VM6 tạo lượt miễn Planck cho Chiến Kĩ, giữ thời hạn hiệu ứng trên Athena.
- Janus VM4 tối đa 4 lần mỗi lượt Janus khi Mặt Sau còn tồn tại. Giới hạn NL 130, vào trận 65 theo xác nhận ngày 15/09/2026.
- Surtr có chuỗi Tuyệt Kĩ → Chiến Kĩ Cường Hóa → Tuyệt Kĩ Cường Hóa, Da Tro, DK bỏ DEF/Kháng một lần và Hỏa Táng VM4 đánh ba lần nhưng xử lý hiệu ứng phụ một lần.
- Ares cấp III tốn 2 Planck và 50% HP hiện tại. Poseidon kết thúc Cực Triều theo thời hạn; VM6 giữ 2 Triều Thế khi vào Nước Rút.
- `character-team.test.mjs`: 35 kịch bản đội Apollo có trang bị và thêm 54 kịch bản đội DoT, Break, đơn mục tiêu và phản kích, gồm Myrk chọn nhiều Veyr.
- Giới hạn năng lượng chưa được cung cấp sẽ chặn kit tự động, không dùng 120 thay thế.

Trong giao diện, Máni và Amphitrite có bộ chọn người nhận Tuyệt Kĩ tự động. Ares có bộ chọn cấp Chiến Kĩ riêng từng hàng. Rotation mẫu chưa tự tìm đội hình, trang bị hoặc thứ tự hành động tối ưu.
