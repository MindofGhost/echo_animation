/* Offline video composition. Interactive playback keeps its ordinary UI. */
(() => {
  'use strict';
  if (!new URLSearchParams(location.search).has('export')) return;
  const W=1600,H=900,film=window.echoFilm;
  const canvas=document.createElement('canvas'),c=canvas.getContext('2d',{alpha:false});
  let scale=1;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const clock=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;

  function terminalAt(t){
    const shot=film.shots.findLast(s=>t>=s.start)||film.shots[0];
    const script=shot.code||'await world.next();',duration=shot.end-shot.start;
    const delay=Math.min(.12,duration*.12);
    const cps=Math.max(36,script.length/Math.max(.08,duration*.68-delay));
    const count=Math.min(script.length,Math.floor(Math.max(0,t-shot.start-delay)*cps));
    const history=film.shots.slice(Math.max(0,shot.index-2),shot.index).map(s=>s.code||'await world.next();');
    const corner=shot.action==='formula'?'bottom-left':
      ['lead','follow','trance','gender','genderMorph'].includes(shot.action)?'bottom-right':'top-right';
    return {shot:shot.id,script,count,history,corner,time:clock(t)};
  }
  function wrapped(text,maxWidth){
    const lines=[];
    for(const source of text.split('\n')){
      let line='';
      for(const char of source){
        if(line&&c.measureText(line+char).width>maxWidth){lines.push(line);line='';}
        line+=char;
      }
      lines.push(line);
    }return lines;
  }
  function terminal(t){
    const state=terminalAt(t),w=420,h=280;
    const x=state.corner==='bottom-left'?48:W-48-w;
    const y=state.corner==='top-right'?135:H-62-h;
    c.save();c.translate(x,y);
    c.shadowColor='#0008';c.shadowBlur=25;c.shadowOffsetY=8;
    c.fillStyle='#081215ef';c.fillRect(0,0,w,h);c.shadowBlur=0;c.shadowOffsetY=0;
    c.strokeStyle='#9cceb466';c.lineWidth=.8;c.strokeRect(.4,.4,w-.8,h-.8);
    c.strokeStyle='#b1d6bf33';c.beginPath();c.moveTo(0,35);c.lineTo(w,35);c.stroke();
    c.fillStyle='#c1dba8';c.beginPath();c.arc(15,17.5,2.5,0,Math.PI*2);c.fill();
    c.font='10px "Courier New",monospace';c.fillStyle='#8aa896';c.fillText('echo / auto',26,21);
    c.fillStyle='#93b69f';c.fillText(state.time,w-49,21);
    c.save();c.beginPath();c.rect(15,46,w-30,h-65);c.clip();
    c.font='12px "Courier New",monospace';
    const prefix=state.history.length?state.history.join('\n\n')+'\n\n':'';
    const lines=wrapped(prefix+state.script.slice(0,state.count),w-30),lineHeight=20.4;
    const firstY=60-Math.max(0,lines.length*lineHeight-(h-70));
    lines.forEach((line,i)=>{
      c.fillStyle=i<wrapped(prefix,w-30).length-1?'#6f9584':'#c5e0ce';
      c.fillText(line,15,firstY+i*lineHeight);
    });
    if(Math.floor(t/.6)%2===0){
      c.fillStyle='#c5dec5';c.fillRect(16+c.measureText(lines.at(-1)||'').width,firstY+(lines.length-1)*lineHeight-10,5,12);
    }c.restore();c.restore();return state;
  }
  function resize(width,height){
    if(width/height!==W/H)throw new Error('Video composition requires 16:9.');
    canvas.width=width;canvas.height=height;scale=width/W;
    film.resizeForExport(width,height);
  }
  function renderAt(t){
    const shot=film.renderForExport(t);
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.drawImage(film.canvas,0,0);
    c.setTransform(scale,0,0,scale,0,0);terminal(t);return shot;
  }
  window.echoVideo={canvas,ready:film.ready,resize,renderAt,terminalAt};
})();
