// Pure demo-only game rules; never use client results for wagering.
export const SYMBOLS = ['JOKER','CROWN','DIAMOND','SEVEN','BELL','HEART','STAR','A','K','Q','SCATTER'];
export const WEIGHTS = [1,3,5,5,7,7,8,12,12,12,3];
export const BET_OPTIONS = [0.20,0.40,0.60,1,2,5,10,20,50];
export const LINES = [[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2]];
// Multipliers use the entire stake, not the line stake. Illustrative, not RTP-calibrated.
export const PAY = {
 JOKER:[0,0,8,24,60],CROWN:[0,0,4,10,25],DIAMOND:[0,0,3,7,18],
 SEVEN:[0,0,5,12,30],BELL:[0,0,2.5,6,15],HEART:[0,0,2,5,12],
 STAR:[0,0,2,5,12],A:[0,0,1,2.5,6],K:[0,0,1,2.5,6],Q:[0,0,1,2.5,6]
};
export const BET_LIMIT = 1_000_000; // demo balance safeguard

export function secureFloat() {
 const bytes = new Uint32Array(1);
 globalThis.crypto.getRandomValues(bytes);
 return bytes[0] / 4294967296;
}
export function pickSymbol(random = secureFloat) {
 const sum = WEIGHTS.reduce((a,b)=>a+b,0);
 let n = Math.min(0.999999999,Math.max(0,random())) * sum;
 for (let i=0; i<SYMBOLS.length; i++) {n-=WEIGHTS[i];if(n<0)return SYMBOLS[i];}
 return SYMBOLS[SYMBOLS.length-1];
}
export function generateGrid(random = secureFloat) {
 return Array.from({length:3},()=>Array.from({length:5},()=>pickSymbol(random)));
}
export function evaluateGrid(grid, stake) {
 if(!Array.isArray(grid)||grid.length!==3||grid.some(row=>!Array.isArray(row)||row.length!==5||row.some(s=>!SYMBOLS.includes(s))))throw Error('Invalid 3x5 grid');
 if(!Number.isFinite(stake)||stake<=0||stake>BET_LIMIT)throw Error('Invalid demo stake');
 const wins = [];
 LINES.forEach((line,lineIndex)=>{
   const cells = line.map((r,col)=>grid[r][col]);
   let best = null;
   for(const symbol of Object.keys(PAY)){
     let count=0;
     for(const cell of cells){if(cell===symbol||cell==='JOKER')count++;else break;}
     if(count>=3) {
       const amount = PAY[symbol][count]*stake;
       if(!best||amount>best.amount)best={lineIndex,symbol,count,amount};
     }
   }
   if(best) wins.push(best);
 });
 const scatters=grid.flat().filter(s=>s==='SCATTER').length;
 const total= Math.round(wins.reduce((acc,x)=>acc+x.amount,0)*100)/100;
 return {total,wins,scatters,freeSpinsAward:scatters>=3?8:0};
}
export function roundedMoney(value){return Math.round((value+Number.EPSILON)*100)/100;}
