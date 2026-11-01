import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateGrid,generateGrid,pickSymbol,roundedMoney,SYMBOLS} from '../src/game.js';

test('random grid shape and known symbols',()=>{
 const grid=generateGrid(()=>.4);
 assert.equal(grid.length,3);
 for(const row of grid){assert.equal(row.length,5);for(const symbol of row)assert.ok(SYMBOLS.includes(symbol));}
});
test('first 3 crowns on top row pay 4x',()=>{
 const g=[
 ['CROWN','CROWN','CROWN','DIAMOND','DIAMOND'],
 ['SCATTER','SCATTER','HEART','HEART','BELL'],
 ['DIAMOND','HEART','STAR','STAR','BELL']
 ];
 const r=evaluateGrid(g,2);
 assert.equal(r.wins.find(w=>w.lineIndex===0)?.amount,8);
 assert.equal(r.freeSpinsAward,0);
});
test('3 scatters anywhere award 8 spins',()=>{
 const g=[
 ['SCATTER','A','K','Q','SCATTER'],
 ['A','K','Q','A','K'],
 ['Q','K','SCATTER','K','A']
 ];
 const r=evaluateGrid(g,1);
 assert.equal(r.scatters,3);
 assert.equal(r.freeSpinsAward,8);
});
test('joker substitutes to extend a line',()=>{
 const g=[
 ['CROWN','JOKER','CROWN','CROWN','BELL'],
 ['SCATTER','SCATTER','HEART','BELL','DIAMOND'],
 ['DIAMOND','HEART','STAR','STAR','BELL']
 ];
 const r=evaluateGrid(g,1);
 assert.equal(r.wins.find(w=>w.lineIndex===0)?.count,4);
 assert.equal(r.wins.find(w=>w.lineIndex===0)?.symbol,'CROWN');
});
test('pays start at leftmost only',()=>{
 const g=[
 ['A','K','CROWN','CROWN','CROWN'],
 ['BELL','STAR','K','A','Q'],
 ['Q','K','STAR','BELL','A']
 ];
 assert.equal(evaluateGrid(g,1).wins.some(w=>w.lineIndex===0),false);
});
test('invalid grid/stake rejected',()=>{
 assert.throws(()=>evaluateGrid([['A']],1));
 assert.throws(()=>evaluateGrid(Array.from({length:3},()=>Array(5).fill('A')),-2));
});
test('money rounds to two decimal places',()=>{
 assert.equal(roundedMoney(0.1+0.2),.3);
});
test('weighted selector bounds',()=>{
 assert.equal(pickSymbol(()=>0),'JOKER');
 assert.equal(pickSymbol(()=>.999999),'SCATTER');
});
