# Bước 4 — bộ thực thi nhân vật

Đã nối đủ 74/74 Veyr vào bộ thực thi riêng trong `characters/`. Nguồn đối chiếu với thẻ nhân vật live và các xác nhận của người dùng; bản kiểm chứng lưu ở `data/step4-live-verification.json`, xác nhận bổ sung trong `data/user-rules.json`. Registry giữ hash nguồn cho từng nhân vật để chặn việc dùng kit cũ khi nguồn thay đổi.

## Nhóm Chang’e–Nyx

- Chang’e quản lý một ‘Nguyệt Kính’, gọi Moon in the Second Mirror sau hành động phù hợp của đồng minh và tách từng hình phản chiếu thành hành động riêng. VM2 mở điều kiện cho đòn nhiều mục tiêu; ‘Song Ảnh’ và VM6 thêm các lần phản chiếu kế tiếp.
- Ishtar duy trì tối đa ba ‘Tinh Môn’ và một ‘Vương Tọa’. Đổi mục tiêu chính khiến A Queen Crosses Every Gate chạy theo tuyến đã đánh dấu; Tuyệt Kĩ và Vận Mệnh bổ sung đường quay lại.
- Skadi thu thập ‘Đạn Tuyết’ từ hiệu ứng có lợi và bất lợi, mở White Silence at Point-Blank từ sáu viên. Hệ số tăng tới tổng 900% Tấn Công ở 12 viên; toàn bộ sát thương Hàn Băng bỏ qua Phòng Thủ.
- Taranis chọn ‘Người Giữ Nét’, vận hành vòng buff chéo Băng–Lôi và khuếch đại sát thương lên mục tiêu có ‘Sơn Dẫn Điện’.
- Dian Mu tạo ‘Lôi Kính’, giảm Tốc Độ Myrk và chuyển sát thương Băng/Lôi của đội hợp lệ thành ‘Siêu Dẫn’; Hàn Băng giữ nguyên và không bị chuyển hóa.
- Marek đặt ‘Mối Nối Yếu’, cộng lượng bào Sức Bền vào hit đầu và truyền phần bào dư sang các Myrk khác. ‘Van Khóa’ giảm lần hồi Sức Bền kế tiếp.
- Marduk mở ‘Hiệp Đấu’ để thay Tấn Công Thường bằng The Guard Opens Once. Hệ số đòn cường hóa tăng theo Tấn Công đã ghi nhận và tương tác với ‘Chảy Máu’.
- Freyja dùng ‘Kết Nối’ để đổi HP của bản thân thành hồi phục tức thời cho một đồng minh, thu hồi một phần HP ở lượt kế tiếp và hồi sinh bằng Tuyệt Kĩ.
- Nyx tạo ‘Chảy Máu’ nhiều tầng theo số hiệu ứng Sát Thương Duy Trì, mở toàn bộ Điểm Yếu bằng ‘Hành Quyết’ và cho những lần chủ động kích hoạt Sát Thương Duy Trì bỏ qua Phòng Thủ.

## Nhóm Heimdall–Nezha

- Heimdall chọn một đồng minh nhận ‘Người Gác Bình Minh’, ưu tiên Fragarach khi tự chọn. Cô tăng sát thương Phản Kích, giảm sát thương người được bảo hộ phải chịu và gọi Phản Kích của Fragarach khi Myrk không đánh vào họ, nhưng không tạo hai lần Phản Kích từ cùng một hành động.
- Nephele tạo Khiên ‘Vân Mạc’ theo Tấn Công, áp dụng ‘Phong Thực’ khi người có Khiên bị chọn và phục hồi Khiên qua các lần Sát Thương Duy Trì. VM2 tạo hai lần kích hoạt riêng; VM6 tái áp dụng rồi kích hoạt các hiệu ứng đang có theo đúng giới hạn.
- Týr dùng ‘Chiến Ước’ để nhận một phần sát thương thay đồng minh, đánh trả bằng Phòng Thủ và lượng HP thực tế đã mất. VM6 có một lần giữ đồng minh được liên kết ở 1 HP.
- Nezha đánh dấu một Myrk bằng ‘Khóa Luân’ và Phản Kích trước khi Myrk gây sát thương. Nếu đòn này phá Sức Bền, toàn bộ hành động Myrk bị hủy; nếu không, A3 giảm sát thương của hành động đó.
- Giới hạn Năng Lượng đã chốt: Heimdall 140 theo nguồn live; Nephele 130, Týr 140 và Nezha 130 theo xác nhận người dùng.

## Khải Hoàn Thần Tính

Bản live ngày 26/09/2026 đã được đối chiếu và nối lại source guard cho Kael, Rowan, Nadia, Tomas, Veylen, Seraphine, Thanatos, Lugh, Hou Yi và Alecto. Sáu nâng cấp mới được thực thi như sau:

- Kael kế thừa 50% Tấn Công cao nhất trong đội; đội chỉ có Hỏa/Lôi giảm 24% Kháng Hỏa và Lôi của toàn bộ Myrk.
- Rowan giảm 50% Kháng Hiệu Ứng của toàn bộ Myrk.
- Mỗi Tấn Công Thường, Chiến Kĩ và Tuyệt Kĩ của Nadia kích hoạt Sát Thương Duy Trì do cô áp dụng một lần với hệ số 100%, không giảm thời hạn.
- Mỗi lần Tomas thực sự hồi HP cho đồng minh, mục tiêu tăng vĩnh viễn 1% HP tối đa trong trận, tối đa 25 tầng.
- Đòn Đánh Theo Sau của đồng đội trao một ‘Phản Hồi’ cho Veylen; đạt giới hạn ưu tiên hành động 75%. Đòn tấn công không phải Đòn Đánh Theo Sau của đồng đội gọi sát thương Lôi bằng 100% Tấn Công Veylen lên các mục tiêu đã trúng, tối đa ba lần giữa hai lượt Veylen.
- Trong đội chỉ có Băng/Lôi, hành động gây sát thương của đồng đội gọi Answering Blade tối đa sáu lần giữa hai lượt Seraphine. ‘Nhịp Điệu’ có tối đa 10 tầng, không bị đòn này tiêu hao; mỗi tầng giảm 3% Kháng Băng/Lôi của mục tiêu và tăng 5% Tốc Độ Seraphine, đều theo giới hạn trong nguồn.

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
- `character-roster.test.mjs`: 222 trường hợp, 74 Veyr ở VM0/2/6 với đội hỗn hợp.
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
