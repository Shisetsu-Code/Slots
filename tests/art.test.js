import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectGLB,qualityReport} from '../scripts/inspect-glb.mjs';

test('art inspector counts materials, GLB rigging, animations and wheel root',()=>{
 const model={
  accessors:[{count:90000}],
  meshes:[{primitives:[{attributes:{POSITION:0},material:0}]}],
  nodes:[{name:'WheelRotor'}],
  materials:Array.from({length:7},()=>({pbrMetallicRoughness:{baseColorTexture:{index:0},metallicRoughnessTexture:{index:1}},normalTexture:{index:2}})),
  textures:Array(6).fill({}),
  skins:[{joints:Array.from({length:32},(_,i)=>i)}],
  animations:['Idle','Spin','Win','Wheel'].map(name=>({name}))
 };
 const meta=inspectGLB(model);
 assert.equal(meta.triangles,30000);
 assert.equal(meta.joints,32);
 assert.ok(meta.wheelRotor);
 assert.ok(qualityReport(meta,'jester').ok);
 assert.ok(qualityReport(meta,'wheel').ok);
});
test('3D art cannot pass a premium gate just by calling something a jester',()=>{
 const model={
  accessors:[{count:36}],
  meshes:[{primitives:[{attributes:{POSITION:0}}]}],
  nodes:[{name:'Sphere'},{name:'Cone'}],
  materials:[{}]
 };
 const meta=inspectGLB(model);
 assert.equal(meta.triangles,12);
 assert.equal(qualityReport(meta,'jester').ok,false);
 assert.equal(qualityReport(meta,'wheel').ok,false);
 assert.ok(qualityReport(meta,'jester').problems.some(x=>x.includes('armature')));
});
