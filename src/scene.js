import * as pc from 'playcanvas';
import {SYMBOLS,generateGrid} from './game.js';
import {drawTile} from './art.js';

const TAU=Math.PI*2;
function material(color,metalness=0) {
 const m=new pc.StandardMaterial();
 m.diffuse=new pc.Color(...color);
 m.metalness=metalness*.25;
 m.gloss=metalness?55:35;
 m.useMetalness=metalness>0;
 m.update();
 return m;
}
function mesh(app,parent,type,name,position,scale,mat) {
 const e=new pc.Entity(name);
 e.addComponent('render',{type,material:mat});
 e.setLocalPosition(...position);
 e.setLocalScale(...scale);
 parent.addChild(e);return e;
}
function tileMaterial(app,canvas){
 const tex=new pc.Texture(app.graphicsDevice,{width:canvas.width,height:canvas.height,format:pc.PIXELFORMAT_R8_G8_B8_A8,mipmaps:true,minFilter:pc.FILTER_LINEAR_MIPMAP_LINEAR,magFilter:pc.FILTER_LINEAR,addressU:pc.ADDRESS_CLAMP_TO_EDGE,addressV:pc.ADDRESS_CLAMP_TO_EDGE});
 tex.setSource(canvas);
 const m=new pc.StandardMaterial();
 m.diffuseMap=tex;
 m.emissiveMap=tex;
 m.emissive=new pc.Color(1,1,1);
 m.emissiveIntensity=1;
 m.useLighting=false; // preserve procedural illustration colors
 m.useSkybox=false;
 m.useTonemap=false;
 m.cull=pc.CULLFACE_NONE;
 m.update();
 return {texture:tex,material:m};
}
export class SlotScene {
 constructor(canvas){
   this.canvas=canvas;
   this.app=new pc.Application(canvas,{graphicsDeviceOptions:{antialias:true,alpha:true}});
   this.app.graphicsDevice.maxPixelRatio=Math.min(window.devicePixelRatio||1,2);
   this.app.setCanvasFillMode(pc.FILLMODE_NONE);
   this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
   const app=this.app;
   app.scene.ambientLight=new pc.Color(.27,.33,.46);
   const camera=new pc.Entity('Theater perspective camera');
   camera.addComponent('camera',{fov:17.5,nearClip:.1,farClip:100,clearColor:new pc.Color(.025,.025,.13,1)});
   camera.setLocalPosition(0,0,21);camera.lookAt(0,0,0);app.root.addChild(camera);this.camera=camera;
   this.lights=[];
   const lights=[
    {pos:[-6,6,12],color:[.3,.65,1],strength:.55},
    {pos:[6,5,10],color:[1,.38,.7],strength:.62},
    {pos:[0,5,11],color:[1,.8,.45],strength:.35}
   ];
   lights.forEach((l,i)=>{const e=new pc.Entity('Theater light '+i);e.addComponent('light',{type:'omni',color:new pc.Color(...l.color),intensity:l.strength,range:25,castShadows:false});e.setLocalPosition(...l.pos);app.root.addChild(e);this.lights.push(e);});
   this.gold=material([.95,.58,.18],.55);
   this.pink=material([.88,.10,.4],.15);
   this.blue=material([.07,.34,.78],.25);
   this.purple=material([.25,.09,.48],.25);
   this.reels=[];
   this.art={};
   this.resourcePool=[];
   SYMBOLS.forEach(symbol=>{
      const {texture,material:mat}=tileMaterial(app,drawTile(symbol));
      this.art[symbol]=mat;this.resourcePool.push(texture,mat);
   });
   const initial=generateGrid();
   for(let col=0;col<5;col++){
     const root=new pc.Entity('3D reel '+(col+1));
     root.setLocalPosition((col-2)*2.35,0,0);
     app.root.addChild(root);
     // Real three-dimensional drum, axle and metallic end caps.
     mesh(app,root,'cylinder','spinning cylinder',[0,0,0],[6.10,2.00,6.10],this.blue).setLocalEulerAngles(0,0,90);
     mesh(app,root,'cylinder','hub',[0,0,0],[.14,.38,.38],this.gold).setLocalEulerAngles(0,0,90);
     const tiles=[];
     for(let index=0;index<12;index++){
       const angle=TAU*index/12;
       const center=new pc.Entity('segment '+index);
       center.setLocalPosition(0,Math.sin(angle)*3.05,Math.cos(angle)*3.05);
       center.setLocalEulerAngles(-angle*180/Math.PI,0,0);
       root.addChild(center);
       mesh(app,center,'box','beveled gold tile back',[0,0,-.085],[2.02,1.88,.13],this.gold);
       const sprite=mesh(app,center,'plane','textured symbol',[0,0,.035],[1.92,1.76,1],this.art[SYMBOLS[(index+col)%SYMBOLS.length]]);
       sprite.setLocalEulerAngles(90,0,0); // PlayCanvas planes face +Y by default.
       tiles.push(sprite);
     }
     this.reels.push({root,tiles,angle:0,job:null});
   }
   // Animated 3D gemstones and little pendants flanking the drum.
   this.decor=[];
   for(const side of [-1,1]){
      const pivot=new pc.Entity('hanging jewel');
      pivot.setLocalPosition(side*6.65,0,1.5);app.root.addChild(pivot);
      mesh(app,pivot,'sphere','glass ruby',[0,0,0],[.84,.98,.58],side<0?this.pink:this.purple);
      mesh(app,pivot,'cone','gold finial',[0,.65,0],[.57,.56,.57],this.gold);
      mesh(app,pivot,'cone','gold base',[0,-.65,0],[.52,.56,.52],this.gold).setLocalEulerAngles(0,0,180);
      this.decor.push(pivot);
   }
   this.coins=[];
   for(let i=0;i<48;i++){
     const holder=new pc.Entity('winning coin '+i);
     app.root.addChild(holder);
     const coin=mesh(app,holder,'cylinder','3D coin',[0,0,0],[.36,.065,.36],this.gold);
     coin.setLocalEulerAngles(90,0,0);
     holder.enabled=false;
     this.coins.push({holder,life:0,velocity:[0,0],spin:0});
   }
   this.burstTime=0;
   this.time=0;
   this.pendingResolve=null;
   this.setGrid(initial);
   this.onUpdate=(dt)=>this.update(Math.min(dt,.05));
   app.on('update',this.onUpdate);
   app.start();
   this.resize();
   this.resizeObserver=new ResizeObserver(()=>this.resize());
   this.resizeObserver.observe(canvas.parentElement);
 }
 resize(){
  const width=Math.max(1,this.canvas.clientWidth);
  const height=Math.max(1,this.canvas.clientHeight);
  this.app.resizeCanvas(width,height);
  // FOV adjusts to portrait screens, preventing hidden outer reels.
  const aspect=width/height;
  this.camera.camera.fov=Math.max(17.5,Math.min(65,14.9/aspect));
 }
 setGrid(grid){
  if(this.reels.some(r=>r.job))return;
  this.reels.forEach((reel,col)=>{
    for(let i=0;i<reel.tiles.length;i++){
      const symbol=(i===0)?grid[1][col]:(i===1)?grid[0][col]:(i===11)?grid[2][col]:SYMBOLS[(i*3+col)%SYMBOLS.length];
      reel.tiles[i].render.material=this.art[symbol];
    }
    reel.root.setLocalEulerAngles(0,0,0);
  });
 }
 spin(grid,{turbo=false}={}){
  if(this.pendingResolve)throw Error('Already spinning');
  return new Promise(resolve=>{
    this.pendingResolve=resolve;
    this.targetGrid=grid;
    this.reels.forEach((reel,i)=>{reel.job={elapsed:0,duration:(turbo?.52:1.55)+i*(turbo?.11:.26),previous:0,done:false};});
  });
 }
 animateWin(amount){
   this.burstTime=2.35;
   for(let i=0;i<this.coins.length;i++){
     const item=this.coins[i],a=(i/this.coins.length)*TAU;
     item.holder.enabled=true;
     item.holder.setLocalPosition((Math.random()-.5)*9,Math.random()*2,3.8+Math.random());
     item.velocity=[Math.cos(a)*(3+Math.random()*4),Math.sin(a)*(3+Math.random()*5)+3];
     item.spin=Math.random()*360;
     item.life=1.0+Math.random()*1.1;
   }
   this.winStrength=Math.min(1.2,amount/20);
 }
 update(dt){
  this.time+=dt;
  this.decor.forEach((p,i)=>{p.setLocalEulerAngles(Math.sin(this.time*1.4+i)*10,this.time*(i?36:-36),Math.sin(this.time*2+i)*13);p.setLocalPosition((i?1:-1)*6.65,Math.sin(this.time*1.8+i)*.33,1.5);});
  let done=0;
  this.reels.forEach((reel,i)=>{
   const j=reel.job;
   if(!j){done++;return;}
   j.elapsed+=dt;
   const t=Math.min(1,j.elapsed/j.duration);
   // Fast accelerating whirls followed by slightly elastic snap.
   const spin=5+i; // integer turns avoid a visible jump when the drum settles
   const progress=t<.75?t/.75*.90:.9+.1*(1-Math.pow(1-(t-.75)/.25,3));
   let angle=progress*spin*360;
   if(t<1)angle+=Math.sin(t*42)*Math.min(12,(1-t)*14);
   reel.root.setLocalEulerAngles(angle,0,0);
   if(t>=1){
     reel.job=null;
     this.reels[i].root.setLocalEulerAngles(0,0,0);
     for(const index of [0,1,11]){
        const row=index===0?1:index===1?0:2;
        reel.tiles[index].render.material=this.art[this.targetGrid[row][i]];
     }
     done++;
   }
  });
  if(done===5&&this.pendingResolve){
    const resolve=this.pendingResolve;
    this.pendingResolve=null;
    resolve();
  }
  if(this.burstTime>0){
    this.burstTime=Math.max(0,this.burstTime-dt);
    const shake=Math.sin(this.time*56)*Math.min(.55,this.burstTime*.32);
    this.camera.setLocalEulerAngles(0,shake,0);
    this.camera.camera.fov= this.camera.camera.fov+(this.burstTime>1.4?-0.03:0.04)*dt*25;
    this.coins.forEach(item=>{
      if(item.life<=0){item.holder.enabled=false;return;}
      item.life-=dt;
      const pos=item.holder.getLocalPosition();
      item.velocity[1]-=10*dt;
      item.holder.setLocalPosition(pos.x+item.velocity[0]*dt,pos.y+item.velocity[1]*dt,pos.z);
      item.spin+=420*dt;
      item.holder.setLocalEulerAngles(item.spin,item.spin*.6,0);
      if(item.life<=0)item.holder.enabled=false;
    });
  } else {
     this.camera.setLocalEulerAngles(0,Math.sin(this.time*.26)*.2,0);
  }
  this.lights[1].light.intensity=.62+Math.sin(this.time*3.9)*.09;
 }
 destroy(){
  this.resizeObserver?.disconnect();
  this.app.off('update',this.onUpdate);
  this.app.destroy();
 }
}
