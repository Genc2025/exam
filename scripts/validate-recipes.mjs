import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const datasetPath=path.join(root,'data','recipes.json');
const reportPath=path.join(root,'recipe-audit.json');
const failures=[];
const fail=(id,issue)=>failures.push({id:id||'GLOBAL',issue});

if(!fs.existsSync(datasetPath)){
  fail('GLOBAL','Missing canonical dataset: data/recipes.json');
}else{
  let recipes=[];
  try{recipes=JSON.parse(fs.readFileSync(datasetPath,'utf8'));}catch(e){fail('GLOBAL',`Invalid JSON: ${e.message}`)}
  if(!Array.isArray(recipes)) fail('GLOBAL','Canonical dataset must be an array');
  else {
    if(recipes.length!==200) fail('GLOBAL',`Expected exactly 200 recipes, found ${recipes.length}`);
    const ids=new Set(),urls=new Set(),images=new Map();
    for(const r of recipes){
      const id=r?.id||'UNKNOWN';
      if(!r?.id) fail(id,'Missing id'); else if(ids.has(r.id)) fail(id,'Duplicate id'); else ids.add(r.id);
      if(!r?.title?.trim()) fail(id,'Missing Albanian title');
      if(!r?.originalTitle?.trim()) fail(id,'Missing originalTitle');
      if(!Array.isArray(r?.ingredients)||!r.ingredients.length) fail(id,'Missing ingredients');
      if(!Array.isArray(r?.steps)||!r.steps.length) fail(id,'Missing instructions');
      if(!r?.source?.url) fail(id,'Missing source URL');
      else if(urls.has(r.source.url)) fail(id,'Duplicate source URL'); else urls.add(r.source.url);
      if(!r?.source?.license) fail(id,'Missing source license/status');
      if(r?.source?.verified!==true) fail(id,'Source not verified');
      if(!r?.image?.status) fail(id,'Missing image status');
      const combined=JSON.stringify(r);
      if(/loremflickr/i.test(combined)) fail(id,'Forbidden LoremFlickr reference');
      if(/example\.com/i.test(combined)) fail(id,'Placeholder example.com URL');
      if(r?.image?.status==='VERIFIED'){
        if(!r.image.localPath) fail(id,'VERIFIED image missing localPath');
        else {
          const p=path.join(root,r.image.localPath);
          if(!fs.existsSync(p)) fail(id,`Broken local image path: ${r.image.localPath}`);
          if(images.has(r.image.localPath)) fail(id,`Duplicate image path also used by ${images.get(r.image.localPath)}`); else images.set(r.image.localPath,id);
        }
        if(!r.image.sourceUrl) fail(id,'VERIFIED image missing sourceUrl');
        if(!r.image.license) fail(id,'VERIFIED image missing license');
      }
    }
  }
}
const report={generatedAt:new Date().toISOString(),target:200,passed:failures.length===0,failures};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exit(failures.length?1:0);
