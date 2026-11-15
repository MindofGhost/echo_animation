/* A place for you. Independent illustrated film; all animation follows the selected recording. */
(() => {
  'use strict';
  const W = 1600, H = 900, TAU = Math.PI * 2;
  const $ = id => document.getElementById(id);
  const canvas = $('screen'), ctx = canvas.getContext('2d', { alpha: false });
  const audio = $('audio'), stage = $('stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const exporting = new URLSearchParams(location.search).has('export');
  let renderScale = 1;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const ease = p => { p = clamp(p); return p * p * (3 - 2 * p); };
  const ramp = (t, a, b) => ease((t - a) / (b - a));
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const clock = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const images = {};
  let pulse = { fps: 30, frames: [], duration: 212.3755 };
  let loaded = false, started = false, captions = false, override = null, raf = 0;
  let pointer = { x: 0, y: 0 }, drift = { x: 0, y: 0 };
  let visualTime = 18, lastFrame = 0, frameCost = 0;
  const effects = { light: -100, rain: -100, mirror: -100, touch: -100 };
  let touchPoint = { x: 800, y: 450 };
  const terminalSession = { shot: -1, script: '', visible: -1, began: 0, history: [] };
  const actor = window.createEchoPerformance({images,clamp,lerp,ease,ramp,hash,path,glow,reduced});
  const shots = actor.shots;
  const chapters = [[0,'Мастерская'],[29.28,'Стеклянный сад'],[58.65,'Для тебя'],[88.34,'День за днём'],[110.4,'Уход'],[147.52,'Снова'],[176.96,'Внутри'],[195.60,'Последний свет']];
  const currentShot = t => shots.findLast(s => t >= s.start) || shots[0];
  const framePulse = t => pulse.frames[Math.min(pulse.frames.length-1, Math.max(0, Math.floor(t*pulse.fps)))] || [0,0,0];
  const shotProgress = (shot, t) => clamp((t-shot.start)/(shot.end-shot.start));

  function path(c, points, fill, stroke, width = 1) {
    c.beginPath(); points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y));
    c.closePath(); if (fill) { c.fillStyle=fill; c.fill(); } if (stroke) { c.strokeStyle=stroke; c.lineWidth=width; c.stroke(); }
  }
  function glow(c, x, y, r, color, alpha = 1) {
    c.save(); c.globalAlpha *= alpha;
    const g = c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,color);g.addColorStop(1,'#ffffff00');
    c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
  }
  function vignette(c, amount = .7) {
    const g=c.createRadialGradient(800,420,150,800,450,900);g.addColorStop(0,'#00000000');g.addColorStop(1,`rgba(2,8,13,${amount})`);c.fillStyle=g;c.fillRect(0,0,W,H);
  }
  function coverImage(c, img, zoom=1, dx=0, dy=0) {
    const scale=Math.max(W/img.width,H/img.height)*zoom,w=img.width*scale,h=img.height*scale;
    c.drawImage(img,(W-w)/2+dx,(H-h)/2+dy,w,h);
  }
  function atmosphericLight(c, env, t, energy) {
    c.save();c.globalCompositeOperation='screen';
    const late=ramp(t,98,118), actionLight=Math.exp(-(performance.now()/1000-effects.light)*.8);
    const strength=env==='room'?.8:.43;
    const light=[lerp(252,194,late),lerp(211,225,late),lerp(151,245,late)].map(Math.round);
    glow(c,1190,180,600,`rgba(${light.join(',')},${strength*.14+energy*.045})`);
    glow(c,510,460,320,`rgba(102,196,177,${.035+actionLight*.24})`);
    if(t<110.4){
      c.fillStyle=`rgba(249,229,177,${.035+energy*.015})`;
      for(let i=0;i<5;i++){
        const wind=Math.sin(t*.15+i)*25;
        path(c,[[1040+i*60+wind,0],[1075+i*65,0],[590+i*125+wind,900],[490+i*125+wind,900]],c.fillStyle);
      }
    }
    c.restore();
  }
  function curtains(c, t, env) {
    if(env!=='room')return;
    // Only transparent fabric pixels enter the bend. The clean backplate and
    // the foreground chairs are separate images in the same source coordinates.
    const img=images['room-curtains'];
    const scale=Math.max(W/img.width,H/img.height)*1.015;
    const width=img.width*scale,height=img.height*scale,dx=(W-width)/2,dy=(H-height)/2;
    for(let y=0;y<img.height;y+=6){
      const row=Math.min(6,img.height-y),depth=clamp(y/(img.height*.7));
      const bend=reduced?0:(Math.sin(t*.85-y*.005)+.32*Math.sin(t*1.3-y*.009))*9*depth**1.8;
      c.drawImage(img,0,y,img.width,row,dx+bend,dy+y*scale,width,row*scale+.35);
    }
    coverImage(c,images['room-chairs'],1.015);
  }
  function water(c, t, env) {
    if(env==='room')return;
    c.save();
    if(env==='garden'){
      c.beginPath();c.moveTo(1015,510);c.lineTo(1212,510);c.lineTo(1500,900);c.lineTo(510,900);c.closePath();c.clip();
      const img=images.garden,sx=img.width/W,sy=img.height/H;
      for(let y=520;y<900;y+=5){const wave=reduced?0:Math.sin(t*1.5-y*.08)*((y-510)/150);c.drawImage(img,400*sx,y*sy,1200*sx,5*sy,400+wave,y,1200,6);}
      c.globalAlpha=.2;c.strokeStyle='#aac8c2';c.lineWidth=1;
      for(let i=0;i<15;i++){
        const p=(t*.29+hash(i+8))%1, x=830+hash(i+9)*500,y=610+hash(i+23)*260;
        c.globalAlpha=(1-p)*.18;c.beginPath();c.ellipse(x,y,p*42,p*9,0,0,TAU);c.stroke();
      }
    }else{
      c.globalCompositeOperation='screen';
      for(let i=0;i<10;i++){const x=730+i*32,y=620+i*18;glow(c,x+Math.sin(t*.4+i)*5,y,24+i*6,'rgba(128,183,159,.025)');}
    }
    c.restore();
  }
  function rain(c, t, env, front=false) {
    const amount=env==='platform'?1:(env==='garden'?ramp(t,91,116)*.65:0);
    const interactive=Math.exp(-(performance.now()/1000-effects.rain)*.4);
    if(amount+interactive<.02)return;
    c.save();c.strokeStyle=front?'#a3c4ca':'#b0c9cf';c.lineWidth=front?1.4:.7;
    const n=front?42:90;
    for(let i=0;i<n;i++){
      const x=hash(i+241)*1900-100-(reduced?0:t*(front?23:13))%180;
      const y=(hash(i+380)*1200+(reduced?0:t*(front?310:190)))%1100-100;
      c.globalAlpha=(amount+interactive*.4)*(front?.13:.17)*(hash(i+7)*.6+.4);
      c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y+(front?37:21));c.stroke();
    }
    if(front){
      for(let i=0;i<18;i++){
        const x=hash(i+713)*W,y=(hash(i+89)*1100+t*(reduced?0:13+hash(i)*17))%1100-80;
        c.globalAlpha=amount*.22;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-3,y+10,x+2,y+23,x-2,y+36);c.stroke();
      }
    }
    c.restore();
  }
  function dust(c,t,env,energy,front=false) {
    const late=ramp(t,106,119),count=front?14:58;
    c.save();c.globalCompositeOperation='screen';
    for(let i=0;i<count;i++){
      const dep=hash(i+17),speed=front?14:5;
      const x=(hash(i+10)*1800+Math.sin(t*.15+i)*35+t*speed) % 1800-100;
      const y=(hash(i+51)*1050-t*(front?7:3))%1050;
      const a=(.12+dep*.3)*(1-late*.85)*( .65+.35*Math.sin(t+i));
      c.globalAlpha=a; c.fillStyle=env==='room'?'#f5db9f':'#c3e4d8';
      c.beginPath();c.ellipse(x,y,(front?2.5:.8)+dep*1.8,(front?2.5:.8)+dep*1.8,0,0,TAU);c.fill();
    }
    c.restore();
  }
  function foreground(c,s,t,p) {
    c.save();
    if(s.env==='garden'){
      // Foreground grasses move at a different depth from the painted garden.
      for(let i=0;i<12;i++){
        const right=i>5, x=right?1550+hash(i)*160:-50+hash(i)*170;
        const wind=(reduced?0:Math.sin(t*.7+i)*17);const y=950,h=150+hash(i+7)*190;
        c.strokeStyle=i%2?'#243e38':'#3a5145';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+wind,y-h*.4,x+wind*2,y-h*.7,x+wind*3,y-h);c.stroke();
        for(let j=0;j<3;j++){c.fillStyle=i%2?'#3f5549':'#2b453c';c.beginPath();c.ellipse(x+wind*(j+1)+12,y-h+j*30,22,5,-.7+j*.4,0,TAU);c.fill();}
      }
    }
    if(t>110.4)actor.reflection(c,s,t,p);
    c.restore();
  }
  function backgroundGrade(c,s,t,p) {
    // Color blending preserves the painted backdrop's luminance. The story
    // gets colder through hue, weather and space, never a growing dark overlay.
    const cold=ramp(t,104,119);
    let tint=s.env==='room'?'#dec499':s.env==='garden'?'#b6cfbf':'#9bbdc7';
    let amount=.16;
    if(cold>0){tint='#93b6ca';amount=lerp(.16,.48,cold);}
    if(s.action==='dayNight'||s.action==='reverseTime'){
      const dusk=s.action==='dayNight'?ease(p):1-ease(p);
      tint='#9cafda';amount=.18+dusk*.3;
    }
    c.save();c.globalCompositeOperation='color';c.globalAlpha=amount;
    c.fillStyle=tint;c.fillRect(0,0,W,H);c.restore();
  }

  const layers=[document.createElement('canvas'),document.createElement('canvas')];
  for(const l of layers){l.width=W;l.height=H;}
  const contexts=layers.map(l=>l.getContext('2d',{alpha:false}));
  function drawShot(c,s,t,now) {
    const p=shotProgress(s,t),e=ease(p),sound=framePulse(t),energy=sound[0];
    c.setTransform(renderScale,0,0,renderScale,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#0b1418';c.fillRect(0,0,W,H);
    const cam=s.from.map((v,i)=>lerp(v,s.to[i],e));
    if(reduced){cam[0]=800;cam[1]=450;cam[2]=1.04;cam[3]=0;}
    const breathe=(!reduced&&t<110.4)?Math.sin(t*.6)*.0018:0;
    c.save();c.translate(800,450);c.rotate(cam[3]);c.scale(cam[2]+breathe,cam[2]+breathe);c.translate(-cam[0]+drift.x*3,-cam[1]+drift.y*2);
    c.save();c.translate(-drift.x*2,-drift.y);coverImage(c,images[s.env==='room'?'room-bare':s.env],1.015);curtains(c,t,s.env);water(c,t,s.env);backgroundGrade(c,s,t,p);c.restore();
    atmosphericLight(c,s.env,t,energy);rain(c,t,s.env);dust(c,t,s.env,energy);
    actor.before(c,s,t,p);actor.character(c,s,t,p);actor.after(c,s,t,p);
    foreground(c,s,t,p);rain(c,t,s.env,true);dust(c,t,s.env,energy,true);vignette(c,.16);
    if(s.action==='power'){c.save();c.fillStyle='#071016';c.globalAlpha=(1-ramp(p,.22,.65))*.85;c.fillRect(0,0,W,H);c.restore();}
    c.restore();
  }
  function render(t,now=performance.now()/1000) {
    if(!loaded)return;
    t=clamp(t,0,pulse.duration);const s=currentShot(t);
    const c0=contexts[0];drawShot(c0,s,t,now);
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(layers[0],0,0,W,H);
    // Optical dissolves and a few motivated cuts, never a flashing transition.
    const previous=shots[s.index-1];
    const changed=previous&&(previous.gesture!==s.gesture||previous.env!==s.env);
    const transition=changed?Math.min(.16,(s.end-s.start)*.12):0;
    const elapsed=t-s.start;
    if(s.index&&elapsed<transition){
      const prev=shots[s.index-1];drawShot(contexts[1],prev,prev.end-.001,now);
      ctx.globalAlpha=1-ease(elapsed/transition);ctx.drawImage(layers[1],0,0,W,H);ctx.globalAlpha=1;
    }
    // A distant reflection reacts to a touch; it does not change the film's ending.
    const touchAge=now-effects.touch;
    if(touchAge<2.5){
      ctx.save();ctx.strokeStyle=t>110.4?'#aac5c6':'#e2d5a9';
      for(let i=0;i<3;i++){const age=touchAge-i*.18;if(age<0)continue;ctx.globalAlpha=Math.max(0,.23-age*.095);ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(touchPoint.x,touchPoint.y,age*70,age*26,0,0,TAU);ctx.stroke();}ctx.restore();
    }
    // Cinema framing leaves portraits intentionally cropped below the chest rather than floating.
    ctx.fillStyle='#080e11';ctx.fillRect(0,0,W,46);ctx.fillRect(0,H-46,W,46);
    const fadeIn=1-ramp(t,0,1.2);
    if(fadeIn){ctx.fillStyle=`rgba(4,9,13,${fadeIn})`;ctx.fillRect(0,0,W,H);}
    if(t>210){glow(ctx,1175,425,5,'rgba(238,208,143,.14)',1-ramp(t,211.5,pulse.duration));}
    if(captions){const line=window.LYRICS.find(([a,b])=>t>=a&&t<b);$('caption').textContent=line?.[2]??'';}else $('caption').textContent='';
    visualTime=t;
    updateTerminal(t,now);
    return s;
  }

  function notice(message) {
    $('stage-notice').textContent=message;
    clearTimeout(notice.timer);notice.timer=setTimeout(()=>$('stage-notice').textContent='',2200);
  }
  function reportError(message) { $('error').textContent=message;$('error').hidden=false; }
  async function togglePlay() {
    if(!loaded)return;
    override=null;
    if(audio.paused){
      if(audio.ended)audio.currentTime=0;
      try{await audio.play();started=true;$('cover').hidden=true;}catch(err){reportError('Не удалось запустить звук. Нажмите воспроизведение ещё раз.');}
    }else audio.pause();
    syncPlayer();
  }
  function seekTo(t) {
    override=null;terminalSession.shot=-1;terminalSession.history=[];audio.currentTime=clamp(t,0,audio.duration||pulse.duration);
    if(!started){started=true;$('cover').hidden=true;}
    render(audio.currentTime);syncPlayer();
  }
  function syncPlayer() {
    const t=override??audio.currentTime,dur=audio.duration||pulse.duration;
    $('play').textContent=audio.paused?'▶':'Ⅱ';$('play').setAttribute('aria-label',audio.paused?'Воспроизвести':'Пауза');
    $('elapsed').textContent=clock(t);$('duration').textContent=clock(dur);
    $('seek').max=dur;$('seek').value=t;$('seek').style.setProperty('--progress',`${t/dur*100}%`);
    const n=Math.max(0,chapters.findLastIndex(a=>t>=a[0]));$('chapter').textContent=`${String(n+1).padStart(2,'0')} · ${chapters[n][1]}`;
  }
  function tick(ms) {
    const now=ms/1000,dt=Math.min(.05,now-lastFrame||.016);lastFrame=now;
    drift.x=lerp(drift.x,reduced?0:pointer.x,Math.min(1,dt*3));drift.y=lerp(drift.y,reduced?0:pointer.y,Math.min(1,dt*3));
    const time=override??(started?audio.currentTime:18);
    const began=performance.now();render(time,now);frameCost=performance.now()-began;
    syncPlayer();raf=requestAnimationFrame(tick);
  }
  function updateTerminal(t,now=performance.now()/1000) {
    if($('terminal').hidden)return;
    const s=currentShot(t);
    if(terminalSession.shot!==s.index){
      if(s.index===terminalSession.shot+1&&terminalSession.script){
        terminalSession.history.push(terminalSession.script);
        terminalSession.history=terminalSession.history.slice(-2);
      }else terminalSession.history=[];
      terminalSession.shot=s.index;
      terminalSession.script=s.code||'await world.next();';
      terminalSession.began=now;terminalSession.visible=-1;
    }
    // Wall-clock typing also works when the film is paused. Scene selection follows the song.
    const duration=s.end-s.start,delay=Math.min(.12,duration*.12);
    const cps=Math.max(36,terminalSession.script.length/Math.max(.08,duration*.68-delay));
    const count=Math.min(terminalSession.script.length,Math.floor(Math.max(0,now-terminalSession.began-delay)*cps));
    if(count!==terminalSession.visible){
      terminalSession.visible=count;
      const prefix=terminalSession.history.length?terminalSession.history.join('\n\n')+'\n\n':'';
      $('terminal-code').textContent=prefix+terminalSession.script.slice(0,count);
      $('terminal-output').scrollTop=$('terminal-output').scrollHeight;
    }
    $('terminal-clock').textContent=clock(t);
  }
  function setTerminal(open) {
    $('terminal').hidden=!open;$('terminal-toggle').setAttribute('aria-expanded',String(open));
    if(open){terminalSession.shot=-1;terminalSession.history=[];updateTerminal(visualTime);$('terminal-output').focus({preventScroll:true});}
    else $('terminal-toggle').focus({preventScroll:true});
  }
  $('terminal-toggle').addEventListener('click',()=>setTerminal($('terminal').hidden));
  $('terminal-close').addEventListener('click',()=>setTerminal(false));
  $('start').addEventListener('click',togglePlay);$('play').addEventListener('click',togglePlay);
  $('seek').addEventListener('input',e=>seekTo(+e.target.value));
  $('volume').addEventListener('input',e=>audio.volume=+e.target.value);audio.volume=.75;
  $('cc').addEventListener('click',()=>{captions=!captions;$('cc').setAttribute('aria-pressed',String(captions));$('caption').setAttribute('aria-hidden',String(!captions));$('cc').setAttribute('aria-label',captions?'Скрыть текст песни':'Показать текст песни');if(loaded)render(visualTime);});
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.cinema').requestFullscreen();}catch{notice('Полный экран недоступен в этом окне.');}}
  $('fullscreen').addEventListener('click',fullscreen);
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented||e.target.matches('input,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='Escape'&&!$('terminal').hidden){e.preventDefault();setTerminal(false);return;}
    if(e.code==='Space'&&e.target.closest('button,a'))return;
    if(e.code==='Space'){e.preventDefault();togglePlay();}
    else if(e.code==='ArrowRight'){e.preventDefault();seekTo(audio.currentTime+5);}
    else if(e.code==='ArrowLeft'){e.preventDefault();seekTo(audio.currentTime-5);}
    else if(e.key.toLowerCase()==='f')fullscreen();
    else if(e.key.toLowerCase()==='c')$('cc').click();
    else if(e.key.toLowerCase()==='t')setTerminal($('terminal').hidden);
  });
  function worldPoint(e){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/W,r.height/H);return {x:(e.clientX-r.left-(r.width-W*scale)/2)/scale,y:(e.clientY-r.top-(r.height-H*scale)/2)/scale};}
  canvas.addEventListener('pointermove',e=>{const p=worldPoint(e);pointer={x:clamp((p.x/W-.5)*2,-1,1),y:clamp((p.y/H-.5)*2,-1,1)};});
  canvas.addEventListener('pointerleave',()=>{pointer={x:0,y:0};});
  canvas.addEventListener('pointerdown',e=>{if(!loaded)return;touchPoint=worldPoint(e);effects.touch=performance.now()/1000;effects.light=effects.touch;if(touchPoint.x>1000){effects.mirror=effects.touch;if(currentShot(visualTime).env!=='room')effects.rain=effects.touch;}stage.focus({preventScroll:true});});
  for(const event of ['loadedmetadata','play','pause','ended','seeked'])audio.addEventListener(event,syncPlayer);
  audio.addEventListener('ended',()=>{override=null;render(pulse.duration);});
  audio.addEventListener('error',()=>reportError('Не удалось прочитать MP3. Откройте проект через python3 server.py из корня репозитория.'));
  const ready=Promise.all([
    ...['room','garden','platform','poses','portraits','acting-create','acting-connect','acting-loss','acting-transform','acting-book','acting-natural','acting-botanical','acting-interlude','acting-memory','room-bare','room-curtains','room-chairs'].map(name=>new Promise((resolve,reject)=>{
      const img=new Image();img.onload=()=>{images[name]=img;resolve();};img.onerror=()=>reject(new Error(name));img.src=`assets/${name}.png`;
    })),
    new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images.chibi=img;resolve();};img.onerror=()=>reject(new Error('chibi'));img.src='assets/chibi.png';}),
    fetch('assets/pulse.json').then(r=>{if(!r.ok)throw new Error('pulse');return r.json();}).then(data=>{pulse=data;})
  ]).then(()=>{
    actor.prepare();loaded=true;$('loading').hidden=true;$('cover').hidden=false;$('play').disabled=false;
    for(const [t] of chapters.slice(1)){const span=document.createElement('span');span.style.left=`${t/pulse.duration*100}%`;$('marks').append(span);}
    render(18);syncPlayer();if(!exporting)raf=requestAnimationFrame(tick);return true;
  }).catch(err=>{reportError(`Не удалось загрузить иллюстрации (${err.message}). Запустите python3 server.py из корня репозитория и откройте /echo-film/.`);$('loading').hidden=true;return false;});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0;}
    else if(loaded&&!raf&&!exporting){lastFrame=0;raf=requestAnimationFrame(tick);}
  });
  // Inspection hooks for desktop verification and editing, not a video export pipeline.
  window.echoFilm={ready,shots,chapters,canvas,play:togglePlay,seek:seekTo,coverage:actor.coverage,direction:window.ECHO_DIRECTION,
    resizeForExport(width,height){
      if(!exporting)throw new Error('Export sizing requires ?export.');
      if(width/height!==W/H)throw new Error('Export must use a 16:9 frame.');
      renderScale=width/W;canvas.width=width;canvas.height=height;
      for(const l of layers){l.width=width;l.height=height;}
    },
    renderForExport(t){
      if(!exporting)throw new Error('Offline frames require ?export.');
      return render(t,t);
    },
    describeAt(t){const s=currentShot(t);return {...actor.describe(s),progress:shotProgress(s,t),hand:actor.anchor(s,t,shotProgress(s,t)),motion:actor.motion(s,t,shotProgress(s,t))};},
    showAt(t){audio.pause();override=clamp(t,0,pulse.duration);started=true;$('cover').hidden=true;render(override);syncPlayer();return currentShot(override);},
    get state(){return {loaded,started,time:visualTime,shot:currentShot(visualTime).index,environment:currentShot(visualTime).env,motif:currentShot(visualTime).motif,lyricIndex:currentShot(visualTime).lyricIndex,gesture:currentShot(visualTime).gesture,paused:audio.paused,terminal:!$('terminal').hidden,terminalCharacters:terminalSession.visible,captions,frameCost,ending:'open'};}
  };
})();
