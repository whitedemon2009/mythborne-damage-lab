const {chromium}=require('/Users/ducbom/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MYTHBORNE_TEST_URL||'file://'+path.resolve(__dirname,'Mythborne-Damage-Lab.html'));await page.locator('#cycleRunner').waitFor();
 assert.equal(await page.locator('#teamPreset').count(),0);assert.equal(await page.locator('.toolbar #cycles').count(),0);assert.equal(await page.locator('.toolbar #critMode').count(),0);
 await page.locator('#cycles').fill('3');await page.locator('#simulate').click();assert.equal(await page.locator('#cycleResults tbody tr').count(),3);assert.doesNotMatch(await page.locator('#cycleResults').innerText(),/NaN/);
 const total=await page.locator('#totalDamage').innerText();assert.equal(await page.locator('#cycleResults tbody tr').last().locator('td').last().innerText(),total);assert.notEqual(total,'0');
 const card=page.locator('.member').first();await card.locator('summary').filter({hasText:'6 món Thần Vật'}).click();let piece=card.locator('.piece-editor').first();await piece.locator('summary').first().click();
 await piece.getByLabel('Bộ Thần Vật',{exact:true}).selectOption({index:1});
 for(let i=0;i<5;i++){await piece.getByRole('button',{name:'Nảy dòng 1',exact:true}).click();await piece.getByRole('button',{name:'Max +3.2',exact:true}).click();}
 assert.match(await piece.locator('.roll-progress').innerText(),/5\/5/);assert.equal(await piece.locator('.roll-plus:disabled').count(),4);
 await piece.getByLabel('Số dòng ban đầu',{exact:true}).selectOption('3');assert.match(await piece.locator('.roll-progress').innerText(),/4\/4/);
 await piece.getByRole('button',{name:'Hoàn tác nảy cấp 6',exact:true}).click();assert.match(await piece.locator('.roll-progress').innerText(),/3\/4/);await piece.getByRole('button',{name:'Nảy dòng 2',exact:true}).click();await piece.getByRole('button',{name:'Min +5.5',exact:true}).click();assert.match(await piece.locator('.roll-progress').innerText(),/4\/4/);
 await card.locator('.gear-suggestions>summary').click();await card.locator('.gear-suggestions').getByRole('button',{name:'Trang bị Mảnh Ký Ức',exact:true}).first().click();assert.notEqual(await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).inputValue(),'');
 await page.locator('.battle-settings>summary').click();await page.locator('#critMode').selectOption('sampled');await page.locator('#simulate').click();
 await page.locator('.turn-editor>summary').click();await page.locator('#prepareRotation').click();assert.ok(await page.locator('#rotationTurns tbody tr').count()>0);
 await page.locator('#teamSnapshotName').fill('Cycle test');await page.locator('#saveReportTeam').click();await page.locator('#compareReportTeams').click();assert.equal(await page.locator('#teamReportResults tbody tr').count(),1);assert.doesNotMatch(await page.locator('#teamReportResults').innerText(),/Không so sánh/);
 await page.locator('#cycleRunner').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/mythborne-step7-desktop.png',fullPage:false});await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:'/private/tmp/mythborne-step7-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS cycle totals, removed presets, roll caps/undo, recommendations, turn targets, team comparison and mobile layout');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
