import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./public/index.html', import.meta.url), 'utf8');

const requiredContent = [
  '<title>Mythborne Damage Lab</title>',
  'HP vô cực — không mất HP, không chết',
  'Tự động — ưu tiên Aspect và sát thương',
  "const elements=['Nham','Hỏa','Phong','Băng','Lôi','Thủy','Ám','Quang','Vật Lý'];",
  '"name":"Nyx"',
  'Lề Sách Không Còn Chỗ Cho Tên Người',
  'Cơ chế nhân vật',
];

for (const marker of requiredContent) {
  assert.ok(html.includes(marker), `Bản public thiếu nội dung bắt buộc: ${marker}`);
}

assert.ok(html.length > 1_000_000, 'Bản public nhỏ bất thường; có thể chưa đóng gói dữ liệu');
console.log('PASS: bản public chứa roster và cơ chế hiện hành');
