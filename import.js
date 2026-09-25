// Imports the current project format, not a migration path for legacy schemas.
let importDraft=null,importBusy=false;
const IMPORT_MAX_BYTES=256*1024*1024;
function importError(message='This JSON does not match the current VFX Tools project format.'){const error=Error(t(message));error.name='ImportValidationError';throw error}
function importObject(x){if(!x||typeof x!=='object'||Array.isArray(x))importError();return x}
function importArray(x){if(!Array.isArray(x))importError();return x}
function importText(x,empty=true){if(typeof x!=='string'||(!empty&&!x.trim()))importError();return x}
function importNumber(x){if(typeof x!=='number'||!Number.isFinite(x))importError();return x}
function validateProjectImport(data){
 importObject(data);if(data.schema!=='slyhigh.vfxdata'||data.schema_version!==VER)importError('This JSON format is not supported. Export it with a compatible version of VFX Tools.');
 // v0.2.8 did not stamp its app version. Its exact structure is accepted.
 if(data.app_version!==undefined){if(typeof data.app_version!=='string'||!/^\d+\.\d+\.\d+$/.test(data.app_version))importError();const [major,minor,patch]=data.app_version.split('.').map(Number);if(major===0&&(minor<2||(minor===2&&patch<8)))importError('Imports support VFX Tools 0.2.8 and later.');}
 if(data.backup_format!==undefined&&data.backup_format!=='slyhigh.media-backup.1')importError();
 const project=importObject(data.project);importText(project.name,false);importText(project.code,false);importText(data.operator);if(project.operator!==undefined)importText(project.operator);
 const ids=new Set(),cameraIds=new Set(),lensIds=new Set(),shotIds=new Set(),refs=new Map();
 function entity(x){importObject(x);importText(x.id,false);if(ids.has(x.id))importError('The JSON contains duplicate identifiers.');ids.add(x.id)}
 function scalarFields(x,fields){for(const key of fields)if(x[key]!=null&&typeof x[key]!=='string'&&typeof x[key]!=='number')importError()}
 function files(list,owner){for(const r of importArray(list)){entity(r);importText(r.mediaId,false);scalarFields(r,['name','note','tag','type','kind','mime','created']);if(r.name!==undefined)importText(r.name);if(r.size!==undefined&&importNumber(r.size)<0)importError();if(r.take!==undefined&&(!Number.isInteger(r.take)||r.take<1))importError();if(!refs.has(r.mediaId))refs.set(r.mediaId,{record:r,...owner})}}
 entity(project);
 for(const [list,set] of [[project.cameras,cameraIds],[project.lenses,lensIds]])for(const e of importArray(list)){entity(e);set.add(e.id);importText(e.code);importText(e.model);scalarFields(e,['make','type','mount','sensor','focal','fps','color']);if(e.provenance!==undefined)importObject(e.provenance)}
 for(const d of importArray(project.days)){entity(d);importText(d.code);importText(d.date);if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(Date.parse(d.date)))importError();
  for(const s of importArray(d.scenes)){entity(s);importText(s.code);for(const u of importArray(s.setups)){entity(u);importText(u.code);if(u.attachments!==undefined)files(u.attachments,{setupId:u.id});
   for(const h of importArray(u.shots)){entity(h);shotIds.add(h.id);importText(h.code,false);if(!Number.isInteger(h.take)||h.take<1)importError();importArray(h.types).forEach(x=>importText(x));importObject(h.camera);
    for(const value of Object.values(h.camera))if(value!=null&&(!['string','number'].includes(typeof value)||(typeof value==='number'&&!Number.isFinite(value))))importError();
    for(const [key,set] of [['cameraId',cameraIds],['lensId',lensIds]])if(h.camera[key]&&!set.has(h.camera[key]))importError('A shot refers to equipment missing from the JSON.');
    if(h.cameraProvenance!==undefined){importObject(h.cameraProvenance);Object.values(h.cameraProvenance).forEach(x=>importText(x))}
    for(const n of importArray(h.notes)){entity(n);importText(n.text);if(n.take!==undefined)importNumber(n.take)}
    for(const m of importArray(h.measurements)){entity(m);for(const key of ['from','to','unit','method','confidence'])importText(m[key]);importNumber(m.value);if(m.si!==undefined){importObject(m.si);importNumber(m.si.value);importText(m.si.unit)}}
    for(const key of ['media','plates','voice'])files(h[key],{shotId:h.id});if(h.attachments!==undefined)files(h.attachments,{shotId:h.id});
   }
  }}
 }
 for(const h of shots(project))if(h.inherited_from&&!shotIds.has(h.inherited_from))importError('A shot refers to another shot missing from the JSON.');
 const embedded=new Map();for(const entry of data.media===undefined?[]:importArray(data.media)){importObject(entry);importText(entry.id,false);if(embedded.has(entry.id)||!refs.has(entry.id))importError('The backup contains invalid file references.');importText(entry.data);const match=/^data:([\w!#$&^.+-]+\/[\w!#$&^.+-]+)?;base64,/.exec(entry.data);if(!match)importError('A file in the backup is damaged.');const body=entry.data.slice(match[0].length);if(body.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(body))importError('A file in the backup is damaged.');embedded.set(entry.id,{entry,offset:match[0].length,type:match[1]||'application/octet-stream',size:body.length/4*3-(body.endsWith('==')?2:body.endsWith('=')?1:0)})}
 return {data,refs,embedded,shotCount:shotIds.size,setupCount:projectSetups(project).length,missing:refs.size-embedded.size};
}
function pickImportJSON(){if(importBusy||attachmentBusy||captureSaving||pendingCapture)return;importDraft=null;$('importInput').value='';$('importInput').click()}
function importFailure(error){$('dlgBody').innerHTML='<h2>'+t('Project not imported')+'</h2><p>'+esc(error.message||t('Could not import. Nothing was changed. Please retry.'))+'</p><button class="secondary" onclick="closeDlg()">'+t('Close')+'</button>';if(!$('dlg').open)$('dlg').showModal()}
async function prepareImport(file){if(!file||importBusy)return;importBusy=true;importDraft=null;taskDialog('Reading JSON…');try{
 if(file.size>IMPORT_MAX_BYTES)importError('Choose a JSON smaller than 256 MB.');
 let data;try{data=JSON.parse((await file.text()).replace(/^\uFEFF/,''),(key,value)=>{if(['__proto__','prototype','constructor'].includes(key))throw Error('Unsafe key');return value})}catch{importError('This file is not valid JSON.')}
 const draft=validateProjectImport(data);importDraft=draft;const pr=data.project;
 $('dlgBody').innerHTML='<h2>'+t('Import project')+'</h2><p class="pdf-filename">'+esc(pr.name)+'</p><p>'+draft.shotCount+' shots · '+draft.setupCount+' setups · '+pr.cameras.length+' '+t('Cameras').toLowerCase()+' · '+pr.lenses.length+' '+t('Lenses').toLowerCase()+'</p><p>'+draft.embedded.size+' '+t('original files included')+'</p>'+(draft.missing?'<p class="import-warning">'+draft.missing+' '+t('files are referenced but not included. Their records will be imported without the originals.')+'</p>':'')+'<p class="helper">'+t('A new project will be added. Existing projects will not be replaced.')+'</p><div class="row"><button onclick="closeDlg()">'+t('Cancel')+'</button><button id="confirmImport" class="primary" onclick="confirmImportJSON()">'+t('Import project')+'</button></div>';
 }catch(error){importDraft=null;importFailure(error)}finally{importBusy=false;$('importInput').value=''}
}
function copyImportedProject(draft){
 const pr=structuredClone(draft.data.project),entityIds=new Map(),mediaIds=new Map([...draft.refs.keys()].map(id=>[id,uid()]));
 function renew(x){const old=x.id;x.id=uid();entityIds.set(old,x.id)}
 renew(pr);for(const e of [...pr.cameras,...pr.lenses])renew(e);
 for(const d of pr.days){renew(d);for(const s of d.scenes){renew(s);for(const u of s.setups){renew(u);for(const a of u.attachments||[]){renew(a);a.mediaId=mediaIds.get(a.mediaId)}for(const h of u.shots){renew(h);for(const a of [...h.notes,...h.measurements,...shotFiles(h)]){renew(a);if(a.mediaId)a.mediaId=mediaIds.get(a.mediaId)}}}}}
 for(const d of pr.days)for(const s of d.scenes)for(const u of s.setups)for(const h of u.shots){for(const key of ['cameraId','lensId'])if(h.camera[key])h.camera[key]=entityIds.get(h.camera[key]);if(h.inherited_from)h.inherited_from=entityIds.get(h.inherited_from)}
 const original=pr.code;let n=2;while(state.projects.some(x=>x.code===pr.code))pr.code=original+'_'+n++;
 if(state.projects.some(x=>x.name===pr.name)){const originalName=pr.name;let n=2;do{pr.name=originalName+' ('+t('Imported')+' '+(n++)+')'}while(state.projects.some(x=>x.name===pr.name))}
 pr.operator=draft.data.operator;pr.imported_at=now();return {project:pr,entityIds,mediaIds};
}
async function confirmImportJSON(){if(!importDraft||importBusy)return;importBusy=true;const draft=importDraft;taskDialog('Importing project…');try{
 const estimate=await navigator.storage?.estimate?.().catch(()=>null),bytes=[...draft.embedded.values()].reduce((n,x)=>n+x.size,0);if(estimate?.quota&&bytes>estimate.quota-(estimate.usage||0))importError('Not enough device storage. Free space and try importing again.');
 const copy=copyImportedProject(draft),records=[];
 for(const [oldId,source] of draft.embedded){const bytes=new Uint8Array(source.size);let dest=0;for(let offset=source.offset;offset<source.entry.data.length;offset+=65536){const chunk=atob(source.entry.data.slice(offset,offset+65536));for(let i=0;i<chunk.length;i++)bytes[dest++]=chunk.charCodeAt(i)}const ref=draft.refs.get(oldId),meta=ref.record;records.push({id:copy.mediaIds.get(oldId),bytes:bytes.buffer,projectId:copy.project.id,...(ref.setupId?{setupId:copy.entityIds.get(ref.setupId)}:{shotId:copy.entityIds.get(ref.shotId)}),name:typeof source.entry.name==='string'?source.entry.name:meta.name||oldId,type:source.type,kind:ref.setupId?'attachment':source.type.startsWith('video/')?'video':source.type.startsWith('audio/')?'voice':'image',created:meta.created||now(),size:source.size});$('fileProgress').textContent=t('Importing project…')+' '+records.length+' / '+draft.embedded.size;await new Promise(r=>setTimeout(r,0))}
 const next=structuredClone(state);next.projects.push(copy.project);next.activeProjectId=copy.project.id;next.activeShotId=shots(copy.project)[0]?.id||null;next.view='shoot';
 await commitFileState(next,records);state=next;importDraft=null;clearPreparedPackage();clearPreparedPDF();closeDlg();navStack=[];go('shoot',{},true);setSaveStatus(t('SAVED ON DEVICE'));toast(t('Project imported'));
 }catch(error){importFailure(error.name==='ImportValidationError'?error:new Error(error.name==='QuotaExceededError'?t('Not enough device storage. Free space and try importing again.'):t('Could not import. Nothing was changed. Please retry.')))}finally{importBusy=false}
}
$('importInput').addEventListener('change',e=>prepareImport(e.target.files[0]));
$('dlg').addEventListener('cancel',e=>{if(importBusy)e.preventDefault()});
$('dlg').addEventListener('close',()=>{if(!importBusy)importDraft=null});
