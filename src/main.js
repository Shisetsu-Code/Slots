import './style.css';
import {SlotScene} from './scene.js';
import {BET_OPTIONS,generateGrid,evaluateGrid,roundedMoney} from './game.js';

const $=(id)=>document.getElementById(id);
const money=(n)=>Number(n).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
const state={credits:1000,betIndex:3,lastWin:0,freeSpins:0,spinning:false,turbo:false,auto:false,sound:false};
let scene=null,autoTimer=null,winTimer=null,toastTimer=null,audioContext=null;
const elements={
 cabinet:$('cabinet'),credits:$('credits'),bet:$('bet-amount'),win:$('last-win'),spin:$('spin-button'),
 minus:$('bet-minus'),plus:$('bet-plus'),buy:$('buy-feature'),auto:$('auto-button'),turbo:$('turbo-button'),
 sound:$('sound-button'),status:$('status'),toast:$('toast'),free:$('free-spins'),
 lines:$('win-lines'),banner:$('big-win'),bannerTitle:$('big-win-title'),bannerValue:$('big-win-value'),
 buyDialog:$('buy-dialog'),rulesDialog:$('rules-dialog')
};
const getBet=()=>BET_OPTIONS[state.betIndex];
function status(message){elements.status.textContent=message;}
function toast(message){
 clearTimeout(toastTimer);elements.toast.textContent=message;elements.toast.classList.add('visible');
 toastTimer=setTimeout(()=>elements.toast.classList.remove('visible'),2300);
}
function refresh(){
 elements.credits.textContent=money(state.credits);
 elements.bet.textContent=money(getBet());
 elements.win.textContent=money(state.lastWin);
 elements.spin.classList.toggle('spinning',state.spinning);
 elements.spin.disabled=state.spinning;
 elements.minus.disabled=state.spinning||state.freeSpins>0||state.betIndex===0;
 elements.plus.disabled=state.spinning||state.freeSpins>0||state.betIndex===BET_OPTIONS.length-1;
 elements.buy.disabled=state.spinning||state.freeSpins>0||state.credits<getBet()*40;
 elements.turbo.setAttribute('aria-pressed',String(state.turbo));
 elements.auto.setAttribute('aria-pressed',String(state.auto));
 elements.sound.setAttribute('aria-pressed',String(state.sound));
 elements.free.textContent=state.freeSpins>0?'✦ GIROS GRATIS RESTANTES: '+state.freeSpins+' ✦':'';
 elements.free.classList.toggle('visible',state.freeSpins>0);
}
function tone(freq=450,seconds=.11,type='sine',volume=.045){
 if(!state.sound)return;
 try{
  audioContext??=new (window.AudioContext||window.webkitAudioContext)();
  if(audioContext.state==='suspended')audioContext.resume();
  const osc=audioContext.createOscillator(),gain=audioContext.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,audioContext.currentTime);
  gain.gain.setValueAtTime(volume,audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+seconds);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();osc.stop(audioContext.currentTime+seconds);
 }catch{/* optional sound */}
}
function celebrate(result){
 clearTimeout(winTimer);
 elements.lines.replaceChildren();
 const paylines=new Set(result.wins.map(w=>w.lineIndex));
 paylines.forEach(i=>{const line=document.createElement('div');line.className='line p'+i;elements.lines.appendChild(line);});
 if(result.total>0){
  elements.bannerTitle.textContent=result.total>=getBet()*20?'¡PREMIO ÉPICO!':result.total>=getBet()*8?'¡GRAN PREMIO!':'¡GANASTE!';
  elements.bannerValue.textContent='+'+money(result.total);
  elements.banner.classList.add('show');
  elements.cabinet.classList.add('celebrating');
  scene.animateWin(result.total);
  [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.19,'triangle',.055),i*115));
 }
 winTimer=setTimeout(()=>{elements.lines.replaceChildren();elements.banner.classList.remove('show');elements.cabinet.classList.remove('celebrating');},state.turbo?1000:1750);
}
function scheduleNext(){
 clearTimeout(autoTimer);
 if(state.freeSpins>0||state.auto){
    autoTimer=setTimeout(()=>{if(!state.spinning&&!document.querySelector('dialog[open]'))runSpin();},state.turbo?260:1350);
 }
}
async function runSpin(){
 if(state.spinning||!scene)return;
 const bet=getBet(),free=state.freeSpins>0;
 if(!free&&state.credits<bet){state.auto=false;refresh();toast('CRÉDITOS INSUFICIENTES PARA GIRAR');return;}
 if(free)state.freeSpins--;
 else state.credits=roundedMoney(state.credits-bet);
 clearTimeout(autoTimer);clearTimeout(winTimer);
 elements.lines.replaceChildren();elements.banner.classList.remove('show');elements.cabinet.classList.remove('celebrating');
 state.spinning=true;state.lastWin=0;
 refresh();status(free?'✦ GIRANDO BONUS — BUENA SUERTE ✦':'LOS RODILLOS ESTÁN GIRANDO...');
 tone(220,.24,'sawtooth',.02);
 const grid=generateGrid();
 try{
  await scene.spin(grid,{turbo:state.turbo});
  const result=evaluateGrid(grid,bet);
  state.credits=roundedMoney(state.credits+result.total);
  state.lastWin=result.total;
  if(result.freeSpinsAward){
    state.freeSpins+=result.freeSpinsAward;
    toast('¡3 SCATTERS! +'+result.freeSpinsAward+' GIROS GRATUITOS');
    tone(880,.4,'triangle',.07);
  }
  if(result.total>0){celebrate(result);status('¡'+result.wins.length+' LÍNEA(S) GANADORA(S)! PREMIO: '+money(result.total));}
  else if(result.freeSpinsAward)status('¡BONUS ACTIVADO!');
  else status(free?'FIN DEL GIRO GRATIS':'PRESIONÁ GIRAR PARA VOLVER A JUGAR');
 }catch(err){
  state.auto=false;
  status('NO SE PUDO FINALIZAR LA ANIMACIÓN');
  console.error(err);
 }finally{
  state.spinning=false;refresh();scheduleNext();
 }
}
elements.spin.addEventListener('click',runSpin);
elements.minus.addEventListener('click',()=>{if(state.spinning||state.freeSpins)return;state.betIndex=Math.max(0,state.betIndex-1);refresh();tone(360);});
elements.plus.addEventListener('click',()=>{if(state.spinning||state.freeSpins)return;state.betIndex=Math.min(BET_OPTIONS.length-1,state.betIndex+1);refresh();tone(520);});
elements.turbo.addEventListener('click',()=>{state.turbo=!state.turbo;refresh();toast(state.turbo?'TURBO ACTIVADO':'TURBO DESACTIVADO');});
elements.auto.addEventListener('click',()=>{state.auto=!state.auto;clearTimeout(autoTimer);refresh();if(state.auto&&!state.spinning)scheduleNext();});
elements.sound.addEventListener('click',()=>{state.sound=!state.sound;refresh();tone(670);});
elements.buy.addEventListener('click',()=>{
 if(state.spinning||state.freeSpins)return;
 $('bonus-cost').textContent=money(getBet()*40);
 elements.buyDialog.showModal();
});
$('buy-cancel').addEventListener('click',()=>elements.buyDialog.close());
$('buy-confirm').addEventListener('click',()=>{
 elements.buyDialog.close();
 const cost=roundedMoney(getBet()*40);
 if(state.credits<cost||state.spinning||state.freeSpins)return;
 state.credits=roundedMoney(state.credits-cost);
 state.freeSpins+=8;
 state.auto=false;
 refresh();toast('¡8 GIROS DE DEMOSTRACIÓN DESBLOQUEADOS!');
 tone(880,.4,'triangle',.08);
 scene.animateWin(cost);
 scheduleNext();
});
$('info-button').addEventListener('click',()=>elements.rulesDialog.showModal());
$('rules-close').addEventListener('click',()=>elements.rulesDialog.close());
window.addEventListener('keydown',e=>{
 if(e.code==='Space'&&!e.repeat&&!e.target.closest('button,dialog,input,textarea')){
  e.preventDefault();runSpin();
 }
});
window.addEventListener('pagehide',()=>{clearTimeout(autoTimer);clearTimeout(winTimer);scene?.destroy();},{once:true});
refresh();
try{
 scene=new SlotScene($('game-canvas'));
 status('PRESIONÁ GIRAR PARA COMENZAR EL ESPECTÁCULO');
}catch(error){
 console.error('PlayCanvas initialization failed',error);
 status('NO SE PUDO INICIAR WEBGL. ACTIVÁ ACELERACIÓN GRÁFICA EN TU NAVEGADOR.');
 elements.spin.disabled=true;
 toast('SE REQUIERE WEBGL PARA EL SLOT 3D');
}
