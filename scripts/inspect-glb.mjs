#!/usr/bin/env node
// Self-contained GLB 2.0 validation. No Blender process or third-party parser.
import fs from 'node:fs';
import path from 'node:path';

function loadGLB(file){
 const data=fs.readFileSync(file);
 if(data.length<20||data.toString('ascii',0,4)!=='glTF')throw Error('Not a GLB 2.0 file');
 const version=data.readUInt32LE(4),size=data.readUInt32LE(8);
 if(version!==2||size!==data.length)throw Error('Bad GLB header/version/size');
 let offset=12,json=null;
 while(offset<data.length){
  if(offset+8>data.length)throw Error('Invalid chunk table');
  const length=data.readUInt32LE(offset),type=data.readUInt32LE(offset+4);
  const start=offset+8,end=start+length;
  if(end>data.length)throw Error('Chunk exceeds file size');
  if(type===0x4e4f534a)json=JSON.parse(data.subarray(start,end).toString('utf8'));
  offset=end;
 }
 if(!json)throw Error('GLB missing JSON chunk');
 return json;
}
export function inspectGLB(g){
 const a=g.accessors??[],meshes=g.meshes??[],skins=g.skins??[],materials=g.materials??[],textures=g.textures??[],images=g.images??[],anims=g.animations??[];
 let triangles=0,morphTargets=0,primitives=0;
 for(const mesh of meshes)for(const p of mesh.primitives??[]){
   primitives++;
   if(p.mode==null||p.mode===4){
     const indices=p.indices!=null?a[p.indices]?.count:(a[p.attributes?.POSITION]?.count??0);
     triangles+=Math.floor((indices??0)/3);
   }
   morphTargets+=p.targets?.length??0;
 }
 const clipNames=anims.map((x,i)=>x.name||'Unnamed_'+i);
 const texMaps=new Set();
 for(const mat of materials){
   const p=mat.pbrMetallicRoughness??{};
   for(const [k,v] of [['baseColor',p.baseColorTexture],['metallicRoughness',p.metallicRoughnessTexture],['normal',mat.normalTexture],['occlusion',mat.occlusionTexture],['emissive',mat.emissiveTexture]])if(v?.index!=null)texMaps.add(k);
 }
 return {
  triangles,meshes:meshes.length,primitives,nodes:g.nodes?.length??0,materials:materials.length,
  textures:textures.length,images:images.length,skins:skins.length,
  joints:skins.reduce((n,x)=>n+(x.joints?.length??0),0),
  animationClips:clipNames,morphTargets,textureChannels:[...texMaps],
  wheelRotor:g.nodes?.some(n=>n.name==='WheelRotor')??false,
  fileExtensions:g.extensionsUsed??[]
 };
}
export function qualityReport(meta,type){
 const problems=[],warn=[];
 if(meta.triangles<5000)problems.push('Model too sparse for reference art ('+meta.triangles+' triangles)');
 if(meta.materials<5)problems.push('Insufficient independently authored materials');
 if(meta.textures<4)problems.push('Missing PBR texture detail');
 if(!meta.textureChannels.includes('baseColor'))problems.push('Base color texture missing');
 if(!meta.textureChannels.includes('normal'))warn.push('No normal map; check sculpted surface detailing');
 if(type==='jester'){
   if(meta.triangles<25000)problems.push('Jester needs production-quality topology / character detail');
   if(meta.skins<1||meta.joints<25)problems.push('Character missing substantial armature/skin');
   if(meta.animationClips.length<4)problems.push('Require at least 4 authored animation clips');
   const found=['idle','spin','win','wheel'].map(x=>meta.animationClips.some(n=>n.toLowerCase().includes(x)));
   if(found.some(v=>!v))warn.push('Clip names should include Idle, Spin, Win and Wheel (or mapped aliases)');
 }else if(type==='wheel'){
   if(meta.triangles<12000)problems.push('Wheel needs sculpted bevels, rim, ornaments and pointer');
   if(!meta.wheelRotor)problems.push('Required independent WheelRotor node absent');
 }
 return {ok:problems.length===0,problems,warnings:warn};
}

if(process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
 const file=process.argv[2],type=process.argv[3]||'jester';
 if(!file||!['jester','wheel'].includes(type)){
   console.error('Usage: npm run art:inspect -- path/to/model.glb [jester|wheel]');
   process.exit(2);
 }
 try{
   const metadata=inspectGLB(loadGLB(file));
   const qa=qualityReport(metadata,type);
   console.log(JSON.stringify({file,type,...metadata,quality:qa},null,2));
   if(!qa.ok)process.exitCode=1;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
