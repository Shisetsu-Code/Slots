import './style.css';
import './v2.css';
import {SlotScene} from './scene-v2.js';
import {BET_OPTIONS,generateGrid,evaluateGrid,roundedMoney} from './game.js';

const $=id=>document.getElementById(id);
const money=n=>Number(n).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
const state={credits:1000,betIndex:3,lastWin:0,freeSpins:0,spinning:false,turbo:false,auto:false,sound:false,bonus:false};
let scene,autoTimer,winTimer,toastTimer,speechTimer,audioContext;
const el={
 cabinet:$('cabinet'),credits:$('credits'),bet:$('bet-amount'),win:$('last-win'),spin:$('spin-button'),
 minus:$('bet-minus'),plus:$('bet-plus'),buy:$('buy-feature'),auto:$('auto-button'),turbo:$('turbo-button'),
 sound:$('sound-button'),status:$('status'),toast:$('toast'),free:$('free-spins'),
 lines:$('win-lines'),banner:$('big-win'),bannerTitle:$('big-win-title'),bannerValue:$('big-win-value'),
 buyDialog:$('buy-dialog'),rulesDialog:$('rules-dialog'),speech:$('jester-speech'),wheel:$('wheel-outcome')
};
const getBet=()=>BET_OPTIONS[state.betIndex];
function status(text){el.status.textContent=text;}
function toast(text){
 clearTimeout(toastTimer);el.toast.textContent=text;el.toast.classList.add('visible');
 toastTimer=setTimeout(()=>el.toast.classList.remove('visible'),3100);
}
function say(text){
 clearTimeout(speechTimer);
 if(!el.speech)return;
 el.speech.textContent=text;el.speech.classList.add('speaking');
 speechTimer=setTimeout(()=>el.speech.classList.remove('speaking'),3600);
}
function refresh(){
 el.credits.textContent=money(state.credits);el.bet.textContent=money(getBet());
 el.win.textContent=money(state.lastWin);
 el.spin.classList.toggle('spinning',state.spinning);
 el.spin.disabled=state.spinning||state.bonus;
 el.minus.disabled=state.spinning||state.bonus||state.freeSpins>0||state.betIndex===0;
 el.plus.disabled=state.spinning||state.bonus||state.freeSpins>0||state.betIndex===BET_OPTIONS.length-1;
 el.buy.disabled=state.spinning||state.bonus||state.freeSpins>0||state.credits<getBet()*40;
 el.turbo.setAttribute('aria-pressed',String(state.turbo));
 el.auto.setAttribute('aria-pressed',String(state.auto));
 el.sound.setAttribute('aria-pressed',String(state.sound));
 el.free.textContent=state.freeSpins>0?'✦ '+state.freeSpins+' GIROS DEL CARNAVAL ✦':'';
 el.free.classList.toggle('visible',state.freeSpins>0);
}
function tone(freq=450,duration=.12,type='sine',volume=.05){
 if(!state.sound)return;
 try{
   audioContext??=new (window.AudioContext||window.webkitAudioContext)();
   if(audioContext.state==='suspended')audioContext.resume();
   const osc=audioContext.createOscillator(),gain=audioContext.createGain();
   osc.type=type;osc.frequency.setValueAtTime(freq,audioContext.currentTime);
   gain.gain.setValueAtTime(volume,audioContext.currentTime);
   gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);
   osc.connect(gain).connect(audioContext.destination);
   osc.start();osc.stop(audioContext.currentTime+duration);
 }catch{}
}
function fanfare(){
 [392,523,659,784,1047,1318].forEach((f,i)=>setTimeout(()=>tone(f,.24,'triangle',.07),i*145));
}
function clearWin(){
 clearTimeout(winTimer);
 el.lines.replaceChildren();el.banner.classList.remove('show');el.cabinet.classList.remove('celebrating');
}
function celebrate(result){
 clearWin();
 const paylines=new Set(result.wins.map(x=>x.lineIndex));
 paylines.forEach(i=>{const line=document.createElement('div');line.className='line p'+i;el.lines.appendChild(line);});
 if(result.total>0){
   el.bannerTitle.textContent=result.total>=getBet()*20?'¡LOCURA TOTAL!':result.total>=getBet()*8?'¡GRAN ACTO!':'¡BRAVO!';
   el.bannerValue.textContent='+'+money(result.total);
   el.banner.classList.add('show');el.cabinet.classList.add('celebrating');
   scene.animateWin(result.total);fanfare();
   say(result.total>=getBet()*8?'¡DE PIE, MI QUERIDO PÚBLICO!':'¡AH, QUÉ ESPECTÁCULO!');
 }
 winTimer=setTimeout(clearWin,state.turbo?1400:2600);
}
function scheduleNext(){
 clearTimeout(autoTimer);
 if(state.bonus||state.spinning||document.querySelector('dialog[open]'))return;
 if(state.freeSpins>0||state.auto){
   autoTimer=setTimeout(()=>{if(!state.spinning&&!state.bonus&&!document.querySelector('dialog[open]'))runSpin();},state.turbo?380:1750);
 }
}
async function bonusShow(){
 if(state.bonus||!scene)return;
 state.bonus=true;clearTimeout(autoTimer);refresh();clearWin();
 status('🎭 EL BUFÓN PRESENTA LA RUEDA DEL DESTINO');
 say('¡QUE GIRE LA RUEDA DE LA LOCURA!');
 el.wheel.classList.add('active');el.wheel.textContent='GIRANDO LA RUEDA...';
 tone(310,.5,'sawtooth',.03);
 try{
   const reward=await scene.playBonusWheel();
   state.freeSpins+=reward.freeSpins;
   el.wheel.textContent='+'+reward.freeSpins+' GIROS GRATIS';
   status('LA RUEDA TE REGALÓ '+reward.freeSpins+' GIROS GRATIS');
   say('¡'+reward.freeSpins+' GIROS! ¡EL SHOW DEBE CONTINUAR!');
   fanfare(); // Winner is already displayed by the 3D wheel and dialogue.
   await new Promise(resolve=>setTimeout(resolve,1500));
 }finally{
   state.bonus=false;el.wheel.classList.remove('active');
   refresh();scheduleNext();
 }
}
async function runSpin(){
 if(state.spinning||state.bonus||!scene)return;
 const bet=getBet(),free=state.freeSpins>0;
 if(!free&&state.credits<bet){state.auto=false;refresh();toast('NO QUEDAN CRÉDITOS DE DEMOSTRACIÓN');return;}
 if(free)state.freeSpins--;
 else state.credits=roundedMoney(state.credits-bet);
 clearTimeout(autoTimer);clearWin();
 state.spinning=true;state.lastWin=0;refresh();
 status(free?'EL GRAN SHOW: GIRO GRATIS':'LOS MECANISMOS COBRAN VIDA...');
 if(!free)say('¡OBSERVEN MIS RODILLOS ENCANTADOS!');
 tone(190,.35,'sawtooth',.03);
 const grid=generateGrid();
 try{
   await scene.spin(grid,{turbo:state.turbo});
   const result=evaluateGrid(grid,bet);
   state.credits=roundedMoney(state.credits+result.total);
   state.lastWin=result.total;
   if(result.total>0){celebrate(result);status('¡'+result.wins.length+' LÍNEA(S) PREMIADAS! +'+money(result.total));}
   else status(free?'EL GRAN SHOW CONTINÚA':'TOCÁ GIRAR PARA INVOCAR LA SUERTE');
   if(result.freeSpinsAward){toast('¡SCATTER! SE ABRE LA RUEDA DEL DESTINO');}
   state.spinning=false;refresh();
   if(result.freeSpinsAward)await bonusShow();
   else scheduleNext();
 }catch(err){
   console.error(err);state.auto=false;state.spinning=false;state.bonus=false;
   status('NO SE PUDO COMPLETAR LA ANIMACIÓN');refresh();
 }
}
el.spin.addEventListener('click',runSpin);
el.minus.addEventListener('click',()=>{if(state.spinning||state.bonus||state.freeSpins)return;state.betIndex=Math.max(0,state.betIndex-1);refresh();tone(355);});
el.plus.addEventListener('click',()=>{if(state.spinning||state.bonus||state.freeSpins)return;state.betIndex=Math.min(BET_OPTIONS.length-1,state.betIndex+1);refresh();tone(570);});
el.turbo.addEventListener('click',()=>{state.turbo=!state.turbo;refresh();toast(state.turbo?'TURBO ACTIVADO':'TURBO DESACTIVADO');});
el.auto.addEventListener('click',()=>{state.auto=!state.auto;clearTimeout(autoTimer);refresh();if(state.auto&&!state.spinning&&!state.bonus)scheduleNext();});
el.sound.addEventListener('click',()=>{state.sound=!state.sound;refresh();tone(900);});
el.buy.addEventListener('click',()=>{
 if(state.spinning||state.bonus||state.freeSpins)return;
 $('bonus-cost').textContent=money(getBet()*40);
 el.buyDialog.showModal();
});
$('buy-cancel').addEventListener('click',()=>el.buyDialog.close());
$('buy-confirm').addEventListener('click',async()=>{
 el.buyDialog.close();
 const cost=roundedMoney(getBet()*40);
 if(state.credits<cost||state.spinning||state.bonus||state.freeSpins)return;
 state.credits=roundedMoney(state.credits-cost);
 state.auto=false;refresh();await bonusShow();
});
$('info-button').addEventListener('click',()=>el.rulesDialog.showModal());
$('rules-close').addEventListener('click',()=>el.rulesDialog.close());
window.addEventListener('keydown',e=>{
 if((e.code==='Space'||e.code==='Enter')&&!e.repeat&&!e.target.closest('button,dialog,input,textarea')){
  e.preventDefault();runSpin();
 }
});
window.addEventListener('pagehide',()=>{clearTimeout(autoTimer);clearTimeout(winTimer);clearTimeout(speechTimer);scene?.destroy();},{once:true});
refresh();
try{
 scene=new SlotScene($('game-canvas'));
 status('LAS CORTINAS ESTÁN ABIERTAS. ¡QUE EMPIECE EL SHOW!');
 say('¡BIENVENIDOS AL CARNAVAL DE LA LOCURA!');
}catch(e){
 console.error('PlayCanvas initialization failed',e);
 status('ERROR AL INICIAR WEBGL: REVISÁ LA ACELERACIÓN GRÁFICA.');
 el.spin.disabled=true;toast('SE NECESITA WEBGL PARA ESTE SHOW 3D');
}
