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
  const names=[];
  if(tracks.length){
    character.addComponent('anim',{activate:true});
    tracks.forEach((clip,i)=>{
      const clipName=clip.name || clip.resource?.name || 'clip_'+i;
      names.push(clipName);
      character.anim.assignAnimation(clipName,clip.resource,undefined,1,true);
    });
  }

  const assigned=pickClip(names,'idle');
  if(assigned)character.anim.baseLayer.transition(assigned,0);
  let last=assigned;
  return {
    asset:result,pivot,model:character,clips:names,
    pose(state){
      if(!character.anim)return false;
      const clip=pickClip(names,state);
      if(!clip || clip===last)return false;
      character.anim.baseLayer.transition(clip,state==='idle'?.25:.12);
      last=clip;return true;
    },
    setDesktop(){pivot.setLocalPosition(-7.30,-2.30,1.25);pivot.setLocalScale(1.35,1.35,1.35);},
    setMobile(){pivot.setLocalPosition(-3.08,.72,1.25);pivot.setLocalScale(.82,.82,.82);},
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
    setDesktop(){pivot.setLocalPosition(7.42,.4,.8);pivot.setLocalScale(1,1,1);},
    setMobile(){pivot.setLocalPosition(3.10,2.38,.8);pivot.setLocalScale(.57,.57,.57);},
    destroy(){pivot.destroy();app.assets.remove(result);}
  };
}
