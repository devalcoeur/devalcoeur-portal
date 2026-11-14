const TRANSLATIONS = {"ru": {"eyebrow": "Официальный персональный портал", "subtitle": "Одна личность · Четыре измерения", "mainAria": "Четыре творческих направления", "tagline": "Невозможное возможно.", "footerNote": "Artist и Designer — в будущем", "host": {"index": "01 / СЦЕНА", "title": "Ведущий &<br>Шоумен", "desc": "Ведущий событий и шоу", "action": "Перейти к ведущему", "aria": "Ведущий и шоумен — открыть раздел"}, "actor": {"index": "02 / КИНО", "title": "Актёр", "desc": "Кино и актёрское мастерство", "action": "Перейти к актёру", "aria": "Актёр — открыть раздел"}, "ai": {"index": "03 / БУДУЩЕЕ", "title": "AI Creator", "desc": "Интеллект и воображение", "action": "Перейти к AI", "aria": "AI Creator — открыть раздел"}, "tele": {"index": "04 / НЕВОЗМОЖНОЕ", "title": "Telekinesis<br>Show", "desc": "За пределами воображения", "action": "Перейти к шоу", "aria": "Telekinesis Show — открыть раздел"}}, "en": {"eyebrow": "Official Personal Portal", "subtitle": "One Identity · Four Dimensions", "mainAria": "Four creative dimensions", "tagline": "Impossible is Possible.", "footerNote": "Artist & Designer — Coming Later", "host": {"index": "01 / THE STAGE", "title": "Host &<br>Showman", "desc": "Master of ceremonies", "action": "Explore Host", "aria": "Host and Showman — open section"}, "actor": {"index": "02 / THE SCREEN", "title": "Actor", "desc": "Cinema & performance", "action": "Explore Actor", "aria": "Actor — open section"}, "ai": {"index": "03 / THE FUTURE", "title": "AI Creator", "desc": "Intelligence & imagination", "action": "Explore AI", "aria": "AI Creator — open section"}, "tele": {"index": "04 / THE IMPOSSIBLE", "title": "Telekinesis<br>Show", "desc": "Beyond imagination", "action": "Explore Show", "aria": "Telekinesis Show — open section"}}, "fr": {"eyebrow": "Portail personnel officiel", "subtitle": "Une identité · Quatre dimensions", "mainAria": "Quatre univers créatifs", "tagline": "L’impossible devient possible.", "footerNote": "Artiste et Designer — Bientôt", "host": {"index": "01 / LA SCÈNE", "title": "Animateur &<br>Showman", "desc": "Maître de cérémonie", "action": "Découvrir l’animateur", "aria": "Animateur et showman — ouvrir la rubrique"}, "actor": {"index": "02 / LE CINÉMA", "title": "Acteur", "desc": "Cinéma & interprétation", "action": "Découvrir l’acteur", "aria": "Acteur — ouvrir la rubrique"}, "ai": {"index": "03 / LE FUTUR", "title": "Créateur IA", "desc": "Intelligence & imagination", "action": "Découvrir l’IA", "aria": "Créateur IA — ouvrir la rubrique"}, "tele": {"index": "04 / L’IMPOSSIBLE", "title": "Telekinesis<br>Show", "desc": "Au-delà de l’imagination", "action": "Découvrir le spectacle", "aria": "Telekinesis Show — ouvrir la rubrique"}}};
const panels = document.querySelectorAll('.panel');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
function lookup(data,key){return key.split('.').reduce((a,k)=>a&&a[k],data)}
function initialLang(){let q=new URLSearchParams(location.search).get('lang');if(['ru','en','fr'].includes(q))return q;try{return localStorage.getItem('portal-lang')||'ru'}catch(e){return 'ru'}}
let lang=initialLang();if(!TRANSLATIONS[lang])lang='ru';
function setLang(next){lang=next;document.documentElement.lang=lang;
  try{localStorage.setItem('portal-lang',lang)}catch(e){}
  document.querySelectorAll('[data-i18n]').forEach(e=>{const t=lookup(TRANSLATIONS[lang],e.dataset.i18n);if(t)e.textContent=t});
  document.querySelectorAll('[data-i18n-html]').forEach(e=>{const t=lookup(TRANSLATIONS[lang],e.dataset.i18nHtml);if(t)e.innerHTML=t});
  document.querySelectorAll('[data-i18n-aria]').forEach(e=>{const t=lookup(TRANSLATIONS[lang],e.dataset.i18nAria);if(t)e.setAttribute('aria-label',t)});
  document.querySelectorAll('.language-choice').forEach(e=>{e.setAttribute('aria-pressed',String(e.dataset.lang===lang))});
  document.title='Christian Devalcoeur | Four Dimensions';
}
document.querySelectorAll('.language-choice').forEach(e=>e.addEventListener('click',()=>{setLang(e.dataset.lang);window.dispatchEvent(new CustomEvent('portal-language-changed',{detail:lang}))}));
setLang(lang);
function playPanel(panel){if(prefersReducedMotion.matches)return;const video=panel.querySelector('video.hero-video');if(!video)return;video.muted=true;const attempt=video.play();if(attempt&&typeof attempt.then==='function')attempt.then(()=>panel.classList.add('is-playing')).catch(()=>{});}
function stopPanel(panel){const video=panel.querySelector('video.hero-video');if(!video)return;video.pause();try{video.currentTime=0}catch(e){}panel.classList.remove('is-playing')}
function navigatePanel(panel){
 const destinations = {
  actor: 'https://devalcoeur.github.io/christian-devalcoeur-portfolio/',
  ai: 'https://devalcoeur.github.io/premium-ai-video-portfolio/'
 };
 const section = panel.dataset.section;
 const url = destinations[section];
 location.href = panel.dataset.route+'index.html?lang='+encodeURIComponent(lang);
}
panels.forEach(panel=>{
 panel.addEventListener('pointerenter',()=>{if(finePointer.matches)playPanel(panel)});
 panel.addEventListener('pointerleave',()=>{if(finePointer.matches)stopPanel(panel)});
 panel.addEventListener('focusin',()=>playPanel(panel));panel.addEventListener('focusout',()=>stopPanel(panel));
 panel.addEventListener('click',()=>navigatePanel(panel));
 panel.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigatePanel(panel)}});
 panel.addEventListener('touchstart',()=>{panels.forEach(p=>{if(p!==panel){p.classList.remove('active');stopPanel(p)}});panel.classList.add('active');playPanel(panel)},{passive:true});
});
