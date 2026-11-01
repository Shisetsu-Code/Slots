// Fully original procedural illustration, no image downloads or supplier assets.
const GOLD='#ffe08a', INK='#2a103f';
function poly(ctx,points,fill,stroke=GOLD,width=7){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(const p of points.slice(1))ctx.lineTo(p[0],p[1]);ctx.closePath();
 ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}
}
function gem(ctx,cx,cy,r,color) {
 const g=ctx.createLinearGradient(cx-r,cy-r,cx+r,cy+r);g.addColorStop(0,'#fffce4');g.addColorStop(.21,color);g.addColorStop(.65,'#17105b');g.addColorStop(1,color);
 poly(ctx,[[cx,cy-r],[cx+r*.85,cy],[cx,cy+r],[cx-r*.85,cy]],g,'#f9cc66',9);
 poly(ctx,[[cx,cy-r],[cx+r*.8,cy],[cx,cy-r*.13],[cx-r*.8,cy]],'#ffffff66',null);
 poly(ctx,[[cx,cy+r],[cx+r*.8,cy],[cx,cy-r*.13],[cx-r*.8,cy]],'#00135766',null);
 ctx.strokeStyle='#d9faff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx,cy+r);ctx.moveTo(cx-r*.85,cy);ctx.lineTo(cx+r*.85,cy);ctx.stroke();
}
function star(ctx,cx,cy,outer,inner,n=5){
 const points=[];for(let i=0;i<n*2;i++){const a=-Math.PI/2+Math.PI*i/n,r=i%2?inner:outer;points.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
 const g=ctx.createLinearGradient(cx,cy-outer,cx,cy+outer);g.addColorStop(0,'#fffdd5');g.addColorStop(.46,'#ffc84a');g.addColorStop(.5,'#e77a10');g.addColorStop(1,'#7a2860');poly(ctx,points,g,'#fff3b8',9);
}
function crown(ctx){
 const g=ctx.createLinearGradient(0,85,0,280);g.addColorStop(0,'#fff4a0');g.addColorStop(.4,'#ffa826');g.addColorStop(1,'#8e3b13');
 poly(ctx,[[77,252],[58,118],[127,170],[188,79],[249,170],[320,116],[299,252]],g,'#ffe9a6',10);
 ctx.fillStyle='#83246d';ctx.fillRect(79,236,219,40);ctx.lineWidth=9;ctx.strokeStyle='#ffe9a8';ctx.strokeRect(79,236,219,40);
 gem(ctx,189,194,43,'#f7337c');gem(ctx,113,234,16,'#41e7ff');gem(ctx,263,234,16,'#48ffac');
 for(const [x,y] of [[58,115],[188,79],[320,116]]){ctx.beginPath();ctx.arc(x,y,13,0,7);ctx.fillStyle='#fff8bd';ctx.fill();}
}
function bell(ctx){
 const g=ctx.createLinearGradient(90,70,300,300);g.addColorStop(0,'#fff1ae');g.addColorStop(.48,'#e99a2e');g.addColorStop(.85,'#7b3d28');g.addColorStop(1,'#ffd474');
 ctx.beginPath();ctx.moveTo(133,115);ctx.bezierCurveTo(115,170,150,204,101,264);ctx.bezierCurveTo(170,291,243,293,297,264);ctx.bezierCurveTo(248,211,268,154,239,115);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.lineWidth=11;ctx.strokeStyle=GOLD;ctx.stroke();
 ctx.beginPath();ctx.arc(193,113,32,0,Math.PI*2);ctx.fillStyle='#f7bc47';ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.arc(198,287,22,0,7);ctx.fillStyle='#b85b1f';ctx.fill();ctx.stroke();
 gem(ctx,194,223,28,'#ec2f8d');
}
function heart(ctx){
 const g=ctx.createLinearGradient(80,100,270,270);g.addColorStop(0,'#fff2aa');g.addColorStop(.2,'#fa3d77');g.addColorStop(.8,'#8c1153');g.addColorStop(1,'#400b72');
 ctx.beginPath();ctx.moveTo(192,286);ctx.bezierCurveTo(70,188,51,139,93,100);ctx.bezierCurveTo(130,65,185,93,192,130);ctx.bezierCurveTo(223,79,282,77,304,125);ctx.bezierCurveTo(324,179,267,235,192,286);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.lineWidth=12;ctx.strokeStyle=GOLD;ctx.stroke();
 ctx.beginPath();ctx.moveTo(117,121);ctx.bezierCurveTo(155,95,171,124,179,149);ctx.lineWidth=10;ctx.strokeStyle='#ffe6daaa';ctx.stroke();
}
function jester(ctx){
 const g=ctx.createLinearGradient(75,40,300,300);g.addColorStop(0,'#fb5296');g.addColorStop(.45,'#7421b9');g.addColorStop(1,'#26105f');
 poly(ctx,[[94,178],[52,75],[144,123],[191,48],[236,120],[329,76],[280,184]],g,'#f6bd4b',10);
 for(const [x,y] of [[52,74],[191,45],[330,77]]){ctx.beginPath();ctx.arc(x,y,18,0,7);ctx.fillStyle='#f7d267';ctx.fill();ctx.strokeStyle='#fff5b0';ctx.lineWidth=5;ctx.stroke();}
 const skin=ctx.createLinearGradient(90,150,260,320);skin.addColorStop(0,'#fff8df');skin.addColorStop(1,'#e2aa7b');poly(ctx,[[97,169],[284,169],[277,257],[238,300],[153,300],[104,258]],skin,'#f9c45b',8);
 ctx.beginPath();ctx.moveTo(120,212);ctx.quadraticCurveTo(146,183,171,211);ctx.moveTo(214,209);ctx.quadraticCurveTo(243,180,269,212);ctx.lineWidth=11;ctx.lineCap='round';ctx.strokeStyle=INK;ctx.stroke();
 ctx.beginPath();ctx.moveTo(134,240);ctx.quadraticCurveTo(194,313,258,240);ctx.quadraticCurveTo(194,272,134,240);ctx.fillStyle='#b7215f';ctx.fill();ctx.strokeStyle='#5c103d';ctx.lineWidth=5;ctx.stroke();
 ctx.beginPath();ctx.arc(193,239,13,0,7);ctx.fillStyle='#ea5b7a';ctx.fill();ctx.strokeStyle='#ffe4bf';ctx.stroke();
}
function seven(ctx){
 ctx.font='900 270px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=25;ctx.strokeStyle='#552164';ctx.strokeText('7',190,199);ctx.lineWidth=15;ctx.strokeStyle=GOLD;ctx.strokeText('7',190,199);
 const g=ctx.createLinearGradient(100,90,280,285);g.addColorStop(0,'#fff4b5');g.addColorStop(.3,'#ff7c86');g.addColorStop(.53,'#c5005b');g.addColorStop(1,'#7a147e');ctx.fillStyle=g;ctx.fillText('7',190,199);
}
function royal(ctx,symbol){
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 254px Georgia,serif';ctx.lineJoin='round';
 ctx.lineWidth=25;ctx.strokeStyle='#542456';ctx.strokeText(symbol,192,211);
 ctx.lineWidth=15;ctx.strokeStyle='#fff0ad';ctx.strokeText(symbol,192,211);
 const g=ctx.createLinearGradient(115,85,270,280);g.addColorStop(0,'#fff8b3');g.addColorStop(.4,symbol==='A'?'#ff4caa':'#fca746');g.addColorStop(.7,symbol==='K'?'#d42f6d':'#de652c');g.addColorStop(1,'#741353');ctx.fillStyle=g;ctx.fillText(symbol,192,211);
}
function drawScatter(ctx){star(ctx,192,178,119,55,8);ctx.font='900 38px Georgia';ctx.textAlign='center';ctx.lineWidth=8;ctx.strokeStyle='#4e2052';ctx.strokeText('BONUS',192,205);ctx.fillStyle='#fff6ca';ctx.fillText('BONUS',192,205);}
export function drawTile(symbol,size=384) {
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const c=canvas.getContext('2d');c.scale(size/384,size/384);
 const g=c.createLinearGradient(0,0,384,384);g.addColorStop(0,'#92fbff');g.addColorStop(.34,'#317cdb');g.addColorStop(.72,'#133a9f');g.addColorStop(1,'#06165c');
 c.fillStyle=g;c.fillRect(0,0,384,384);
 // Harlequin diamond cloth.
 c.save();c.globalAlpha=.19;
 for(let y=-120;y<520;y+=80)for(let x=-120;x<520;x+=80){poly(c,[[x+40,y],[x+80,y+40],[x+40,y+80],[x,y+40]],(x+y)%160===0?'#e5ffff':'#08186f',null);}
 c.restore();
 const vignette=c.createRadialGradient(175,130,40,195,190,295);vignette.addColorStop(0,'#ffffff11');vignette.addColorStop(1,'#0207359a');c.fillStyle=vignette;c.fillRect(0,0,384,384);
 // Beveled metallic surrounding frame.
 c.lineWidth=10;c.strokeStyle='#91eeffcc';c.strokeRect(8,8,368,368);c.lineWidth=5;c.strokeStyle='#123c8e';c.strokeRect(17,17,350,350);
 c.save();c.shadowColor='#110326';c.shadowBlur=19;c.shadowOffsetY=12;
 if(symbol==='JOKER')jester(c);else if(symbol==='CROWN')crown(c);else if(symbol==='DIAMOND')gem(c,192,190,111,'#09ccff');else if(symbol==='SEVEN')seven(c);
 else if(symbol==='BELL')bell(c);else if(symbol==='HEART')heart(c);else if(symbol==='STAR')star(c,192,185,116,55,5);else if(symbol==='SCATTER')drawScatter(c);
 else royal(c,symbol);
 c.restore();
 c.fillStyle='#ffffff3d';c.beginPath();c.ellipse(128,63,100,14,-.4,0,Math.PI*2);c.fill();
 return canvas;
}
