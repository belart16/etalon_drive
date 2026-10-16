/* =========================================================
   ЭТАЛОН ДРАЙВ — скрипты сайта
   ========================================================= */

/* ---------------------------------------------------------
   НАСТРОЙКИ — заполните перед публикацией
   --------------------------------------------------------- */
const SITE_CONFIG = {
  // Куда отправляются заявки
  email: 'mail@npoeta.ru',
  phone: '+7 (495) 137-77-50',

  // Этап 2: адрес собственного обработчика на сервере (например, '/send.php').
  // Пока пусто — после «Отправить» посетитель выбирает, откуда отправить заявку
  // (почта, Gmail, Яндекс, Mail.ru, мессенджеры) — сайт данные не принимает.
  formEndpoint: '',
  formAccessKey: '',

  // Яндекс Метрика: номер счётчика
  // Цели: lead_prepare (заполнил форму), lead_channel (выбрал способ отправки),
  //       form_submit (этап 2), phone_click, email_click, cfg_request
  metrikaId: '',

  // Мессенджеры компании — появятся в окне отправки заявки и в карточке контактов.
  // Пустые не показываются.
  //   telegram: 'https://t.me/имя_аккаунта'
  //   whatsapp: '79991234567'            (номер только цифрами, текст заявки подставится сам)
  //   max:      'https://max.ru/...'     (ссылка на чат/профиль компании в MAX)
  messengers: {
    telegram: '',
    whatsapp: '',
    max: '',
  },

  // Прочие соцсети — только в карточке контактов
  socials: [
    { label: 'ВКонтакте', url: '' },
  ],
};

(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Яндекс Метрика (загружается, только если указан номер) ---------- */
  function initMetrika() {
    const id = SITE_CONFIG.metrikaId;
    if (!id) return;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  function goal(name, params) {
    try { if (SITE_CONFIG.metrikaId && window.ym) window.ym(SITE_CONFIG.metrikaId, 'reachGoal', name, params); } catch (e) {}
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-goal]');
    if (el) goal(el.dataset.goal);
  });

  /* ---------- Шапка: тень при прокрутке, мобильное меню ---------- */
  const header = $('.header');
  const burger = $('.burger');
  const nav = $('#nav');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Прокрутка к блокам с учётом шапки ----------
     «Контакты» → сразу к карточкам контактов и формы (без заголовка секции),
     кнопки заявки → к самой форме. Если блок помещается в экран — ставим его по центру. */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCROLL_TARGETS = { contacts: '.grid-contacts' };
  const mobileBar = $('.mobile-bar');

  function resolveTarget(id) {
    if (!id || id === 'top') return document.body;
    return SCROLL_TARGETS[id] ? $(SCROLL_TARGETS[id]) : document.getElementById(id);
  }
  function targetTop(el) {
    if (el === document.body) return 0;
    const offTop = header.getBoundingClientRect().height + 16;
    const offBottom = (mobileBar && getComputedStyle(mobileBar).display !== 'none' ? mobileBar.offsetHeight : 0) + 16;
    // offsetTop не учитывает анимацию появления (transform), поэтому позиция точная
    let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    const h = el.offsetHeight;
    const avail = window.innerHeight - offTop - offBottom;
    let top = y - offTop;
    if (h < avail) top -= (avail - h) / 2; // помещается — центрируем
    return Math.max(0, Math.round(top));
  }
  function scrollToEl(el, smooth) {
    const behavior = smooth && !reduceMotion ? 'smooth' : 'auto';
    window.scrollTo({ top: targetTop(el), behavior });
    // Картинки выше могут догрузиться во время прокрутки и сдвинуть блок — доводим позицию
    const fix = () => {
      const want = targetTop(el);
      if (Math.abs(window.scrollY - want) > 24) window.scrollTo({ top: want, behavior: 'auto' });
    };
    if ('onscrollend' in window && behavior === 'smooth') window.addEventListener('scrollend', fix, { once: true });
    else setTimeout(fix, behavior === 'smooth' ? 900 : 300);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = a.getAttribute('href').slice(1);
    const el = resolveTarget(id);
    if (!el) return;
    e.preventDefault();
    history.pushState(null, '', id ? '#' + id : location.pathname);
    scrollToEl(el, true);
    // На компьютере ставим курсор в первое пустое поле формы
    if (id === 'lead-form' && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setTimeout(() => { const f = $('#lead-form input[name="name"]'); if (f && !f.value) f.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
    }
  });
  // Переход по ссылке с якорем с другой страницы (например, /#contacts)
  window.addEventListener('load', () => {
    const id = location.hash.slice(1);
    const el = id && resolveTarget(decodeURIComponent(id));
    if (el) setTimeout(() => scrollToEl(el, false), 50);
  });

  /* ---------- Подсветка активного пункта меню ---------- */
  const navLinks = $$('.nav > a[href^="#"]');
  const sectionIds = navLinks.map((a) => a.getAttribute('href').slice(1));
  // дочерние секции, относящиеся к пунктам меню
  const parentOf = { industries: 'product', advantages: 'product', models: 'product', design: 'specs', module: 'specs', control: 'specs', schemes: 'specs', hmi: 'specs', integration: 'specs' };
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = parentOf[en.target.id] || en.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ---------- Появление блоков ---------- */
  const revealEls = $$('.section .section-head, .section .card, .kpi, .stat, .ind-card, .adv, .cab, .scheme, .shot, .hs-item, .topology, .spec-table, .photo, .hmi__features li, .module__stage, .integration__pic, .service__photos');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Счётчики в блоке «О компании» ---------- */
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target; co.unobserve(el);
        const end = +el.dataset.count; const suf = el.dataset.suffix || '';
        const t0 = performance.now(); const dur = 1200;
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Конфигуратор обозначения модели ---------- */
  const cfg = $('#configurator');
  if (cfg) {
    const voltageText = { '030': '3,0 кВ', '033': '3,3 кВ', '060': '6,0 кВ', '066': '6,6 кВ', '100': '10 кВ', '110': '11 кВ' };
    const suffixText = {
      '': 'для работы с асинхронным двигателем',
      'T': 'для работы с синхронным двигателем',
      'PM': 'для работы с двигателем на постоянных магнитах',
      'S': 'в исполнении для тяжёлого режима',
    };
    const fmtPower = (kw) => kw >= 1000
      ? (kw / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' МВт'
      : kw.toLocaleString('ru-RU') + ' кВт';

    const codeEl = $('.configurator__code', cfg);
    const descEl = $('.configurator__desc', cfg);
    const hintEl = $('.configurator__hint', cfg);
    let currentCode = '';

    const update = () => {
      const v = cfg.voltage.value;
      const s = cfg.suffix.value;
      let p = Math.round(Number(cfg.power.value));
      let hint = '';
      if (!p || p < 160) { hint = 'Минимальная мощность в линейке — 160 кВт.'; p = 160; }
      if (p > 20000) { hint = 'Максимальная мощность в линейке — 20 000 кВт.'; p = 20000; }
      hintEl.hidden = !hint; hintEl.textContent = hint;
      currentCode = `ЭДПЧ-${v}-${p}${s ? '-' + s : ''}`;
      codeEl.textContent = currentCode;
      descEl.textContent = `Преобразователь частоты мощностью ${fmtPower(p)} и напряжением ${voltageText[v]} ${suffixText[s]}.`;
    };
    cfg.addEventListener('input', update);
    cfg.addEventListener('change', update);
    update();

    $('#cfg-request').addEventListener('click', () => {
      goal('cfg_request');
      prefillForm('Коммерческое предложение', `Прошу подготовить КП на модель ${currentCode}.`);
    });
  }

  /* ---------- Конструкция: интерактивные точки ---------- */
  const hsButtons = $$('.hs');
  const hsItems = $$('.hs-item');
  function activateHs(i, scrollList) {
    hsButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.hs === String(i)));
    hsItems.forEach((it) => it.classList.toggle('is-active', it.dataset.hs === String(i)));
    if (scrollList && window.innerWidth <= 1024) {
      const it = hsItems.find((x) => x.dataset.hs === String(i));
      if (it) it.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  hsButtons.forEach((b) => b.addEventListener('click', () => activateHs(b.dataset.hs, true)));
  hsItems.forEach((it) => {
    it.addEventListener('mouseenter', () => activateHs(it.dataset.hs));
    it.addEventListener('click', () => activateHs(it.dataset.hs));
  });

  /* ---------- Просмотр изображений ---------- */
  const lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const lbImg = $('img', lb); const lbCap = $('.lightbox__cap', lb);
    $$('.zoomable').forEach((btn) => btn.addEventListener('click', () => {
      lbImg.src = btn.dataset.zoom; lbImg.alt = btn.dataset.caption || '';
      lbCap.textContent = btn.dataset.caption || '';
      lb.showModal();
    }));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  } else {
    // Старые браузеры: открываем картинку в новой вкладке
    $$('.zoomable').forEach((btn) => btn.addEventListener('click', () => window.open(btn.dataset.zoom, '_blank')));
  }

  /* ---------- Соцсети ---------- */
  const socialsBox = $('#socials');
  const M = SITE_CONFIG.messengers || {};
  const socials = [
    { label: 'Telegram', url: M.telegram },
    { label: 'WhatsApp', url: M.whatsapp ? 'https://wa.me/' + String(M.whatsapp).replace(/\D/g, '') : '' },
    { label: 'MAX', url: M.max },
  ].concat(SITE_CONFIG.socials || []).filter((s) => s.url);
  if (socialsBox && socials.length) {
    socials.forEach((s) => {
      const a = document.createElement('a');
      a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = '<svg class="ico"><use href="#i-chat"/></svg>';
      a.append(document.createTextNode(s.label));
      socialsBox.append(a);
    });
    socialsBox.hidden = false;
  }

  /* ---------- Форма заявки ---------- */
  const form = $('#lead-form');
  const status = $('.form-status', form);

  function prefillForm(subject, message) {
    if (subject) {
      const opt = $$('option', form.subject).find((o) => o.textContent === subject);
      if (opt) form.subject.value = opt.value || opt.textContent;
    }
    if (message && !form.message.value.includes(message)) {
      form.message.value = (form.message.value ? form.message.value + '\n' : '') + message;
    }
  }
  $$('[data-subject]').forEach((a) => a.addEventListener('click', () => prefillForm(a.dataset.subject)));

  // Аккуратное форматирование российского номера при вводе
  form.phone.addEventListener('input', () => {
    const raw = form.phone.value;
    if (!/^[\s+\d()-]*$/.test(raw)) return;
    let d = raw.replace(/\D/g, '');
    if (!d) return;
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') return; // иностранный номер — не трогаем
    d = d.slice(0, 11);
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    form.phone.value = out;
  });

  function setInvalid(el, bad) {
    const box = el.closest('.field') || el.closest('.consent');
    if (box) box.classList.toggle('is-invalid', bad);
    return bad;
  }
  function validate() {
    let ok = true;
    if (setInvalid(form.name, form.name.value.trim().length < 2)) ok = false;
    const digits = form.phone.value.replace(/\D/g, '');
    if (setInvalid(form.phone, digits.length < 10)) ok = false;
    const em = form.email.value.trim();
    if (setInvalid(form.email, em !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))) ok = false;
    if (setInvalid(form.consent, !form.consent.checked)) ok = false;
    return ok;
  }
  ['name', 'phone', 'email'].forEach((n) => form[n].addEventListener('blur', () => { if (form[n].value) validate(); }));
  form.consent.addEventListener('change', () => setInvalid(form.consent, !form.consent.checked));

  function collect() {
    const f = form;
    return {
      'Имя': f.name.value.trim(),
      'Компания': f.company.value.trim(),
      'Телефон': f.phone.value.trim(),
      'Email': f.email.value.trim(),
      'Тема': f.subject.value,
      'Напряжение сети': f.grid_voltage.value,
      'Мощность двигателя, кВт': f.motor_power.value,
      'Тип двигателя': f.motor_type.value,
      'Сообщение': f.message.value.trim(),
    };
  }
  function showStatus(text, type) {
    status.textContent = text;
    status.className = 'form-status ' + (type === 'ok' ? 'is-ok' : type === 'err' ? 'is-err' : '');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.website.value) return; // бот заполнил скрытое поле
    if (!validate()) {
      showStatus('Проверьте выделенные поля.', 'err');
      const firstBad = $('.is-invalid input', form);
      if (firstBad) firstBad.focus();
      return;
    }
    const data = collect();

    // Вариант 1: сервис приёма форм / свой обработчик
    if (SITE_CONFIG.formEndpoint) {
      form.classList.add('is-sending');
      showStatus('Отправляем…');
      try {
        const payload = Object.assign({}, data, {
          subject: 'Заявка с сайта ЭТАЛОН ДРАЙВ: ' + data['Тема'],
          from_name: 'Сайт ЭТАЛОН ДРАЙВ',
          replyto: data['Email'] || undefined,
        });
        if (SITE_CONFIG.formAccessKey) payload.access_key = SITE_CONFIG.formAccessKey;
        const res = await fetch(SITE_CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        goal('form_submit');
        form.reset();
        showStatus('Спасибо! Заявка отправлена — мы свяжемся с вами в ближайшее рабочее время.', 'ok');
      } catch (err) {
        showStatus('Не удалось отправить заявку. Позвоните нам: +7 (495) 137-77-50 или напишите на ' + SITE_CONFIG.email, 'err');
      } finally {
        form.classList.remove('is-sending');
      }
      return;
    }

    // Этап 1: посетитель сам выбирает, откуда отправить заявку
    openSendDialog(data);
  });

  /* ---------- Окно «Как отправить заявку?» ---------- */
  const sendDlg = $('#send-dialog');
  const enc = encodeURIComponent;
  let lastText = '';

  function leadText(data, forMessenger) {
    const lines = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    if (forMessenger) {
      lines.unshift('Заявка с сайта ЭТАЛОН ДРАЙВ', '');
      lines.push('', `Для: НПО «ЭТА», ${SITE_CONFIG.email}, ${SITE_CONFIG.phone}`);
    }
    return lines.join('\n');
  }

  // Синхронное копирование: срабатывает внутри клика, до перехода по ссылке
  function copySync(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    (sendDlg && sendDlg.open ? sendDlg : document.body).append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (err) {}
    ta.remove(); return ok;
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return copySync(text); }
  }

  function optLink(label, hint, href, channel, opts = {}) {
    const a = document.createElement('a');
    a.className = 'send-opt'; a.href = href; a.dataset.channel = channel;
    if (!opts.sameTab) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = `<span class="send-opt__ico"><svg class="ico"><use href="#${opts.icon || 'i-mail'}"/></svg></span><span class="send-opt__txt"><b></b><small></small></span>`;
    $('b', a).textContent = label; $('small', a).textContent = hint;
    if (opts.copyFirst) a.dataset.copy = '1';
    return a;
  }

  function openSendDialog(data) {
    goal('lead_prepare');
    const to = SITE_CONFIG.email;
    const subj = 'Заявка с сайта ЭТАЛОН ДРАЙВ: ' + data['Тема'];
    const body = leadText(data, false);
    lastText = leadText(data, true);

    if (!sendDlg || typeof sendDlg.showModal !== 'function') {
      window.location.href = `mailto:${to}?subject=${enc(subj)}&body=${enc(body)}`;
      return;
    }

    // Почта
    const mailBox = $('#send-mail'); mailBox.textContent = '';
    mailBox.append(
      optLink('Gmail', 'mail.google.com', `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(to)}&su=${enc(subj)}&body=${enc(body)}`, 'gmail'),
      optLink('Яндекс Почта', 'mail.yandex.ru', `https://mail.yandex.ru/compose?to=${enc(to)}&subject=${enc(subj)}&body=${enc(body)}`, 'yandex'),
      optLink('Почта Mail.ru', 'e.mail.ru', `https://e.mail.ru/compose/?to=${enc(to)}&subject=${enc(subj)}&body=${enc(body)}`, 'mailru'),
      optLink('Outlook', 'outlook.live.com', `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(to)}&subject=${enc(subj)}&body=${enc(body)}`, 'outlook'),
      optLink('Почтовая программа', 'Outlook, Apple Mail, Thunderbird…', `mailto:${to}?subject=${enc(subj)}&body=${enc(body)}`, 'mailto', { sameTab: true })
    );

    // Мессенджеры компании (если указаны в настройках)
    const msgBox = $('#send-messengers'); msgBox.textContent = '';
    if (M.whatsapp) msgBox.append(optLink('WhatsApp', 'текст подставится сам', `https://wa.me/${String(M.whatsapp).replace(/\D/g, '')}?text=${enc(lastText)}`, 'whatsapp', { icon: 'i-chat' }));
    if (M.telegram) msgBox.append(optLink('Telegram', 'текст скопируется — вставьте в чат', M.telegram, 'telegram', { icon: 'i-chat', copyFirst: true }));
    if (M.max) msgBox.append(optLink('MAX', 'текст скопируется — вставьте в чат', M.max, 'max', { icon: 'i-chat', copyFirst: true }));
    $('[data-group="messengers"]', sendDlg).hidden = !msgBox.children.length;

    // Системное меню «Поделиться» (телефоны, планшеты, часть ПК)
    const canShare = typeof navigator.share === 'function';
    const shareGroup = $('[data-group="share"]', sendDlg);
    shareGroup.hidden = !canShare;
    // На сенсорных устройствах — первым пунктом, на ПК — после почты
    const touch = matchMedia('(pointer: coarse)').matches;
    if (canShare) {
      if (touch) $('.send-dialog__sub', sendDlg).after(shareGroup);
      else $('[data-group="mail"]', sendDlg).after(shareGroup);
    }

    $('.send-copy__ok', sendDlg).textContent = '';
    sendDlg.showModal();
  }

  function channelName(ch) {
    return { gmail: 'Gmail', yandex: 'Яндекс Почте', mailru: 'Почте Mail.ru', outlook: 'Outlook', mailto: 'почтовой программе', whatsapp: 'WhatsApp', telegram: 'Telegram', max: 'MAX', share: 'выбранном приложении' }[ch] || ch;
  }
  function afterChannel(ch) {
    goal('lead_channel', { channel: ch });
    sendDlg.close();
    let msg = `Заявка открыта в ${channelName(ch)}. Проверьте текст и нажмите «Отправить» — после этого она придёт к нам.`;
    if (ch === 'telegram' || ch === 'max') msg = `Текст заявки скопирован. В открывшемся чате ${channelName(ch)} вставьте его и отправьте.`;
    if (ch === 'mailto') msg = 'Открываем почтовую программу. Если ничего не открылось — нажмите «Отправить заявку» ещё раз и выберите Gmail, Яндекс или Mail.ru.';
    showStatus(msg, 'ok');
  }

  if (sendDlg) {
    sendDlg.addEventListener('click', async (e) => {
      if (e.target === sendDlg) { sendDlg.close(); return; }
      const opt = e.target.closest('[data-channel]');
      if (!opt) return;
      const ch = opt.dataset.channel;
      if (ch === 'copy') {
        const ok = await copyText(lastText);
        $('.send-copy__ok', sendDlg).textContent = ok ? 'Скопировано' : 'Не удалось скопировать';
        goal('lead_channel', { channel: 'copy' });
        return;
      }
      if (ch === 'share') {
        try { await navigator.share({ title: 'Заявка с сайта ЭТАЛОН ДРАЙВ', text: lastText }); afterChannel('share'); }
        catch (err) { /* посетитель закрыл меню — ничего не делаем */ }
        return;
      }
      if (opt.dataset.copy) copySync(lastText); // копируем до того, как откроется чат
      setTimeout(() => afterChannel(ch), 0);
    });
    $('.send-dialog__close', sendDlg).addEventListener('click', () => sendDlg.close());
  }

  /* ---------- Прочее ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  initMetrika();
})();
