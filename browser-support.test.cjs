const {chromium}=require('/Users/ducbom/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MYTHBORNE_TEST_URL||'file://'+path.resolve(__dirname,'Mythborne-Damage-Lab.html'));await page.locator('#cycleRunner').waitFor();
 for(const [i,name] of ['Hermes','Amphitrite','Poseidon','Hephaestus','Hera'].entries())await page.getByLabel('Veyr '+(i+1),{exact:true}).selectOption(name);
 await page.locator('#enemyHPMode').selectOption('infinite');await page.locator('#enemyCount').fill('3');await page.locator('#cycles').fill('4');
 for(let i=1;i<=5;i++)await page.getByLabel('Vận Mệnh '+i,{exact:true}).selectOption('6');await page.locator('#simulate').click();
 assert.equal(await page.locator('#critMode').inputValue(),'sampled');assert.match(await page.locator('#criticalModeNotice').innerText(),/Hermes/);assert.notEqual(await page.locator('#totalDamage').innerText(),'—');assert.equal(await page.locator('#cycleResults tbody tr').count(),4);
 const summary=page.locator('#supportActionSummary');assert.match(await summary.locator('[data-actor="0"]').innerText(),/Hermes: [1-9]\d* Tấn Công Thường.*Hỗ trợ: Poseidon/);assert.match(await summary.locator('[data-actor="1"]').innerText(),/Hỗ trợ: Poseidon/);
 const total=await page.locator('#totalDamage').innerText();await page.locator('#simulate').click();assert.equal(await page.locator('#totalDamage').innerText(),total);
 await page.getByLabel('Chủ lực nhận buff 1',{exact:true}).selectOption('1');assert.match(await summary.locator('[data-actor="0"]').innerText(),/Hỗ trợ: Amphitrite/);
 await page.locator('.turn-editor>summary').click();await page.locator('#prepareRotation').click();await page.getByLabel('Đồng minh · Hermes · lượt 1',{exact:true}).selectOption('2');assert.notEqual(await page.locator('#totalDamage').innerText(),'—');assert.match(await summary.locator('[data-actor="0"]').innerText(),/Poseidon/);
 await page.locator('#cycleRunner').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/mythborne-support-vm6.png'});assert.deepEqual(errors,[]);
 console.log('PASS Chrome Poseidon team all VM6, automatic crit mode, carry in slot 3, support BA, card/per-turn overrides, deterministic cycle damage');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
