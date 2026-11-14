(()=>{
  'use strict';
  const root=document.getElementById('audio-console-preview');
  const canvas=document.getElementById('audio-console-canvas');
  const fsButton=document.getElementById('fullscreen-toggle');
  const openPlayer=document.getElementById('open-player-from-console');
  const audio=document.getElementById('signature-audio');
  const menuToggle=document.getElementById('signature-menu-toggle');
  const playerPanel=document.getElementById('signature-panel');
  if(!root||!canvas)return;

  const modeButtons=[...root.querySelectorAll('[data-console-mode]')];
  let mode='console';
  const ctx=canvas.getContext('2d');
  let raf=0;

  const STRINGS={
    ru:{fs:'Полный экран',exitFs:'Выйти из полного экрана',console:'Консоль',sphere:'Сфера',audio:'Аудио'},
    en:{fs:'Fullscreen',exitFs:'Exit fullscreen',console:'Console',sphere:'Sphere',audio:'Audio'},
    fr:{fs:'Plein écran',exitFs:'Quitter le plein écran',console:'Console',sphere:'Sphère',audio:'Audio'}
  };
  function lang(){return document.documentElement.lang in STRINGS?document.documentElement.lang:'ru';}
  function applyLabels(){
    const t=STRINGS[lang()];
    modeButtons.forEach(btn=>{const key=btn.dataset.consoleMode; btn.textContent=t[key]||key; btn.setAttribute('aria-label', t[key]||key);});
    if(openPlayer){openPlayer.textContent=t.audio; openPlayer.setAttribute('aria-label',t.audio);}    
    if(fsButton){const full=!!document.fullscreenElement; fsButton.setAttribute('aria-label', full?t.exitFs:t.fs); fsButton.title=full?t.exitFs:t.fs; fsButton.classList.toggle('is-fullscreen',full);}
  }

  function setMode(next){
    mode=next==='sphere'?'sphere':'console';
    root.dataset.mode=mode;
    modeButtons.forEach(btn=>btn.classList.toggle('is-active', btn.dataset.consoleMode===mode));
  }
  modeButtons.forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.consoleMode)));
  setMode('console');

  function resize(){
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(10, Math.round(rect.width*dpr));
    canvas.height=Math.max(10, Math.round(rect.height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  const frequencyBins=new Uint8Array(128);
  let smoothed=new Float32Array(30);
  function draw(ts){
    const w=canvas.clientWidth||218, h=canvas.clientHeight||74;
    const playing=audio&&!audio.paused;
    const analyser=window.signatureAnalyser;
    const trueAudio=!!(playing&&analyser);
    const t=ts/1000;
    if(trueAudio)analyser.getByteFrequencyData(frequencyBins);
    ctx.clearRect(0,0,w,h);
    const backdrop=ctx.createLinearGradient(0,0,0,h);
    backdrop.addColorStop(0,'#07172b');backdrop.addColorStop(.7,'#020917');backdrop.addColorStop(1,'#03050b');
    ctx.fillStyle=backdrop;ctx.fillRect(0,0,w,h);
    const count=30, gap=1.8, horizontal=8, barW=(w-horizontal*2-gap*(count-1))/count;
    const baseline=h*.76;
    const maxHeight=h*.63;
    for(let i=0;i<count;i++){
      let level;
      if(!playing)level=0.05;
      else if(trueAudio){
        const index=Math.min(frequencyBins.length-1,Math.floor(Math.pow(i/(count-1),1.55)*frequencyBins.length*.72));
        level=Math.min(1,frequencyBins[index]/235);
      }else{
        // File-system preview: show responsive-looking motion, without claiming real audio analysis.
        level=.22+.62*Math.abs(Math.sin(t*2.4+i*.42)*Math.cos(t*1.1+i*.22));
      }
      smoothed[i]+= (level-smoothed[i])*(playing?.25:.12);
      const bh=Math.max(2.5,smoothed[i]*maxHeight);
      const x=horizontal+i*(barW+gap), y=baseline-bh;
      const gold=(i%7===0 || i%11===0);
      const gradient=ctx.createLinearGradient(x,y,x,baseline);
      if(gold){
        gradient.addColorStop(0,'#fff9db');gradient.addColorStop(.15,'#ffdfa0');gradient.addColorStop(.47,'#ebb564');gradient.addColorStop(1,'#65411d');
      }else{
        gradient.addColorStop(0,'#efffff');gradient.addColorStop(.14,'#abf3ff');gradient.addColorStop(.42,'#55caff');gradient.addColorStop(1,'#1559af');
      }
      ctx.shadowBlur=playing?9:4;
      ctx.shadowColor=gold?'#ffc766':'#45bdff';
      ctx.fillStyle=gradient;
      ctx.fillRect(x,y,Math.max(2,barW),bh);
      ctx.shadowBlur=0;
      ctx.fillStyle=gold?'rgba(255,246,208,.72)':'rgba(215,251,255,.68)';
      ctx.fillRect(x,y,Math.max(2,barW),Math.min(1.2,bh));
    }
    // Two thin luminous waveforms with restrained blue/gold reflections.
    const renderWave=(y,amp,color,width,shift)=>{
      ctx.beginPath();
      for(let x=0;x<=w;x+=2){
        const v=y+amp*Math.sin((x/w)*Math.PI*3.6+shift+(playing?t*1.5:0)) + .28*amp*Math.sin((x/w)*Math.PI*7.4-shift);
        x===0?ctx.moveTo(x,v):ctx.lineTo(x,v);
      }
      ctx.lineWidth=width;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=playing?9:5;ctx.stroke();ctx.shadowBlur=0;
    };
    const strength=playing?1:.38;
    renderWave(h*.82,3.6*strength,'#6ed4ff',1.65,0);
    renderWave(h*.87,2.7*strength,'#f0c178',1.2,1.7);
    // Glossy glass edge and faint floor reflection.
    const rim=ctx.createLinearGradient(0,0,w,0);
    rim.addColorStop(0,'rgba(53,162,255,.48)');rim.addColorStop(.4,'rgba(224,245,255,.11)');rim.addColorStop(.85,'rgba(230,174,82,.40)');rim.addColorStop(1,'rgba(91,192,255,.36)');
    ctx.strokeStyle=rim;ctx.lineWidth=1;ctx.strokeRect(.5,.5,w-1,h-1);
    raf=requestAnimationFrame(draw);
  }
  draw(performance.now());

  if(openPlayer&&menuToggle&&playerPanel){
    openPlayer.addEventListener('click',()=>{
      playerPanel.hidden=false;
      menuToggle.setAttribute('aria-expanded','true');
      playerPanel.scrollIntoView({block:'nearest',inline:'nearest'});
    });
  }

  async function toggleFullscreen(){
    try{
      if(!document.fullscreenElement){
        await document.documentElement.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    }catch(err){console.warn('Fullscreen unavailable:',err);}
  }
  fsButton?.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', applyLabels);
  window.addEventListener('portal-language-changed', applyLabels);
  applyLabels();
})();
