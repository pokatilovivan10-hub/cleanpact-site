const flatTiers=[
  [40,6200,9500,18500],[45,6600,10100,19500],[50,6900,10800,20500],
  [55,7200,11500,21000],[60,7600,12200,22000],[65,8000,12800,23000],
  [70,8400,13500,24000],[75,8800,14200,25000],[80,9200,14850,26000],
  [85,9600,15500,27000],[90,10000,16200,28500],[95,10500,16900,30000],
  [115,11000,17500,31000],[135,11500,18200,33000],[155,12000,18900,35000],
  [175,12500,19600,36500],[200,13000,20300,38000]
];
const officeTiers=[[50,5400,8100,13500],[100,11500,16200,18200],[150,13500,23000,25700],[200,15500,25700,28400],[250,17500,32400,35100]];
const flatTypes=[['support','Поддерживающая'],['general','Генеральная'],['repair','После ремонта']];
const officeTypes=[['support','Поддерживающая'],['general','Генеральная'],['repair','После ремонта']];
const extras={
  flat:[['bathroom','Дополнительный санузел',1500,'шт.'],['window1','Окно 1-створчатое',740,'шт.'],['window2','Окно 2-створчатое',1080,'шт.'],['window3','Окно 3-створчатое',1280,'шт.'],['balconyblock','Балконный блок',2025,'шт.'],['fridge','Холодильник внутри',1200,'шт.'],['oven','Духовка внутри',1200,'шт.'],['microwave','Микроволновка внутри',1000,'шт.'],['inside','Мытьё мебели внутри',600,'шт., от'],['dishes','Мытьё посуды',1100,'услуга, от'],['iron','Глажка белья',1100,'час, от'],['chandelier','Большая люстра (более 50 см)',1200,'шт., от'],['steam','Чистка парогенератором',3900,'услуга, от']],
  office:[['window2','Окно 2-створчатое',1080,'шт.'],['window3','Окно 3-створчатое',1280,'шт.'],['showcase','Витрины магазина / кафе',405,'м²'],['blinds','Жалюзи',810,'м²'],['sanitize','Дезинфекция помещений',2000,'услуга, от'],['steam','Чистка парогенератором',3900,'услуга, от']],
  windows:[['window1','Окно 1-створчатое',740,'шт.'],['window2','Окно 2-створчатое',1080,'шт.'],['window3','Окно 3-створчатое',1280,'шт.'],['balconyblock','Балконный блок',2025,'шт.'],['loggia','Лоджия / балкон',3375,'шт.'],['net','Москитная сетка',470,'шт.'],['blinds','Жалюзи',810,'м²'],['bay','Эркер / нестандартное окно',405,'м², от'],['afterfit','Окна после ремонта',540,'м²'],['showcase','Витрины магазинов / кафе',405,'м²'],['beauty','Витрины салонов красоты',240,'м²']],
  furniture:[['sofa2','Диван 2-местный',5700,'шт., от'],['sofa3','Диван 3-местный',7000,'шт., от'],['corner4','Диван угловой 4-местный',8600,'шт., от'],['corner5','Диван угловой 5-местный',9450,'шт., от'],['armchair','Кресло',1500,'шт., от'],['chair','Стул с мягкой спинкой',700,'шт., от'],['bed','Кровать',3100,'шт., от'],['mattress','Матрас евро',5100,'шт., от'],['carpet','Ковёр, ворс до 1 см',510,'м², от'],['rug','Ковролин / палас',700,'м², от'],['stain','Удаление сложных пятен',800,'услуга, от'],['antibacterial','Антибактериальная обработка',1200,'услуга, от']]
};
const objectNames={flat:'Квартира / дом',office:'Офис / помещение',windows:'Мытьё окон',furniture:'Химчистка мебели'};
let state={object:'flat',type:'general',area:50,qty:{},equipment:{vacuum:'',ladder:''}};
const rub=value=>value.toLocaleString('ru-RU')+' ₽';
const $=id=>document.getElementById(id);
function typeName(){return (state.object==='flat'?flatTypes:officeTypes).find(type=>type[0]===state.type)?.[1]||''}
function getBase(){
  const area=Number(state.area);
  if(state.object==='flat'){
    if(area>200)return null;
    const tier=flatTiers.find(item=>area<=item[0]);
    return tier?.[{support:1,general:2,repair:3}[state.type]]??null;
  }
  if(state.object==='office'){
    if(area>=300)return Math.ceil(area*({support:80,general:150,repair:160}[state.type]));
    if(area>250)return null;
    const tier=officeTiers.find(item=>area<=item[0]);
    return tier?.[{support:1,general:2,repair:3}[state.type]]??null;
  }
  return 0;
}
function getExtra(){return extras[state.object].reduce((sum,item)=>sum+item[2]*(state.qty[item[0]]||0),0)}
function description(){
  const parts=[objectNames[state.object]];
  if(['flat','office'].includes(state.object))parts.push(typeName(),state.area+' м²');
  for(const item of extras[state.object]){const count=state.qty[item[0]]||0;if(count)parts.push(`${item[1]} × ${count}`)}
  return parts.join(' · ');
}
function renderChoices(){
  const types=state.object==='office'?officeTypes:flatTypes;
  $('typeChoices').innerHTML=types.map(([key,name])=>`<button type="button" class="choice ${state.type===key?'active':''}" data-type="${key}"><span>${name}</span><b>${state.type===key?'●':'○'}</b></button>`).join('');
  $('typeChoices').querySelectorAll('button').forEach(button=>button.onclick=()=>{state.type=button.dataset.type;renderChoices();renderEquipment();renderTotal()});
}
function renderEquipment(){
  const shouldShow=state.object==='flat'&&['support','general','repair'].includes(state.type);
  $('equipmentBlock').hidden=!shouldShow;
  if(!shouldShow)return;
  $('equipmentQuestions').innerHTML=[['vacuum','Есть ли пылесос?'],['ladder','Есть ли стремянка?']].map(([key,label])=>`<fieldset class="equipment-question"><legend>${label}</legend><label><input type="radio" name="${key}" value="yes" ${state.equipment[key]==='yes'?'checked':''}> Да</label><label><input type="radio" name="${key}" value="no" ${state.equipment[key]==='no'?'checked':''}> Нет</label></fieldset>`).join('');
  $('equipmentQuestions').querySelectorAll('input').forEach(input=>input.onchange=()=>{state.equipment[input.name]=input.value});
}
function renderExtras(){
  const labels={flat:'Дополнительные услуги',office:'Дополнительные услуги',windows:'Какие окна нужно помыть?',furniture:'Что нужно почистить?'};
  $('extrasTitle').textContent=labels[state.object];
  $('extrasList').innerHTML=extras[state.object].map(item=>`<div class="extra-row"><div class="extra-info"><strong>${item[1]}</strong><small>${rub(item[2])} / ${item[3]}</small></div><div class="qty"><button data-id="${item[0]}" data-dir="-1" aria-label="Уменьшить ${item[1]}">−</button><span>${state.qty[item[0]]||0}</span><button data-id="${item[0]}" data-dir="1" aria-label="Добавить ${item[1]}">+</button></div></div>`).join('');
  $('extrasList').querySelectorAll('button').forEach(button=>button.onclick=()=>{const id=button.dataset.id;state.qty[id]=Math.max(0,Math.min(100,(state.qty[id]||0)+Number(button.dataset.dir)));renderExtras();renderTotal()});
}
function renderTotal(){
  const base=getBase();
  const extra=getExtra();
  $('totalPrice').textContent=base===null?'По запросу':rub(base+extra);
  $('basePrice').textContent=base===null?'По запросу':rub(base);
  $('extraPrice').textContent=rub(extra);
  $('summaryDesc').textContent=description();
  let note='Стоимость зависит от диапазона площади по прайсу.';
  if(state.object==='flat'&&state.area>200)note='Для квартир свыше 200 м² уточните индивидуальную стоимость.';
  if(state.object==='office'&&state.area>250&&state.area<300)note='Для офисов 251–299 м² цена в прайсе не указана — требуется уточнение.';
  if(state.object==='office'&&state.area>=300)note='Для офисов свыше 300 м² применяется тариф за м² из прайса.';
  $('areaNote').textContent=note;
}
function render(){
  document.querySelectorAll('[data-object]').forEach(button=>button.classList.toggle('active',button.dataset.object===state.object));
  const hasBase=['flat','office'].includes(state.object);
  $('baseBlock').hidden=!hasBase;
  $('equipmentBlock').hidden=true;
  $('area').value=state.area;
  $('areaRange').value=Math.min(500,state.area);
  renderChoices();
  renderEquipment();
  renderExtras();
  renderTotal();
}
function setArea(value){
  state.area=Math.max(1,Math.min(500,Math.round(Number(value)||1)));
  $('area').value=state.area;
  $('areaRange').value=Math.min(500,state.area);
  renderTotal();
}
$('objectTabs').addEventListener('click',event=>{const button=event.target.closest('[data-object]');if(!button)return;state.object=button.dataset.object;state.type='support';state.qty={};state.equipment={vacuum:'',ladder:''};render()});
$('area').addEventListener('input',event=>{if(event.target.value!=='')setArea(event.target.value)});
$('areaRange').addEventListener('input',event=>setArea(event.target.value));
$('areaMinus').onclick=()=>setArea(state.area-5);
$('areaPlus').onclick=()=>setArea(state.area+5);
document.querySelectorAll('[data-prefill]').forEach(link=>link.addEventListener('click',()=>{state.object=link.dataset.prefill;state.type='support';state.qty={};state.equipment={vacuum:'',ladder:''};render()}));
document.querySelectorAll('[data-plan]').forEach(link=>link.addEventListener('click',()=>{state.object='flat';state.type=link.dataset.plan;state.qty={};state.equipment={vacuum:'',ladder:''};render()}));
function setModal(open){$('leadModal').classList.toggle('open',open);$('leadModal').setAttribute('aria-hidden',String(!open));document.body.style.overflow=open?'hidden':'';if(open){$('leadStatus').textContent='';$('leadName').focus()}}
$('requestBtn').onclick=()=>setModal(true);
$('closeModal').onclick=()=>setModal(false);
document.querySelector('[data-close]').onclick=()=>setModal(false);
document.addEventListener('keydown',event=>{if(event.key==='Escape')setModal(false)});
const leadConfigUrl=new URL('assets/form-config.json',document.currentScript.src).href;
let leadEndpointPromise;
function getLeadEndpoint(){
  if(!leadEndpointPromise){
    leadEndpointPromise=fetch(leadConfigUrl,{cache:'no-store'})
      .then(response=>{if(!response.ok)throw new Error('config');return response.json()})
      .then(config=>{if(!config||typeof config.endpoint!=='string'||!config.endpoint.startsWith('https://'))throw new Error('endpoint');return config.endpoint});
    leadEndpointPromise.catch(()=>{leadEndpointPromise=undefined});
  }
  return leadEndpointPromise;
}
$('leadForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const form=$('leadForm');
  const status=$('leadStatus');
  const button=form.querySelector('button[type="submit"]');
  status.textContent='';
  if(!form.reportValidity())return;
  if(form.querySelector('input[name="bot-field"]').value)return;
  const initialButtonMarkup=button.innerHTML;
  button.disabled=true;
  button.textContent='Отправляем…';
  try{
    const endpoint=await getLeadEndpoint();
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
    const result=await response.json().catch(()=>null);
    if(!response.ok||!result||result.ok!==true)throw new Error('delivery');
    status.textContent='Заявка отправлена. Мы перезвоним вам в ближайшее время.';
    form.reset();
  }catch(_){
    status.textContent='Не удалось отправить заявку. Позвоните нам или попробуйте ещё раз.';
  }finally{
    button.disabled=false;
    button.innerHTML=initialButtonMarkup;
  }
});
const gallery=$('gallery');
let activeGallery='compare';
function showGallery(){
  gallery.classList.toggle('objects',activeGallery==='objects');
  const count=activeGallery==='objects'?4:6;
  gallery.innerHTML=Array.from({length:count},(_,index)=>`<article class="portfolio-item"><img src="assets/${activeGallery==='objects'?'object':'before-after'}-${index+1}.jpg" alt="${activeGallery==='objects'?'Объект Clean Pact':'Результат уборки до и после'} ${index+1}" loading="lazy"><div><strong>${activeGallery==='objects'?'Пример объекта':'Результат уборки'} №${index+1}</strong><span>${activeGallery==='objects'?'Портфолио':'До / После'} ↗</span></div></article>`).join('');
  gallery.querySelectorAll('img').forEach(image=>image.onclick=()=>{const wrap=document.createElement('div');wrap.className='lightbox';wrap.innerHTML=`<button aria-label="Закрыть">×</button><img src="${image.src}" alt="${image.alt}">`;wrap.onclick=()=>wrap.remove();document.body.append(wrap)});
}
document.querySelectorAll('[data-gallery]').forEach(button=>button.onclick=()=>{activeGallery=button.dataset.gallery;document.querySelectorAll('[data-gallery]').forEach(item=>item.classList.toggle('active',item===button));showGallery()});
$('menuBtn').onclick=()=>{const open=$('nav').classList.toggle('open');$('menuBtn').setAttribute('aria-expanded',String(open))};
$('nav').querySelectorAll('a').forEach(link=>link.onclick=()=>$('nav').classList.remove('open'));
function enhanceLanding(){
  const prices=document.querySelector('#prices');
  if(prices&&!document.querySelector('.consult-strip'))prices.insertAdjacentHTML('afterend','<section class="consult-strip"><div class="container consult-inner"><div><div class="eyebrow">НУЖНА ПОДСКАЗКА?</div><h2>Не знаете, какой <em>формат уборки</em> выбрать?</h2><p>Начните с расчёта: выберите помещение и услугу — дальше легко уточнить детали.</p></div><a href="#calculator" class="btn">Рассчитать уборку <span>↗</span></a></div></section>');
  if(!document.querySelector('.quiz-fab'))document.body.insertAdjacentHTML('beforeend','<button class="quiz-fab" type="button" aria-label="Открыть расчёт стоимости"><span>Рассчитать<br>уборку</span><b>↗</b></button>');
  const extras=$('extrasBlock');
  const extrasList=$('extrasList');
  const extrasNote=extras?.querySelector('.calc-muted');
  if(extras&&extrasList&&extrasNote&&!extras.querySelector('.extras-details')){
    const details=document.createElement('details');
    details.className='extras-details';
    details.innerHTML='<summary>Добавить дополнительные работы</summary>';
    details.append(extrasNote,extrasList);
    extras.append(details);
  }
}
enhanceLanding();
render();
showGallery();

function initReviewsCarousel(){
  const track=document.querySelector('.reviews-track');
  const previous=$('reviewsPrev');
  const next=$('reviewsNext');
  const counter=$('reviewsCounter');
  if(!track||!previous||!next||!counter)return;
  const originals=[...track.children];
  const total=originals.length;
  let index=0;
  const visible=()=>window.matchMedia('(max-width:480px)').matches?1:window.matchMedia('(max-width:780px)').matches?2:3;
  const clones=()=>[...track.querySelectorAll('[data-review-clone]')];
  function prepare(){
    clones().forEach(node=>node.remove());
    originals.slice(0,visible()).forEach(card=>{const clone=card.cloneNode(true);clone.dataset.reviewClone='true';clone.setAttribute('aria-hidden','true');track.append(clone)});
    index=0;
    move(false);
  }
  function move(animate=true){
    const card=track.querySelector('.review-card');
    const gap=16;
    const distance=card.getBoundingClientRect().width+gap;
    track.style.transition=animate?'transform .38s ease':'none';
    track.style.transform=`translateX(${-index*distance}px)`;
    counter.textContent=`${(index%total)+1} / ${total}`;
  }
  function go(direction){
    index+=direction;
    if(index<0){index=total-1;move(false);requestAnimationFrame(()=>move(true));return}
    move(true);
  }
  next.addEventListener('click',()=>go(1));
  previous.addEventListener('click',()=>go(-1));
  track.addEventListener('transitionend',()=>{if(index>=total){index=0;move(false)}});
  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(prepare,120)});
  prepare();
}
initReviewsCarousel();

const quizUrl='https://clean-pact.ru/';
function openQuiz(){
  let quizModal=$('quizModal');
  if(!quizModal){
    quizModal=document.createElement('div');
    quizModal.className='quiz-modal';
    quizModal.id='quizModal';
    quizModal.innerHTML='<div class="quiz-modal__backdrop" data-quiz-close="true"></div><section class="quiz-modal__dialog" role="dialog" aria-modal="true" aria-label="Расчёт стоимости уборки"><button class="quiz-modal__close" type="button" aria-label="Закрыть квиз">×</button><iframe title="Расчёт стоимости уборки Clean Pact" src="'+quizUrl+'"></iframe></section>';
    document.body.append(quizModal);
    quizModal.querySelectorAll('[data-quiz-close="true"],.quiz-modal__close').forEach(control=>control.onclick=()=>{quizModal.classList.remove('open');document.body.style.overflow=''});
  }
  quizModal.classList.add('open');
  document.body.style.overflow='hidden';
}
document.addEventListener('click',event=>{
  const trigger=event.target.closest('.head-cta,.hero-actions .btn,.consult-strip .btn,.quiz-fab');
  if(!trigger)return;
  event.preventDefault();
  openQuiz();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    const quizModal=$('quizModal');
    if(quizModal?.classList.contains('open')){quizModal.classList.remove('open');document.body.style.overflow=''}
  }
});
