const {chromium}=require('/Users/ducbom/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MYTHBORNE_TEST_URL||'file://'+path.resolve(__dirname,'Mythborne-Damage-Lab.html'));await page.locator('#cycleRunner').waitFor();
 await page.locator('#enemyHPMode').selectOption('infinite');await page.locator('#enemyAttack').fill('0');await page.locator('#cycles').fill('5');
 await page.getByLabel('Xu hướng hành động 1',{exact:true}).selectOption('basic');await page.locator('#simulate').click();
 assert.match(await page.locator('#supportActionSummary [data-actor="0"]').innerText(),/Apollo: [1-9]\d* Tấn Công Thường · 0 Chiến Kĩ/);
 await page.getByLabel('Xu hướng hành động 2',{exact:true}).selectOption('skill-basic-basic');
 await page.locator('#teamSnapshotName').fill('Chuỗi tùy chọn');await page.locator('#saveReportTeam').click();await page.getByLabel('Xu hướng hành động 1',{exact:true}).selectOption('skill');
 await page.getByRole('button',{name:'Nạp đội Chuỗi tùy chọn',exact:true}).click();assert.equal(await page.getByLabel('Xu hướng hành động 1',{exact:true}).inputValue(),'basic');assert.equal(await page.getByLabel('Xu hướng hành động 2',{exact:true}).inputValue(),'skill-basic-basic');
 for(let i=2;i<=5;i++)await page.getByLabel('Xu hướng hành động '+i,{exact:true}).selectOption('basic');
 await page.locator('.turn-editor>summary').click();await page.locator('#prepareRotation').click();assert.equal(await page.getByLabel('Kỹ năng · Apollo · lượt 1',{exact:true}).inputValue(),'Basic');await page.getByLabel('Kỹ năng · Apollo · lượt 1',{exact:true}).selectOption('Skill');assert.match(await page.locator('#supportActionSummary [data-actor="0"]').innerText(),/· 1 Chiến Kĩ/);
 assert.notEqual(await page.locator('#totalDamage').innerText(),'—');assert.deepEqual(errors,[]);console.log('PASS Chrome pattern selection, actual BA counts, saved team restore and individual turn override');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
