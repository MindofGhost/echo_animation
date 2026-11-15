/* Phrase-level acting with intact illustrations and source-space prop contacts. */
window.createEchoPerformance = function createEchoPerformance(options) {
  'use strict';
  const { images, clamp, lerp, ease, ramp, hash, path, glow, reduced } = options;
  const TAU=Math.PI*2, assets={
    press:['acting-create',0],protect:['acting-create',1],arrange:['acting-create',2],card:['acting-create',3],
    trace:['acting-connect',0],hug:['acting-connect',1],blind:['acting-connect',2],listen:['acting-connect',3],
    heart:['acting-loss',0],glass:['acting-loss',1],kneel:['acting-loss',3],
    read:['acting-book',0],learnBook:['acting-book',1],askBook:['acting-book',2],answerBook:['acting-book',3],
    serve:['acting-transform',0],cat:['acting-transform',1],male:['acting-transform',2],stand:['acting-transform',3],
    offer:['poses',1],reach:['poses',2],sit:['poses',3],
    papers:['acting-natural',0],seedKneel:['acting-natural',1],quiet:['acting-natural',2],seedStand:['acting-natural',3],
    eggplantHold:['acting-botanical',0],tomatoHold:['acting-botanical',1],eggplantPlant:['acting-botanical',2],tomatoPlant:['acting-botanical',3],
    waterPlant:['acting-interlude',0],liftPlant:['acting-interlude',1],carryPlant:['acting-interlude',2],placePlant:['acting-interlude',3],
    memory:['acting-memory',0],tornMemory:['acting-memory',1],findMemory:['acting-memory',2],keepMemory:['acting-memory',3]
  };
  // Source-space contacts in a 627px sheet cell. Never cut or deform the limbs.
  const anatomy={
    press:{tip:[477,278]},
    protect:{tip:[368,121],heart:[310,245]},
    arrange:{tip:[524,484]},
    card:{tip:[372,208],card:[345,181]},
    trace:{tip:[524,131]},hug:{tip:[493,186]},
    blind:{tip:[340,133]},listen:{tip:[258,133],heart:[321,231]},
    heart:{tip:[302,221],heart:[298,220]},
    glass:{tip:[440,132]},read:{tip:[355,270],book:[405,285]},
    learnBook:{tip:[350,285],book:[330,260],heart:[330,260]},askBook:{tip:[245,160],book:[400,285]},answerBook:{tip:[360,277],book:[405,290]},kneel:{tip:[429,562]},
    serve:{tip:[426,204],bowl:[428,182]},cat:{tip:[344,407]},male:{tip:[344,219]},stand:{tip:[455,331]},
    offer:{tip:[488,176]},reach:{tip:[546,84]},sit:{tip:[386,493]},
    papers:{tip:[368,521]},seedKneel:{tip:[311,338],plant:[318,265]},
    quiet:{tip:[337,278]},seedStand:{tip:[330,205],plant:[323,139]},
    eggplantHold:{tip:[402,263]},tomatoHold:{tip:[386,268]},eggplantPlant:{tip:[310,280]},tomatoPlant:{tip:[310,280]},
    waterPlant:{tip:[342,349],spout:[433,420],plant:[480,490]},liftPlant:{tip:[375,316],plant:[365,248]},
    carryPlant:{tip:[394,256],plant:[383,211]},placePlant:{tip:[406,503],plant:[422,458]},
    memory:{tip:[370,210]},tornMemory:{tip:[370,210]},findMemory:{tip:[400,510]},keepMemory:{tip:[340,270]}
  };
  const parts={},pointClouds={};
  const direction=window.ECHO_DIRECTION;
  if(!direction||direction.length!==window.LYRICS.length)throw new Error('Every lyric must have an authored performance.');
  const entries=direction.map(d=>({...d,motif:d.action,frame:'acting',pose:assets[d.gesture][1]}));
  const rests=[
    {start:0,end:.03,env:'room',gesture:'press',action:'rest',intent:'Рука готовится включить питание.'},
    {start:16.10,end:18.8,env:'room',gesture:'waterPlant',action:'waterPlant',intent:'Поливает росток: струя и отдельные капли достигают земли.'},
    {start:18.8,end:22.3,env:'room',gesture:'liftPlant',action:'liftPlant',intent:'Поднимает горшок ближе к лицу и рассматривает листья.'},
    {start:22.3,end:25.5,env:'room',gesture:'carryPlant',action:'carryPlant',intent:'Бережно несёт горшок к окну; камера следует к свету.'},
    {start:25.5,end:29.28,env:'garden',gesture:'placePlant',action:'placePlant',intent:'Ставит росток в стеклянном саду; первые капли расходятся по воде.'},
    {start:134.70,end:141,env:'room',gesture:'keepMemory',action:'exhaustion',intent:'После разрыва остаётся с одной сохранённой открыткой.'},
    {start:141,end:147.52,env:'platform',gesture:'heart',action:'wait',intent:'Ждёт ответа в пустом пространстве.'},
    {start:194.75,end:201.3,env:'platform',gesture:'sit',action:'afterglow',intent:'Садится и обнимает колени.'},
    {start:201.3,end:205.56,env:'platform',gesture:'sit',action:'horizon',intent:'Смотрит в дальнее освещённое окно.'},
    {start:207.30,end:212.3755,env:'platform',gesture:'sit',action:'outro',intent:'Остаётся сидеть у стекла; вдали горит один свет.'}
  ].map((d,i)=>({...d,id:`rest-${i}`,lyricIndex:null,variant:0,frame:'acting',motif:d.action,code:'await world.next();'}));
  const shots=[...entries,...rests].sort((a,b)=>a.start-b.start).map((s,index)=>{
    const wide=['isolation','horizon','outro','afterglow'].includes(s.action);
    const zoom=wide?1.02:1.045;
    const interlude={waterPlant:[[875,500,1.18,0],[875,490,1.23,0]],liftPlant:[[875,500,1.16,0],[875,480,1.23,0]],carryPlant:[[810,450,1.04,0],[845,450,1.08,0]],placePlant:[[800,500,1.07,0],[800,490,1.1,0]]}[s.action];
    return {...s,index,from:interlude?interlude[0]:[800,450,zoom,0],to:interlude?interlude[1]:[800+(s.action==='leave'?s.variant*6:0),450,zoom+.018,0]};
  });
  const actionSet=new Set(direction.map(d=>d.action));
  const pulse=p=>Math.sin(Math.PI*ease(clamp(p)));
  function prepare(){
    for(const [gesture,[name,index]] of Object.entries(assets)){
      const image=images[name],cell=image.width/2;
      const base=document.createElement('canvas');base.width=base.height=cell;
      const bc=base.getContext('2d',{willReadFrequently:true});
      // The natural sheet's lower-row hair curl slightly enters the empty
      // bottom margin of the upper cells. Keep only their complete subjects.
      const cropHeight=name==='acting-natural'&&index<2?cell-32:cell;
      const region=name==='acting-interlude'?
        [[0,0,627,590],[627,0,627,590],[0,590,627,664],[627,627,627,627]][index]:
        name==='acting-memory'?[[0,0,627,720],[627,0,627,720],[0,720,627,534],[627,720,627,534]][index]:
        [(index%2)*cell,Math.floor(index/2)*cell,cell,cropHeight];
      const fit=Math.min(cell/region[2],cell/region[3]);
      bc.drawImage(image,...region,(cell-region[2]*fit)/2,0,region[2]*fit,region[3]*fit);
      const raw=bc.getImageData(0,0,cell,cell).data,cloud=[];
      for(let y=5;y<cell;y+=12)for(let x=5;x<cell;x+=12){
        const i=(y*cell+x)*4;if(raw[i+3]>180)cloud.push({x:x/cell,y:y/cell,color:`rgb(${raw[i]},${raw[i+1]},${raw[i+2]})`,z:hash(x+y*cell)});
      }
      pointClouds[gesture]=cloud;
      parts[gesture]={base};
    }
  }
  function layout(s){
    let x=490,y=842,h=775;
    if(['points','dimension','circle','circumference','sine','tangent','formula'].includes(s.action)){x=475;h=760;y=835;}
    if(['read','learnBook','askBook','answerBook'].includes(s.gesture)){h=775;y=845;x=490;}
    if(s.gesture==='arrange'||s.gesture==='kneel'){h=790;y=845;x=500;}
    if(s.gesture==='papers'||s.gesture==='seedKneel'){h=620;y=865;x=875;}
    if(s.gesture==='quiet'){h=720;y=825;}
    if(['waterPlant','liftPlant','placePlant'].includes(s.gesture)){h=660;y=865;x=850;}
    if(s.gesture==='placePlant'){x=470;y=850;}
    if(s.gesture==='carryPlant'){h=740;y=835;x=840;}
    if(s.gesture==='findMemory'||s.gesture==='keepMemory'){h=660;y=860;x=710;}
    if(s.gesture==='memory'||s.gesture==='tornMemory'){x=780;y=840;}
    if(s.gesture==='cat'){h=680;y=840;x=520;}
    if(s.action==='isolation'){h=lerp(600,385,.8);x=430;y=806;}
    if(['afterglow','horizon','outro'].includes(s.action)){h=s.action==='afterglow'?610:440;x=475;y=820;}
    return {x,y,h};
  }
  function motion(s,t,p){
    const a=s.action,v=s.variant||0,q=ease(p),b=pulse(p);
    const m={x:0,y:0,lean:0,scaleX:1,scaleY:1,alpha:1};
    // Small whole-figure shifts only. The complete source drawing stays intact.
    if(!reduced)m.y=Math.sin(t*1.6)*.7;
    if(pressActions.has(a)){
      const push=sinPress(s,p);m.x=push*2;m.lean=push*.002;
      if(a==='execution')m.y+=Math.min(v,12)*.35;
    }
    if(a==='protection'){m.y=b*2;m.lean=-b*.003;}
    if(['pieces','create','collect','erase','tasks'].includes(a)){m.y=b*1.2;m.lean=b*.003;}
    if(['data','initialize','arguments','illegal','study','learnLove','answer'].includes(a))m.lean=-b*.003;
    if(['world','simulate','explore','breathe'].includes(a))m.y-=b*1.4;
    if(['stimulations','reachOffer','happy','pledge','satisfaction','god','proof','resolve'].includes(a))m.y-=b*2.5;
    if(a==='infinity'){m.x=q*7;m.lean=q*.007;}
    if(['limit','trapped','sharedTrap','closingTrap'].includes(a))m.x=b*3;
    if(a==='blind'){m.y=q*3;m.lean=-q*.005;}
    if(a==='dizzy'){m.x=Math.sin(p*TAU*1.5)*5;m.lean=Math.sin(p*TAU*1.5)*.012;}
    if(['join','embrace','gather','completion'].includes(a))m.lean=-b*.004;
    if(a==='cat'){m.scaleX=m.scaleY=lerp(1.03,1,q);m.y-=b*4;}
    if(a==='purr'){m.y-=Math.sin(p*TAU*2)**2*2;m.lean=Math.sin(p*TAU*2)*.004;}
    if(a==='trance'){m.lean=Math.sin(p*TAU)*.008;}
    if(['listenReady','vibrations','question'].includes(a))m.lean=-q*.005;
    if(a==='leave'){m.x=-v*2;m.y=q*v*.7;m.lean=-q*.004;}
    if(['isolation','plead','heartbroken','loveBound','wait','exhaustion'].includes(a)){m.y=q*3;m.lean=-q*.006;}
    if(['choose','recall','challenge'].includes(a))m.lean=b*.006;
    if(a==='nutrients'||a==='antioxidants')m.lean=q*.004;
    if(s.gesture==='waterPlant'){m.lean=Math.sin(p*Math.PI)*.003;}
    if(a==='liftPlant'){m.y-=q*12;m.lean=-b*.004;}
    if(a==='carryPlant'){m.x=q*14;m.y-=b*2;}
    if(a==='placePlant'){m.y=q*7;m.lean=b*.004;}
    if(reduced){m.x=0;m.y=0;m.lean=0;}
    return m;
  }
  function anchor(s,t,p,key='tip',fixed=false){
    const l=layout(s),m=fixed?{x:0,y:0,lean:0,scaleX:1,scaleY:1}:motion(s,t,p);
    const spec=anatomy[s.gesture],local=(spec[key]||spec.tip).map(x=>x/627);
    const x=(local[0]-.5)*l.h*m.scaleX,y=(local[1]-1)*l.h*m.scaleY;
    return {x:l.x+m.x+x*Math.cos(m.lean)-y*Math.sin(m.lean),y:l.y+m.y+x*Math.sin(m.lean)+y*Math.cos(m.lean)};
  }
  function drawPose(c,gesture,l,m,alpha=1){
    const part=parts[gesture];c.save();c.globalAlpha*=alpha*m.alpha;c.translate(l.x+m.x,l.y+m.y);c.rotate(m.lean);c.scale(m.scaleX,m.scaleY);c.translate(-l.h/2,-l.h);
    c.drawImage(part.base,0,0,l.h,l.h);
    c.restore();
  }
  function points(c,s,t,p,alpha){
    const l=layout(s),m=motion(s,t,p),depth=s.action==='dimension'?Math.sin(p*Math.PI)*115:0;
    c.save();c.globalAlpha*=alpha;
    for(const point of pointClouds[s.gesture]){
      const x=l.x+(point.x-.5)*l.h+m.x+(point.z-.5)*depth,y=l.y+(point.y-1)*l.h+m.y+(point.z-.5)*depth*.24;
      c.fillStyle=point.color;c.beginPath();c.arc(x,y,s.action==='dimension'?2.1:lerp(4,2.3,ease(p)),0,TAU);c.fill();
    }c.restore();
  }
  function character(c,s,t,p){
    const l=layout(s),m=motion(s,t,p),a=s.action;
    if(['points','dimension'].includes(a)){
      const amount=a==='points'?ramp(p,0,.8):1-ramp(p,.55,1);
      drawPose(c,s.gesture,l,m,1-amount);points(c,s,t,p,amount);return;
    }
    if(a==='eggplant'||a==='tomato'){
      const blend=ramp(p,.4,.8),plant=a==='eggplant'?'eggplantPlant':'tomatoPlant';
      drawPose(c,s.gesture,l,m,1-blend);
      drawPose(c,plant,{...l,h:490,y:832},{...m,lean:0},blend);return;
    }
    if(a==='illegal'){drawPose(c,p<.38?'memory':'tornMemory',l,m);return;}
    if(a==='dizzy')for(const offset of [-9,9])drawPose(c,s.gesture,{...l,x:l.x+offset},{...m,lean:m.lean-offset*.001},.08);
    if(a==='infinity')for(let i=5;i>=1;i--)drawPose(c,s.gesture,{...l,x:l.x+150+i*100,h:l.h*(1-i*.105),y:790-i*15},m,.13-i*.015);
    drawPose(c,s.gesture,l,m);
  }
  function stroke(c,points,color='#c9ddce',width=1.7,alpha=.75){
    if(!points.length)return;c.save();c.lineCap='round';c.lineJoin='round';c.globalAlpha*=alpha;c.beginPath();
    points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));
    c.strokeStyle='#20363d';c.lineWidth=Math.max(2.5,width+1.2);c.shadowColor='#13282e';c.shadowBlur=2;c.stroke();
    c.strokeStyle=color;c.lineWidth=Math.max(1.8,width);c.shadowBlur=0;c.stroke();c.restore();
  }
  function switchProp(c,s,t,p){
    const tip=anchor(s,t,p,'tip',true),press=sinPress(s,p),x=tip.x+3,y=tip.y-6;
    c.save();
    c.strokeStyle='#7c8d81';c.lineWidth=2;c.globalAlpha=.6;c.beginPath();c.moveTo(x+20,y+25);c.bezierCurveTo(x+50,y+90,x+31,700,x+50,900);c.stroke();
    c.globalAlpha=1;c.fillStyle='#4d6158';c.strokeStyle='#b4bfa384';c.lineWidth=1;c.beginPath();c.roundRect(x-4,y-16,32,51,5);c.fill();c.stroke();
    c.fillStyle='#c4ceb8';c.beginPath();c.roundRect(x+1+press*3,y-7+press*3,17,29,3);c.fill();
    c.fillStyle=t<110.4?'#d4d3a0':'#a9beb8';c.beginPath();c.arc(x+12,y-11,1.7,0,TAU);c.fill();
    c.restore();
  }
  const pressActions=new Set(['power','current','direct','run','execution','executeAll','executeOnly','executeReturn','finalExecution']);
  function sinPress(s,p){return s.action==='finalExecution'?ease(p):pulse(clamp((p-.08)/.88));}
  const glassActions=new Set(['limit','trapped','simulation','sharedTrap','closingTrap','free','loveBound','gender','genderMorph','infinity','run','execution','executeAll','executeOnly','executeReturn','finalExecution']);
  function glassSurface(c,s,t,p,front=false){
    c.save();
    if(!front){
      // A window extends beyond the shot: no rectangle around the character.
      const g=c.createLinearGradient(720,0,1220,0);
      g.addColorStop(0,'#b4d2d000');g.addColorStop(.38,'#d1e0da03');g.addColorStop(.56,'#d5e5df16');g.addColorStop(.63,'#ecf0e50a');g.addColorStop(1,'#8badbe00');
      c.fillStyle=g;path(c,[[870,-100],[1420,-100],[1100,1000],[550,1000]],g);
      // Short reflected highlights, never a closed border or a glowing frame.
      c.strokeStyle='#d4e0da';c.lineWidth=1;c.globalAlpha=.24;
      c.beginPath();c.moveTo(1240,-30);c.lineTo(1190,140);c.moveTo(1045,650);c.lineTo(1000,805);c.stroke();
    }else{
      const tip=anchor(s,t,p),touch=['limit','trapped','simulation','sharedTrap','free'].includes(s.action)||s.gesture==='glass';
      if(touch){
        const a=.12+.12*pulse(p);glow(c,tip.x,tip.y+12,52,'rgba(210,226,222,.15)',a*3);
        c.fillStyle='#cadfd7';c.globalAlpha=a*.5;c.beginPath();c.ellipse(tip.x,tip.y+11,17,24,-.1,0,TAU);c.fill();
        for(let i=0;i<4;i++){c.beginPath();c.ellipse(tip.x-17+i*10,tip.y-16-Math.sin(i*Math.PI/3)*9,3,13,-.12,0,TAU);c.fill();}
      }
      for(let i=0;i<18;i++){
        const x=800+hash(i+71)*650,y=90+hash(i+91)*700;c.globalAlpha=.12+hash(i)*.12;c.strokeStyle='#c7dedb';c.lineWidth=.8;
        c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-2,y+6,x+1,y+15+hash(i+9)*13);c.stroke();
      }
    }c.restore();
  }
  function contact(c,s,t,p,alpha=.18){
    const l=layout(s),m=motion(s,t,p);c.save();c.globalAlpha*=alpha;c.translate(1780,0);c.scale(-1,1);drawPose(c,s.gesture,{...l,x:620},m);c.restore();
  }
  function roleReflection(c,s,t,p){
    // A visible partner answers the gesture. No thread is attached to her ear.
    const gesture=s.action==='lead'?'listen':s.action==='follow'?'trace':'listen';
    const m=motion(s,t,p),answer=ramp(p,.08,.55);
    c.save();c.globalAlpha=.32+answer*.13;c.filter='saturate(.65)';
    c.translate(2240,0);c.scale(-1,1);
    drawPose(c,gesture,{x:1110,y:832,h:745},{...m,x:0,y:m.y*.7});c.restore();
  }
  function flower(c,x,y,scale=1,alpha=1){
    c.save();c.translate(x,y);c.scale(scale,scale);c.globalAlpha*=alpha;c.strokeStyle='#8b9b77';c.lineWidth=2;c.beginPath();c.moveTo(0,30);c.quadraticCurveTo(8,5,0,-15);c.stroke();
    for(let i=0;i<6;i++){const a=i*TAU/6;c.fillStyle='#e2ddbe';c.beginPath();c.ellipse(Math.cos(a)*10,-18+Math.sin(a)*10,9,4,a,0,TAU);c.fill();}
    c.fillStyle='#ccb77e';c.beginPath();c.arc(0,-18,5,0,TAU);c.fill();c.restore();
  }
  function petal(c,x,y,size,angle,alpha){
    c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;
    c.shadowColor='#4b4a3b66';c.shadowBlur=3;c.shadowOffsetY=1;
    const g=c.createLinearGradient(-size,0,size,size*.3);g.addColorStop(0,'#efc7a4');g.addColorStop(.5,'#fff0cf');g.addColorStop(1,'#cfab8c');
    c.fillStyle=g;c.beginPath();c.moveTo(-size,0);c.bezierCurveTo(-size*.4,-size*.85,size*.75,-size*.65,size,0);c.bezierCurveTo(size*.5,size*.48,-size*.4,size*.5,-size,0);c.fill();c.restore();
  }
  function waterPlant(c,s,t,p){
    const source=anchor(s,t,p,'spout'),target=anchor(s,t,p,'plant');
    c.save();c.strokeStyle='#c7e0db';c.lineWidth=1.4;c.globalAlpha=.6;
    c.beginPath();c.moveTo(source.x,source.y);c.quadraticCurveTo(target.x-12,source.y+20,target.x,target.y+14);c.stroke();
    for(let i=0;i<9;i++){
      const q=(t*1.7+i/9)%1,x=lerp(source.x,target.x,q),y=lerp(source.y,target.y+14,q)+Math.sin(q*Math.PI)*-5;
      c.globalAlpha=.5;c.fillStyle='#e5eeea';c.beginPath();c.ellipse(x,y,1.4,3,.1,0,TAU);c.fill();
    }c.restore();
  }
  function marks(c,s,t,p){
    const a=s.action,tip=anchor(s,t,p),fixed=anchor(s,t,p,'tip',true);
    if(a==='circle'||a==='circumference'){
      // The touch starts a drawing on the glass; the hand itself is not a rig.
      const q=clamp((t-33.01)/(36.77-33.01)),radius=92;
      const line=[];for(let i=0;i<=Math.ceil(q*120);i++){
        const angle=Math.min(q,i/120)*TAU;
        line.push({x:fixed.x+radius-radius*Math.cos(angle),y:fixed.y+radius*Math.sin(angle)});
      }
      stroke(c,line,'#e2e4cd',2,.85);
      const head=line[line.length-1];if(head)glow(c,head.x,head.y,15,'rgba(240,220,154,.22)');
      if(a==='circumference')stroke(c,line,'#e1cfa1',3,ramp(p,.55,1)*.4);
    }
    if(a==='sine'||a==='tangent'){
      const q=clamp((t-36.77)/(40.36-36.77)),line=[];
      for(let i=0;i<=Math.ceil(q*140);i++){
        const phase=Math.min(q,i/140);line.push({x:fixed.x+phase*380,y:fixed.y+Math.sin(phase*TAU*1.35)*48});
      }
      stroke(c,line,'#c0ddce',2,.85);
      if(a==='tangent'){
        const x=fixed.x+q*380,y=fixed.y+Math.sin(q*TAU*1.35)*48,dy=Math.cos(q*TAU*1.35)*48*TAU*1.35/380;
        stroke(c,[{x:x-95*p,y:y-95*p*dy},{x:x+95*p,y:y+95*p*dy}],'#e1cfa1',1.5,.75);
      }
    }
    if(a==='formula'){
      // Daylight ink: generous spacing, a pale edge and no dark screen overlay.
      const written=ramp(p,.02,.3),drawn=ramp(p,.03,.38);
      const text=(value,x,y,font)=>{
        c.font=font;c.lineJoin='round';c.strokeStyle='#fff2d8';c.lineWidth=4;
        c.strokeText(value,x,y);c.fillStyle='#183c40';c.fillText(value,x,y);
      };
      c.save();c.globalAlpha=ramp(p,0,.08);
      text('L(you, me) = ∞',900,225,'italic 42px Georgia');
      const expression='(x² + y² − 1)³ = x²y³';
      text(expression.slice(0,Math.ceil(written*expression.length)),900,285,'36px Georgia');
      const line=[],beat=reduced?1:1+Math.sin(t*TAU*.85)*.009;
      for(let i=0;i<=Math.ceil(drawn*180);i++){
        const theta=Math.min(drawn,i/180)*TAU;
        line.push({x:1120+10*beat*Math.sin(theta)**3*16,y:480-(13*Math.cos(theta)-5*Math.cos(2*theta)-2*Math.cos(3*theta)-Math.cos(4*theta))*10*beat});
      }
      c.beginPath();line.forEach((point,i)=>i?c.lineTo(point.x,point.y):c.moveTo(point.x,point.y));
      c.lineJoin='round';c.lineCap='round';c.strokeStyle='#fff1d7';c.lineWidth=7;c.stroke();
      c.strokeStyle='#934753';c.lineWidth=4.2;c.stroke();c.restore();
    }
    if(a==='count'){
      for(let i=0;i<=s.variant;i++){const grow=i===s.variant?ramp(p,.15,1):1,x=fixed.x+i*23;stroke(c,[{x,y:fixed.y-10},{x:x+2,y:fixed.y-10+grow*27}],'#e0ecdb',3,.9);}
    }
    if(a==='purr'){
      const x=tip.x+135,y=tip.y-90;c.save();c.strokeStyle='#eee1bd';c.lineWidth=2;
      for(let i=0;i<3;i++){
        const q=(p*1.6+i*.31)%1;c.globalAlpha=Math.sin(q*Math.PI)*.65;
        c.beginPath();c.moveTo(x+q*38,y+i*15);c.bezierCurveTo(x+12+q*38,y-9+i*15,x+22+q*38,y+7+i*15,x+29+q*38,y-4+i*15);c.stroke();
      }c.restore();
    }
    if(a==='vibrations'||a==='listenReady'){
      const x=tip.x+85,y=tip.y;c.save();c.strokeStyle='#d5dfc4';c.lineWidth=2.2;
      for(let i=0;i<3;i++){c.globalAlpha=.6-i*.13;c.beginPath();c.arc(x+i*23,y,18+i*14,-.85,.85);c.stroke();}c.restore();
    }
  }
  // Shared fracture topology: fine irregular branches grow along one surface.
  // It never resets to a fresh fan of thick rays for each word.
  const fractures=[];
  for(let branch=0;branch<6;branch++){
    let x=(hash(branch+19)-.5)*8,y=(hash(branch+29)-.5)*8;
    const base=-1.5+branch*.57;
    for(let step=0;step<8;step++){
      const angle=base+(hash(branch*37+step+5)-.5)*.65,len=15+hash(branch*41+step+17)*19;
      const next={x:x+Math.cos(angle)*len,y:y+Math.sin(angle)*len};
      fractures.push({a:{x,y},b:next,at:step/8*.84+branch*.018,width:1.15-step*.06});
      if(step===3||step===5){
        let sx=x,sy=y;const side=angle+(branch%2?-.75:.7);
        for(let k=0;k<3;k++){
          const ex=sx+Math.cos(side+(hash(k+branch*12)-.5)*.6)*(14-k*3),ey=sy+Math.sin(side)*(14-k*3);
          fractures.push({a:{x:sx,y:sy},b:{x:ex,y:ey},at:step/8*.84+.05+k*.025,width:.7});sx=ex;sy=ey;
        }
      }x=next.x;y=next.y;
    }
  }
  function cracks(c,s,t,p){
    const level=s.action==='run'?p*.12:s.action==='execution'?(s.variant+ease(p)+1)/14:s.action==='executeOnly'?lerp(1,.5,ease(p)):1;
    const tip=anchor(s,t,p,'tip',true);
    c.save();c.translate(tip.x,tip.y);c.lineCap='round';
    for(const f of fractures){
      const q=ramp(level,f.at,Math.min(1,f.at+.13));if(!q)continue;
      const x=lerp(f.a.x,f.b.x,q),y=lerp(f.a.y,f.b.y,q);
      c.globalAlpha=.32;c.strokeStyle='#24454b';c.lineWidth=f.width+1.1;c.beginPath();c.moveTo(f.a.x+.7,f.a.y+.5);c.lineTo(x+.7,y+.5);c.stroke();
      c.globalAlpha=.62;c.strokeStyle='#c6d6d0';c.lineWidth=f.width;c.beginPath();c.moveTo(f.a.x,f.a.y);c.lineTo(x,y);c.stroke();
    }c.restore();
  }
  function before(c,s,t,p){
    const a=s.action,l=layout(s),tip=anchor(s,t,p),fixed=anchor(s,t,p,'tip',true);
    if(['power','current','direct'].includes(a))switchProp(c,s,t,p);
    if(glassActions.has(a))glassSurface(c,s,t,p);
    if(pressActions.has(a)&&t>=67.99)cracks(c,s,t,p);
    if(['join','embrace','satisfaction','happy','vibrations','gather','completion','proof','simulation','nutrients','antioxidants'].includes(a))contact(c,s,t,p,.2);
    if(['lead','follow','trance'].includes(a))roleReflection(c,s,t,p);
    if(a==='leave'){
      contact(c,s,t,p,(1-(s.variant+p)/5)*.22);
      glow(c,1120,340,250,'rgba(244,202,130,.08)',clamp(1-(s.variant+p)/5));
    }
    if(a==='recall'){contact(c,s,t,p,.19*(1-ramp(p,.3,.9)));}
    if(a==='free'){c.save();c.translate(ease(p)*220,0);contact(c,s,t,p,.19*(1-ease(p)));c.restore();}
    if(a==='sharedTrap'){contact(c,s,t,p,.15);}
    if(a==='gender'||a==='genderMorph'){
      const m=motion(s,t,p),pose=a==='gender'?'male':'stand';
      c.save();c.beginPath();c.rect(1010,116,300,680);c.clip();c.globalAlpha=.52;c.translate(2310,0);c.scale(-1,1);drawPose(c,pose,{x:1150,y:785,h:665},{...m,x:0,scaleX:1});c.restore();
    }
    if(a==='create'||a==='god'){
      const plant=anchor(s,t,p,'plant');
      glow(c,plant.x,plant.y,75,'rgba(231,218,154,.1)',pulse(p));
    }
    if(a==='world'||a==='simulate'){
      // Reveal the actual illustrated room, rather than a floating model house.
      const q=clamp((t-10.90)/(16.10-10.90));
      glow(c,1195,360,450,'rgba(247,220,159,.13)',ease(q));
    }
    if(a==='proof'){c.save();c.fillStyle='#092019';c.globalAlpha=ease(p)*.22;c.beginPath();c.ellipse(l.x+25,l.y-10,130,18,0,0,TAU);c.fill();c.restore();}
    if(a==='travel'||a==='reverseTime'||a==='dayNight'){
      const q=ease(p),sun=a==='reverseTime'?1-q:q;
      glow(c,lerp(1450,700,sun),lerp(150,500,sun),210,'rgba(242,201,133,.13)');
      if(a==='reverseTime')for(let i=0;i<10;i++){c.save();c.fillStyle='#b9c4a1';c.globalAlpha=.3;c.beginPath();c.ellipse(850+hash(i)*450,750-q*530+hash(i+3)*40,5,2,i,0,TAU);c.fill();c.restore();}
    }
  }
  function after(c,s,t,p){
    const a=s.action,tip=anchor(s,t,p),fixed=anchor(s,t,p,'tip',true);
    marks(c,s,t,p);
    if(s.gesture==='waterPlant')waterPlant(c,s,t,p);
    if(s.action==='liftPlant'||s.action==='placePlant'){const plant=anchor(s,t,p,'plant');glow(c,plant.x,plant.y,65,'rgba(242,220,154,.08)',pulse(p));}
    if(a==='power'||a==='current'||a==='direct'){
      const amount=a==='power'?ramp(p,.3,.9):1,line=[];
      for(let i=0;i<=80;i++){const q=i/80,x=fixed.x+28+q*340,wave=a==='direct'?Math.sin(q*TAU*2)*(1-ease(p))*22:Math.sin(q*TAU*2+p*TAU)*22;line.push({x,y:fixed.y+wave});}
      stroke(c,line,'#dbe6c4',3,amount*.85);
    }
    if(a==='protection'){
      const eye=anchor(s,t,p);c.save();c.globalAlpha=pulse(p)*.2;c.fillStyle='#dfeee5';c.translate(eye.x-45,eye.y-6);c.rotate(-.2);c.fillRect(0,0,80,3);c.restore();
    }
    if(a==='data'||a==='initialize'||a==='tasks'){
      const card=anchor(s,t,p,'card');c.save();c.fillStyle='#526d60';c.globalAlpha=.72;c.font='10px monospace';
      const lines=a==='initialize'?['01 01 01','✓ ready']:a==='tasks'?['01 ✓','02 ✓','03 ✓']:['x: 0.0','y: 1.0','love: ∞'];
      for(let i=0;i<lines.length;i++)if(p>i/lines.length*.8)c.fillText(lines[i].slice(0,Math.ceil(p*12)),card.x-25,card.y+i*11);c.restore();
    }
    if(a==='blind'||a==='dizzy'){
      const q=a==='blind'?ease(p):1;c.save();c.fillStyle='#071014';c.globalAlpha=q*.19;c.fillRect(0,0,1600,lerp(0,285,q));c.fillRect(0,lerp(900,615,q),1600,300);c.restore();
    }
    if(a==='nutrients'||a==='antioxidants'){
      const bowl=anchor(s,t,p,'bowl');
      for(let i=0;i<14;i++){const q=clamp(p*1.3-hash(i+23)*.25),x=lerp(bowl.x,1080,q),y=lerp(bowl.y,390,q)-Math.sin(q*Math.PI)*45;c.save();c.globalAlpha=Math.sin(q*Math.PI)*.6;c.fillStyle=a==='nutrients'?'#bdd0a2':'#e0b58e';c.beginPath();c.ellipse(x,y,3,2,0,0,TAU);c.fill();c.restore();}
      if(a==='antioxidants'){c.save();c.globalAlpha=ease(p)*.28;c.strokeStyle='#d6c9a9';c.lineWidth=2;c.beginPath();c.ellipse(1080,390,55,80,0,0,TAU);c.stroke();c.restore();}
    }
    if(a==='satisfaction'){flower(c,lerp(tip.x,1080,ease(p)),lerp(tip.y,410,ease(p)),.8,1-ramp(p,.7,1));}
    if(a==='stimulations'){
      // Large, shaded petals are readable at the start of the phrase, too.
      for(let i=0;i<34;i++){
        const q=clamp(p*.85+hash(i+41)*.46),angle=i*2.4;
        const x=tip.x+35+q*650,y=tip.y+Math.sin(angle)*70+Math.sin(q*Math.PI+angle)*110+q*95;
        petal(c,x,y,9+hash(i+25)*12,angle+q*2,.65+hash(i+7)*.3);
      }
      for(let i=0;i<4;i++){
        const q=clamp(p+i*.16),x=1000+i*100,y=710+i*20;c.save();c.globalAlpha=.3;c.strokeStyle='#e5d9b2';c.lineWidth=1.4;
        c.beginPath();c.ellipse(x,y,35+q*65,5+q*10,0,0,TAU);c.stroke();c.restore();
      }
    }
    if(a==='proof'){glow(c,tip.x,tip.y,70,'rgba(229,216,161,.12)',ease(p));stroke(c,[{x:1080,y:320},{x:1080,y:430}],'#c8d4ba',20,pulse(p)*.08);}
    if(a==='completion'||a==='gather'){
      const heart=anchor(s,t,p,'heart');
      for(let i=0;i<12;i++){
        const q=clamp(p*1.4-hash(i)*.25),x=lerp(1000+hash(i+6)*250,heart.x,q),y=lerp(300+hash(i+9)*350,heart.y,q);
        petal(c,x,y,7,i+q,Math.sin(q*Math.PI)*.6);
      }
    }
    if(a==='heartbroken'){
      const heart=anchor(s,t,p,'heart');glow(c,heart.x,heart.y,60,'rgba(177,207,210,.09)',pulse(p));
    }
    if(glassActions.has(a))glassSurface(c,s,t,p,true);
    if(['study','answer'].includes(a)){
      const book=anchor(s,t,p,'book');c.save();c.translate(book.x,book.y);
      const turn=a==='study'||a==='learnLove'?Math.sin(p*Math.PI):pulse(p)*.25;
      c.globalAlpha=.6;c.strokeStyle='#dddcc5';c.lineWidth=1.4;c.beginPath();c.moveTo(0,-35);c.bezierCurveTo(-24*turn,-48,-36*turn,12,0,28);c.stroke();
      c.strokeStyle='#8c9b89';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(5,-20+i*10);c.lineTo(32,-24+i*10);c.stroke();}c.restore();
    }
    if(['free','trapped','sharedTrap','limit','vibrations'].includes(a)){glow(c,tip.x+3,tip.y,42,'rgba(194,218,215,.11)',pulse(p));}
    if(['afterglow','horizon','outro'].includes(a))glow(c,1175,425,25,'rgba(232,192,124,.075)');
  }
  function reflection(c,s,t,p){
    if(t<110.4)return;
    c.save();c.globalAlpha=.055;c.translate(1670,15);c.scale(-1,1);character(c,s,t-.4,p);c.restore();
  }
  return {shots,prepare,character,before,after,reflection,anchor,motion,
    describe(s){return {id:s.id,line:s.lyricIndex,text:s.text||'',action:s.action,gesture:s.gesture,variant:s.variant,intent:s.intent,code:s.code};},
    get coverage(){return [...actionSet];}
  };
};
