const {chromium}=require('/Users/ducbom/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'Mythborne-Damage-Lab.html'));await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).waitFor();
await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).selectOption({label:'Khi Mặt Trời Hạ Thấp Hơn Mọi Vương Miện'});
const first=page.locator('#team .member').first();assert.match(await first.innerText(),/ATK 1487.00/);assert.match(await first.innerText(),/STCM 74.00%/);
await first.getByLabel('Tinh luyện',{exact:true}).selectOption('5');assert.match(await first.innerText(),/STCM 90.00%/);
await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).selectOption({label:'Thiên Thương Tàn Ảnh'});assert.match(await first.innerText(),/Khác Aspect/);assert.match(await first.innerText(),/ATK 999.00/);
await page.getByLabel('Veyr 1',{exact:true}).selectOption({label:'Artemis'});
assert.equal(await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).inputValue(),'');assert.equal(await first.getByLabel('Tinh luyện',{exact:true}).inputValue(),'1');
await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).selectOption({label:'Thiên Thương Tàn Ảnh'});await first.getByLabel('Tinh luyện',{exact:true}).selectOption('5');assert.match(await first.innerText(),/Khớp Aspect/);
await first.getByText('Nguồn cộng chỉ số đầu trận',{exact:true}).click();assert.match(await first.innerText(),/Thiên Thương Tàn Ảnh · TL5/);
await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).selectOption('');assert.doesNotMatch(await first.innerText(),/Thiên Thương Tàn Ảnh · TL5/);
await first.getByText('6 món Thần Vật',{exact:true}).click();
for(let i=0;i<5;i++){const piece=first.locator('.piece-editor').nth(i);if(!(await piece.getAttribute('open')))await piece.locator('summary').first().click();await piece.getByLabel('Bộ Thần Vật',{exact:true}).selectOption({label:'THIÊN KÍNH GIỮA CHÍNH NGỌ'});}
assert.match(await first.innerText(),/5 món · Mốc 2\/4\/5/);assert.doesNotMatch(await first.innerText(),/Chưa hoàn chỉnh/);
await page.locator('.advanced-sequence>summary').click();const row=page.locator('.action-row').first();await row.locator('.kitAction').selectOption('manual');await row.locator('.source').selectOption('Buff');await row.locator('.action-advanced > summary').click();assert.equal(await row.locator('.ability').inputValue(),'Skill');await row.locator('.ability').selectOption('Ult');assert.equal(await row.locator('.cost').inputValue(),'0');
await page.locator('#simulate').click();assert.notEqual(await page.locator('#totalDamage').innerText(),'—');assert.deepEqual(errors,[]);
console.log('PASS standalone browser: memory base stats, TL change, Aspect gate, Veyr switch, unequip, provenance and simulation; zero page errors');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
