# Bộ máy chiến đấu — bước 2

## Đã thực thi và kiểm tra

- Lịch lượt tự sinh đến hết số cycle. Một lượt tự nhiên kế tiếp cho mỗi đơn vị; Tốc Độ đổi giữ tiến trình, đẩy lượt trừ BaseAV và chặn tại thời điểm hiện tại. Các đơn vị đã sẵn sàng giữ FIFO; đến đồng thời ưu tiên phe ta, SPD, vị trí.
- Chế độ nhập AV cố định vẫn có để đối chiếu phép tính. Các hàng lượt thật ở chế độ tự sinh tạo chuỗi lặp riêng theo từng Veyr; không có hàng thì chờ. Không tự chọn kỹ năng thay khi thiếu tài nguyên.
- Tách lượt thật, hành động chen ngang và lượt cộng thêm. Lượt cộng thêm xử lý thời hạn nhưng giữ lịch lượt tự nhiên đang chờ.
- Hiệu ứng có nguồn, tên, loại, giá trị, tầng, trần tầng và thời hạn. Cùng tên làm mới; khác tên trong cùng bucket cộng. Thời hạn giảm cuối lượt thực tế của người nhận. DoT giảm ngay sau tick.
- Buff ATK/HP/DEF/SPD, sát thương và các chỉ số chung; debuff DEF, RES, vulnerability, hiệu ứng khống chế và gắn Điểm Yếu. EHR/EffectRES và miễn nhiễm tuyệt đối có kiểm tra riêng. Gắn Điểm Yếu không giảm RES.
- Đòn nhiều hit chuyển mục tiêu khi mục tiêu chết; bounce chọn lại mục tiêu sống bằng seed. Engine cho phép hệ số/bào Sức Bền riêng từng mục tiêu qua `targetRatios`/`targetToughness`.
- Phá Vỡ, Diệt Kích từ hit phá, DoT, Quang Tích, khống chế và hồi Sức Bền. Phá trong chính hành động Myrk không được hồi Sức Bền cuối hành động đó.
- Trigger sau đồng minh tấn công, sau Myrk đánh trúng người sở hữu và sau phe ta phá Sức Bền. Mỗi đăng ký bắt buộc có giới hạn giữa hai lượt chủ sở hữu. Chỉ cấm nguồn FUA tự kích trực tiếp; A→B→A hợp lệ nếu còn số lần. Một hành động Myrk nhiều hit chỉ phát một sự kiện phản kích, có danh sách các Veyr bị đánh.
- Tài nguyên tiêu trước, hoàn sau; Năng Lượng theo chỉ số hiện tại; hạ địch bằng DoT vẫn cộng Năng Lượng. Tuyệt Kĩ hỗ trợ `energyCost` riêng, tách khỏi cap.
- Sát Thương Chuẩn dùng giá trị gốc bỏ các lớp giảm trừ; phép tính không nhân phòng thủ lần hai.
- Khiên nhiều nguồn cùng nhận sát thương; HP chỉ chịu phần vượt khiên lớn nhất. Khiên cùng nguồn giữ giá trị lớn hơn và làm mới thời hạn.
- Chết xoá hiệu ứng và Năng Lượng. Hồi sinh tức thời dùng một nguồn theo thứ tự talent/ascension/skill/fate/ally/external, giữ tiến trình lượt. Cơ chế này đã được kiểm tra bằng dữ liệu thử, chưa gắn vào kit nào.
- Vòng lặp sai hoặc vượt giới hạn kiểm tra trả `complete:false`; giao diện xoá kết quả cũ và báo lỗi, không trình bày sát thương bị cắt như kết quả hoàn chỉnh.

## Cách dùng trên web

1. Chọn “Tự sinh lượt, lặp chuỗi kỹ năng mỗi Veyr”.
2. “Tạo chuỗi cho 5 Veyr” tạo một BA mẫu cho mỗi người; nhập đúng hệ số theo kit.
3. Thêm các hàng lượt thật theo thứ tự sử dụng của từng Veyr. Hàng chen ngang sử dụng AV nhập tay.
4. Muốn thử FUA/Phản Kích tự động: chọn nguồn sát thương, mở “Công thức, tài nguyên & hiệu ứng”, chọn điều kiện “Kích hoạt” và giới hạn. Điều kiện nhập thử không làm thay đổi kit canon của nhân vật.
5. Xem nhật ký để đối chiếu thời điểm, sát thương, tài nguyên và hiệu ứng.

## Phạm vi còn lại

Bộ máy đã nối 61/61 kit Veyr, gồm Athena overkill và Hỏa Táng; xem `CHARACTERS.md`. Nội tại trang bị nằm trong `GEAR.md`. Bước 5 thêm lựa chọn theo số lượt thực tế, các mốc trước/sau lượt cho Tuyệt Kĩ, timeline và so sánh rotation (`ROTATIONS.md`). Myrk hiện dùng dummy có thể cấu hình; chưa có bộ thực thi riêng cho từng kit Myrk. VM3/VM5 vẫn tạm hoãn tăng cấp kỹ năng. Trình tự tìm rotation tối ưu chưa được triển khai.

## Kiểm tra

`node damage-simulator/combat.test.mjs`

`node damage-simulator/engine.test.mjs`

`python3 damage-simulator/validate_data.py`
