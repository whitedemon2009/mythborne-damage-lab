import {recommendationReview} from './recommendation-review.mjs';

// Reviewed against all four live Doc tabs. Indices refer to the pinned review,
// never to the order of a newly loaded catalog. No keyword or Aspect scoring.
const reviewedProfiles = [
 ['Chiến Kĩ tiêu Trọng Áp; Tuyệt Kĩ chuẩn bị cho Chiến Kĩ.',null,[36,54],[1,0]],
 ['Dồn Chiến Kĩ vào mục tiêu đã đánh dấu.',null,[54,36],[1,0]],
 ['Tấn Công Thường chuẩn bị tầng cho Chiến Kĩ.',null,[36,54],[1,0]],
 ['Đánh lan 2–3 mục tiêu và tự phá Sức Bền.',null,[55,38],[6,0]],
 ['Chiến Kĩ Cường Hóa đánh lan; không phải FUA.',null,[55,38],[0]],
 ['Sát thương toàn sân; Tuyệt Kĩ chỉ tiêu 110–120 Năng Lượng.',null,[40,56],[0]],
 ['FUA toàn sân được gọi khi đồng minh đánh nhiều mục tiêu.',null,[56,25],[11,0]],
 ['Giảm Phòng Thủ và hỗ trợ bào Sức Bền; không có DoT riêng.',null,[42,57],[19]],
 ['DoT riêng và kích hoạt lại DoT bằng Tuyệt Kĩ.',null,[50,42],[8,2]],
 ['Chiến Kĩ chọn một đồng minh, tăng Tốc Độ và hỗ trợ lượt.',null,[44,58],[5,20]],
 ['Chiến Kĩ tăng Tấn Công cho một đồng minh.',null,[44,58],[5,20]],
 ['Khiên theo Phòng Thủ; duy trì khiên khi đồng minh chịu đòn.',null,[46,59],[3]],
 ['Khiên theo HP/Phòng Thủ; buff có giới hạn theo Phòng Thủ Seren.',null,[46,59],[3]],
 ['Hồi máu theo HP, có cứu nguy khi HP thấp.',null,[60,48],[4]],
 ['Hồi máu theo thời gian và kích hoạt lại hồi máu.',null,[60,49],[18,4]],
 ['Chiến Kĩ tiêu tài nguyên và đánh nảy cùng một mục tiêu.',64,[36,54],[1,0]],
 ['FUA lên mục tiêu đánh dấu sau đòn đồng minh.',65,[55,38],[11,0]],
 ['Tuyệt Kĩ gây sát thương chính; chi phí 130 Năng Lượng.',66,[40,56],[0]],
 ['Tăng sát thương mục tiêu phải nhận; không có DoT riêng.',67,[42,57],[19]],
 ['Chiến Kĩ một đồng minh và sạc Năng Lượng; VM1 thêm ưu tiên hành động.',68,[44,58],[5,20]],
 ['Tạo và phục hồi khiên theo Phòng Thủ.',69,[46,59],[3]],
 ['Hồi máu, giải hiệu ứng và hồi máu theo thời gian.',70,[60,48],[18,4]],
 ['Luân phiên BA/Chiến Kĩ/Tuyệt Kĩ; sát thương dư có thể chuyển mục tiêu.',71,[54,36],[0]],
 ['Chiến Kĩ/Tuyệt Kĩ AoE và đòn nảy; Công Lý Dội Âm là sát thương phụ, không phải FUA.',72,[56,40],[0]],
 ['Chiến Kĩ chọn một đồng minh và ưu tiên hành động.',73,[44,58],[5,20]],
 ['Hồi máu/buff theo HP; VM1 thay đổi mạnh giá trị sát thương FUA.',74,[60,48],[4]],
 ['Tấn Công Thường Cường Hóa gây sát thương; Chiến Kĩ và Tuyệt Kĩ không gây sát thương.',75,[54,0],[15,1]],
 ['DoT cộng dồn và sát thương quá tải riêng.',null,[50,42],[8,2]],
 ['DoT, kích hoạt DoT ngoài lượt địch và FUA.',76,[50,42],[8,2]],
 ['Chiến Kĩ nhiều cấp; cấp III tiêu HP, có FUA riêng.',77,[55,38],[0]],
 ['Chiến Kĩ Cường Hóa trong Cực Triều; FUA ở Nước Rút.',78,[55,38],[12,0]],
 ['Trì hoãn, khống chế, giảm Tốc Độ và kháng.',79,[42,57],[10,19]],
 ['Khiên Phòng Thủ, giảm kháng Thủy và khống chế.',80,[46,59],[3,10]],
 ['Chiến Kĩ đánh địch và buff đội; không phải Chiến Kĩ chọn một đồng minh.',81,[45,14],[5,7]],
 ['Ghi nhận DoT thành Chết Chóc rồi gây lại sát thương Ám qua Phòng Thủ/Kháng.',82,[50,42],[17,8]],
 ['DoT và Chiến Kĩ Cường Hóa kích hoạt DoT riêng.',83,[50,42],[8,2]],
 ['Bào Sức Bền và Diệt Kích.',null,[52,51],[13,6]],
 ['Tấn Công Thường Cường Hóa gây Diệt Kích; ưu tiên Diệt Phá thay vì Chí Mạng BA.',84,[52,51],[13,6]],
 ['Buff Diệt Phá cả đội; cần đủ Diệt Phá bản thân cho Đột Phá.',85,[45,14],[5]],
 ['Hồi máu theo HP và hồi máu khi phá Sức Bền.',null,[60,48],[4,18]],
 ['Tuyệt Kĩ hai mức tiêu hao; VM4 giảm mức II từ 200 xuống 150.',86,[40,56],[16,0]],
 ['Chiến Kĩ đơn mục tiêu, nhận thêm lượt và FUA.',87,[36,54],[1,0]],
 ['Hỗ trợ phá Sức Bền và tự gây Diệt Kích trong Mặt Sau — Hỏa Dương.',88,[43,28],[13]],
 ['Hồi máu theo HP, hỗ trợ Diệt Kích do đồng minh gây ra.',89,[60,48],[4,18]],
 ['Diệt Kích và chuỗi Chiến Kĩ; Tuyệt Kĩ Cường Hóa miễn phí.',90,[52,51],[13,6]],
 ['Chiến Kĩ đánh địch; Tuyệt Kĩ mới chọn một đồng minh để buff Skill/FUA.',91,[45,14],[5]],
 ['Tuyệt Kĩ gây Diệt Kích theo Lôi Áp; tiêu 150 Năng Lượng.',92,[52,51],[13,6]],
 ['Khiên theo Tấn Công và FUA AoE; không ưu tiên Phòng Thủ như Aegis thông thường.',93,[46,30],[0,11]],
 ['Chiến Kĩ/Tuyệt Kĩ đánh lan; Shatterring là sát thương phụ, không phải FUA.',null,[55,38],[0]],
 ['FUA AoE chủ lực; đồng minh được chọn sạc Thiên Phú, Tuyệt Kĩ cường hóa FUA.',94,[56,25],[11,0]],
 ['Khiên theo Phòng Thủ; ghi nhận để phục hồi khiên, không gây sát thương lưu trữ.',null,[46,59],[3,20]],
 ['Debuff và tương tác nhiều loại đòn; Thạch Sư là sát thương phụ, không phải FUA.',95,[42,57],[19]],
 ['Tuyệt Kĩ tiêu 400 Năng Lượng; được đồng minh Mjolnir sạc.',96,[40,56],[16,0]],
 ['Chiến Kĩ chọn một đồng minh; buff tập trung một mục tiêu địch.',97,[44,58],[5,20]],
 ['FUA khi địch hồi Sức Bền; Tuyệt Kĩ cường hóa FUA kế tiếp.',null,[55,38],[21,0]],
 ['Phản Kích khi Myrk chọn bản thân; VM1 mới có nhánh FUA riêng.',98,[62,63],[14]],
 ['Chiến Kĩ chọn một đồng minh; buff khi người nhận chịu đòn và hành động tiếp.',99,[44,58],[20,5]],
 ['Phản Kích khi Myrk chọn ít nhất hai đồng minh; không bắt buộc chọn Bellona.',null,[62,34],[14]],
 ['Hồi máu tức thời/dự trữ theo HP và buff; Tuyệt Kĩ không gây sát thương.',100,[60,49],[18,4]],
 ['Sát thương trực tiếp ghi Vạch Nhật rồi kích nổ; lượng lưu trữ không phải FUA.',101,[54,36],[17,1]],
 ['Phán quyết sau hành động địch, giảm Phòng Thủ và tăng sát thương nhận.',null,[57,42],[19]],
 ['Chọn Fragarach để tăng Phản Kích và bảo vệ mục tiêu được canh gác.',102,[68,58],[20,5]],
 ['Khiên theo Tấn Công và Sát Thương Duy Trì Phong.',103,[93,46],[8,3]],
 ['Phản Kích theo Phòng Thủ, liên kết đồng minh và chia sát thương.',104,[98,62],[14,3]],
 ['Phản Kích trước hành động Myrk, cần Chí Mạng và bào Sức Bền.',105,[98,62],[14,13]],
 ['Đòn Đánh Theo Sau đơn mục tiêu sao chép nhịp tấn công của đồng minh.',106,[76,42],[11,19]],
 ['Chiến Kĩ đổi mục tiêu trong giao tranh 2–3 Myrk.',107,[55,38],[0,1]],
 ['Chiến Kĩ Cường Hóa đơn mục tiêu Hàn Băng, cần đồng minh liên tục buff.',108,[54,36],[1,16]],
 ['Chiến Kĩ chọn một đồng minh, buff riêng đội Băng–Lôi.',109,[68,58],[5,20]],
 ['Khiên theo HP và Siêu Dẫn cho đội thuần Băng–Lôi.',110,[46,59],[3,5]],
 ['Hỗ trợ bào Sức Bền và Diệt Kích; nhân vật 4★ không có trấn.',null,[52,51],[6,13]],
 ['Tấn Công Thường Cường Hóa theo Tấn Công.',111,[55,38],[15,1]],
 ['HP chuyển thành hồi máu cho mục tiêu Kết Nối và hồi sinh.',112,[60,48],[18,4]],
 ['Debuff, nhiều tầng Chảy Máu và kích hoạt Sát Thương Duy Trì.',113,[50,42],[8,2,19]],
];

const memoryReasons={
 0:'Tăng Tấn Công thường trực để tăng sát thương BA; không cần Chiến Kĩ gây sát thương.',
 14:'Tốc Độ bản thân giúp hành động và sạc Tuyệt Kĩ thường xuyên hơn. Lựa chọn 3★ đơn giản, không có buff sát thương đội từ nội tại.',
 25:'Tăng sát thương đòn toàn sân, phù hợp FUA AoE. Không có chỉ số và nội tại mạnh như trấn 5★.',
 28:'Áp debuff để giảm Phòng Thủ ngắn hạn; cần Chính Xác Hiệu Ứng và đòn thực sự áp debuff. Với Janus chủ yếu kích hoạt qua Tuyệt Kĩ.',
 30:'Tăng lượng khiên, áp dụng cả khi khiên theo Tấn Công. Không bổ sung sát thương FUA.',
 34:'Tăng trực tiếp Phản Kích, không cần bản thân được chọn làm mục tiêu. Chỉ số nền 3★ thấp.',
 36:'Tăng sát thương Chiến Kĩ, thêm buff Chiến Kĩ trong 2 lượt sau Tuyệt Kĩ. Không buff BA, FUA hay lượng lưu trữ trực tiếp.',
 38:'Tăng sát thương khi đòn đánh trúng ít nhất 2 mục tiêu; mốc cao hơn cần 3. Không phù hợp trận chỉ có một Myrk.',
 40:'Tăng sát thương Tuyệt Kĩ; phần hồi Năng Lượng chỉ kích hoạt khi trúng ít nhất 4 mục tiêu. Ít địch vẫn nhận buff Tuyệt Kĩ.',
 42:'Chính Xác Hiệu Ứng và tăng sát thương địch nhận sau khi áp thành công debuff; hiệu lực ngắn, cần duy trì debuff.',
 43:'Hồi Năng Lượng khi đánh địch có ít nhất 3 debuff. Janus cần đồng đội bổ sung debuff; Phòng Thủ không tăng Diệt Kích.',
 44:'Chiến Kĩ chọn một đồng minh để tăng sát thương người nhận và Tốc Độ bản thân. Không dùng cho Chiến Kĩ chỉ đánh địch/buff toàn đội.',
 45:'Sau Tuyệt Kĩ, buff nguyên tố cho đồng minh cùng nguyên tố người đeo. Chỉ chọn khi đội có DPS cùng hệ; không phải buff đa dụng.',
 46:'Tăng lượng khiên, thêm giảm sát thương sau Tuyệt Kĩ cho đồng minh đang có khiên. Không cần khiên phải dùng hệ số Phòng Thủ.',
 48:'Tăng trị liệu; hồi Năng Lượng cần chữa mục tiêu dưới 50% HP. Đội luôn đầy máu sẽ không kích hoạt phần năng lượng.',
 49:'Hồi máu để tăng Tấn Công người nhận. Ưu tiên đội có DPS dùng Tấn Công; ít giá trị cho Diệt Kích hoặc DPS theo HP/Phòng Thủ.',
 50:'Tăng DoT riêng và hồi Năng Lượng từ DoT. Không tăng riêng đòn trực tiếp hay sát thương quá tải không được tính là DoT.',
 51:'Diệt Phá và hiệu suất bào Sức Bền khi địch chưa vỡ; thiên về mở cửa sổ Diệt Kích.',
 52:'Diệt Phá và buff Diệt Kích khi tự phá hoặc đánh địch đã vỡ; phù hợp nguồn sát thương Diệt Kích.',
 54:'Chí Mạng và buff sau hai hành động đánh cùng một địch. Cần tập trung mục tiêu, đổi địch liên tục làm giảm hiệu quả.',
 55:'ST Chí Mạng và buff đòn trúng đúng 2–3 địch; hồi năng lượng cần đúng 3. Không nhận phần buff mục tiêu khi chỉ đánh một địch.',
 56:'Tấn Công và tăng sát thương theo số mục tiêu khác nhau trong đòn. Giá trị cao hơn khi đánh đông, không giả định luôn đủ 5 địch.',
 57:'Chính Xác Hiệu Ứng; địch có debuff của người đeo phải hành động rồi mới nhận hiệu ứng tăng sát thương. Không có ngay đầu trận.',
 58:'Hồi Năng Lượng và ST Chí Mạng cho một đồng minh được Chiến Kĩ chọn. Phần ST Chí Mạng không hỗ trợ DoT/Diệt Kích thuần.',
 59:'Phòng Thủ và phục hồi khiên khi vỡ; hợp khiên dùng Phòng Thủ. Cần khiên thực sự bị phá để kích hoạt phục hồi.',
 60:'HP tăng lượng hồi máu; chữa mục tiêu đạt ít nhất 80% HP để buff sát thương. Có thể khó duy trì khi Myrk gây sát thương quá lớn.',
 62:'Tăng Phản Kích và hồi HP sau Phản Kích; không yêu cầu người đeo phải bị chọn. Phòng Thủ là chỉ số bảo kê, không tăng hệ số ATK.',
 63:'HP và ST Chí Mạng cho Phản Kích kế tiếp khi bản thân bị chọn. Không kích hoạt chỉ nhờ đồng đội bị đánh.',
 68:'Hồi Năng Lượng và buff một đồng minh qua Chiến Kĩ; dùng được cho Keraunos cần xoay Tuyệt Kĩ thường xuyên.',
 76:'Tăng Sát Thương Duy Trì và Chính Xác Hiệu Ứng; phần Planck yêu cầu tích đủ lần sát thương rồi dùng đòn trực tiếp.',
 93:'Tăng khiên theo Tấn Công và sát thương đồng minh đang có khiên; phần năng lượng cần ba mục tiêu.',
 98:'Tăng Chí Mạng và Phản Kích; nhánh giảm sát thương chỉ mở khi chính người đeo bị Myrk chọn.',
 102:'Chiến Kĩ đánh dấu một đồng minh Fragarach; Phản Kích của họ được tăng sát thương, xuyên Phòng Thủ và sạc Năng Lượng cho người đeo.',
 103:'Tạo Khiên tăng Sát Thương Duy Trì và các lần sát thương đó phục hồi Khiên thấp nhất do người đeo tạo.',
 104:'Tăng Phòng Thủ, giảm sát thương khi chuỗi liên kết bị nhắm và cường hóa Phản Kích kế tiếp.',
 105:'Tăng Chí Mạng và Phản Kích; nhánh trước đòn địch đổi giữa bào Sức Bền và xuyên Phòng Thủ.',
 106:'Tăng Chính Xác Hiệu Ứng; Đòn Đánh Theo Sau ngay sau đòn đơn mục tiêu của đồng minh được tăng sát thương.',
 107:'Ghi nhận mục tiêu Chiến Kĩ; đổi sang mục tiêu khác sẽ tăng sát thương và hồi Năng Lượng.',
 108:'Mỗi buff đồng minh áp dụng cho người đeo tích một tầng tăng Chiến Kĩ và Tuyệt Kĩ, tối đa bốn tầng.',
 109:'Sau Tấn Công Thường, kéo dài buff đơn mục tiêu gần nhất từ Chiến Kĩ.',
 110:'HP và Khiên cao; mỗi Myrk bị giảm Tốc Độ sạc Năng Lượng trong giới hạn giữa hai lượt.',
 111:'Chiến Kĩ hoặc Tuyệt Kĩ mở buff ba lượt cho Tấn Công Thường Cường Hóa.',
 112:'Tăng lượng hồi từ cơ chế tự giảm HP, hoàn HP cho người đeo và hoàn Năng Lượng sau khi Tuyệt Kĩ hồi sinh.',
 113:'Mỗi debuff thành công áp dụng tăng Sát Thương Duy Trì mục tiêu phải nhận trong hai lượt.',
};
// Borrowed 5★ options are explicit, with the portion of their passive that
// transfers to this kit. They are not labelled as this character's signature.
const borrowedMemories={
 0:[64,'Tăng ST Chí Mạng và Chiến Kĩ; Aren tiêu Trọng Áp bằng Chiến Kĩ nên có thể dùng nhánh xuyên Phòng Thủ khi tiêu tài nguyên.'],
 16:[78,'Tăng Chiến Kĩ/FUA và ST Chí Mạng. Cần xen kẽ Chiến Kĩ với FUA để có hai dấu; không phải chỉ tung FUA là đủ mọi nội tại.'],
 17:[86,'Tăng Tuyệt Kĩ và Hồi Năng Lượng. Cap 130 chỉ cho 12% sát thương từ nhánh giới hạn NL; tiêu 130 chỉ nhận mốc hoàn năng lượng thấp.'],
 21:[74,'HP, trị liệu và buff sát thương sau hồi máu; giải hiệu ứng có thêm lợi ích. Đây là lựa chọn hỗ trợ, không tận dụng mạnh buff sát thương bản thân.'],
 24:[68,'Hồi Năng Lượng và buff sát thương qua Chiến Kĩ một đồng minh. Người nhận phải dùng Tuyệt Kĩ để kích hoạt phần hoàn năng lượng.'],
 28:[82,'Tăng DoT và Chính Xác Hiệu Ứng; Anubis kích hoạt DoT ngoài lượt Myrk nên dùng được nhánh khuếch đại đó.'],
 29:[78,'Cùng tăng Chiến Kĩ/FUA và ST Chí Mạng; cần cả Chiến Kĩ lẫn FUA để có đủ hai dấu.'],
 30:[77,'Tăng Chiến Kĩ và ST Chí Mạng; xuyên Phòng Thủ theo Planck thực tiêu. Không có phần tăng FUA riêng; mất HP mới kích hoạt Hồi Năng Lượng.'],
 34:[76,'Tăng DoT và Chính Xác Hiệu Ứng, hợp Chết Chóc. Nhánh Planck cần tích đủ lần DoT rồi có đòn trực tiếp; không thay được nhánh DoT ngoài lượt của trấn Hades.'],
 35:[82,'Tăng DoT và Chính Xác Hiệu Ứng; Prometheus có kích hoạt DoT riêng ngoài lượt địch. Không thay nhánh cường hóa Chiến Kĩ của trấn riêng.'],
 40:[96,'Tăng Tuyệt Kĩ khi tiêu ít nhất 150 NL và nhận năng lượng từ đồng đội. Mức II dùng được cả ở VM4; mức I 100 không kích hoạt buff theo chi phí.'],
 41:[64,'ST Chí Mạng và buff Chiến Kĩ theo tầng, phù hợp chuỗi Chiến Kĩ. Không nhận lợi ích ưu tiên hành động riêng như trấn Thanatos.'],
 43:[74,'HP, trị liệu và buff sát thương sau hồi máu. Ưu tiên hỗ trợ chung; không có buff Diệt Kích đội riêng như trấn Hestia.'],
 45:[81,'Hồi Năng Lượng; Chiến Kĩ/Tuyệt Kĩ buff Chí Mạng đội và tương tác Planck. Hợp DPS Skill/FUA có Chí Mạng, không yêu cầu Chiến Kĩ chọn đồng minh.'],
 52:[86,'Cap 400 đạt trần 40% sát thương của nội tại, thêm Tuyệt Kĩ và Hồi Năng Lượng. Đổi lại không có sạc theo từng đồng minh và xuyên kháng như trấn Apollo.'],
 53:[68,'Hồi Năng Lượng và buff qua Chiến Kĩ một đồng minh; phần hoàn năng lượng cần người nhận dùng Tuyệt Kĩ. Không có buff đơn mục tiêu riêng của trấn Máni.'],
 54:[78,'Tăng cả Chiến Kĩ và FUA. Cần chờ địch hồi Sức Bền để Eos gọi FUA và có đủ hai dấu; không giả định kích hoạt ngay đầu trận.'],
 56:[68,'Hồi Năng Lượng và buff qua Chiến Kĩ một đồng minh. Không có nhánh bảo kê/buff sau chịu đòn của trấn Nemty.'],
 58:[74,'Tăng HP, trị liệu và sát thương đồng minh sau chữa. Không có thêm nhánh hồi máu dự trữ như trấn riêng.'],
};
const setReasons={
 0:'Luân phiên nguồn sát thương để tích buff; chỉ lặp một loại đòn sẽ khó duy trì đủ mốc. Phù hợp lối chơi phối hợp BA/Skill/Ult.',
 1:'Tập trung các đòn chỉ trúng một địch, cần Chí Mạng cho mốc 5. Đòn đánh lan hoặc chuyển sát thương sang địch khác không được mặc định hưởng như đòn đơn.',
 2:'Áp debuff để hỗ trợ sát thương DoT của đội. Giá trị cao trong đội DoT; không phải bộ tăng mọi loại sát thương đồng đội.',
 3:'Tăng Phòng Thủ, lượng khiên và phục hồi khiên khi đồng minh có khiên của người đeo bị đánh.',
 4:'Tăng HP, tạo hồi máu theo thời gian sau trị liệu và tích lượt hồi để mở nội tại hỗ trợ đội.',
 5:'Cần Tốc Độ trong trận cao hơn Tốc Độ cơ bản. Tăng hiệu quả buff ATK/ST Chí Mạng/sát thương; không khuếch đại mọi loại buff như Diệt Phá hoặc Năng Lượng.',
 6:'Ưu tiên khi chính người đeo phá Sức Bền. Không nhận đầy đủ nội tại nếu đồng đội luôn phá trước; phần 15% chỉ tăng DoT phá vỡ, không kéo dài khống chế.',
 7:'Sau Tuyệt Kĩ, tăng hiệu quả BA/Chiến Kĩ kế tiếp và hoàn năng lượng khi kích hoạt. Cần bố trí thứ tự hành động phù hợp.',
 8:'Tăng DoT của người đeo qua các lần DoT gây sát thương; không dùng chỉ vì kit có debuff hoặc nhắc DoT đồng đội.',
 11:'Chỉ tích tầng từ FUA, tối đa 3; mốc hồi năng lượng cần FUA trúng ít nhất 2 địch. Không thay FUA bằng Phản Kích hoặc sát thương phụ.',
 12:'Hợp Chiến Kĩ Cường Hóa và FUA Thủy. Hai dấu phải cùng tồn tại mới đủ hiệu quả; Cực Triều kéo dài làm giảm thời gian chồng dấu.',
 13:'Diệt Phá, bào Sức Bền và Diệt Kích vào địch đã vỡ. Giá trị mốc phá vỡ còn phụ thuộc ai tung hit phá.',
 14:'Phải được Myrk chọn làm mục tiêu rồi Phản Kích mới nhận đủ hiệu quả. Đồng minh bị đánh thay không kích hoạt điều kiện này.',
 15:'Sau Chiến Kĩ tăng BA, ST Chí Mạng và xuyên Phòng Thủ của BA; đúng nguồn BA Cường Hóa của Artemis.',
 16:'Hồi Năng Lượng và sát thương Tuyệt Kĩ; mốc 5 yêu cầu thực tế tiêu ít nhất 160 Năng Lượng, không xét riêng giới hạn Năng Lượng.',
 17:'Tăng sát thương tính từ lượng đã ghi nhận. Mốc xuyên Phòng Thủ phù hợp Chết Chóc của Hades; Vạch Nhật Hou Yi gây lượng cố định nên không hưởng phần xuyên Phòng Thủ đó, vẫn nhận phần hoàn năng lượng.',
 18:'HP và hồi máu có độ trễ/dự trữ; sau khi thực hồi sẽ bảo kê và buff đòn kế tiếp. Không chỉ cần một lần hồi máu tức thời.',
 19:'Debuff phải tồn tại khi Myrk kết thúc hành động để mở tăng sát thương nhận; kết quả phụ thuộc hành động và số mục tiêu Myrk chọn.',
 20:'Chiến Kĩ phải chọn đúng một đồng minh và người đó được Myrk chọn. Không kích hoạt bằng Tuyệt Kĩ chọn đồng minh hoặc Chiến Kĩ toàn đội.',
 21:'Người đeo phải đánh địch trong lúc đã vỡ, rồi chờ địch hồi Sức Bền. Buff FUA/Tuyệt Kĩ sau hồi; không có hiệu quả đầy đủ ở lần phá đầu.',
 10:'Tự áp giảm Tốc Độ, trì hoãn hoặc khống chế để tích nội tại. Chỉ debuff Phòng Thủ/sát thương nhận là chưa đủ.',
};

export function reviewedGearSuggestions(character,catalog,state={}) {
 const pin=recommendationReview.characters.findIndex(x=>x.id===character?.id);
 const sourceMatches=(kind,index)=>{const ref=recommendationReview[kind][index];return ref&&catalog[kind].find(x=>x.id===ref.id&&x.contentHash===ref.hash);};
 if(pin<0||!sourceMatches('characters',pin))return {identity:'Hồ sơ đã thay đổi hoặc chưa được đối chiếu; tạm ẩn đề cử để tránh dùng dữ liệu cũ.',memories:[],sets:[]};
 const [identity,signature,alternatives,setIds]=reviewedProfiles[pin];
 const borrowed=borrowedMemories[pin];
 const memories=[...(signature===null?[]:[signature]),...(borrowed?[borrowed[0]]:[]),...alternatives].flatMap(index=>{
  const item=sourceMatches('memories',index);if(!item||item.aspect!==character.aspect)return [];
  return [{item,label:index===signature?'Trấn':borrowed?.[0]===index?'5★ thay thế — trấn của Veyr khác':`${item.rarity}★ dự phòng`,reason:index===signature?`Nội tại riêng cho ${character.name}. ${identity}`:borrowed?.[0]===index?borrowed[1]:memoryReasons[index]}];
 });
 const plan=(parts,reason)=>{const pieces=parts.map(([index,count])=>({item:sourceMatches('artifacts',index),count}));return pieces.every(x=>x.item)?{pieces,reason}:null;};
 let sets=setIds.map(index=>plan([[index,6]],setReasons[index]));
 const split=(parts,reason)=>plan(parts,reason);
 if(pin===5||pin===17)sets.unshift(split([[16,4],[0,2]],'4 Thiên Kính tăng sát thương Tuyệt Kĩ + 2 Võ Đài tăng ATK. Tuyệt Kĩ dưới 160 Năng Lượng nên chủ động không dùng mốc 5 Thiên Kính.'));
 if(pin===38)sets.unshift(split([[6,2],[13,2],[5,2]],'40% Diệt Phá từ hai mốc 2 và Tốc Độ. Giúp đủ mốc Đột Phá của Nike; nếu chỉ số phụ đã đủ, cân nhắc bộ hỗ trợ Tốc Độ bên dưới.'));
 if(pin===40&&Number(state.kitFate)>=4)sets=[split([[16,4],[0,2]],'VM4: Tuyệt Kĩ mức II chỉ tiêu 150, không kích hoạt mốc 5 Thiên Kính. Dùng mốc 4 tăng Tuyệt Kĩ và 2 Võ Đài tăng ATK.'),...sets.slice(1)];
 if(pin===40&&Number(state.kitFate||0)<4&&sets[0])sets[0].reason+=' Astraeus phải dùng mức II (200); mức I (100) không đạt điều kiện.';
 if(pin===25){sets.unshift(split([[4,2],[18,2],[7,2]],'24% HP và 5% Hồi Năng Lượng, hỗ trợ đồng thời hồi máu, buff theo HP và FUA.'));
  if(Number(state.kitFate)>=1)sets.push(plan([[11,6]],'VM1: hướng phụ sát thương FUA. Mốc 4/5 hỗ trợ FUA, nhưng ATK mốc 2 không tăng FUA theo HP; đổi lấy ít HP/trị liệu hơn.'));}
 if(pin===29)sets.push(plan([[9,6]],'Chỉ cân nhắc khi thường dùng Chiến Kĩ cấp III tiêu HP. Mốc 5 cần 3 lần mất HP do kỹ năng trong thời hạn tầng; không mặc định đạt được bằng địch đánh.'));
 if(pin===47||pin===57)sets.unshift(split([[0,2],[8,2],[11,2]],pin===47?'36% ATK thường trực cho cả khiên và sát thương Durga, không yêu cầu kích hoạt FUA.':'36% ATK thường trực cho Phản Kích Bellona kể cả khi Myrk chỉ chọn các đồng đội khác.'));
 if(pin===57)sets[1].reason+=' Với Bellona đây là lựa chọn có điều kiện, không phải bộ mặc định chỉ vì cùng Aspect Lugh.';
 return {identity,memories,sets:sets.filter(Boolean),reviewedAt:recommendationReview.reviewedAt};
}
