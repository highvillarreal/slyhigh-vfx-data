const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
fs.mkdirSync('test-output',{recursive:true});
(async()=>{
 const engine=process.env.TEST_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:process.env.BROWSER_CHANNEL||'msedge'}:{})});
 const context=await browser.newContext({viewport:{width:402,height:874},isMobile:true,hasTouch:true,locale:'es-MX'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4173');await page.waitForFunction(()=>typeof db!=='undefined'&&db);
 // Global settings are reachable before creating a project, but never in the header.
 assert.equal(await page.locator('header select').count(),0);
 await page.getByRole('button',{name:'Ajustes de la app',exact:true}).click();
 await page.locator('#languageSelect').selectOption('en');
 await page.getByRole('heading',{name:'App settings',exact:true}).waitFor();
 assert.equal(await page.locator('#languageSelect').inputValue(),'en');
 await page.reload();await page.getByRole('button',{name:'App settings',exact:true}).click();
 assert.equal(await page.locator('#languageSelect').inputValue(),'en');
 await page.locator('#languageSelect').selectOption('system');
 await page.getByRole('heading',{name:'Ajustes de la app',exact:true}).waitFor();
 await page.reload();await page.getByRole('button',{name:'Ajustes de la app',exact:true}).click();
 assert.equal(await page.locator('#languageSelect').inputValue(),'system');
 assert.ok(await page.locator('#languageSelect').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16));
 await page.evaluate(async()=>{
  state.projects=[{id:'layout-qa',name:'IPSY · Prueba de rodaje',code:'IPSY',cameras:[{id:'camera-qa',code:'CAM A',make:'Sony',model:'FX30'}],lenses:[{id:'lens-qa',code:'LENS A',make:'Sony',model:'FE 24–70mm F2.8 GM II'}],days:[]}];state.activeProjectId='layout-qa';state.activeShotId=null;
  await createShot();const original=raw(),setup=shot()._u;
  for(let i=2;i<=30;i++)setup.shots.push({...structuredClone(original),id:'shot-'+i,code:'SH'+String(i).padStart(3,'0')});
  await save();go('shoot');
 });
 // A standalone browser can report a visual viewport shorter than the layout
 // viewport even without a keyboard. That difference must not shorten the app.
 await page.evaluate(()=>{
  window.actualViewport=window.visualViewport;window.mockViewportHeight=innerHeight-62;window.mockScale=1;
  Object.defineProperty(window,'visualViewport',{configurable:true,value:{get height(){return mockViewportHeight},get scale(){return mockScale},offsetTop:0,addEventListener(){}}});
  window.dispatchEvent(new Event('resize'));
 });
 await page.waitForTimeout(80);
 assert.ok(await page.evaluate(()=>Math.abs(document.getElementById('nav').getBoundingClientRect().bottom-innerHeight)<1),'Footer must reach the layout viewport when browser chrome reduces visualViewport.height');
 await page.evaluate(()=>Object.defineProperty(window,'visualViewport',{configurable:true,value:actualViewport}));
 // A stale initial shell height must not position the footer. No rotation event.
 await page.evaluate(()=>go('tools',{},true));
 const staleShell=await page.addStyleTag({content:'body {height: 812px; min-height: 812px}'});
 assert.equal(await page.evaluate(()=>document.body.getBoundingClientRect().height),812);
 assert.ok(await page.evaluate(()=>Math.abs(document.getElementById('nav').getBoundingClientRect().bottom-874)<1));
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 await page.waitForTimeout(40);
 assert.ok(await page.evaluate(()=>Math.abs(document.getElementById('nav').getBoundingClientRect().bottom-874)<1));
 await staleShell.evaluate(e=>e.remove());
 let checks=0;
 for(const [width,height,top,right,bottom,left] of [[320,568,0,0,0,0],[375,667,20,0,0,0],[393,852,59,0,34,0],[402,874,62,0,34,0],[430,932,62,0,34,0],[667,375,0,0,0,0],[874,402,0,59,21,59],[744,1133,24,0,20,0],[768,1024,24,0,20,0],[820,1180,24,0,20,0],[1024,768,24,0,20,0],[1366,1024,0,0,0,0]]){
  await page.setViewportSize({width,height});
  await page.evaluate(({top,right,bottom,left})=>{for(const [side,n] of Object.entries({top,right,bottom,left}))document.documentElement.style.setProperty('--safe-'+side,n+'px')},{top,right,bottom,left});
  for(const language of ['es','en']){
   await page.evaluate(language=>setLanguage(language),language);
   for(const target of ['shoot','shot','library','tools','export','screen','distortion','projectSettings']){
    await page.evaluate(target=>go(target,{},true),target);await page.waitForTimeout(25);
    const m=await page.evaluate(()=>{
     const main=document.getElementById('main'),nav=document.getElementById('nav'),dock=document.getElementById('captureDock');
     const rect=e=>e.getBoundingClientRect().toJSON();main.scrollLeft=500;
     return {main:rect(main),nav:rect(nav),dock:rect(dock),hidden:nav.hidden,scrollLeft:main.scrollLeft,scrollWidth:main.scrollWidth,clientWidth:main.clientWidth,body:rect(document.body),rootOverflow:document.documentElement.scrollWidth>innerWidth,
      overflow:[...main.querySelectorAll('*')].filter(e=>{const r=rect(e);return r.width&&r.height&&(r.left<main.getBoundingClientRect().left||r.right>main.getBoundingClientRect().right+.5)}).map(e=>e.id||e.className||e.tagName)};
    });
    const label=JSON.stringify({target,language,width,height,m});
    assert.equal(m.rootOverflow,false,label);assert.equal(m.scrollLeft,0,label);assert.ok(m.scrollWidth<=m.clientWidth+1,label);assert.deepEqual(m.overflow,[],label);
    assert.ok(m.body.height>=height-1,label);
    if(!m.hidden){assert.ok(Math.abs(m.nav.bottom-height)<1,label);assert.ok(m.nav.height<=72+bottom,label);assert.equal(m.nav.width,width);}
    assert.ok(await page.evaluate(()=>parseFloat(getComputedStyle(document.getElementById('main')).paddingBottom)>=document.getElementById('nav').getBoundingClientRect().height+document.getElementById('captureDock').getBoundingClientRect().height+23),label);
    if(target==='shot')assert.ok(Math.abs(m.dock.bottom-m.nav.top)<1,label);
    if(target==='shoot'){
     await page.locator('main .list-row').last().scrollIntoViewIfNeeded();
     const row=await page.locator('main .list-row').last().boundingBox();assert.ok(row.y+row.height<=m.nav.top+1,label);
     assert.ok(await page.evaluate(()=>scrollY>0),label);
     assert.equal(await page.evaluate(()=>document.getElementById('main').scrollTop),0,label);
    }
    checks++;
   }
  }
 }
 // Opening a shot and going back preserves the user's position in a long list.
 await page.setViewportSize({width:402,height:874});await page.evaluate(()=>go('shoot',{},true));
 const twentieth=page.locator('main .list-row').nth(19);await twentieth.scrollIntoViewIfNeeded();
 const listScroll=await page.evaluate(()=>scrollY);
 await twentieth.click();await page.waitForSelector('#sh');
 await page.evaluate(()=>back());await page.waitForFunction(()=>route.page==='shoot');
 assert.ok(await page.evaluate(y=>Math.abs(scrollY-y)<2,listScroll));
 // Unbroken user values and native input intrinsic sizes must not widen a list/grid.
 await page.setViewportSize({width:320,height:740});
 await page.evaluate(()=>{for(const side of ['top','right','bottom','left'])document.documentElement.style.setProperty('--safe-'+side,'0px');p().name='PRODUCCION'.repeat(16);shot()._s.code='SCENE'.repeat(30);shot()._u.code='SETUP'.repeat(30);raw().code='SHOT'.repeat(30);p().cameras[0].model='CAMERA'.repeat(30);p().lenses[0].model='LENS'.repeat(30)});
 for(const target of ['shoot','shot','library']){
  await page.evaluate(target=>go(target,{},true),target);
  assert.ok(await page.evaluate(()=>document.getElementById('main').scrollWidth<=document.getElementById('main').clientWidth+1),target+' long values');
 }
 // Keyboard-only visual viewport sizing, then restoration; pinch zoom remains enabled.
 await page.setViewportSize({width:402,height:874});
 await page.evaluate(()=>{go('shot');document.getElementById('shotNote').focus();window.mockViewportHeight=430;Object.defineProperty(window,'visualViewport',{configurable:true,value:{height:430,scale:1,offsetTop:0,addEventListener(){}}});window.dispatchEvent(new Event('resize'))});
 await page.waitForTimeout(80);
 assert.ok(await page.evaluate(()=>document.body.classList.contains('keyboard')));
 assert.equal(await page.locator('#nav').isVisible(),false);assert.equal(await page.locator('#captureDock').isVisible(),false);
 assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--keyboard-height')),'');
 await page.evaluate(()=>{document.activeElement.blur();Object.defineProperty(window,'visualViewport',{configurable:true,value:actualViewport});window.dispatchEvent(new Event('resize'))});await page.waitForTimeout(80);
 assert.equal(await page.locator('#nav').isVisible(),true);assert.ok(await page.evaluate(()=>Math.abs(document.getElementById('nav').getBoundingClientRect().bottom-innerHeight)<1));
 await page.evaluate(()=>{document.getElementById('sh').focus();Object.defineProperty(window,'visualViewport',{configurable:true,value:{height:437,scale:2,offsetTop:0,addEventListener(){}}});window.dispatchEvent(new Event('resize'))});await page.waitForTimeout(80);
 assert.equal(await page.evaluate(()=>document.body.classList.contains('keyboard')),false,'Pinch zoom must not be mistaken for a keyboard');
 await page.evaluate(()=>{document.activeElement.blur();Object.defineProperty(window,'visualViewport',{configurable:true,value:actualViewport});window.dispatchEvent(new Event('resize'))});
 assert.equal(await page.locator('#languageSelect').count(),0);
 assert.doesNotMatch(await page.locator('meta[name=viewport]').getAttribute('content'),/user-scalable=no|maximum-scale=1/);
 // Modal remains usable in a short landscape window.
 await page.setViewportSize({width:667,height:375});await page.evaluate(()=>confirmShotDelete());
 const dlg=await page.locator('#dlg').boundingBox();assert.ok(dlg.x>=0&&dlg.y>=0&&dlg.x+dlg.width<=667&&dlg.y+dlg.height<=375);
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.setViewportSize({width:402,height:874});
 await page.evaluate(()=>{p().name='IPSY';raw().code='SH001';shot()._s.code='01';shot()._u.code='A';setLanguage('es');document.documentElement.style.setProperty('--safe-top','62px');document.documentElement.style.setProperty('--safe-bottom','34px');go('shoot');document.getElementById('toast').classList.remove('show')});
 await page.screenshot({path:'test-output/layout-027-'+(engine===webkit?'webkit':'chromium')+'-list.png'});
 await page.evaluate(()=>go('shot'));await page.screenshot({path:'test-output/layout-027-'+(engine===webkit?'webkit':'chromium')+'-shot.png'});
 await page.evaluate(()=>go('appSettings'));await page.locator('.screen-info summary').click();
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedDiagnostics=text}}}));
 await page.getByRole('button',{name:'Copiar diagnóstico de pantalla',exact:true}).click();
 const report=JSON.parse(await page.evaluate(()=>copiedDiagnostics));assert.equal(report.build,'0.2.8');assert.ok(report.initial&&report.current);assert.ok(report.recent.length<=15);assert.doesNotMatch(JSON.stringify(report),/IPSY|camera-qa|lens-qa|PRODUCCION/);
 assert.deepEqual(errors,[]);console.log('PASS '+(engine===webkit?'WebKit':'Chromium')+': '+checks+' layouts, safe areas, nested overflow, 30-shot vertical scroll, long values, compact footer, viewport mismatch, keyboard restore and modal bounds');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
