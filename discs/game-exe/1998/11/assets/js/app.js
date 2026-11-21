'use strict';
if(document.fonts&&document.fonts.load){document.fonts.load('400 16px Arimo','Aa').catch(()=>{});document.fonts.load('700 16px Arimo','Aa').catch(()=>{})}
/* ---- настройки ---- */
const K=2;                 // увеличение графики относительно оригинала (программное)
const SPEED=750;           // скорость прокрутки фона, px оригинала в секунду
const IMG='assets/img/ui/',SND='assets/sound/',CNT='assets/img/content/';
const OFF=[0,600,1203,1798,2406];   // смещения экранов в фоне fon (px оригинала, измерены по оригиналу)
const FON_H=3006;

/* ---- утилиты ---- */
const P=n=>n*K+'px';
const $=(t,c,p)=>{const e=document.createElement(t);if(c)e.className=c;if(p)p.appendChild(e);return e};
const place=(e,x,y,w,h)=>{e.style.left=P(x);e.style.top=P(y);if(w!=null)e.style.width=P(w);if(h!=null)e.style.height=P(h);return e};
const image=(p,src,x,y,w,h,c)=>{const e=$('img',c,p);e.alt='';e.draggable=false;e.src=src;return place(e,x,y,w,h)};
const lit=(p,n,x,y,w,h)=>image(p,IMG+'lights/'+n+'.webp',x,y,w,h,'lt');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const VOL=n=>n==='adwav'?0.2:0.5;   // громкость звуков
function play(n){try{const a=new Audio(SND+n+'.wav');a.volume=VOL(n);const r=a.play();if(r&&r.catch)r.catch(()=>{})}catch{}}
const SND_MS={button1:700,button2:300,adwav:3500,exit:1000};
function playWait(n){return new Promise(res=>{let d=false;const fin=()=>{if(!d){d=true;res()}};try{const a=new Audio(SND+n+'.wav');a.volume=VOL(n);a.addEventListener('ended',fin);a.addEventListener('error',fin);const r=a.play();if(r&&r.catch)r.catch(fin)}catch{fin()}setTimeout(fin,SND_MS[n]||1000)})}
function hot(p,x,y,w,h,light,fn,label){
  const e=$('div','hs',p);place(e,x,y,w,h);
  if(label){e.setAttribute('role','button');e.setAttribute('aria-label',label)}
  if(light){e.addEventListener('pointerenter',()=>light.classList.add('on'));e.addEventListener('pointerleave',()=>light.classList.remove('on'))}
  if(fn)e.addEventListener('click',fn);
  return e;
}
function panel(p,x,y,w,h,tl,tw){
  const root=place($('div','panel',p),x,y,w,h),ttl=$('div','ttl',root),txt=$('div','txt',root);
  if(tw!=null){ttl.style.marginLeft=P(tl);ttl.style.width=P(tw)}
  root.hidden=true;
  return {root,ttl,txt,h,
    show(it,full){ttl.textContent=it.t;if(tw!=null){const r=it.al==='r';ttl.style.textAlign=r?'right':'';ttl.style.width=P(r?tw+12:tw)}ttl.style.fontSize='';txt.textContent=it.x||'';txt.hidden=!full;root.classList.toggle('scroll',!!full);root.style.height=full?P(h):'auto';root.scrollTop=0;root.hidden=false},
    clear(){root.hidden=true}};
}

/* ---- всплывающее сообщение ---- */
const msgEl=document.getElementById('msg'),msgBox=msgEl.firstElementChild;let msgT=0;
function hideToast(){clearTimeout(msgT);msgEl.hidden=true}
function toast(text,ms,cls){msgBox.textContent=text;msgBox.className='msgbox'+(cls?' '+cls:'');msgEl.hidden=false;clearTimeout(msgT);msgT=setTimeout(hideToast,ms||1000)}
msgEl.addEventListener('click',hideToast);

/* ---- сцена и масштаб ---- */
const stage=document.getElementById('stage'),world=document.getElementById('world'),barEl=document.getElementById('bar');
function fit(){const s=Math.min(innerWidth/1600,innerHeight/1200);stage.style.transform='scale('+s+')'}
addEventListener('resize',fit);fit();

image(world,IMG+'fon.webp',0,0,800,FON_H,'fon');
const sec=OFF.map(o=>{const s=$('div','sec',world);s.style.top=P(o);return s});
function showOnly(i){sec.forEach((s,k)=>s.classList.toggle('hide',k!==i))}

/* ---- экран 0: ввод кода ---- */
let code=0,entered=false,unlocked=false;
const s0=sec[0];
const stars=image(s0,IMG+'stars/st0.webp',199,144,212,31);
for(let i=0;i<=8;i++)new Image().src=IMG+'stars/st'+i+'.webp';
G.keys.forEach(([k,x,y])=>{
  const L=lit(s0,'screen01_numpanel_btn_'+k,x,y,31,33);
  hot(s0,x-2,y-2,35,37,L,()=>{
    if(k==='star')return;
    play('button2');
    if(k==='c')code=0;else if(code<8)code++;
    stars.src=IMG+'stars/st'+code+'.webp';
  },k==='star'?'*':k);
});
{const L=lit(s0,'screen01_numpanel_bigbtn',188,277,56,50);
 hot(s0,188,277,56,50,L,async()=>{
   if(entered)return;entered=true;
   await playWait('button1');await playWait('adwav');await wait(350);
   unlocked=true;pinned=true;barShow();
 },'Enter');}
{const L=lit(s0,'screen01_exitbtn',450,486,57,58);hot(s0,450,486,57,58,L,doExit,'Выход');}

/* ---- списки и тексты (демо, патчи, утилиты) ---- */
function list(p,src,x,y,w,h,rows,onPick){
  image(p,src,x,y,w,h);
  rows.forEach(([t,rh],i)=>hot(p,x,t,w,rh,null,()=>onPick(i),null));
}
/* демо */
const s1=sec[1],D=DATA.demos;
let dIdx=-1,dMode='text',dBig=-1;
const dPan=panel(s1,378,108,282,350,-4,264);
const gal=place($('div','gal',s1),380,168,276,290);gal.hidden=true;
const slots=G.slots.map(([x,y])=>{
  const d=place($('div','slot',gal),x-380,y-168,128,92),im=$('img',null,d);
  im.addEventListener('error',()=>im.classList.add('miss'));im.addEventListener('load',()=>im.classList.remove('miss'));
  return {d,im};
});
const big=place($('div','big',s1),380,168,276,192),bigIm=$('img',null,big);big.hidden=true;
bigIm.addEventListener('error',()=>bigIm.classList.add('miss'));bigIm.addEventListener('load',()=>bigIm.classList.remove('miss'));
const lblText=image(s1,IMG+'demos/text.webp',393,499,108,27);lblText.hidden=true;
function dRender(){
  if(dIdx<0){dPan.clear();gal.hidden=true;big.hidden=true;lblText.hidden=true;return}
  const it=D[dIdx],pics=dMode==='pics';
  dPan.show(it,!pics);lblText.hidden=!pics;
  if(pics){let f=24;while(dPan.ttl.offsetHeight>60*K&&f>16){f-=.5;dPan.ttl.style.fontSize=P(f)}}
  gal.hidden=!(pics&&dBig<0);big.hidden=!(pics&&dBig>=0);
  if(pics){
    slots.forEach((s,i)=>{const f=it.p[i];s.d.hidden=!f;if(f){const u=IMG+'demos/'+f+'.webp';if(s.im.getAttribute('src')!==u){s.im.classList.remove('miss');s.im.src=u}}});
    if(dBig>=0){const u=IMG+'demos/'+it.p[dBig]+'.webp';if(bigIm.getAttribute('src')!==u){bigIm.classList.remove('miss');bigIm.src=u}}
  }
}
list(s1,IMG+'demos/demos.webp',121,107,212,402,G.demoRows,i=>{dIdx=i;dMode='text';dBig=-1;dRender()});
slots.forEach((s,i)=>s.d.addEventListener('click',()=>{dBig=i;dRender()}));
big.addEventListener('click',()=>{dBig=-1;dRender()});
{const L=lit(s1,'screen02_textpicturebtn',353,492,37,40);
 hot(s1,353,492,148,40,L,()=>{
   if(dIdx<0||!D[dIdx].p.length)return;
   dMode=dMode==='text'?'pics':'text';dBig=-1;dRender();
 },'Картинки / Текст');}
{const L=lit(s1,'screen02_installbtn',519,492,37,40);hot(s1,519,492,140,40,L,()=>install('demos',dIdx),'Установить');}
/* патчи и утилиты */
const resets=[];
function textSection(i,key,imgSrc,ix,iy,iw,ih,rows,px,py,pw,ph,light,lx,ly,lw,lh,lhw){
  const s=sec[i],pan=panel(s,px,py,pw,ph,9,pw-18);
  let cur=-1;
  resets.push(()=>{cur=-1;pan.clear()});
  list(s,IMG+imgSrc,ix,iy,iw,ih,rows,n=>{cur=n;pan.show(DATA[key][n],true)});
  const L=lit(s,light,lx,ly,lw,lh);
  hot(s,lx,ly,lhw,lh,L,()=>install(key,cur),'Установить');
}
textSection(2,'patches','patches.webp',106,214,200,280,G.patchRows,374,92,322,358,'screen03_installbtn',384,479,42,41,150);
textSection(3,'utils','utils.webp',107,72,95,272,G.utilRows,376,73,322,336,'screen04_installbtn',111,386,40,39,140);

/* заглушка: установка файлов (будет доработана) */
function install(section,index){play('button2');toast('Все файлы доступны в образе диска',2000)/* ссылки на файлы будут добавлены позже */}
function doExit(){runEnd()}

/* ---- нижняя панель ---- */
image(barEl,IMG+'linersm.webp',0,0,800,98);
G.bar.forEach(([x,y,w,h,n,act])=>{
  const L=lit(barEl,n,x,y-502,w,h);
  hot(barEl,x-8,y-502-6,w+16,98-(y-502-6),L,()=>{if(act===0)doExit();else{play('button2');goTo(act)}},null);
});
let barOn=false,pinned=true;
function barShow(fast){barEl.classList.toggle('fast',!!fast);barOn=true;barEl.classList.add('show')}
function barHide(fast){barEl.classList.toggle('fast',!!fast);barOn=false;barEl.classList.remove('show')}
let hideT=0;
stage.addEventListener('pointermove',e=>{
  if(!unlocked||busy||cur===4)return;
  const r=stage.getBoundingClientRect(),y=(e.clientY-r.top)/(r.height/1200);
  if(!barOn){if(y>=1080)barShow()}
  else if(y>=1004-40){pinned=false;clearTimeout(hideT)}
  else if(!pinned){clearTimeout(hideT);hideT=setTimeout(()=>{if(!busy)barHide()},350)}
});
document.documentElement.addEventListener('pointerleave',()=>{if(barOn&&!pinned&&!busy)barHide()});


/* ---- бонус ---- */
const s4=sec[4];
const bBg=image(s4,IMG+'bonus/'+BONUS.pages[0].glass+'.webp',0,0,800,600);
[...BONUS.pages.flatMap(p=>[p.glass,p.text]),BONUS.contacts].forEach(n=>new Image().src=IMG+'bonus/'+n+'.webp');
let bPage=0,bMode='glass',bContacts=false,bPhoto=-1;
const legal=place($('p','legal',s4),BONUS.legal[0],BONUS.legal[1]);legal.textContent=BONUS.legal[2];legal.hidden=true;
const bLayers=BONUS.pages.map(pg=>{
  const covers=$('div',null,s4),hots=$('div',null,s4),tb=buildText(s4,pg),txt=tb.wrap,view=place($('div','pv',s4),...pg.view),vim=$('img',null,view);
  covers.hidden=hots.hidden=txt.hidden=view.hidden=true;
  pg.covers.forEach(r=>hot(covers,...r,null,toggleMode,'Обложка'));
  pg.hot.forEach((h,i)=>{const e=hot(hots,h.x,h.y,h.w,h.h,null,()=>{bPhoto=i;bRender()},null);if(h.round)e.classList.add('round')});
  view.addEventListener('click',()=>{bPhoto=-1;bRender()});
  return {covers,hots,txt,view,vim,sync:tb.sync};
});
function makeScroll(wrap,box){
  const sb=$('div','sb',wrap),up=$('div','sbb sbu',sb),dn=$('div','sbb sbd',sb),th=$('div','sbt',sb);
  const BTN=28,THH=12,LINE=28;
  const scale=()=>stage.getBoundingClientRect().width/1600||1;
  function sync(){
    const max=box.scrollHeight-box.clientHeight,trk=sb.clientHeight-2*BTN-THH;
    th.hidden=max<=0;th.style.top=(BTN+(max>0&&trk>0?box.scrollTop/max*trk:0))+'px';
  }
  box.addEventListener('scroll',sync);
  let rep=0;
  const hold=(el,dir)=>el.addEventListener('pointerdown',e=>{
    e.preventDefault();box.scrollTop+=dir*LINE;clearInterval(rep);
    const t=setTimeout(()=>{rep=setInterval(()=>{box.scrollTop+=dir*LINE},60)},400);
    const stop=()=>{clearTimeout(t);clearInterval(rep);removeEventListener('pointerup',stop);removeEventListener('pointercancel',stop)};
    addEventListener('pointerup',stop);addEventListener('pointercancel',stop);
  });
  hold(up,-1);hold(dn,1);
  sb.addEventListener('pointerdown',e=>{
    if(e.target!==sb)return;
    e.preventDefault();
    box.scrollTop+=(e.offsetY<parseFloat(th.style.top||0)?-1:1)*(box.clientHeight-LINE);
  });
  th.addEventListener('pointerdown',e=>{
    e.preventDefault();e.stopPropagation();
    const y0=e.clientY,s0=box.scrollTop,sc=scale();
    const mv=ev=>{const max=box.scrollHeight-box.clientHeight,trk=sb.clientHeight-2*BTN-THH;if(trk>0)box.scrollTop=s0+(ev.clientY-y0)/sc/trk*max};
    const end=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',end);removeEventListener('pointercancel',end)};
    addEventListener('pointermove',mv);addEventListener('pointerup',end);addEventListener('pointercancel',end);
  });
  return sync;
}
function buildText(p,pg){
  const wrap=place($('div','btbox',p),...pg.txt),box=$('div','btxt',wrap),sync=makeScroll(wrap,box);
  const L=pg.t.split('\n').map(x=>x.trim());
  let i=0;const ti=[];while(i<L.length&&L[i]!==''){ti.push(L[i]);i++}
  $('div','bt1',box).textContent=ti.join('\n');
  let st=0;                       // 1 — список участников, 2 — ждём название песни
  for(;i<L.length;i++){
    const l=L[i];
    if(l===''){if(st===1)st=2;$('div','sp',box);continue}
    const prevBlank=i>0&&L[i-1]==='',nxt=L[i+1]||'';
    if(/^(Нынешний )?[Сс]остав группы/.test(l)){$('div','bp b',box).textContent=l;st=1;continue}
    if(st===1){
      const d=$('div','bp',box),m=l.match(/^([^—(–]+?)(\s*(?:—|\(|–).*)$/);
      if(m&&!/^[а-яё]/.test(l)){$('b',null,d).textContent=m[1];d.appendChild(document.createTextNode(m[2]))}else d.textContent=l;
      continue;
    }
    if(st===2){st=0;if(l.length<=40&&nxt.length<=60){$('div','bs',box).textContent=l;continue}}
    if(prevBlank&&l.length<=28&&nxt.length>70){$('div','bh',box).textContent=l;continue}
    if(prevBlank&&l.length<=26&&!/[.,!?:;…—–-]$/.test(l)&&nxt.length>=24){$('div','bs',box).textContent=l;continue}
    const d=$('div','bp',box);d.textContent=l;
    if(l.length>70)d.classList.add('ind');
  }
  return {wrap,sync};
}
function bRender(){
  const pg=BONUS.pages[bPage],txt=bMode==='text';
  bCatch.hidden=!bContacts;
  legal.hidden=!(bPage===0&&txt&&!bContacts);
  bBg.src=IMG+'bonus/'+(bContacts?BONUS.contacts:txt?pg.text:pg.glass)+'.webp';
  bLayers.forEach((l,k)=>{const on=k===bPage&&!bContacts;
    l.covers.hidden=!(on&&!txt);l.hots.hidden=!(on&&txt);l.txt.hidden=!(on&&txt);l.view.hidden=!(on&&txt&&bPhoto>=0);if(on&&txt)l.sync()});
  if(!bContacts&&txt&&bPhoto>=0){
    const l=bLayers[bPage],h=pg.hot[bPhoto],[,,W,H]=pg.view,[f,w,hh]=h.p,m=7,bd=3;
    const s=Math.min(1,(W-2*m-2*bd)/w,(H-2*m-2*bd)/hh),iw=w*s,ih=hh*s;
    l.vim.src=CNT+'bonus/'+f;l.vim.style.width=P(iw);l.vim.style.height=P(ih);l.vim.style.borderWidth=P(bd);
    l.vim.style.left=P((W-iw-2*bd)/2);l.vim.style.top=P((H-ih-2*bd)/2);
  }
}
function toggleMode(){bMode=bMode==='glass'?'text':'glass';bPhoto=-1;bRender()}
function bStep(d){bPage=(bPage+d+BONUS.pages.length)%BONUS.pages.length;bPhoto=-1;bRender()}
function playMusic(page){toast('Музыка включается в плеере слева от оболочки диска',2000,'arimo')}
function bonusReset(){bPage=0;bMode='glass';bContacts=false;bPhoto=-1;bRender()}
function bonusExit(){
  if(busy||cur!==4)return;
  goTo(1,{pre:170,after:()=>{dIdx=-1;dMode='text';dBig=-1;dRender()}});
}
{const c=BONUS.cluster,r=(o)=>[o[0]-o[2]-3,o[1]-o[2]-3,2*o[2]+6,2*o[2]+6];
 [['eject',bonusExit,'Eject'],['rewind',()=>bStep(-1),'Назад'],['play',()=>playMusic(bPage),'Play'],['record',toggleMode,'Описание / обложка'],['ff',()=>bStep(1),'Вперёд']]
 .forEach(([k,fn,lb])=>hot(s4,...r(c[k]),null,fn,lb).classList.add('round'));
 hot(s4,...BONUS.logo,null,()=>{bContacts=true;bPhoto=-1;bRender()},'FeeLee');
 }
const bCatch=hot(s4,0,0,800,600,null,()=>{bContacts=false;bRender()},'Закрыть');
bRender();

/* ---- финал: слайды сайтов, экран благодарностей, осциллограф ---- */
const endEl=document.getElementById('end');
const E={};
[['web','webframe',0,0,800,600],['comp','computerraframe',0,0,800,600],['kd','kdlabframe',0,0,800,600],['exe','exe_site',159,0,483,600],['end','endframe',0,0,800,600]]
 .forEach(([k,n,x,y,w,h])=>{E[k]=image(endEl,IMG+'end/'+n+'.webp',x,y,w,h);E[k].hidden=true});
const wave=image(endEl,IMG+'end/endline.webp',108,30,446,147);wave.hidden=true;
const veil=$('div','veil',endEl);
let ending=false;
function slideWait(ms){return new Promise(r=>{const t=setTimeout(done,ms);function done(){clearTimeout(t);endEl.removeEventListener('click',done);r()}endEl.addEventListener('click',done)})}
function wipe(ms){return new Promise(res=>{const t0=performance.now();(function step(t){const k=Math.min(1,(t-t0)/ms);wave.style.clipPath='inset(0 '+(100-k*100)+'% 0 0)';k<1?requestAnimationFrame(step):res()})(t0)})}
async function runEnd(){
  if(ending)return;ending=true;busy=true;clearTimeout(hideT);
  play('exit');await wait(1300);
  endEl.hidden=false;
  for(const k of ['web','comp','kd']){E[k].hidden=false;await slideWait(3000);E[k].hidden=true}
  await wait(300);
  E.exe.hidden=false;await slideWait(3000);E.exe.hidden=true;
  E.end.hidden=false;await wait(170);
  wave.style.clipPath='inset(0 100% 0 0)';wave.hidden=false;await wipe(4900);
  await wait(400);play('exit');await wait(1000);
  veil.style.opacity=1;await wait(350);
  resetAll();
}
/* возврат на главную экран, как при первом открытии */
function resetAll(){
  hideToast();code=0;stars.src=IMG+'stars/st0.webp';entered=false;unlocked=false;pinned=true;
  clearTimeout(hideT);barOn=false;barEl.classList.remove('show','fast');
  cur=0;world.style.transform='translate3d(0,0,0)';
  dIdx=-1;dMode='text';dBig=-1;dRender();resets.forEach(f=>f());
  bonusReset();showOnly(0);
  Object.values(E).forEach(e=>e.hidden=true);wave.hidden=true;
  veil.style.transition='none';veil.style.opacity=0;void veil.offsetWidth;veil.style.transition='';
  endEl.hidden=true;ending=false;busy=false;
}

/* ---- переходы между экранами ---- */
let cur=0,busy=false;
function scrollTo_(y0,y1){
  return new Promise(res=>{
    const dur=Math.abs(y1-y0)/SPEED*1000,t0=performance.now();
    (function step(t){
      const k=dur?Math.min(1,(t-t0)/dur):1;
      world.style.transform='translate3d(0,'+(-(y0+(y1-y0)*k)*K)+'px,0)';
      k<1?requestAnimationFrame(step):res();
    })(t0);
  });
}
async function goTo(n,opt){
  opt=opt||{};
  if(busy||n===cur||!unlocked)return;
  busy=true;clearTimeout(hideT);
  const fromFirst=cur===0;
  sec.forEach(s=>s.classList.add('hide'));
  if(opt.pre)await wait(opt.pre);
  if(fromFirst){barHide(true);await wait(550)}
  await scrollTo_(OFF[cur],OFF[n]);
  cur=n;
  if(!fromFirst){await wait(150);barHide(true)}
  await wait(n===4?650:300);
  if(n===4)bonusReset();
  if(opt.after)opt.after();
  showOnly(n);pinned=false;busy=false;
}
showOnly(0);
