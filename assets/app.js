(() => {
  'use strict';
  const KEY = 'flow_demo_state_v1';
  const DRAFT = 'flow_booking_draft_v1';
  const qs = (s, r=document) => r.querySelector(s);
  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const pad = n => String(n).padStart(2,'0');
  const dateISO = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const addDays = n => { const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+n); return d; };
  const SLOT_TIMES=['09:00','10:00','11:30','13:30','14:30','16:00','17:30','19:00','20:00'];
  const toMinutes = t => { const [h,m]=String(t).split(':').map(Number); return h*60+m; };
  const timesFor = (state,service,date='') => {
    const open=toMinutes(state.settings.open), latest=toMinutes(state.settings.close)-service.duration;
    const now=new Date(), today=dateISO(now), cutoff=now.getHours()*60+now.getMinutes()+30;
    return SLOT_TIMES.filter(t=>{ const m=toMinutes(t); return m>=open && m<=latest && !(date===today && m<=cutoff); });
  };
  const fmtDate = iso => { const d=new Date(iso+'T12:00:00'); return `${d.getMonth()+1}月${d.getDate()}日`; };
  const week = d => ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];

  const seed = () => ({
    services:[
      {id:'s1',name:'新客造型',duration:60,price:169,tag:'推荐',desc:'首次到店的完整沟通与造型服务，包含需求确认、方案建议与现场完成。',enabled:true},
      {id:'s2',name:'深度护理',duration:90,price:259,tag:'热门',desc:'适合需要更完整护理流程的预约项目，预留更长服务时间。',enabled:true},
      {id:'s3',name:'快速整理',duration:30,price:99,tag:'快捷',desc:'30 分钟快速服务，适合已有明确需求的复购用户。',enabled:true},
      {id:'s4',name:'一对一咨询',duration:45,price:129,tag:'咨询',desc:'先聊清需求和预期，再决定是否进入后续正式服务。',enabled:true}
    ],
    orders:[
      {id:'FLW-DEMO-01',serviceId:'s2',date:dateISO(addDays(2)),time:'14:30',status:'confirmed',customer:'林夏',phone:'13800005217',createdAt:new Date().toISOString()}
    ],
    user:{name:'林夏',phone:'13800005217',level:'SILVER',points:1280,visits:6},
    settings:{open:'10:00',close:'20:00',autoConfirm:false,reminder:true}
  });
  const read = () => { try { const v=JSON.parse(localStorage.getItem(KEY)); if(v?.services&&v?.orders) return v; } catch(_){} const v=seed(); localStorage.setItem(KEY,JSON.stringify(v)); return v; };
  const write = s => localStorage.setItem(KEY,JSON.stringify(s));
  const readDraft = () => { try{return JSON.parse(sessionStorage.getItem(DRAFT))||{};}catch(_){return{}} };
  const writeDraft = d => sessionStorage.setItem(DRAFT,JSON.stringify(d));
  const clearDraft = () => sessionStorage.removeItem(DRAFT);
  const serviceById = (state,id) => state.services.find(s=>s.id===id);
  const statusText = s => ({pending:'待确认',confirmed:'已确认',completed:'已完成',cancelled:'已取消'})[s]||s;
  const statusClass = s => ({pending:'amber',confirmed:'green',completed:'blue',cancelled:''})[s]||'';

  const app = qs('#app');
  if(!app) return;
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const resetMainScroll = () => { const main=qs('.app-main'); if(main) main.scrollTop=0; requestAnimationFrame(()=>{ const m=qs('.app-main'); if(m) m.scrollTop=0; }); };

  const navHTML = active => `<nav class="bottom-nav" aria-label="用户端导航">
    ${[['home','首页'],['services','服务'],['orders','订单'],['member','我的']].map(([k,l],i)=>`<button type="button" data-nav="${k}" class="${active===k?'active':''}" ${active===k?'aria-current="page"':''}><small>0${i+1}</small>${l}</button>`).join('')}
  </nav>`;
  const topHTML = label => `<header class="app-top"><a class="app-logo" href="#/home" aria-label="FLOW 首页"><i></i>FLOW</a><span class="app-context mono">${esc(label)}</span></header>`;
  const shell = (body,active='home',label='INTERACTIVE DEMO') => `<div class="app">${topHTML(label)}<main id="main" class="app-main">${body}</main>${navHTML(active)}</div>`;
  const goto = path => { location.hash = path.startsWith('#')?path:`#${path}`; };

  function home(state){
    const next = [...state.orders].filter(o=>['pending','confirmed'].includes(o.status)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
    const service = next ? serviceById(state,next.serviceId) : null;
    return shell(`<section class="screen">
      <div class="hero-greeting"><div class="eyebrow mono">GOOD DAY / ${week(new Date())}</div><h1>把下一次<br><span>预约安排好。</span></h1><p class="screen-sub">少填信息，少走一步。FLOW 把服务、时间和订单状态放在一条清楚的路径里。</p></div>
      <section class="merchant-card"><small class="mono">AURA STUDIO / DEMO MERCHANT</small><h2>今日 ${esc(state.settings.open)}—${esc(state.settings.close)} 可预约</h2><div class="merchant-meta"><span>线下服务工作室</span><span>距你 2.4 km</span></div></section>
      <div class="section-title"><h2>下一次预约</h2><button type="button" data-nav="orders">查看全部</button></div>
      ${next?`<article class="card next-card" data-order="${next.id}" tabindex="0" role="button" aria-label="查看 ${esc(service?.name||'服务')} 预约详情"><div><span class="chip ${statusClass(next.status)}"><i class="status-dot"></i>${statusText(next.status)}</span><div class="next-date">${fmtDate(next.date)}<br>${next.time}</div><p>${esc(service?.name||'服务')} · ${service?.duration||'-'} 分钟</p></div><strong class="price">¥${service?.price||0}</strong></article>`:`<div class="card empty"><strong>还没有预约</strong>从一个服务开始。</div>`}
      <div class="section-title"><h2>常用服务</h2><button type="button" data-nav="services">全部服务</button></div>
      <div class="service-strip">${state.services.filter(s=>s.enabled).slice(0,3).map(s=>`<article class="service-mini" data-service="${s.id}" tabindex="0" role="button" aria-label="查看 ${esc(s.name)} 服务详情"><div><h3>${esc(s.name)}</h3><p>${s.duration} 分钟 · ${esc(s.tag)}</p></div><strong>¥${s.price}</strong></article>`).join('')}</div>
    </section>`,'home');
  }

  function services(state){
    return shell(`<section class="screen"><div class="eyebrow mono">SERVICES</div><h1 class="screen-title">选服务，<br>再选时间。</h1><p class="screen-sub">先把你要做的事选清楚，系统再根据服务时长给出可预约时间。</p><div class="service-list">${state.services.filter(s=>s.enabled).map(s=>`<article class="service-card" data-service="${s.id}" tabindex="0" role="button" aria-label="查看 ${esc(s.name)} 服务详情"><div class="service-card-top"><div><span class="chip blue">${esc(s.tag)}</span><h2 style="margin-top:10px">${esc(s.name)}</h2></div><strong class="price">¥${s.price}</strong></div><p>${esc(s.desc)}</p><div class="service-footer"><span>${s.duration} 分钟</span><strong>查看详情 →</strong></div></article>`).join('')}</div></section>`,'services','SERVICE CATALOG');
  }

  function serviceDetail(state,id){
    const s=serviceById(state,id); if(!s) return notFound();
    return shell(`<section class="screen"><div class="back-row"><button class="back-btn" type="button" data-back>← 返回</button><span class="chip blue">${esc(s.tag)}</span></div><div class="service-hero"><div class="eyebrow mono">SERVICE / ${esc(s.id.toUpperCase())}</div><h1>${esc(s.name)}</h1><p>${esc(s.desc)}</p><div class="service-hero-foot"><div><small>服务价格</small><div class="price">¥${s.price}</div></div><div><small>预计时长</small><strong>${s.duration} MIN</strong></div></div></div><div class="section-title"><h2>预约前知道这些</h2></div><div class="feature-list"><div><span>到店时间</span><strong>建议提前 5 分钟</strong></div><div><span>取消规则</span><strong>开始前 2 小时</strong></div><div><span>确认方式</span><strong>商家确认后生效</strong></div></div><div style="margin-top:22px"><button class="btn blue full" type="button" data-book="${s.id}" ${s.enabled?'':'disabled'}>${s.enabled?'选择预约时间':'当前暂停预约'}</button></div></section>`,'services','SERVICE DETAIL');
  }

  function booking(state,id){
    const s=serviceById(state,id); if(!s) return notFound(); if(!s.enabled) return serviceDetail(state,id);
    let draft=readDraft(); if(draft.serviceId!==id){draft={serviceId:id,date:'',time:''};writeDraft(draft)}
    const days=[0,1,2,3,4,5].map(n=>addDays(n));
    const times=draft.date?timesFor(state,s,draft.date):[];
    if(draft.time && !times.includes(draft.time)){ draft.time=''; writeDraft(draft); }
    return shell(`<section class="screen"><div class="back-row"><button class="back-btn" type="button" data-back>← 返回</button><span class="mono" style="font-size:.62rem;color:#7d8490">STEP 01</span></div><div class="progress"><i class="on"></i><i></i><i></i></div><h1 class="screen-title">选一个<br>合适的时间。</h1><p class="screen-sub">${esc(s.name)} · ${s.duration} 分钟</p><div class="section-title"><h2>日期</h2></div><div class="date-grid">${days.map(d=>{const iso=dateISO(d),available=timesFor(state,s,iso).length>0;return `<button class="date-btn ${draft.date===iso?'selected':''}" type="button" data-date="${iso}" ${available?'':'disabled'}><small>${available?week(d):'无时段'}</small><strong>${d.getMonth()+1}/${d.getDate()}</strong></button>`}).join('')}</div><div class="section-title"><h2>时间</h2><span class="chip">可预约</span></div><div class="time-grid">${!draft.date?`<div class="slot-empty">先选择日期，再查看当天可预约时段。</div>`:times.length?times.map(t=>`<button class="time-btn ${draft.time===t?'selected':''}" type="button" data-time="${t}">${t}</button>`).join(''):`<div class="slot-empty">这个日期已经没有适合该服务时长的可预约时段，请换一天。</div>`}</div><div class="sticky-action"><button class="btn blue full" type="button" data-next-book ${draft.date&&draft.time?'':'disabled'}>下一步：确认预约</button></div></section>`,'services','BOOKING / 01');
  }

  function confirm(state,id){
    const s=serviceById(state,id); const draft=readDraft(); if(!s||!s.enabled||!draft.date||!draft.time||!timesFor(state,s,draft.date).includes(draft.time)) return booking(state,id);
    return shell(`<section class="screen"><div class="back-row"><button class="back-btn" type="button" data-back>← 返回</button><span class="mono" style="font-size:.62rem;color:#7d8490">STEP 02</span></div><div class="progress"><i class="on"></i><i class="on"></i><i></i></div><h1 class="screen-title">确认信息，<br>提交预约。</h1><div class="card booking-summary"><div class="summary-row"><span>服务</span><strong>${esc(s.name)}</strong></div><div class="summary-row"><span>日期</span><strong>${fmtDate(draft.date)}</strong></div><div class="summary-row"><span>时间</span><strong>${draft.time}</strong></div><div class="summary-row"><span>金额</span><strong>¥${s.price}</strong></div></div><form id="booking-form" novalidate><div class="form-grid"><div class="field"><label for="customer">预约人</label><input id="customer" name="customer" autocomplete="name" required value="${esc(state.user.name)}"></div><div class="field"><label for="phone">手机号</label><input id="phone" name="phone" inputmode="numeric" autocomplete="tel" required maxlength="11" value="${esc(state.user.phone)}"></div></div><div class="form-error" id="form-error" role="alert"></div><button class="btn blue full" type="submit">提交预约</button></form><p class="screen-sub" style="font-size:.72rem">演示环境不会发送短信、扣款或调用真实微信能力。</p></section>`,'services','BOOKING / 02');
  }

  function success(state,id){
    const o=state.orders.find(x=>x.id===id); const s=o&&serviceById(state,o.serviceId); if(!o||!s) return orders(state);
    return shell(`<section class="screen success"><div class="progress"><i class="on"></i><i class="on"></i><i class="on"></i></div><div class="success-mark">✓</div><div class="eyebrow mono">BOOKING SUBMITTED</div><h1>预约已提交。</h1><p>商家确认后，订单状态会从“待确认”更新为“已确认”。这个 Demo 可以在商家后台直接操作状态。</p><div class="success-code">预约编号<strong>${esc(o.id)}</strong></div><div class="button-row"><button class="btn ghost" type="button" data-nav="orders">查看订单</button><a class="btn primary" style="display:flex;align-items:center;justify-content:center" href="/admin/">打开商家后台</a></div></section>`,'orders','BOOKING / DONE');
  }

  function orders(state){
    const list=[...state.orders].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
    return shell(`<section class="screen"><div class="eyebrow mono">MY BOOKINGS</div><h1 class="screen-title">订单状态，<br>随时看清。</h1><p class="screen-sub">演示里保留真实业务常见的待确认、已确认、已完成和已取消状态。</p><div class="order-list">${list.length?list.map(o=>{const s=serviceById(state,o.serviceId);return `<article class="order-card" data-order="${o.id}" tabindex="0" role="button" aria-label="查看 ${esc(s?.name||'服务')} 订单详情"><div class="order-card-top"><div><h3>${esc(s?.name||'未知服务')}</h3><p>${fmtDate(o.date)} · ${o.time} · ${esc(o.id)}</p></div><strong>¥${s?.price||0}</strong></div><span class="chip ${statusClass(o.status)}"><i class="status-dot"></i>${statusText(o.status)}</span></article>`}).join(''):`<div class="empty"><strong>暂无订单</strong>完成一次预约后会显示在这里。</div>`}</div></section>`,'orders','ORDER CENTER');
  }

  function orderDetail(state,id){
    const o=state.orders.find(x=>x.id===id); const s=o&&serviceById(state,o.serviceId); if(!o||!s) return orders(state);
    return shell(`<section class="screen"><div class="back-row"><button class="back-btn" type="button" data-back>← 返回</button><span class="chip ${statusClass(o.status)}">${statusText(o.status)}</span></div><article class="order-detail-hero"><div class="eyebrow mono">${esc(o.id)}</div><h1>${esc(s.name)}</h1><p class="screen-sub">${fmtDate(o.date)} · ${o.time} · ${s.duration} 分钟</p></article><div class="section-title"><h2>订单信息</h2></div><div class="feature-list"><div><span>预约人</span><strong>${esc(o.customer)}</strong></div><div><span>联系电话</span><strong>${esc(o.phone.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2'))}</strong></div><div><span>服务金额</span><strong>¥${s.price}</strong></div><div><span>当前状态</span><strong>${statusText(o.status)}</strong></div></div>${['pending','confirmed'].includes(o.status)?`<div style="margin-top:22px"><button class="btn ghost full" type="button" data-cancel-order="${o.id}">取消预约</button></div>`:''}<p class="screen-sub" style="font-size:.72rem">真实项目可在这里继续接支付、退款、核销、评价等能力；本 Demo 不模拟不存在的第三方授权。</p></section>`,'orders','ORDER DETAIL');
  }

  function member(state){
    return shell(`<section class="screen"><div class="eyebrow mono">MEMBER</div><div class="member-hero"><div class="member-name">${esc(state.user.name)}</div><small>FLOW MEMBER · DEMO</small><div class="member-level"><div><small>会员等级</small><strong>${esc(state.user.level)}</strong></div><div style="text-align:right"><small>积分</small><strong>${state.user.points}</strong></div></div></div><div class="stat-grid"><div class="stat-card"><strong>${state.user.visits}</strong><span>累计到店</span></div><div class="stat-card"><strong>${state.orders.length}</strong><span>预约记录</span></div></div><div class="settings-list"><button type="button" data-nav="orders"><span>我的订单</span><strong>→</strong></button><button type="button" data-reset><span>重置演示数据</span><strong>→</strong></button><a href="https://seekblack.cn/work/flow/" style="display:flex;justify-content:space-between;padding:16px 2px;border-bottom:1px solid #dfe3eb"><span>返回 FLOW Case Study</span><strong>↗</strong></a></div><p class="screen-sub" style="font-size:.72rem">Independent Concept Project · 所有人物、商家与订单均为演示数据。</p></section>`,'member','MEMBER CENTER');
  }

  function notFound(){return shell(`<section class="screen empty" style="padding-top:100px"><strong>这个页面不存在</strong><button class="btn primary" type="button" data-nav="home">返回首页</button></section>`,'home','NOT FOUND')}

  function render(){
    const state=read(); const hash=location.hash||'#/home'; const parts=hash.replace(/^#\/?/,'').split('/').filter(Boolean); const route=parts[0]||'home';
    let html;
    if(route==='home') html=home(state);
    else if(route==='services') html=services(state);
    else if(route==='service') html=serviceDetail(state,parts[1]);
    else if(route==='book') html=booking(state,parts[1]);
    else if(route==='confirm') html=confirm(state,parts[1]);
    else if(route==='success') html=success(state,parts[1]);
    else if(route==='orders') html=parts[1]?orderDetail(state,parts[1]):orders(state);
    else if(route==='member') html=member(state);
    else html=notFound();
    app.innerHTML=html;
    resetMainScroll();
    bind();
  }

  function bind(){
    app.querySelectorAll('[data-nav]').forEach(el=>el.addEventListener('click',()=>goto('/'+el.dataset.nav)));
    app.querySelectorAll('[data-service]').forEach(el=>{const go=()=>goto('/service/'+el.dataset.service);el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
    app.querySelectorAll('[data-order]').forEach(el=>{const go=()=>goto('/orders/'+el.dataset.order);el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
    app.querySelectorAll('[data-back]').forEach(el=>el.addEventListener('click',()=>history.back()));
    app.querySelectorAll('[data-book]').forEach(el=>el.addEventListener('click',()=>{writeDraft({serviceId:el.dataset.book,date:'',time:''});goto('/book/'+el.dataset.book)}));
    app.querySelectorAll('[data-date]').forEach(el=>el.addEventListener('click',()=>{const d=readDraft();if(d.date!==el.dataset.date)d.time='';d.date=el.dataset.date;writeDraft(d);render()}));
    app.querySelectorAll('[data-time]').forEach(el=>el.addEventListener('click',()=>{const d=readDraft();d.time=el.dataset.time;writeDraft(d);render()}));
    qs('[data-next-book]',app)?.addEventListener('click',()=>{const d=readDraft();if(d.date&&d.time)goto('/confirm/'+d.serviceId)});
    qs('#booking-form',app)?.addEventListener('submit',e=>{
      e.preventDefault(); const fd=new FormData(e.currentTarget); const name=String(fd.get('customer')||'').trim(); const phone=String(fd.get('phone')||'').trim(); const err=qs('#form-error',app);
      if(!name){err.textContent='请填写预约人。';return}
      if(!/^1\d{10}$/.test(phone)){err.textContent='请输入 11 位手机号。';return}
      const d=readDraft(), state=read(), service=serviceById(state,d.serviceId); if(!service||!service.enabled||!d.date||!d.time||!timesFor(state,service,d.date).includes(d.time)){err.textContent='预约时间已不可用，请重新选择。';return}
      const now=new Date(); const id=`FLW${String(now.getFullYear()).slice(-2)}${pad(now.getMonth()+1)}${pad(now.getDate())}${String(Math.floor(Math.random()*900)+100)}`;
      state.user.name=name; state.user.phone=phone; state.orders.push({id,serviceId:service.id,date:d.date,time:d.time,status:state.settings.autoConfirm?'confirmed':'pending',customer:name,phone,createdAt:new Date().toISOString()}); write(state); clearDraft(); goto('/success/'+id);
    });
    app.querySelectorAll('[data-cancel-order]').forEach(el=>el.addEventListener('click',()=>{const state=read(),o=state.orders.find(x=>x.id===el.dataset.cancelOrder);if(o){o.status='cancelled';write(state);render()}}));
    qs('[data-reset]',app)?.addEventListener('click',()=>{localStorage.setItem(KEY,JSON.stringify(seed()));clearDraft();goto('/home');render()});
  }

  window.addEventListener('hashchange',render); window.addEventListener('storage',render); window.addEventListener('pageshow',resetMainScroll); render();
})();
