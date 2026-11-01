import * as pc from 'playcanvas';

/**
 * Production asset adapter. A reference image is not a skinned 3D model.
 * We will only replace the primitive prototype when a genuine GLB exists.
 */
export const PRODUCTION_ASSET_PATHS = Object.freeze({
  jester: '/assets/characters/mad-jester.glb',
  wheel: '/assets/wheels/fortune-royale.glb'
});

const CHARACTER_CLIPS = {
  idle: ['idle','breath','stand'],
  spin: ['spin','present','gesture','cast'],
  win: ['celebrate','win','cheer','laugh'],
  bonus: ['wheel','reveal','show','point']
};

function norm(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function pickClip(available, requested) {
  const words = CHARACTER_CLIPS[requested] || CHARACTER_CLIPS.idle;
  const entries=available.map(x=>({key:x,keyNorm:norm(x)}));
  for(const word of words) {
    const exact=entries.find(x=>x.keyNorm===word);
    if(exact)return exact.key;
  }
  for(const word of words) {
    const match=entries.find(x=>x.keyNorm.includes(word));
    if(match)return match.key;
  }
  return requested==='idle' && entries.length ? entries[0].key : null;
}

function loadContainer(app,url) {
  return new Promise((resolve,reject)=>{
    app.assets.loadFromUrl(url,'container',(error,asset)=>{
      if(error || !asset?.resource) reject(new Error('GLB import failed '+url+': '+String(error || 'no resource')));
      else resolve(asset);
    });
  });
}

/**
 * A production file is optional to allow non-asset integration testing.
 * No default mesh is presented as an art-direction substitute.
 */
export async function loadPremiumJester(app, stage, {url=PRODUCTION_ASSET_PATHS.jester}={}) {
  const result = await loadContainer(app,url);
  const character = result.resource.instantiateRenderEntity({castShadows:true,receiveShadows:true});
  character.name = 'MAD_JESTER_PRODUCTION_GLTF';
  const pivot=new pc.Entity('MAD_JESTER_PRODUCTION_PIVOT');
  stage.addChild(pivot);
  pivot.addChild(character);

  const tracks=result.resource.animations || [];
  const names=tracks.map((clip,i)=>clip.name || clip.resource?.name || 'clip_'+i);
  // Important: imported glTF skeleton joint names are already runtime nodes.
  // Drive those nodes directly, avoiding a second mismatched graph hierarchy.
  const keys=['Head','Chest','UpperArm.L','UpperArm.R','Forearm.L','Forearm.R',
    'Coat.Left','Coat.Right','Hat.Left','Hat.Right','Hat.Center'];
  const bones=Object.fromEntries(keys.map(name=>[name,character.findByName(name)]));
  const original=Object.fromEntries(keys.map(name=>{
    const bone=bones[name];return [name,bone?bone.getLocalEulerAngles().clone():null];
  }));
  let emotion='idle';
  const euler=(name,x,y,z)=>{
    const b=bones[name],base=original[name];
    if(b&&base)b.setLocalEulerAngles(base.x+x,base.y+y,base.z+z);
  };
  return {
    asset:result,pivot,model:character,clips:names,
    pose(next){emotion=next;return true;},
    animate(time){
      const idle=Math.sin(time*1.65),slow=Math.sin(time*.73);
      const active=emotion==='spin'?.48:emotion==='win'?1:emotion==='bonus'?.85:.12;
      euler('Head',slow*5,-slow*7+(emotion==='bonus'?12:0),idle*4);
      euler('Chest',0,slow*3,idle*2);
      euler('UpperArm.L',0,0,-active*52+idle*5);
      euler('UpperArm.R',0,0,active*66+idle*7);
      euler('Forearm.L',0,-active*12,active*6);
      euler('Forearm.R',0,active*24,-active*7);
      euler('Coat.Left',idle*8,0,slow*7);
      euler('Coat.Right',idle*9,0,-slow*8);
      euler('Hat.Left',idle*5,slow*4,slow*9);
      euler('Hat.Right',-idle*5,slow*4,-slow*9);
      euler('Hat.Center',idle*4,slow*4,idle*3);
    },
    setDesktop(){pivot.setLocalPosition(-7.26,-2.48,1.65);pivot.setLocalScale(1.34,1.34,1.34);},
    setMobile(){pivot.setLocalPosition(-3.15,-.08,1.55);pivot.setLocalScale(.92,.92,.92);},
    destroy(){pivot.destroy();app.assets.remove(result);}
  };
}

function findHierarchy(entity,predicate){
  if(predicate(entity))return entity;
  for(const c of entity.children){const r=findHierarchy(c,predicate);if(r)return r;}
  return null;
}

export async function loadPremiumWheel(app,stage,{url=PRODUCTION_ASSET_PATHS.wheel}={}) {
  const result=await loadContainer(app,url);
  const model=result.resource.instantiateRenderEntity({castShadows:true,receiveShadows:true});
  model.name='FORTUNE_ROYALE_PRODUCTION_GLTF';
  // The rotor must be a separate named transform, so winning sectors can be
  // selected deterministically by the existing visual animation code.
  const rotor=findHierarchy(model,e=>norm(e.name)==='wheelrotor');
  if(!rotor){
    model.destroy();app.assets.remove(result);
    throw new Error('Wheel asset missing required node WheelRotor');
  }
  const pivot=new pc.Entity('FORTUNE_ROYALE_PRODUCTION_PIVOT');
  stage.addChild(pivot);pivot.addChild(model);
  return {
    asset:result,pivot,model,rotor,
    setDesktop(){pivot.setLocalPosition(7.48,.35,1.0);pivot.setLocalScale(1.15,1.15,1.15);},
    setMobile(){pivot.setLocalPosition(3.1,2.45,.8);pivot.setLocalScale(.79,.79,.79);},
    destroy(){pivot.destroy();app.assets.remove(result);}
  };
}
