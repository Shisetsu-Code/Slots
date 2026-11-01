import * as pc from 'playcanvas';
import {SYMBOLS, generateGrid, secureFloat} from './game.js';
import {drawTile} from './art.js';
import {loadPremiumJester,loadPremiumWheel} from './premium-assets.js';

const TAU=Math.PI*2;
const SLICES=[8,10,12,8,15,8,10,12,8,15,10,12];
const PALETTE={
  midnight:[.055,.019,.115], midnight2:[.11,.035,.18],
  plum:[.27,.046,.27], violet:[.47,.09,.51], coral:[.91,.13,.35],
  teal:[.025,.66,.69], gold:[.94,.60,.16], lightGold:[1,.85,.48],
  ivory:[.96,.81,.67], ink:[.045,.024,.08], ruby:[.72,.075,.2]
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=(x)=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const easeOut=(x)=>1-Math.pow(1-clamp(x,0,1),5);

function mat(color,{metal=.05,gloss=50,glow=0,unlit=false}={}){
 const m=new pc.StandardMaterial();
 m.diffuse=new pc.Color(...color);
 // Unlit materials preserve deep velvet/pigment colors without requiring an
 // environment cubemap; the volumetric character is built from real meshes.
 m.useMetalness=false;
 m.metalness=0;m.gloss=gloss;
 m.useLighting=false;
 m.useTonemap=false;
 m.emissive=new pc.Color(...color);
 m.emissiveIntensity=1;
 m.update();return m;
}
function node(parent,name,x=0,y=0,z=0){
 const n=new pc.Entity(name);n.setLocalPosition(x,y,z);parent.addChild(n);return n;
}
function shape(parent,type,name,xyz,scale,material,rotation){
 const ent=node(parent,name,...xyz);
 ent.addComponent('render',{type,material});
 ent.setLocalScale(...scale);
 if(rotation)ent.setLocalEulerAngles(...rotation);
 return ent;
}
function materialFromCanvas(app,canvas){
 const t=new pc.Texture(app.graphicsDevice,{width:canvas.width,height:canvas.height,format:pc.PIXELFORMAT_R8_G8_B8_A8,mipmaps:true,minFilter:pc.FILTER_LINEAR_MIPMAP_LINEAR,magFilter:pc.FILTER_LINEAR,addressU:pc.ADDRESS_CLAMP_TO_EDGE,addressV:pc.ADDRESS_CLAMP_TO_EDGE});
 t.setSource(canvas);
 const m=new pc.StandardMaterial();
 m.diffuseMap=t;m.emissiveMap=t;m.emissive=new pc.Color(.9,.9,.9);m.emissiveIntensity=.4;
 m.useLighting=false;m.useTonemap=false;m.cull=pc.CULLFACE_NONE;m.update();
 return {texture:t,material:m};
}
function wheelCanvas(){
 const c=document.createElement('canvas');c.width=c.height=1024;
 const g=c.getContext('2d'), cx=512,cy=512,r=472;
 const colors=['#6021a5','#b01355','#134d78','#891a82','#d05b15','#244294',
               '#6021a5','#b01355','#134d78','#891a82','#d05b15','#244294'];
 g.fillStyle='#1a0c30';g.fillRect(0,0,1024,1024);
 for(let i=0;i<SLICES.length;i++){
   const a=-Math.PI/2+(i-.5)*TAU/SLICES.length,b=a+TAU/SLICES.length,mid=(a+b)/2;
   const gradient=g.createRadialGradient(cx,cy,90,cx,cy,r);
   gradient.addColorStop(0,'#130b28');gradient.addColorStop(.33,colors[i]);gradient.addColorStop(1,colors[i]);
   g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,r,a,b);g.closePath();g.fillStyle=gradient;g.fill();
   g.lineWidth=13;g.strokeStyle='#ffe2a6';g.stroke();
   g.save();g.translate(cx+Math.cos(mid)*r*.66,cy+Math.sin(mid)*r*.66);
   g.rotate(mid+Math.PI/2);
   g.textAlign='center';g.lineJoin='round';g.lineWidth=9;g.strokeStyle='#240723';g.font='900 51px Georgia';g.strokeText(SLICES[i]+' FS',0,8);
   g.fillStyle='#fff2b5';g.fillText(SLICES[i]+' FS',0,8);g.restore();
 }
 g.lineWidth=26;g.strokeStyle='#f7c354';g.beginPath();g.arc(cx,cy,r-8,0,TAU);g.stroke();
 g.lineWidth=9;g.strokeStyle='#fff8d2';g.beginPath();g.arc(cx,cy,r-28,0,TAU);g.stroke();
 for(let i=0;i<36;i++){const a=i/36*TAU;g.beginPath();g.arc(cx+Math.cos(a)*(r-15),cy+Math.sin(a)*(r-15),9,0,TAU);g.fillStyle=i%2?'#fff0b7':'#ff4a96';g.fill();}
 g.beginPath();g.arc(cx,cy,93,0,TAU);g.fillStyle='#361055';g.fill();g.lineWidth=17;g.strokeStyle='#f7be52';g.stroke();
 g.textAlign='center';g.font='900 69px Georgia';g.fillStyle='#fff4ac';g.fillText('J',cx,cy+23);
 return c;
}
function darkCardArt(symbol){
 // Reframe original hand-drawn emblems in the bespoke carnival palette.
 const original=drawTile(symbol,384),c=document.createElement('canvas');c.width=c.height=384;
 const g=c.getContext('2d');
 g.fillStyle='#230d38';g.fillRect(0,0,384,384);
 g.save();g.beginPath();g.roundRect(15,15,354,354,28);g.clip();
 g.filter='hue-rotate(76deg) saturate(1.3) contrast(1.1)';
 g.drawImage(original,0,0);g.restore();
 const shade=g.createRadialGradient(180,120,60,192,190,270);
 shade.addColorStop(0,'#3f125a00');shade.addColorStop(1,'#08031aa0');
 g.fillStyle=shade;g.fillRect(0,0,384,384);
 g.strokeStyle='#e6ae52';g.lineWidth=11;g.strokeRect(8,8,368,368);
 g.strokeStyle='#ec68be';g.lineWidth=4;g.strokeRect(20,20,344,344);
 for(let i=0;i<4;i++){const x=i%2?351:33,y=i>1?351:33;g.fillStyle='#ffdb87';g.beginPath();g.arc(x,y,7,0,TAU);g.fill();}
 return c;
}
function createJester(app,stage,m){
 const r=node(stage,'THE MAD JESTER (articulated 3D)',-7.30,-.20,1.20);
 const base=shape(stage,'cylinder','Jester stage pedestal',[-7.3,-2.62,.65],[2.7,.35,2.2],m.gold);
 const inlay=shape(stage,'cylinder','Pedestal inlay',[-7.3,-2.40,.65],[2.45,.07,2],m.coral);
 const bob=node(r,'Body rig');
 // shoes and jointed legs
 const legs=[];
 for(const side of [-1,1]){
   const leg=node(bob,'Leg pivot',side*.30,-.91,0);
   shape(leg,'capsule','Striped pant leg',[0,-.51,0],[.34,1.22,.38],side<0?m.violet:m.coral,[0,0,side*8]);
   shape(leg,'sphere','Oversized pointed shoe',[side*.1,-1.22,.32],[.63,.25,.72],m.ink);
   shape(leg,'sphere','Shoe gemstone',[side*.10,-1.17,.75],[.13,.13,.13],m.lightGold);
   legs.push(leg);
 }
 shape(bob,'cone','Tailored circus waistcoat',[0,-.44,0],[1.13,1.52,.83],m.violet,[0,0,180]);
 shape(bob,'sphere','Velvet torso',[0,-.23,.05],[.78,.81,.58],m.plum);
 shape(bob,'sphere','Golden collar',[0,.44,.03],[.96,.18,.70],m.lightGold);
 for(let i=0;i<5;i++){
   const x=(i-2)*.34;
   shape(bob,'cone','Five-point clown collar',[x,.46,.06],[.35,.48,.55],i%2?m.coral:m.teal,[0,0,180]);
   shape(bob,'sphere','Jacket buttons',[0,-.12-i*.25,.57],[.095,.095,.08],m.gold);
 }
 // Character's articulating shoulders; wrist and wand act separately.
 const arms=[];
 for(const side of [-1,1]){
  const pivot=node(bob,'Articulating shoulder',side*.71,.04,0);
  shape(pivot,'capsule','Puffed striped sleeve',[side*.23,-.44,0],[.4,.92,.45],side<0?m.coral:m.violet,[0,0,side*25]);
  shape(pivot,'sphere','Cuff jewel',[side*.45,-.90,0],[.30,.29,.28],m.gold);
  shape(pivot,'sphere','Gloved hand',[side*.46,-1.04,.08],[.28,.34,.29],m.ivory);
  arms.push(pivot);
 }
 const head=node(bob,'Head swivel',0,.87,.10);
 shape(head,'sphere','Pearl white porcelain jester face',[0,.26,0],[.91,1.09,.77],m.ivory);
 shape(head,'sphere','Pointed chin',[0,-.42,.25],[.46,.41,.43],m.ivory);
 for(const side of [-1,1]){
    shape(head,'sphere','Rose cheek',[side*.55,.01,.65],[.24,.15,.08],m.coral);
    shape(head,'sphere','Eye socket',[side*.33,.44,.70],[.28,.36,.12],m.ink);
    shape(head,'sphere','Luminous eye',[side*.33,.46,.80],[.13,.21,.08],m.teal);
    shape(head,'box','Expressive eyebrow',[side*.32,.77,.73],[.42,.075,.14],m.violet,[0,0,side*18]);
 }
 shape(head,'sphere','Rubied nose',[0,.08,.77],[.19,.19,.22],m.coral);
 const mouth=shape(head,'sphere','Expressive grinning mouth',[0,-.38,.66],[.50,.15,.17],m.ink);
 for(const x of [-.24,-.08,.08,.24])shape(head,'box','Teeth',[x,-.32,.811],[.12,.08,.035],m.ivory);
 shape(head,'sphere','Jester cap band',[0,1.04,0],[.92,.29,.78],m.plum);
 const horns=[];
 for(const side of [-1,0,1]){
   const pivot=node(head,'Kinetic hat horn',side*.39,1.12,0);
   shape(pivot,'cone','Tri-color harlequin horn',[side*.30,.55,0],[.40,1.23,.40],side===0?m.teal:side<0?m.coral:m.violet,[0,0,-side*32]);
   shape(pivot,'sphere','Bouncing brass bell',[side*.61,1.11,0],[.21,.22,.21],m.lightGold);
   horns.push(pivot);
 }
 const props=[];
 for(let i=0;i<4;i++){
  const card=node(stage,'Levitation card '+i);
  const colors=[m.coral,m.teal,m.lightGold,m.violet];
  shape(card,'box','Floating playing card',[0,0,0],[.50,.75,.065],colors[i]);
  shape(card,'box','Card center sigil',[0,0,.05],[.19,.37,.02],m.ivory);
  props.push(card);
 }
 return {r,bob,head,mouth,arms,legs,horns,props,base,inlay};
}
function createWheel(app,stage,m){
 const frame=node(stage,'ROULETTE RIG',7.42,.40,.80);
 shape(frame,'cylinder','Wheel mount',[0,0,-.45],[4.65,.36,4.65],m.gold,[90,0,0]);
 shape(frame,'cylinder','Inner shadow disc',[0,0,-.16],[4.36,.25,4.36],m.ink,[90,0,0]);
 const rotor=node(frame,'SIXTY SECOND OF CHAOS');
 const {material,texture}=materialFromCanvas(app,wheelCanvas());
 shape(rotor,'plane','Wheel numbered surface',[0,0,.03],[4.13,1,4.13],material,[90,0,0]);
 shape(rotor,'cylinder','Brass center spinner',[0,0,.20],[.62,.29,.62],m.lightGold,[90,0,0]);
 for(let i=0;i<24;i++){
    const a=i/24*TAU;
    shape(rotor,'sphere','Wheel bulb '+i,[Math.cos(a)*2.10,Math.sin(a)*2.10,.23],[.15,.15,.15],i%3===0?m.coral:m.lightGold);
 }
 // Stationary 3D pointer and illuminated top jewel.
 shape(frame,'cone','Razor sharp selector',[0,2.26,.38],[.56,.73,.32],m.coral,[0,0,180]);
 shape(frame,'sphere','Selector pearl',[0,2.62,.32],[.22,.22,.24],m.lightGold);
 const gears=[];
 for(let side of [-1,1]){
  const gear=node(stage,'Ancient clockwork gear '+side,side*9.6,-1.57,-1.1);
  shape(gear,'cylinder','Gear heart',[0,0,0],[1.10,.18,1.10],m.gold,[90,0,0]);
  for(let i=0;i<9;i++){
     const a=i/9*TAU;
     shape(gear,'box','Gear tooth',[Math.cos(a)*.72,Math.sin(a)*.72,.07],[.35,.30,.30],m.lightGold,[0,0,a*180/Math.PI]);
  }
  gears.push(gear);
 }
 return {frame,rotor,gears,texture};
}
export class SlotScene{
 constructor(canvas){
  this.canvas=canvas;
  this.app=new pc.Application(canvas,{graphicsDeviceOptions:{antialias:true,alpha:true}});
  const app=this.app;
  app.graphicsDevice.maxPixelRatio=Math.min(window.devicePixelRatio||1,2);
  app.setCanvasFillMode(pc.FILLMODE_NONE);app.setCanvasResolution(pc.RESOLUTION_AUTO);
  app.scene.ambientLight=new pc.Color(.25,.22,.37);
  app.scene.exposure=1.0;
  const m={};
  Object.entries(PALETTE).forEach(([key,value])=>{
   m[key]=mat(value,{metal:['gold','lightGold'].includes(key)?.38:.05,gloss:60,glow:['teal','coral','lightGold'].includes(key)?.18:0});
  });
  this.m=m;
  this.camera=node(app.root,'CINEMATIC CAMERA',0,0,25);
  this.camera.addComponent('camera',{fov:23,nearClip:.1,farClip:100,clearColor:new pc.Color(.034,.012,.073,1)});
  this.camera.lookAt(0,0,0);
  this.beams=[];
  const rig=[
   {xyz:[-8,6,8],color:[.92,.12,.5],intensity:1.3},
   {xyz:[8,5,9],color:[.12,.75,.95],intensity:1.3},
   {xyz:[0,5,8],color:[1,.66,.30],intensity:1.25}
  ];
  for(const item of rig){
    const e=node(app.root,'Animated theatrical spotlight',...item.xyz);
    e.addComponent('light',{type:'omni',range:28,color:new pc.Color(...item.color),intensity:item.intensity,castShadows:false});
    this.beams.push(e);
  }
  this.stage=node(app.root,'ACTIVE MECHANICAL THEATER');
  // Physical layered theater with depth and moving lights.
  shape(this.stage,'box','Velvet backdrop',[0,0,-3.6],[23.5,10.8,.2],m.midnight);
  for(let i=-12;i<=12;i++){
   shape(this.stage,'box','Burgundy velvet pleat '+i,[i*.92,0,-3.4],[.25,9.9,.32],i%2?m.plum:m.midnight2);
  }
  shape(this.stage,'box','Orchestra floor',[0,-3.27,-.8],[24,.35,6],m.plum);
  for(let i=0;i<28;i++){
    const a=i/28*TAU;
    shape(this.stage,'sphere','Chasing marquee incandescent '+i,[Math.cos(a)*10.25,Math.sin(a)*3.28,-2.0],[.12,.12,.1],i%4?m.lightGold:m.coral);
  }
  for(const side of [-1,1]){
   shape(this.stage,'cylinder','Art deco proscenium column',[side*10.50,0,-2.2],[.45,9.3,.45],m.gold);
   for(let j=0;j<5;j++)shape(this.stage,'sphere','Column electric sapphire',[side*10.50,-3.4+j*1.70,-1.81],[.25,.25,.25],m.teal);
  }
  shape(this.stage,'box','Top giant gilded crossbar',[0,3.25,-1.8],[21.4,.25,.54],m.lightGold);
  shape(this.stage,'box','Lower bronze stage rail',[0,-2.58,-1.65],[21.5,.19,.53],m.gold);
  // A hanging cage of five 3D reels.
  this.reelCabinet=shape(this.stage,'box','Reel cabinet',[0,-.15,-1.65],[10.35,5.2,1.15],m.ink);
  this.reelTop=shape(this.stage,'box','Top marquee rim',[0,2.22,.00],[10.7,.25,.35],m.lightGold);
  this.reelBottom=shape(this.stage,'box','Bottom marquee rim',[0,-2.40,.00],[10.7,.25,.35],m.lightGold);
  this.separators=[];
  this.art={};this.resources=[];
  for(const sym of SYMBOLS){
    const {texture,material}=materialFromCanvas(app,darkCardArt(sym));
    this.art[sym]=material;this.resources.push(texture,material);
  }
  this.reels=[];
  this.mobile=false;
  const initial=generateGrid();
  for(let col=0;col<5;col++){
   const reel=node(this.stage,'Kinetic three-layer reel '+col,(col-2)*1.98,-.10,.30);
   shape(reel,'cylinder','Visible rotating reel hub',[0,0,-.63],[.60,4.2,.60],m.violet,[0,0,90]);
   const cards=[];
   for(let row=0;row<3;row++){
     const pivot=node(reel,'Volumetric glyph slab '+row,0,(1-row)*1.43,0);
     shape(pivot,'box','Solid beveled metal tile',[0,0,-.14],[1.85,1.31,.20],m.gold);
     shape(pivot,'box','Dark inset frame',[0,0,-.04],[1.76,1.23,.12],m.ink);
     const glyph=shape(pivot,'plane','Illustrated carnival emblem',[0,0,.045],[1.68,1,1.13],this.art[initial[row][col]],[90,0,0]);
     cards.push({pivot,glyph,row,current:initial[row][col],previousBand:-1});
   }
   this.reels.push({root:reel,cards,job:null});
   if(col<4)this.separators.push(shape(this.stage,'box','Reel separator '+col,[(col-1.5)*1.98,-.10,.58],[.11,4.68,.18],m.lightGold));
  }
  this.jester=createJester(app,this.stage,m);
  // Primitive stand-in is only available for engineers via ?blockout=1.
  this.blockout=new URLSearchParams(window.location.search).has('blockout');
  this.jester.r.enabled=this.blockout;
  this.jester.base.enabled=this.blockout;
  this.jester.inlay.enabled=this.blockout;
  this.jester.props.forEach(card=>card.enabled=this.blockout);
  this.productionCharacter=null;this.productionWheel=null;
  this.assetFailures=[];
  this.wheel=createWheel(app,this.stage,m);
  this.runningWheel=null;this.wheelAngle=0;this.cameraFocus=0;
  this.particles=[];
  for(let i=0;i<70;i++){
    const e=node(this.stage,'Golden flying particle '+i);
    shape(e,'sphere','Polished brass confetti',[0,0,0],[.10,.10,.07],i%5?m.gold:m.coral);
    e.enabled=false;this.particles.push({e,life:0,vx:0,vy:0,vz:0,spin:0});
  }
  this.time=0;this.emotion='idle';this.winTimer=0;this.spinResolve=null;this.spinGrid=initial;this.activeMode='idle';
  this.onUpdate=(dt)=>this.update(Math.min(.10,dt));
  app.on('update',this.onUpdate);
  app.start();
  this.resize();
  this.resizeObserver=new ResizeObserver(()=>this.resize());
  this.resizeObserver.observe(canvas.parentElement);
  this.productionArtLoad=this.loadProductionArt();
 }
 async loadProductionArt(){
  try{
    const response=await fetch('/assets/manifest.json');
    if(!response.ok)return;
    const manifest=await response.json();
    if(!manifest.productionArtReady)return;
    if(!manifest.jester?.url||!manifest.wheel?.url)throw Error('Both approved GLBs required');
    const [character,wheel]=await Promise.all([
      loadPremiumJester(this.app,this.stage,{url:manifest.jester.url}),
      loadPremiumWheel(this.app,this.stage,{url:manifest.wheel.url})
    ]);
    // Swap the two models together: don't display a mixed quality game.
    this.productionCharacter=character;this.productionWheel=wheel;
    this.jester.r.enabled=false;this.jester.base.enabled=false;this.jester.inlay.enabled=false;
    this.jester.props.forEach(card=>card.enabled=false);
    this.wheel.frame.enabled=false;this.wheel.gears.forEach(g=>g.enabled=false);
    this.wheel.frame=wheel.pivot;this.wheel.rotor=wheel.rotor;
    this._lastProductionEmotion=null;
    this.resize();
    document.documentElement.dataset.productionArt='loaded';
  }catch(error){
    this.assetFailures.push(String(error));
    document.documentElement.dataset.productionArt='missing';
    console.warn('GLB production art not ready:',error);
  }
 }
 resize(){
  const parent=this.canvas.parentElement;
  const w=Math.max(1,parent.clientWidth),h=Math.max(1,parent.clientHeight);
  this.app.resizeCanvas(w,h);
  this.canvas.style.width='100%';this.canvas.style.height='100%';this.app.updateCanvasSize();
  const aspect=w/h;
  const mobile=w<700;
  this.mobile=mobile;
  if(this.productionCharacter){if(mobile)this.productionCharacter.setMobile();else this.productionCharacter.setDesktop();}
  if(this.productionWheel){if(mobile)this.productionWheel.setMobile();else this.productionWheel.setDesktop();}
  if(mobile){
    // Portrait: a two-level 3D theater, not a far-away horizontal stage.
    this.camera.camera.fov=clamp(25+(1-aspect)*9,24,33);
    this.jester.r.setLocalPosition(-3.08,2.37,1.25);
    this.jester.r.setLocalScale(.59,.59,.59);
    this.jester.base.setLocalPosition(-3.1,.60,.65);
    this.jester.base.setLocalScale(1.35,.18,1.10);
    this.wheel.frame.setLocalPosition(3.10,2.38,.80);
    this.wheel.frame.setLocalScale(.57,.57,.57);
    this.wheel.gears.forEach(g=>{g.enabled=false;});
    this.reels.forEach((r,i)=>r.root.setLocalPosition((i-2)*1.75,-1.05,.30));
    this.reelCabinet.setLocalPosition(0,-1.10,-1.65);this.reelCabinet.setLocalScale(9.25,5.20,1.15);
    this.reelTop.setLocalPosition(0,1.27,0);this.reelTop.setLocalScale(9.4,.25,.35);
    this.reelBottom.setLocalPosition(0,-3.44,0);this.reelBottom.setLocalScale(9.4,.25,.35);
    this.separators.forEach((sep,i)=>sep.setLocalPosition((i-1.5)*1.75,-1.05,.58));
  }else{
    this.camera.camera.fov=clamp(2*Math.atan(11.25/(25*aspect))*180/Math.PI,22,65);
    this.jester.r.setLocalPosition(-7.30,-.20,1.20);this.jester.r.setLocalScale(1,1,1);
    this.jester.base.setLocalPosition(-7.3,-2.62,.65);this.jester.base.setLocalScale(2.7,.35,2.2);
    this.wheel.frame.setLocalPosition(7.42,.40,.80);this.wheel.frame.setLocalScale(1,1,1);
    this.wheel.gears.forEach(g=>{g.enabled=true;});
    this.reels.forEach((r,i)=>r.root.setLocalPosition((i-2)*1.98,-.10,.30));
    this.reelCabinet.setLocalPosition(0,-.15,-1.65);this.reelCabinet.setLocalScale(10.35,5.2,1.15);
    this.reelTop.setLocalPosition(0,2.22,0);this.reelTop.setLocalScale(10.7,.25,.35);
    this.reelBottom.setLocalPosition(0,-2.40,0);this.reelBottom.setLocalScale(10.7,.25,.35);
    this.separators.forEach((sep,i)=>sep.setLocalPosition((i-1.5)*1.98,-.10,.58));
  }
 }
 setEmotion(next){this.emotion=next;}
 spin(grid,{turbo=false}={}){
  if(this.spinResolve||this.runningWheel)throw Error('Already animating');
  this.spinGrid=grid;this.emotion='spin';
  return new Promise(resolve=>{
   this.spinResolve=resolve;
   this.reels.forEach((reel,i)=>reel.job={elapsed:0,duration:(turbo?.62:1.70)+i*(turbo?.13:.27),band:-1,stopped:false});
  });
 }
 async playBonusWheel(){
  if(this.runningWheel||this.spinResolve)throw Error('Stage busy');
  this.emotion='bonus';
  const index=Math.floor(secureFloat()*SLICES.length);
  return new Promise(resolve=>{
   const start=this.wheelAngle;
   const final=(Math.ceil(start/360)+6)*360-index*(360/SLICES.length);
   this.runningWheel={elapsed:0,duration:5.2,start,final,index,resolve};
  });
 }
 explode(amount=1){
  this.emotion='win';this.winTimer=2.9;
  for(const p of this.particles){
    p.life=.9+secureFloat()*1.65;
    p.vx=(secureFloat()-.5)*15;p.vy=3+secureFloat()*10;p.vz=secureFloat()*3;
    p.e.setLocalPosition((secureFloat()-.5)*8,-1,2+secureFloat());
    p.e.enabled=true;
  }
 }
 update(dt){
  this.time+=dt;const t=this.time;
  const j=this.jester,emotion=this.emotion;
  const stageWave=emotion==='bonus'?1:emotion==='win'?.86:emotion==='spin'?.5:.2;
  j.bob.setLocalPosition(0,Math.sin(t*2)*.06+stageWave*Math.sin(t*9)*.09,0);
  j.bob.setLocalEulerAngles(0,Math.sin(t*.65)*6,Math.sin(t*1.15)*3+stageWave*8*Math.sin(t*5));
  j.head.setLocalEulerAngles(-4+Math.sin(t*1.8)*5,Math.sin(t*.92)*9,emotion==='bonus'?-13:Math.sin(t*2)*7);
  j.mouth.setLocalScale(.50,emotion==='win'||emotion==='bonus'?.22:.13,.17);
  j.arms[0].setLocalEulerAngles(0,0,-20+Math.sin(t*2.2)*11+(emotion==='win'?-75:emotion==='bonus'?-30:0));
  j.arms[1].setLocalEulerAngles(0,0,20+Math.sin(t*2.4+1)*12+(emotion==='bonus'?92:emotion==='spin'?30:emotion==='win'?100:0));
  j.legs.forEach((leg,i)=>leg.setLocalEulerAngles(0,0,Math.sin(t*2+i*Math.PI)*5));
  j.horns.forEach((horn,i)=>horn.setLocalEulerAngles(Math.sin(t*3.6+i)*13,0,Math.sin(t*4+i)*17));
  if(this.productionCharacter && this._lastProductionEmotion!==this.emotion){
    this.productionCharacter.pose(this.emotion);
    this._lastProductionEmotion=this.emotion;
  }
  j.props.forEach((card,i)=>{
   const a=t*(emotion==='bonus'?2.4:.7)+i*TAU/4;
   if(this.mobile)card.setLocalPosition(-3.1+Math.cos(a)*1.08,3.45+Math.sin(a)*.45,2.55+Math.sin(a*2)*.10);
   else card.setLocalPosition(-7.25+Math.cos(a)*(1.55+.22*Math.sin(t)),1.50+Math.sin(a)*.72,2.5+Math.sin(a*2)*.18);
   card.setLocalEulerAngles(t*48+i*15,t*73,i*36);
  });
  this.wheel.gears.forEach((gear,i)=>gear.setLocalEulerAngles(0,0,t*(i?40:-34)));
  if(!this.runningWheel)this.wheelAngle+=dt*3.1;
  else {
    const w=this.runningWheel;
    w.elapsed+=dt;
    const progress=clamp(w.elapsed/w.duration,0,1);
    this.wheelAngle=w.start+(w.final-w.start)*easeOut(progress);
    this.cameraFocus=smooth(Math.min(1,w.elapsed/.9))*(1-smooth((w.elapsed-(w.duration-.75))/.75));
    if(progress>=1){
      this.wheelAngle=w.final;
      this.runningWheel=null;
      const prize=SLICES[w.index];
      w.resolve({freeSpins:prize,index:w.index});
      this.emotion='win';this.winTimer=1.75;this.explode(.5);
    }
  }
  this.wheel.rotor.setLocalEulerAngles(0,0,this.wheelAngle);
  // Cinematic camera orbit and dolly; framed to keep all reels legible.
  const n=this.cameraFocus;
  if(this.mobile){
    this.camera.setLocalPosition(.38*n,Math.sin(t*.27)*.06,25-1.4*n);
    this.camera.lookAt(1.25*n,0,0);
  }else{
    this.camera.setLocalPosition(2.1*n,Math.sin(t*.27)*.10,25-4.3*n);
    this.camera.lookAt(4.7*n,0,0);
  }
  this.beams[0].light.intensity=1.2+Math.sin(t*3.7)*.31+stageWave*.17;
  this.beams[1].light.intensity=1.2+Math.sin(t*4.2+1)*.35+stageWave*.25;
  this.beams[2].light.intensity=1.1+Math.sin(t*2.2)*.14;
  let finished=0;
  for(let i=0;i<this.reels.length;i++){
    const reel=this.reels[i],job=reel.job;
    if(!job){finished++;continue;}
    job.elapsed+=dt;
    const progress=clamp(job.elapsed/job.duration,0,1);
    const power=progress<.72?1:1-smooth((progress-.72)/.28);
    const travel=job.elapsed*(job.duration<1.5?12:8);
    const band=Math.floor(travel);
    for(const card of reel.cards){
      if(band!==card.previousBand){
        card.glyph.render.material=this.art[SYMBOLS[Math.floor(secureFloat()*SYMBOLS.length)]];
        card.previousBand=band;
      }
      const offset=((1-card.row)*1.43-travel+50*4.29)%4.29;
      let y=offset>2.145?offset-4.29:offset;
      const p=card.pivot;
      if(progress<.93){
       p.setLocalPosition(0,y*.97,-.15+.36*Math.sin(travel*1.1));
       p.setLocalEulerAngles(-power*24*Math.sin(travel),0,power*3*Math.sin(t*9+i));
      }else{
       const landing=smooth((progress-.93)/.07);
       p.setLocalPosition(0,y*(1-landing)+(1-card.row)*1.43*landing,-.15*(1-landing));
       p.setLocalEulerAngles(-power*24*(1-landing),0,0);
      }
    }
    if(progress>=1){
      reel.job=null;
      for(const card of reel.cards){
       card.pivot.setLocalPosition(0,(1-card.row)*1.43,0);
       card.pivot.setLocalEulerAngles(0,0,0);
       card.glyph.render.material=this.art[this.spinGrid[card.row][i]];
       card.previousBand=-1;
      }
      finished++;
    }
  }
  if(finished===5&&this.spinResolve){
    const resolve=this.spinResolve;this.spinResolve=null;resolve();
    if(!this.runningWheel)this.emotion='idle';
  }
  if(this.winTimer>0){
    this.winTimer-=dt;if(this.winTimer<=0&&this.emotion==='win')this.emotion='idle';
  }
  for(const p of this.particles){
    if(p.life<=0)continue;
    p.life-=dt;
    const v=p.e.getLocalPosition();p.vy-=11*dt;
    p.e.setLocalPosition(v.x+p.vx*dt,v.y+p.vy*dt,v.z+p.vz*dt);
    p.spin+=dt*540;p.e.setLocalEulerAngles(p.spin,p.spin*.7,0);
    if(p.life<=0)p.e.enabled=false;
  }
 }
 // Keep old API compatible for the UI layer.
 animateWin(amount){this.explode(amount);}
 destroy(){
  this.productionCharacter?.destroy();this.productionWheel?.destroy();
  this.resizeObserver?.disconnect();
  this.app.off('update',this.onUpdate);
  this.app.destroy();
 }
}
