(()=>{
 'use strict';
 const root=document.getElementById('audio-console-preview');
 const canvas=document.getElementById('audio-console-canvas');
 const audio=document.getElementById('signature-audio');
 const btnFs=document.getElementById('fullscreen-toggle');
 const btnPanel=document.getElementById('open-player-from-console');
 const panel=document.getElementById('signature-panel');
 const panelMenu=document.getElementById('signature-menu-toggle');
 const video=document.getElementById('elite-overlay-video');
 const mainPlay=document.getElementById('signature-play');
 const settings=document.getElementById('elite-glass-settings');
 const mute=document.getElementById('elite-glass-mute');
 const btnPlay=document.getElementById('elite-glass-play');
 if(!root||!canvas||!audio)return;
 const ctx=canvas.getContext('2d');
 const strings={ru:{fs:'Полный экран',exitFs:'Выйти из полного экрана',console:'Консоль',sphere:'Сфера',audio:'Аудио',play:'Воспроизвести или поставить на паузу',settings:'Настройки звука',mute:'Включить или выключить звук'},en:{fs:'Fullscreen',exitFs:'Exit fullscreen',console:'Console',sphere:'Sphere',audio:'Audio',play:'Play or pause',settings:'Audio settings',mute:'Mute or unmute'},fr:{fs:'Plein écran',exitFs:'Quitter le plein écran',console:'Console',sphere:'Sphère',audio:'Audio',play:'Lecture ou pause',settings:'Réglages audio',mute:'Couper ou rétablir le son'}};
 const modeBtns=[...root.querySelectorAll('[data-console-mode]')];
 // Localized captions cover only the Russian words baked into the animated source.
 const localizedTop=document.createElement('div');localizedTop.className='elite-localized-captions';
 localizedTop.innerHTML='<span data-slot="console"></span><span data-slot="sphere"></span><span data-slot="audio"></span>';
 root.appendChild(localizedTop);
 let mode='console';let raf=0;let fft=new Uint8Array(128);let levels=new Float32Array(32);
 const getLang=()=>strings[document.documentElement.lang]?document.documentElement.lang:'ru';
 function translate(){const s=strings[getLang()];
  modeBtns.forEach(b=>{const m=b.dataset.consoleMode;b.setAttribute('aria-label',s[m]);b.title=s[m]});
  if(btnPanel){btnPanel.title=s.audio;btnPanel.setAttribute('aria-label',s.audio)}
  if(btnPlay){btnPlay.title=s.play;btnPlay.setAttribute('aria-label',s.play)}
  if(settings){settings.title=s.settings;settings.setAttribute('aria-label',s.settings)}
  if(mute){mute.title=s.mute;mute.setAttribute('aria-label',s.mute)}
  localizedTop.hidden=getLang()==='ru';
  localizedTop.querySelectorAll('[data-slot]').forEach(el=>el.textContent=s[el.dataset.slot]);
  if(btnFs){const fs=!!document.fullscreenElement;btnFs.title=fs?s.exitFs:s.fs;btnFs.setAttribute('aria-label',btnFs.title);btnFs.classList.toggle('is-fullscreen',fs)}
 }
 modeBtns.forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.consoleMode==='sphere'?'sphere':'console';root.dataset.mode=mode;modeBtns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.consoleMode===mode)))}));
 function openPanel(){if(!panel)return;panel.hidden=false;panelMenu?.setAttribute('aria-expanded','true')}
 btnPanel?.addEventListener('click',openPanel);
 settings?.addEventListener('click',openPanel);
 btnPlay?.addEventListener('click',()=>mainPlay?.click());
 mute?.addEventListener('click',()=>document.getElementById('signature-mute')?.click());
 // The pictured BASS/MID/TREBLE controls are overlaid with real range inputs,
 // synced bidirectionally to the existing full-size player's audio filters.
 for(const kind of ['bass','mid','treble']){
  const small=document.getElementById(`elite-${kind}`),large=document.getElementById(`signature-${kind}`);
  if(!small||!large)continue;
  small.value=large.value;
  small.addEventListener('input',()=>{large.value=small.value;large.dispatchEvent(new Event('input',{bubbles:true}))});
  large.addEventListener('input',()=>small.value=large.value);
 }
 // Transparent video: if autoplay is blocked or VP9 alpha unsupported,
 // first-frame PNG provides an accurately masked, static fallback.
 if(video){const start=video.play();if(start&&start.catch)start.catch(()=>{video.style.display='none'});
  video.addEventListener('error',()=>{video.style.display='none'});
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)video.pause();}
 function resize(){const dpr=Math.min(2,window.devicePixelRatio||1);const r=canvas.getBoundingClientRect();canvas.width=Math.max(8,Math.round(r.width*dpr));canvas.height=Math.max(8,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)}
 resize();addEventListener('resize',resize,{passive:true});
 function wave(w,h,t,playing,y,amp,color,shift){ctx.beginPath();for(let x=0;x<=w;x+=2){const p=x/w;const v=y+(playing?amp:amp*.25)*Math.sin(p*12.1+t*1.65+shift)+(playing?amp*.3:0)*Math.cos(p*19-t*.75+shift);x?ctx.lineTo(x,v):ctx.moveTo(x,v)}ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.shadowColor=color;ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0}
 function draw(now){
  const w=canvas.clientWidth||180,h=canvas.clientHeight||30,t=now/1000,playing=!audio.paused;
  const analyser=window.signatureAnalyser;const live=!!(analyser&&playing);
  if(live){if(fft.length!==analyser.frequencyBinCount)fft=new Uint8Array(analyser.frequencyBinCount);analyser.getByteFrequencyData(fft)}
  ctx.clearRect(0,0,w,h);
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#071b34');bg.addColorStop(.55,'#020b1b');bg.addColorStop(1,'#020711');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  if(mode==='console'){
   const count=32,pad=w*.08,gap=1.3,barW=(w-pad*2-gap*(count-1))/count,base=h*.80;
   for(let i=0;i<count;i++){
    let v=0.07;if(playing&&!analyser){v=.20+.62*Math.abs(Math.sin(t*2.7+i*.48)*Math.cos(t*1.43+i*.19));}if(live){const index=Math.min(fft.length-1,Math.round(Math.pow(i/(count-1),1.6)*fft.length*.75));v=Math.min(1,fft[index]/245)}
    // Do not simulate frequency analysis if the browser has no accessible audio analyser.
    levels[i]+=(v-levels[i])*(playing?.32:.13);
    const bh=Math.max(1.4,levels[i]*h*.72),x=pad+i*(barW+gap),y=base-bh;
    const gold=i%7===0||i%13===0;
    const grad=ctx.createLinearGradient(0,y,0,base);
    if(gold){grad.addColorStop(0,'#fff8d9');grad.addColorStop(.24,'#ffd68d');grad.addColorStop(.61,'#c18c34');grad.addColorStop(1,'#60421d')}
    else{grad.addColorStop(0,'#e9fcff');grad.addColorStop(.25,'#76e4ff');grad.addColorStop(.64,'#168af5');grad.addColorStop(1,'#123f87')}
    ctx.fillStyle=grad;ctx.shadowColor=gold?'#ffe09a':'#38bfff';ctx.shadowBlur=playing?8:4;ctx.fillRect(x,y,Math.max(1.2,barW),bh);ctx.shadowBlur=0;
   }
   wave(w,h,t,playing,h*.83,2.6,'#79dfff',0);
   wave(w,h,t,playing,h*.91,1.8,'#eac078',1.5);
  }else{
   const radius=Math.min(h*.39,w*.15);const x=w/2,y=h*.48;
   const aura=ctx.createRadialGradient(x,y,1,x,y,radius*1.7);
   aura.addColorStop(0,'rgba(171,240,255,.8)');aura.addColorStop(.4,'rgba(18,130,245,.7)');aura.addColorStop(.75,'rgba(15,65,147,.35)');aura.addColorStop(1,'rgba(0,10,35,0)');
   ctx.fillStyle=aura;ctx.fillRect(x-radius*1.7,y-radius*1.7,radius*3.4,radius*3.4);
   ctx.strokeStyle='#f0c57a';ctx.shadowColor='#e7b768';ctx.shadowBlur=6;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y,radius*1.3,radius*.47, -.4,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
   ctx.fillStyle='#7bdaff';ctx.beginPath();ctx.arc(x,y,radius*.40,0,Math.PI*2);ctx.fill();
   wave(w,h,t,playing,h*.87,2.5,'#65caff',0);
  }
  raf=requestAnimationFrame(draw);
 }
 raf=requestAnimationFrame(draw);
 btnFs?.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen?.()}catch(e){console.warn('Fullscreen is unavailable',e)}});
 document.addEventListener('fullscreenchange',translate);
 window.addEventListener('portal-language-changed',translate);
 translate();
})();
