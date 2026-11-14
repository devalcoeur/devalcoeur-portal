(()=>{
'use strict';
const root=document.getElementById('audio-console-preview');
const audio=document.getElementById('signature-audio');
const video=document.getElementById('elite-overlay-video');
const btnFx=document.getElementById('elite-fx-switch');
const btnPower=document.getElementById('elite-power-switch');
const stop=document.getElementById('signature-stop');
if(!root||!audio||!btnFx||!btnPower)return;
let powered=true,fxOn=true;
const words={
 ru:{fxOn:'Выключить световые эффекты',fxOff:'Включить световые эффекты',pOn:'Полностью выключить устройство и музыку',pOff:'Включить устройство'},
 en:{fxOn:'Turn lighting effects off',fxOff:'Turn lighting effects on',pOn:'Power off device and music',pOff:'Power on device'},
 fr:{fxOn:'Désactiver les effets lumineux',fxOff:'Activer les effets lumineux',pOn:'Éteindre le lecteur et la musique',pOff:'Allumer le lecteur'}
};
function labels(){const t=words[document.documentElement.lang]||words.ru;btnFx.title=fxOn?t.fxOn:t.fxOff;btnFx.setAttribute('aria-label',btnFx.title);btnPower.title=powered?t.pOn:t.pOff;btnPower.setAttribute('aria-label',btnPower.title);}
function render(){root.dataset.power=powered?'on':'off';root.dataset.fx=fxOn?'on':'off';btnPower.setAttribute('aria-pressed',String(powered));btnFx.setAttribute('aria-pressed',String(fxOn));btnFx.disabled=!powered;labels();if(video){if(powered&&fxOn&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const p=video.play();if(p?.catch)p.catch(()=>{});}else video.pause();}}
function power(state){powered=!!state;if(!powered){stop?.click();audio.pause();}render();}
btnFx.addEventListener('click',()=>{if(!powered)return;fxOn=!fxOn;render();});
btnPower.addEventListener('click',()=>power(!powered));
// Starting playback by any of the original player controls wakes the visual module too.
audio.addEventListener('play',()=>{if(!powered){powered=true;render();}});
window.addEventListener('portal-language-changed',labels);
render();
})();
