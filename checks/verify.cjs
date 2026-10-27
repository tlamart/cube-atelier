'use strict';
// Tests sans dépendances : moteur du cube et commandes de l'interface.
// Le DOM simulé ne remplace pas un contrôle visuel dans un navigateur.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs HTML uniques');
for (const [, id] of source.matchAll(/\$\('([^']+)'\)/g)) assert(ids.includes(id), `Élément manquant : ${id}`);
for (const [, asset] of html.matchAll(/(?:src|href)="([^"#]+\.(?:css|js))"/g)) assert(fs.existsSync(path.join(root, asset)));
assert(!fs.readFileSync(path.join(root, 'style.css'), 'utf8').includes('@import'), 'CSS autonome');
class Element {
  constructor(tag = 'div') { this.tag = tag; this.style = {}; this.dataset = {}; this.children = []; this.attributes = {}; this.value = '850'; this.disabled = false; this.open = false; }
  appendChild(child) {
    if (child.tag === 'fragment') { [...child.children].forEach(c => this.appendChild(c)); return child; }
    if (child.parent) child.parent.children = child.parent.children.filter(c => c !== child);
    child.parent = this; this.children.push(child); return child;
  }
  replaceChildren(...children) { this.children.forEach(c => c.parent = null); this.children = []; children.forEach(c => this.appendChild(c)); }
  setAttribute(k, v) { this.attributes[k] = v; }
  querySelectorAll(selector) { return this.children.flatMap(c => [...((c.className||'').split(' ').includes(selector.slice(1)) ? [c] : []), ...c.querySelectorAll(selector)]); }
  animate(frames, options) { animations.push({frames, options}); return { finished: delayAnimation ? new Promise(resolve => finishAnimations.push(resolve)) : Promise.resolve() }; }
  addEventListener(type, fn) { this['on' + type] = fn; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  setPointerCapture() {}
  scrollIntoView() {}
}
let animations = [], delayAnimation = false, finishAnimations = [];
function environment(saved) {
  const nodes = Object.fromEntries(ids.map(id => [id, new Element()]));
  const timers = new Map(); let nextTimer = 0, storage = saved;
  const context = vm.createContext({
    document: { getElementById: id => { assert(nodes[id], `ID existant : ${id}`); return nodes[id]; }, createElement: tag => new Element(tag), createDocumentFragment: () => new Element('fragment'), querySelector: () => new Element(), addEventListener() {} },
    localStorage: {getItem: () => storage, setItem: (_, v) => storage = v},
    window: {matchMedia: () => ({matches: false})},
    setTimeout: callback => { const id = ++nextTimer; timers.set(id, callback); return id; }, clearTimeout: id => timers.delete(id),
    console, assert
  });
  vm.runInContext(source, context);
  return {nodes, timers, context, run: code => vm.runInContext(code, context), storage: () => storage};
}
const equalState = (a, b, message) => assert.equal(JSON.stringify(a), JSON.stringify(b), message);
const state = env => env.run('JSON.stringify(stickers)');
function solvedState(env, lesson) {
  return env.run(`makeCube(); if(${lesson}>0)stickers.forEach(s=>{s.p=rotateVector(s.p,0,Math.PI);s.n=rotateVector(s.n,0,Math.PI)}); JSON.stringify(stickers)`);
}
async function main() {
  const e = environment(null);
  assert.equal(e.nodes.cube.querySelectorAll('.sticker').length, 54);
  // Les six faces : quatre quarts de tour et chaque mouvement suivi de son inverse.
  for (const face of ['R','L','U','D','F','B']) {
    e.run('makeCube()'); const before = state(e);
    e.run(`for(let n=0;n<4;n++)applyMove('${face}')`); assert.equal(state(e), before);
    for (const suffix of ['', "'", '2']) {
      e.run(`applyMove(${JSON.stringify(face+suffix)});applyMove(invert(${JSON.stringify(face+suffix)}))`);
      assert.equal(state(e), before);
    }
  }
  equalState(e.run("rotateVector([1,1,1],0,-Math.PI/2)"), [1,1,-1], 'R horaire : avant-haut vers arrière-haut');
  equalState(e.run("rotateVector([1,1,1],1,-Math.PI/2)"), [-1,1,1], 'U horaire : avant-droite vers avant-gauche');
  equalState(e.run("rotateVector([1,1,1],2,-Math.PI/2)"), [1,-1,1], 'F horaire : haut-droite vers bas-droite');
  // Une longue suite conserve les 54 emplacements, puis son inverse restaure tout.
  e.run(`makeCube(); const baseline=JSON.stringify(stickers); const randomMoves=Array.from({length:600},(_,i)=>Object.keys(faces)[(i*13+i*i)%6]+['',"'",'2'][i%3]); randomMoves.forEach(applyMove); assert.equal(new Set(stickers.map(s=>s.p.join(',')+'/'+s.n.join(','))).size,54); [...randomMoves].reverse().forEach(t=>applyMove(invert(t))); assert.equal(JSON.stringify(stickers),baseline);`);
  for (let i=0;i<7;i++) {
    const solved = JSON.parse(solvedState(e,i));
    e.run(`loadLesson(${i})`);
    const initial = JSON.parse(state(e));
    if (i>=3) initial.forEach((s,j) => { if(s.p[1]<1) equalState(s,solved[j],`Étape ${i+1} : préserver les deux premières couches`); });
    if (i===2) initial.forEach((s,j) => { if(s.p[1]===-1) equalState(s,solved[j], 'Deuxième couronne : première couche conservée'); });
    if (i>=4) {
      const yellowEdges=initial.filter(s=>s.n[1]===1&&s.color==='#f5cf48'&&Math.abs(s.p[0])+Math.abs(s.p[2])===1);
      assert.equal(yellowEdges.length,4,'Croix jaune conservée');
    }
    if(i>=5) initial.forEach((s,j)=> {if(s.p.filter(v=>v!==0).length===2)equalState(s,solved[j],'Arêtes conservées');});
    if(i===6) {
      const colorsAt=(list,p)=>list.filter(s=>s.p.every((v,j)=>v===p[j])).map(s=>s.color).sort();
      for(const x of [-1,1])for(const z of [-1,1])equalState(colorsAt(initial,[x,1,z]),colorsAt(solved,[x,1,z]),'Dernière étape : coins à la bonne place');
    }
    const count=e.run('moves.length');
    await e.nodes.forward.onclick(); await e.nodes.back.onclick();
    equalState(JSON.parse(state(e)),initial, 'Avancer puis reculer');
    for(let n=0;n<count;n++)await e.nodes.forward.onclick();
    equalState(JSON.parse(state(e)),solved,`Démonstration ${i+1} résolue`);
    assert.equal(e.nodes.forward.disabled,true);
    e.nodes.reset.onclick(); assert.equal(e.run('index'),0);
  }
  // L'angle CSS compense l'inversion de l'axe vertical de l'écran.
  for (const face of ['R','L','U','D','F','B']) {
    animations=[]; await e.run(`animate('${face}')`);
    const m=e.run(`moveInfo('${face}')`);
    assert.equal(animations[0].frames[1].transform,`rotate${['X','Y','Z'][m.axis]}(${m.angle*(m.axis===1?1:-1)}deg)`);
  }
  // Changer d'étape pendant une animation ne doit pas altérer la nouvelle étape.
  e.run('loadLesson(0)'); delayAnimation=true;
  const pending=e.nodes.forward.onclick(); assert.equal(e.run('busy'),true);
  e.run('loadLesson(3)'); const newState=state(e);
  finishAnimations.splice(0).forEach(fn=>fn()); await pending;
  assert.equal(state(e),newState); assert.equal(e.run('index'),0); assert.equal(e.run('busy'),false);
  delayAnimation=false;
  // Une ancienne lecture automatique ne doit pas programmer la nouvelle lecture.
  e.run('loadLesson(0)'); delayAnimation=true; e.nodes.play.onclick();
  e.run('loadLesson(1)'); e.nodes.play.onclick();
  finishAnimations.splice(0).forEach(fn=>fn()); await new Promise(setImmediate);
  assert.equal(e.run('index'),1); assert.equal(e.timers.size,1);
  e.run('stop()'); delayAnimation=false;
  e.run('loadLesson(0)'); e.nodes.complete.onclick(); assert.equal(e.run('current'),1);
  const restored=environment(e.storage()); assert.equal(restored.run('current'),1); assert.equal(restored.run('completed.length'),1);
  restored.nodes.restart.onclick(); assert.equal(restored.run('current'),0); assert.equal(restored.run('completed.length'),0);
  for(const saved of ['{', 'null','{"current":1.5,"completed":"wrong"}','{"current":999,"completed":[1,1,-1,20]}']) {
    const c=environment(saved); assert(c.run('Number.isInteger(current)&&current>=0&&current<7')); assert(c.run('completed.length<=7'));
  }
  e.nodes['notation-open'].onclick();assert(e.nodes['notation-dialog'].open);
  await e.nodes['notation-grid'].children[0].onclick();assert(e.run('practiceMode'));assert(e.nodes.play.disabled);
  e.nodes['practice-reset'].onclick();assert(!e.run('practiceMode'));
  e.nodes['scene'].onkeydown({key:'ArrowRight',preventDefault(){}}); assert(e.run('viewY')!==-34);
  e.nodes['reset-view'].onclick();assert.equal(e.run('viewY'),-34);
  // Le focus est un masque d'affichage : le cube conserve toutes ses couleurs.
  const f=environment(null);
  const visible=()=>f.nodes.cube.querySelectorAll('.sticker').filter(el=>!el.className.split(' ').includes('is-masked'));
  assert(f.nodes.cube.querySelectorAll('.is-masked').length>0,'Masque actif par défaut');
  assert(f.nodes.cube.querySelectorAll('.piece-marker').length===2,'A sur les deux couleurs de l’arête');
  assert.equal(f.nodes.cube.querySelectorAll('.destination-marker').length,1,'B indique le but');
  assert.equal(f.nodes['tracking-start'].textContent,'bas / avant');
  assert.equal(f.nodes['tracking-end'].textContent,'haut / avant');
  const initialColors=state(f);
  f.nodes['focus-off'].onclick();assert.equal(visible().length,54);assert.equal(state(f),initialColors);
  assert(f.nodes['tracking-guide'].hidden);assert.equal(f.nodes['focus-off'].attributes['aria-pressed'],'true');
  assert.equal(environment(f.storage()).run('focusEnabled'),false,'Préférence conservée');
  f.nodes['focus-on'].onclick();
  for(let n=0;n<4;n++)await f.nodes.forward.onclick();
  assert.equal(visible().length,5,'Croix blanche : exactement cinq cases visibles à la fin');
  assert(visible().every(el=>el.style.background==='#f7f6eb'));
  assert.equal(f.nodes.cube.querySelectorAll('.is-masked').length,49);
  assert.equal(f.nodes.cube.querySelectorAll('.piece-marker').length,0);
  assert.equal(f.nodes.cube.querySelectorAll('.destination-marker').length,0);
  assert(f.nodes['tracking-guide'].hidden);
  await f.nodes.back.onclick();assert(!f.nodes['tracking-guide'].hidden,'Le repérage revient en reculant');
  for(const stage of [1,2,3,4,5,6]){
    f.run(`loadLesson(${stage})`);
    assert(visible().length<54,`Étape ${stage+1} : masquer les pièces inutiles`);
    if([2,3,4].includes(stage)){
      assert(!f.nodes['tracking-guide'].hidden,`Étape ${stage+1} : repérage actif`);
      assert.equal(f.nodes.cube.querySelectorAll('.destination-marker').length,1);
    }
    const total=f.run('moves.length');for(let n=0;n<total;n++)await f.nodes.forward.onclick();
    if(stage===3)assert.equal(visible().length,5,'Croix jaune isolée à la fin');
    if(stage===6)assert.equal(visible().length,54,'Le cube résolu retrouve ses six couleurs');
  }
  f.run('loadLesson(0)');delayAnimation=true;const moving=f.nodes.forward.onclick();
  assert(f.nodes['focus-off'].disabled,'Ne pas interrompre une rotation avec le bouton Focus');
  f.nodes['focus-off'].onclick();assert(f.run('focusEnabled'));
  finishAnimations.splice(0).forEach(fn=>fn());await moving;delayAnimation=false;
  f.nodes['notation-open'].onclick();await f.nodes['notation-grid'].children[0].onclick();
  assert.equal(visible().length,54,'Exploration libre sans masque');assert(f.nodes['tracking-guide'].hidden);
  f.nodes['practice-reset'].onclick();assert(visible().length<54,'Rétablir le focus après exploration');
  console.log('OK — HTML et ressources, 18 inversions, suite de 600 mouvements, 7 démonstrations, prérequis pédagogiques, lecture avant/arrière, annulations et concurrence, sauvegarde, exploration, clavier, focus et repères A/B.');
}
main().catch(err=>{console.error(err);process.exitCode=1});
