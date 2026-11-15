(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KR = n => '₩' + Number(n).toLocaleString('ko-KR');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const BASE = 19900, MR = 14900, EXPRESS = 9900, ALT = 6900;
  const audio = $('sample-audio');
  const heroPlay = $('hero-play'), samplePlay = $('sample-play'), giftPlay = $('gift-play');
  let activeSample = 'mother', step = 0, order = fresh(), phase = 'form'; // form | generating | result | pay | done

  function fresh(){return {relation:'',occasion:'',recipient:'',giver:'',pron:'',story:'',detail:'',message:'',mood:'따뜻하고 진심 어린',genre:'어쿠스틱',voice:'여성',tempo:'중간',mr:false,key:'0',express:false,alt:false,contactType:'kakao',contact:'',name:'',pay:'카카오페이',agreeTerms:false,agreeRefund:false,agreePrivacy:false};}

  const samples = {
    mother:{label:'어머니께 · 발라드',title:'나의 어머니, 순자 씨에게',desc:'모든 것을 내어주신 엄마에게, 말로는 다 못 한 마음을 노래로 전해 보세요.',occ:'부모님께'},
    anniversary:{label:'기념일 · 어쿠스틱 팝',title:'우리가 함께 세어 온 날들',desc:'처음 만난 곳과 둘만 아는 일화를 음악으로 기억해 보세요.',occ:'기념일'},
    birthday:{label:'생일 · 밝은 팝',title:'오늘은 네가 주인공',desc:'그 사람만을 위한 이름과 이야기로 생일을 특별하게.',occ:'생일'},
    thanks:{label:'감사 · 포크',title:'그날의 고마움을',desc:'미처 전하지 못한 감사의 말을 노래에 담아요.',occ:'감사'},
    wedding:{label:'결혼식 · 어쿠스틱',title:'우리의 봄은 계속될 거야',desc:'두 사람의 이야기를 하객 앞에서 직접 부르는 축가를 상상해 보세요.',occ:'결혼식'},
    comfort:{label:'위로 · 잔잔한 발라드',title:'내일은 조금 더 따뜻하게',desc:'힘든 시간을 걷는 사람에게 건네는 작은 위로.',occ:'위로'},
    father:{label:'아버지께 · 발라드',title:'묵묵한 사랑의 이름',desc:'말없이 곁을 지켜주신 아버지께 보내는 노래.',occ:'아버지께'},
    graduation:{label:'졸업 · 팝',title:'새로운 페이지',desc:'함께한 시간의 마지막 장을 넘기는 축하의 노래.',occ:'졸업'}
  };

  /* ---------- audio ---------- */
  const tt = n => `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
  function audioUi(){
    const g = audio.paused ? '▶' : 'Ⅱ';
    [heroPlay, samplePlay].forEach(b => { if(!b) return; b.querySelector('span').textContent = g; b.setAttribute('aria-label', audio.paused ? '시연 반주 재생' : '시연 반주 일시정지'); });
    if(giftPlay) giftPlay.textContent = audio.paused ? '시연용 반주 듣기 ▶' : '일시정지 Ⅱ';
    const w = document.querySelector('.audio-wave'); if(w) w.classList.toggle('playing', !audio.paused);
    $('hero-time').textContent = tt(audio.currentTime);
    const d = Number.isFinite(audio.duration) ? audio.duration : 0;
    $('sample-time').textContent = `${tt(audio.currentTime)} / ${tt(d)}`;
    if(d > 0) $('sample-progress').value = Math.round(audio.currentTime / d * 100);
    const rp = $('result-progress'); if(rp && d > 0){ rp.value = Math.round(audio.currentTime / d * 100); const rt = $('result-time'); if(rt) rt.textContent = `${tt(audio.currentTime)} / ${tt(d)}`; }
    const rb = $('result-play'); if(rb) rb.textContent = audio.paused ? '▶' : 'Ⅱ';
  }
  const toggleAudio = () => { if(audio.paused) audio.play().catch(() => alert('시연 오디오를 열 수 없어요. 폴더 전체를 함께 열어 주세요.')); else audio.pause(); };
  [heroPlay, samplePlay, giftPlay].forEach(el => el && el.addEventListener('click', toggleAudio));
  ['play','pause','timeupdate','loadedmetadata','ended'].forEach(e => audio.addEventListener(e, audioUi));
  $('sample-progress').addEventListener('input', e => { if(Number.isFinite(audio.duration)) audio.currentTime = audio.duration * Number(e.target.value) / 100; });

  document.querySelectorAll('[data-sample]').forEach(el => el.addEventListener('click', () => {
    activeSample = el.dataset.sample; const x = samples[activeSample];
    document.querySelectorAll('[data-sample]').forEach(b => { b.classList.toggle('active', b === el); b.setAttribute('aria-selected', b === el ? 'true' : 'false'); });
    $('sample-label').textContent = x.label; $('sample-title').textContent = x.title; $('sample-player-title').textContent = x.title; $('sample-description').textContent = x.desc;
  }));

  /* ---------- nav / modals ---------- */
  const mobileNav = $('mobile-nav');
  $('menu-toggle').addEventListener('click', () => { const o = mobileNav.classList.toggle('open'); $('menu-toggle').setAttribute('aria-expanded', String(o)); });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
  const dlg = $('order-dialog'), gift = $('gift-dialog');
  const show = m => { m.showModal(); document.body.style.overflow = 'hidden'; };
  const close = m => { m.close(); if(!dlg.open && !gift.open) document.body.style.overflow = ''; };
  function openOrder(occ = '', mr = false){
    order = fresh(); if(occ) order.occasion = occ; if(mr) order.mr = true;
    step = occ ? 0 : 0; phase = 'form'; render(); show(dlg); mobileNav.classList.remove('open');
  }
  document.querySelectorAll('[data-open-order]').forEach(b => b.addEventListener('click', () => openOrder()));
  document.querySelectorAll('[data-open-wedding]').forEach(b => b.addEventListener('click', () => openOrder('결혼식', true)));
  document.querySelectorAll('[data-occasion]').forEach(b => b.addEventListener('click', () => openOrder(b.dataset.occasion)));
  $('sample-create').addEventListener('click', () => openOrder(samples[activeSample].occ));
  $('order-close').addEventListener('click', () => { audio.pause(); close(dlg); });
  $('gift-close').addEventListener('click', () => { audio.pause(); close(gift); });
  dlg.addEventListener('close', () => { audio.pause(); document.body.style.overflow = ''; });
  gift.addEventListener('close', () => { audio.pause(); document.body.style.overflow = ''; });
  [dlg, gift].forEach(d => d.addEventListener('click', e => { if(e.target === d) close(d); }));

  /* ---------- order flow ---------- */
  const relations = ['엄마','아빠','아내','남편','여자친구','남자친구','약혼자','할머니','할아버지','딸','아들','손주','형제·자매','친구','선생님','나 자신','그 외'];
  const occasions = ['생일','기념일','결혼식','프로포즈','부모님께','아버지께','감사','졸업','위로','그리움','사과','추억'];
  const FORM_STEPS = [
    ['누구를 위한 노래인가요?','선물 받을 분과의 관계를 골라 주세요.'],
    ['어떤 순간을 위한 선물인가요?','가장 가까운 상황을 골라 주세요.'],
    ['노래의 주인공을 알려 주세요.','실제로 부르는 이름이나 호칭을 적어 주세요.'],
    ['기억에 남는 이야기가 있나요?','처음 만난 날, 함께한 여행, 자주 하시던 말씀. 짧아도 괜찮아요.'],
    ['꼭 전하고 싶은 한마디는요?','노래를 듣고 이 말만은 기억했으면 하는 문장이에요.'],
    ['어떤 노래가 어울릴까요?','스타일과 목소리를 골라 주세요.'],
    ['받아 볼 곳을 알려 주세요.','완성되면 알려 드릴게요. 결제 정보는 아직 필요 없어요.'],
    ['선택 옵션이 있어요.','지금 정하지 않아도 돼요. 노래를 들어 본 뒤 추가해도 됩니다.']
  ];
  const keyLabel = v => ({'-3':'-3반음','-2':'-2반음','-1':'-1반음','0':'원키','1':'+1반음','2':'+2반음','3':'+3반음'})[String(v)] || '원키';
  const total = () => BASE + (order.mr ? MR : 0) + (order.express ? EXPRESS : 0) + (order.alt ? ALT : 0);
  const card = (k, v, sel) => `<button type="button" class="choice-card ${sel === v ? 'selected' : ''}" data-set="${esc(k)}" data-value="${esc(v)}"><b>${esc(v)}</b></button>`;

  function summary(){
    const pending = phase === 'form' || phase === 'generating';
    $('live-summary').innerHTML =
      `<div class="summary-row"><span>받는 분</span><span>${esc(order.recipient || order.relation || '선택 전')}</span></div>` +
      `<div class="summary-row"><span>상황</span><span>${esc(order.occasion || '선택 전')}</span></div>` +
      `<div class="summary-row"><span>스타일</span><span>${esc(order.genre)} · ${esc(order.voice)}</span></div>` +
      `<div class="summary-row"><span>맞춤곡 1곡</span><span>${KR(BASE)}</span></div>` +
      (order.mr ? `<div class="summary-row"><span>MR (${keyLabel(order.key)})</span><span>+ ${KR(MR)}</span></div>` : '') +
      (order.express ? `<div class="summary-row"><span>급행 제작</span><span>+ ${KR(EXPRESS)}</span></div>` : '') +
      (order.alt ? `<div class="summary-row"><span>다른 스타일 버전</span><span>+ ${KR(ALT)}</span></div>` : '');
    $('summary-total').textContent = pending || phase === 'result' ? '₩0' : KR(total());
    $('order-free-tag').textContent = phase === 'pay' ? '결제 단계 · 시연' : '무료 · 결제 정보 입력 없음';
  }

  function setHead(label, pct, title, sub){
    $('order-step-label').textContent = label; $('order-progress').style.width = pct + '%';
    $('order-title').textContent = title; $('order-subtitle').textContent = sub; $('order-error').textContent = '';
  }
  const nav = (back, nextText, hideNext) => {
    $('order-back').style.visibility = back ? 'visible' : 'hidden';
    $('order-next').style.display = hideNext ? 'none' : 'inline-flex';
    if(nextText) $('order-next').textContent = nextText;
  };

  function render(){
    summary();
    if(phase === 'generating') return renderGen();
    if(phase === 'result') return renderResult();
    if(phase === 'pay') return renderPay();
    if(phase === 'done') return renderDone();
    const [t, s] = FORM_STEPS[step];
    setHead(`${step + 1}/8단계 · 무료로 만들어 보기`, (step + 1) / 8 * 100, t, s);
    nav(step > 0, step === 7 ? '내 노래 만들기 (무료) →' : '다음 →', false);
    const el = $('order-fields');
    if(step === 0) el.innerHTML = `<div class="radio-cards compact-cards">${relations.map(r => card('relation', r, order.relation)).join('')}</div>`;
    else if(step === 1) el.innerHTML = `<div class="radio-cards compact-cards">${occasions.map(r => card('occasion', r, order.occasion)).join('')}</div>`;
    else if(step === 2) el.innerHTML = `<div class="two-col-form"><div class="form-field"><label for="recipient">노래에 넣을 이름·호칭 *</label><input id="recipient" maxlength="40" placeholder="예: 순자, 우리 엄마" value="${esc(order.recipient)}"/></div><div class="form-field"><label for="giver">선물하는 사람 (선택)</label><input id="giver" maxlength="40" placeholder="예: 아들 민재" value="${esc(order.giver)}"/></div></div><div class="form-field"><label for="pron">발음 메모 (선택)</label><input id="pron" maxlength="60" placeholder="예: 윤슬 → 윤슬 (받침 발음 주의)" value="${esc(order.pron)}"/></div>`;
    else if(step === 3) el.innerHTML = `<div class="form-field"><label for="story">가장 기억에 남는 이야기 *</label><textarea id="story" maxlength="3000" placeholder="처음 만난 곳, 함께 간 여행, 마음이 따뜻했던 순간, 둘만 아는 별명...">${esc(order.story)}</textarea></div><div class="form-field"><label for="detail">그 사람을 떠올리게 하는 특징 (선택)</label><textarea id="detail" maxlength="1200" placeholder="말버릇, 웃음소리, 좋아하는 음식이나 장소">${esc(order.detail)}</textarea></div><p class="form-help">주민등록번호·계좌번호 등 민감한 정보는 적지 말아 주세요.</p>`;
    else if(step === 4) el.innerHTML = `<div class="form-field"><label for="message">가사에 꼭 담고 싶은 한마디 *</label><textarea id="message" maxlength="1000" placeholder="예: 표현은 못 했지만 엄마 덕분에 여기까지 왔어요.">${esc(order.message)}</textarea></div><div class="form-field"><label>어떤 분위기로 전할까요?</label><div class="style-choices">${['따뜻하고 진심 어린','밝고 신나는','뭉클하고 감동적인','차분하고 담백한','유쾌하고 재치 있는','웅장하고 극적인'].map(v => card('mood', v, order.mood)).join('')}</div></div>`;
    else if(step === 5) el.innerHTML = `<div class="form-field"><label>음악 스타일</label><div class="style-choices">${['발라드','어쿠스틱','팝','트로트','R&B','인디','록','재즈','CCM','추천해 주세요'].map(v => card('genre', v, order.genre)).join('')}</div></div><div class="form-field"><label>보컬</label><div class="style-choices">${['여성','남성','듀엣','추천해 주세요'].map(v => card('voice', v, order.voice)).join('')}</div></div><div class="form-field"><label>빠르기</label><div class="style-choices">${['느리게','중간','신나게'].map(v => card('tempo', v, order.tempo)).join('')}</div></div>`;
    else if(step === 6) el.innerHTML = `<p class="sub-title">완성 알림을 받을 방법</p><div class="contact-switch">${[['kakao','카카오톡'],['sms','문자'],['email','이메일']].map(([k, l]) => `<button type="button" class="choice-card ${order.contactType === k ? 'selected' : ''}" data-ct="${k}"><b>${l}</b></button>`).join('')}</div><div class="two-col-form"><div class="form-field"><label for="name">이름 *</label><input id="name" maxlength="30" autocomplete="name" value="${esc(order.name)}" placeholder="이름"/></div><div class="form-field"><label for="contact">${order.contactType === 'email' ? '이메일 *' : '휴대폰 번호 *'}</label><input id="contact" maxlength="60" ${order.contactType === 'email' ? 'type="email" autocomplete="email" placeholder="example@email.com"' : 'type="tel" inputmode="numeric" autocomplete="tel" placeholder="010-0000-0000"'} value="${esc(order.contact)}"/></div></div><p class="form-help">완성 알림과 주문 조회에만 사용해요. 개인정보 수집·이용 동의는 결제 단계에서 받아요.</p>`;
    else if(step === 7) {
      el.innerHTML = `<div class="addon-panel ${order.mr ? 'addon-active' : ''}"><h3>🎤 MR (무대에서 부를 반주) <span class="price-mini">+ ${KR(MR)}</span></h3><p>결혼식 축가·프로포즈·잔치·행사에서 직접 부를 수 있는 반주 파일. 결제 시에만 청구돼요.</p><div class="check-row"><label><input type="checkbox" id="o-mr" ${order.mr ? 'checked' : ''}/> MR도 받아 볼래요</label></div><div class="key-picker" ${order.mr ? '' : 'hidden'} id="key-picker"><label for="o-key">키 조정</label><select id="o-key">${['-3','-2','-1','0','1','2','3'].map(v => `<option value="${v}" ${order.key === v ? 'selected' : ''}>${keyLabel(v)}</option>`).join('')}</select></div></div><div class="addon-panel"><h3>🚀 급행 제작 <span class="price-mini">+ ${KR(EXPRESS)}</span></h3><p>더 빨리 받고 싶을 때. (시연 옵션 · 실제 소요 시간은 오픈 후 안내)</p><div class="check-row"><label><input type="checkbox" id="o-ex" ${order.express ? 'checked' : ''}/> 급행으로 받을래요</label></div></div><div class="addon-panel"><h3>🎼 다른 스타일 버전 <span class="price-mini">+ ${KR(ALT)}</span></h3><p>같은 가사로 다른 편곡을 한 곡 더.</p><div class="check-row"><label><input type="checkbox" id="o-alt" ${order.alt ? 'checked' : ''}/> 추가 버전도 받을래요</label></div></div><p class="form-help">옵션은 선택일 뿐, 지금 결제되지 않아요. 노래를 들어 본 뒤 마음에 들면 결제 단계에서 최종 확인해요.</p>`;
      const bind = (id, k) => $(id).addEventListener('change', e => { order[k] = e.target.checked; if(k === 'mr') $('key-picker').hidden = !order.mr; summary(); });
      bind('o-mr', 'mr'); bind('o-ex', 'express'); bind('o-alt', 'alt');
      $('o-key').addEventListener('change', e => { order.key = e.target.value; summary(); });
    }
    el.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => { order[b.dataset.set] = b.dataset.value; render(); }));
    el.querySelectorAll('[data-ct]').forEach(b => b.addEventListener('click', () => { collect(); order.contactType = b.dataset.ct; order.contact = ''; render(); }));
  }

  function collect(){
    const map = {2:['recipient','giver','pron'],3:['story','detail'],4:['message'],6:['name','contact']};
    (map[step] || []).forEach(id => { if($(id)) order[id] = $(id).value.trim(); });
  }
  function validate(){
    if(step === 0 && !order.relation) return '누구를 위한 노래인지 골라 주세요.';
    if(step === 1 && !order.occasion) return '어떤 순간인지 골라 주세요.';
    if(step === 2 && !order.recipient) return '이름이나 호칭을 적어 주세요.';
    if(step === 3 && order.story.length < 10) return '이야기를 10자 이상 적어 주세요.';
    if(step === 4 && order.message.length < 3) return '전하고 싶은 한마디를 3자 이상 적어 주세요.';
    if(step === 6){
      if(!order.name) return '이름을 입력해 주세요.';
      if(order.contactType === 'email'){ if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.contact)) return '올바른 이메일 주소를 입력해 주세요.'; }
      else if(!/^01[016789]-?\d{3,4}-?\d{4}$/.test(order.contact.replace(/\s/g, ''))) return '올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)';
    }
    return '';
  }
  $('order-form').addEventListener('submit', e => {
    e.preventDefault();
    if(phase === 'pay') return submitPay();
    if(phase !== 'form') return;
    collect(); const err = validate(); if(err){ $('order-error').textContent = err; return; }
    if(step < 7){ step++; render(); } else { phase = 'generating'; render(); }
  });
  $('order-back').addEventListener('click', () => {
    if(phase === 'pay'){ phase = 'result'; return render(); }
    collect(); step = Math.max(0, step - 1); render();
  });

  /* 제작(시연) */
  let genTimer;
  function renderGen(){
    setHead('노래 제작 중 · 무료', 100, `${esc(order.recipient)}님을 위한 노래를 만들고 있어요`, '시연용 화면이에요. 실제 서비스에서는 이 시간에 가사와 음악이 만들어져요.');
    nav(false, '', true);
    $('order-fields').innerHTML = `<div class="gen-box"><div class="gen-ring"></div><h3>이야기를 노래로 바꾸는 중…</h3><p>창을 닫지 않아도 알림으로 알려 드릴게요 (시연)</p><div class="gen-log" id="gen-log"><span>□ 이야기 분석</span><span>□ 가사 구성</span><span>□ 멜로디와 보컬 입히기</span><span>□ 마지막 검수</span></div></div>`;
    const spans = [...$('gen-log').children]; let i = 0; clearInterval(genTimer);
    genTimer = setInterval(() => {
      if(i < spans.length){ spans[i].textContent = spans[i].textContent.replace('□', '✓'); spans[i].classList.add('done'); i++; }
      else { clearInterval(genTimer); phase = 'result'; render(); }
    }, 900);
  }
  function lyrics(){
    const n = order.recipient || '당신', s = order.story.split(/[.\n]/)[0].slice(0, 28), m = order.message.slice(0, 40);
    return `[1절]\n${n}, 오늘은 이 노래를 불러 봐요\n"${s}"\n그날의 공기가 아직도 따뜻해요\n\n[후렴]\n${m}\n말로는 다 못 해도 노래에 실어 보내요\n${n}, 고마워요 그리고 사랑해요\n\n(시연용 예시 가사 · 실제 제작 시 입력하신 이야기로 새로 작성돼요)`;
  }
  function renderResult(){
    setHead('완성 · 먼저 들어 보세요', 100, '노래가 완성됐어요 🎧', '전곡을 들어 보시고, 마음에 들 때만 결제해 주세요.');
    nav(false, '', true);
    $('order-fields').innerHTML = `<div class="result-card"><span class="tag">${esc(order.occasion)} · ${esc(order.genre)} · ${esc(order.voice)}</span><h3>${esc(order.recipient)}에게 전하는 노래</h3><div class="sub">시연용 반주로 재생돼요 (실제 제작곡 아님)</div><div class="result-player"><button type="button" class="play-circle" id="result-play" aria-label="재생">▶</button><input id="result-progress" type="range" min="0" max="100" value="0" aria-label="재생 위치"/><span id="result-time">0:00 / 0:00</span></div><div class="lyrics-box">${esc(lyrics())}</div></div>
    <div class="decision"><button type="button" class="btn btn-coral" id="btn-like">마음에 들어요 → ${KR(total())}로 선물하기</button><button type="button" class="btn btn-outline" id="btn-redo">가사·스타일 바꿔서 다시 만들기</button><button type="button" class="btn btn-ghost" id="btn-no">마음에 안 들어요 · 결제 없이 끝내기</button><small>결제하지 않으셔도 요금은 청구되지 않아요.</small></div>`;
    $('result-play').addEventListener('click', toggleAudio);
    $('result-progress').addEventListener('input', e => { if(Number.isFinite(audio.duration)) audio.currentTime = audio.duration * Number(e.target.value) / 100; });
    $('btn-like').addEventListener('click', () => { audio.pause(); phase = 'pay'; render(); });
    $('btn-redo').addEventListener('click', () => { audio.pause(); phase = 'form'; step = 5; render(); });
    $('btn-no').addEventListener('click', () => { audio.pause(); phase = 'nopay'; renderNoPay(); });
  }
  function renderNoPay(){
    setHead('종료', 100, '괜찮아요, 결제 없이 마무리했어요', '청구된 금액은 없어요. 마음이 바뀌면 언제든 다시 만들어 보세요.');
    nav(false, '', true); summary();
    $('order-fields').innerHTML = `<div class="order-finish"><span>🌿</span><h3>이용해 주셔서 고마워요</h3><p>어떤 점이 아쉬웠는지 알려 주시면 더 좋은 노래를 만드는 데 큰 도움이 돼요. (선택)</p><div class="form-field" style="margin-top:14px;text-align:left"><textarea id="why" maxlength="400" placeholder="예: 가사가 사연과 달랐어요 / 목소리가 어울리지 않았어요"></textarea></div><div class="finish-actions"><button class="btn btn-outline" type="button" id="again">처음부터 다시 만들어 보기</button><button class="text-link" type="button" id="bye">닫기</button></div></div>`;
    $('again').addEventListener('click', () => { order = fresh(); step = 0; phase = 'form'; render(); });
    $('bye').addEventListener('click', () => close(dlg));
  }

  /* 결제(시연) */
  function renderPay(){
    setHead('결제 · 시연', 100, '이 노래를 선물할게요', '실제 결제는 이루어지지 않는 시연 화면이에요.');
    nav(true, `${KR(total())} 결제하기 (시연)`, false);
    $('order-fields').innerHTML = `<div class="review-brief"><h3>주문 내용</h3><div class="review-row">받는 분: ${esc(order.recipient)} (${esc(order.relation)}) · ${esc(order.occasion)}</div><div class="review-row">맞춤곡 1곡: ${KR(BASE)}</div>${order.mr ? `<div class="review-row">MR (${keyLabel(order.key)}): + ${KR(MR)}</div>` : ''}${order.express ? `<div class="review-row">급행 제작: + ${KR(EXPRESS)}</div>` : ''}${order.alt ? `<div class="review-row">다른 스타일 버전: + ${KR(ALT)}</div>` : ''}<div class="review-row"><b>결제 금액 ${KR(total())}</b> (부가세 포함 표시 예정)</div></div>
    <p class="sub-title">추가로 받을 옵션 (지금 바꿀 수 있어요)</p><div class="check-row"><label><input type="checkbox" id="p-mr" ${order.mr ? 'checked' : ''}/> MR 반주 +${KR(MR)}</label></div><div class="check-row"><label><input type="checkbox" id="p-alt" ${order.alt ? 'checked' : ''}/> 다른 스타일 버전 +${KR(ALT)}</label></div>
    <p class="sub-title">결제 수단</p><div class="pay-methods">${['카카오페이','토스페이','네이버페이','신용·체크카드'].map(v => card('pay', v, order.pay)).join('')}</div>
    <ul class="lock-list"><li>🔓 결제 후 열리는 것: MP3 다운로드, 선물 링크, 가사 카드${order.mr ? ', MR 파일' : ''}</li></ul>
    <label class="agree-row"><input type="checkbox" id="a-terms" ${order.agreeTerms ? 'checked' : ''}/> <span>(필수) <a href="./terms.html" target="_blank" rel="noopener">이용약관</a>에 동의합니다.</span></label>
    <label class="agree-row"><input type="checkbox" id="a-privacy" ${order.agreePrivacy ? 'checked' : ''}/> <span>(필수) <a href="./privacy.html" target="_blank" rel="noopener">개인정보 수집·이용</a>에 동의합니다.</span></label>
    <label class="agree-row"><input type="checkbox" id="a-refund" ${order.agreeRefund ? 'checked' : ''}/> <span>(필수) 디지털 콘텐츠는 제공이 시작되면 <a href="./refund.html" target="_blank" rel="noopener">청약철회가 제한</a>될 수 있음을 확인했고, 노래를 들어 본 뒤 결제함에 동의합니다.</span></label>`;
    $('order-fields').querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => { order.pay = b.dataset.value; syncPay(); render(); }));
    const chk = (id, k) => $(id).addEventListener('change', e => { order[k] = e.target.checked; if(k === 'mr' || k === 'alt'){ syncPay(); render(); } });
    chk('p-mr', 'mr'); chk('p-alt', 'alt'); chk('a-terms', 'agreeTerms'); chk('a-privacy', 'agreePrivacy'); chk('a-refund', 'agreeRefund');
  }
  function syncPay(){ ['a-terms:agreeTerms','a-privacy:agreePrivacy','a-refund:agreeRefund'].forEach(p => { const [id, k] = p.split(':'); if($(id)) order[k] = $(id).checked; }); }
  function submitPay(){
    syncPay();
    if(!order.agreeTerms || !order.agreePrivacy || !order.agreeRefund){ $('order-error').textContent = '필수 항목에 모두 동의해 주세요.'; return; }
    const id = 'ST' + Date.now().toString().slice(-8);
    try {
      const list = JSON.parse(localStorage.getItem('songtoyou-demo-orders') || '[]');
      list.unshift({id, at: new Date().toISOString(), recipient: order.recipient, occasion: order.occasion, genre: order.genre, mr: order.mr, total: total(), contact: order.contact, status: '시연 주문 (실제 제작·결제 없음)'});
      localStorage.setItem('songtoyou-demo-orders', JSON.stringify(list.slice(0, 20)));
    } catch(e) {}
    order.id = id; phase = 'done'; render();
  }
  function renderDone(){
    setHead('결제 완료 · 시연', 100, '선물 준비가 끝났어요 🎁', '실제 결제·발송은 이루어지지 않았어요.');
    nav(false, '', true); summary();
    $('order-fields').innerHTML = `<div class="order-finish"><span>💌</span><h3>주문번호 ${esc(order.id)}</h3><p>${esc(order.recipient)}님께 전하는 ${esc(order.occasion)} 노래${order.mr ? ' + MR' : ''}<br/>실제 서비스에서는 ${order.contactType === 'kakao' ? '카카오톡' : order.contactType === 'sms' ? '문자' : '이메일'}로 선물 링크를 보내 드려요.</p><div class="finish-actions"><button class="btn btn-coral" type="button" id="preview-gift">선물 페이지 미리보기 ↗</button><a class="btn btn-outline" href="./order-status.html">주문 조회 보기</a><button class="text-link" type="button" id="reset">새 노래 만들기</button></div></div>`;
    $('preview-gift').addEventListener('click', () => { $('gift-title').textContent = `${order.recipient}에게 전하는 노래`; $('gift-subtitle').textContent = order.message; close(dlg); show(gift); });
    $('reset').addEventListener('click', () => { order = fresh(); step = 0; phase = 'form'; render(); });
  }

  audioUi();
})();
