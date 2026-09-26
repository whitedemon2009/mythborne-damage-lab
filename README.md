# Mythborne Damage Lab

Mở `Mythborne-Damage-Lab.html` bằng trình duyệt. Chạy `python3 damage-simulator/build.py` sau thay đổi để cập nhật bản đóng gói.

## Mốc 15/09/2026

- Công thức sát thương trực tiếp, DoT, Phá Vỡ, Diệt Kích theo Bible người dùng gửi và các xác nhận sau đó.
- BaseBreak = 1691 × cấp/60; Hỏa 2, Nham 2, Phong 1.5, Băng/Lôi/Quang 1, Thủy/Ám 0.5; Hỏa Ngục/Thủy Triều dùng Hỏa/Thủy.
- Hit phá Sức Bền dùng 0.9; các hit sau dùng 1.0. Cơ chế Diệt Kích cần bật rõ cho hành động.
- Hiệu ứng Break, DoT 2 lượt và giảm thời hạn sau tick, Quang Tích 20%/trần 200% ATK hiện tại.
- Dummy có HP, cấp, Sức Bền, Tốc Độ, điểm yếu, sát thương, số hit và số Veyr bị chọn trong mỗi hành động; chọn mục tiêu ngẫu nhiên có trọng số Aspect và seed tái lập.
- Planck 3/5, tiêu trước hoàn sau; Năng Lượng bắt đầu 50%, FUA mặc định 10 và hưởng ER.
- Lượt tự sinh theo SPD; buff SPD/AA cập nhật lượt kế tiếp và số lượt thực tế. Buff/debuff có thời hạn, FUA/Phản Kích có trigger và giới hạn. Chi tiết: `ENGINE.md`.
- Thần Vật không cho dòng phụ cùng loại chỉ số chính.

## Giới hạn hiện tại

Web hỗ trợ cả cấu hình thủ công và kit tự động cho toàn bộ 74 Veyr trong nguồn live. Xem `CHARACTERS.md` để biết cơ chế, cách tạo rotation và kiểm tra. Chỉ số gốc Lv60 đã lấy từ nguồn live, hàng từ kit tự lấy hệ số, hàng thủ công nhập tay. Dữ liệu chuẩn hoá nằm trong `data/`, gồm 74 Veyr, 114 Mảnh Ký Ức, 22 bộ Thần Vật và 46 Myrk. Bộ thực thi trang bị hiện bao phủ 114 Mảnh Ký Ức và 22 bộ Thần Vật; xem `GEAR.md`. VM3/VM5 tạm chưa tăng cấp kỹ năng theo xác nhận của người dùng.

Các kit hỗ trợ FUA, phản kích, DoT, Diệt Kích và các biến thể theo điều kiện riêng; vẫn có chế độ thủ công để thử công thức. Chế độ tự sinh lặp chuỗi lượt thật riêng của từng Veyr; hàng chen ngang vẫn dùng AV cố định. DoT trong UI là đặt debuff, không gây sát thương trực tiếp. Giảm DEF/RES/vulnerability có thể nhập cho một đòn hoặc tạo bằng hành động Debuff có thời hạn.

Bước 5 đã thêm phần **Lập kế hoạch từng lượt**: tính lịch, sửa quyết định và người nhận buff ở từng lượt, đặt điều kiện Tuyệt Kĩ, lưu/nạp và so sánh các rotation trên cùng cấu hình. Xem `ROTATIONS.md`. Timeline và số lượt lấy trực tiếp từ mô phỏng; kết quả so sánh được tính lại, không dùng số cũ sau khi đổi trang bị hoặc Myrk.

Bước 6 thêm **Báo cáo sát thương** và **So sánh đội hình**: công thức từng hit, đóng góp theo nguồn, chẩn đoán tài nguyên, lưu/nạp riêng trang bị và rotation của mỗi đội để so sánh trên cùng Myrk. Xem `REPORTS.md`.

## Kiểm tra

Chạy `node test-all.mjs` để kiểm tra toàn bộ dữ liệu nhân vật, công thức, trang bị, rotation và tương tác đội hình. Chạy `npm run test:browser` để mở bản đóng gói bằng Chromium và kiểm tra chọn roster, đội VM6, HP vô cực, trang bị riêng từng Veyr và giao diện di động. Trước mỗi lần xuất bản, GitHub Pages tự chạy toàn bộ các bước này; bản mới chỉ được triển khai khi tất cả đều vượt qua.

HP Myrk: ô nhập hỗ trợ 10 triệu và các giá trị đến `Number.MAX_SAFE_INTEGER`, bỏ giới hạn cũ 1 triệu. Trong thiết lập Myrk, chọn **Chế độ HP Myrk → HP vô cực** để ghi toàn bộ sát thương mà không giảm HP hoặc hạ địch. Myrk vẫn hành động, nhận hiệu ứng và phá/hồi Sức Bền. HP nhập là HP tham chiếu hữu hạn cho cơ chế theo HP; Myrk luôn đầy HP, do đó không có hiệu ứng hạ địch, sát thương dư khi chết hoặc giảm HP. Báo cáo mỗi mục tiêu và mỗi cycle lấy sát thương đã ghi thay vì lấy HP ban đầu trừ HP còn lại. Đây là chế độ dummy kiểm thử, không thay đổi canon chiến đấu.

`infinite-hp.test.mjs` kiểm tra sát thương trực tiếp/FUA/DoT/Break/Diệt Kích không bị cắt, lượt Myrk và không nhận năng lượng hạ địch. `browser-infinite-hp.test.cjs` kiểm tra nhập 10 triệu, bật/tắt vô cực, tổng cycle và thông báo lỗi đúng ô.

Bước 7: phần trên chỉ thiết lập Myrk; chọn thời lượng và chạy tại **Chạy sát thương theo cycle**. Bảng cycle cộng sát thương thực tế từng hit và hiển thị lũy kế. Chuỗi kỹ năng và lựa chọn từng lượt nằm trong phần mở rộng. Mỗi Thần Vật mới bắt đầu chưa nảy; nút **+** chọn Min/Mid/Max, chip **×** hoàn tác. Cấp 15 cho tối đa 5 lần nảy nếu khởi đầu 4 dòng, 4 lần nếu khởi đầu 3 dòng; ở cấp thấp hơn áp dụng mốc mỗi 3 cấp. Đổi cấp giảm hoặc chuyển sang 3 dòng sẽ bỏ lượt nảy không còn hợp lệ. Các bản lưu cũ giữ lượt nảy đã có. Đề cử là gợi ý từ nội dung kit/nội tại và Aspect, không phải bộ tối ưu được chứng minh bằng mô phỏng. Áp dụng bộ cho 6 món chỉ đổi tên bộ, giữ chỉ số và lượt nảy.

`node damage-simulator/browser-experience.test.cjs`

`node damage-simulator/combat.test.mjs`

`node damage-simulator/engine.test.mjs`

`node damage-simulator/gear.test.mjs`

`node damage-simulator/gear-integration.test.mjs`

`node damage-simulator/character-runtime.test.mjs`

`node damage-simulator/character-team.test.mjs`

Janus có giới hạn 130 Năng Lượng theo xác nhận ngày 15/09/2026, bắt đầu trận với 65. Các xác nhận bổ sung được lưu ở `data/user-rules.json`, không sửa nguồn đồng bộ. Bản web dùng được cả qua localhost và mở trực tiếp file HTML.
