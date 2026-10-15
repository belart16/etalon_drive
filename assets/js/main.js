/* =========================================================
   ЭТАЛОН ДРАЙВ — скрипты сайта
   ========================================================= */

/* ---------------------------------------------------------
   НАСТРОЙКИ — заполните перед публикацией
   --------------------------------------------------------- */
const SITE_CONFIG = {
  // Куда приходят заявки, если сервис формы не подключён (откроется почтовая программа посетителя)
  email: 'mail@npoeta.ru',

  // Сервис приёма заявок (рекомендуется). Пример для Web3Forms:
  //   formEndpoint: 'https://api.web3forms.com/submit', formAccessKey: 'ВАШ_КЛЮЧ'
  // Пример для Formspree: formEndpoint: 'https://formspree.io/f/ВАШ_ID', formAccessKey: ''
  // Или адрес собственного обработчика на сервере (например, /send.php).
  formEndpoint: '',
  formAccessKey: '',

  // Яндекс Метрика: номер счётчика (цели: form_submit, phone_click, email_click, cfg_request)
  metrikaId: '',

  // Соцсети и мессенджеры. Пустые ссылки на сайте не показываются.
  socials: [
    { label: 'Telegram', url: '' },
    { label: 'WhatsApp', url: '' },
    { label: 'ВКонтакте', url: '' },
    { label: 'MAX', url: '' },
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
  function goal(name) {
    try { if (SITE_CONFIG.metrikaId && window.ym) window.ym(SITE_CONFIG.metrikaId, 'reachGoal', name); } catch (e) {}
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
  const socials = (SITE_CONFIG.socials || []).filter((s) => s.url);
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
      'Страница': location.href,
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

    // Вариант 2 (запасной): письмо через почтовую программу посетителя
    const body = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
    const href = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent('Заявка с сайта ЭТАЛОН ДРАЙВ: ' + data['Тема'])}&body=${encodeURIComponent(body)}`;
    goal('form_submit');
    window.location.href = href;
    showStatus('Открываем почтовую программу с готовым письмом. Если она не открылась — напишите на ' + SITE_CONFIG.email + ' или позвоните +7 (495) 137-77-50.', 'ok');
  });

  /* ---------- Прочее ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  initMetrika();
})();
