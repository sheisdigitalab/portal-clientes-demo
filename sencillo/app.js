// Versión sencilla: el minorista entra con su email y descarga sus facturas y albaranes.
// Solo necesita de Mercagestion el PDF de cada documento y un archivo con sus datos.
(() => {
  const D = window.DEMO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app');
  const store = {
    get(k, d) { try { const v = sessionStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eurFmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
  const eur = n => eurFmt.format(n);
  const fecha = iso => new Date(iso + 'T12:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const mes = iso => cap(new Date(iso + 'T12:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
  const plural = (n, s, p) => `${n} ${n === 1 ? s : (p || s + 's')}`;
  const ini = n => String(n).split(/\s+/).filter(w => w && !/^(de|del|la|las|el|los|y|e|i)$/i.test(w)).map(w => w[0].toUpperCase()).slice(0, 2).join('');
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    truck: svg('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    doc: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    down: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    out: svg('<path d="M15 4h4v16h-4M10 16l4-4-4-4M14 12H4"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
    phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    lock: svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>')
  };
  const MARKS = {
    laguna: '<path d="M2.5 12c3.2-5 9-6.4 13.2-3.3L20.5 5v14l-4.8-3.7C11.5 18.4 5.7 17 2.5 12z"/><circle cx="8" cy="11" r="1.1" fill="currentColor" stroke="none"/>',
    costanorte: '<path d="M4 13a8 8 0 0 1 16 0z"/><path d="M12 5v8M8.5 6.5 10.5 13M15.5 6.5 13.5 13"/><path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2-1.5 4.5-1.5S19 17 21 17"/>'
  };

  /* ---------- Estado ---------- */
  (() => {
    const p = new URLSearchParams(location.search);
    if (p.get('m') && D.mayoristas[p.get('m')]) store.set('tenant', p.get('m'));
    if (p.get('entrar')) store.set('s-logged-' + (p.get('m') || store.get('tenant', 'laguna')), true);
  })();
  let tenantKey = store.get('tenant', 'laguna');
  if (!D.mayoristas[tenantKey]) tenantKey = 'laguna';
  const T = () => D.mayoristas[tenantKey];
  const C = () => T().clientes[0];
  const logged = () => store.get('s-logged-' + tenantKey, false);
  const path = () => location.hash.replace(/^#\//, '').split('?')[0];
  const say = t => { $('#live').textContent = t; };
  function toast(t) {
    const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t; document.body.append(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2600);
  }
  const mark = () => `<span class="logo__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${MARKS[tenantKey] || ''}</svg></span>`;
  const logo = sub => `<span class="logo">${mark()}<span class="logo__name">${esc(T().nombre)}${sub ? `<span class="logo__sub">${sub}</span>` : ''}</span></span>`;
  const pdfUrl = n => `../docs/${tenantKey}-${n}.pdf`;

  $('#demo-tenant').value = tenantKey;
  $('#demo-tenant').addEventListener('change', e => { tenantKey = e.target.value; store.set('tenant', tenantKey); route(); });

  /* ---------- Acceso sin contraseña ---------- */
  function loginLayout(inner) {
    const t = T();
    app.innerHTML = `
    <div class="login">
      <aside class="login__side">
        ${logo()}
        <div>
          <h1>Tus facturas y albaranes, siempre a mano.</h1>
          <ul>
            <li><span>${I.doc}</span>Descarga tus facturas en PDF, sin tener que pedirlas</li>
            <li><span>${I.truck}</span>Todos tus albaranes, desde el primer día</li>
            <li><span>${I.clock}</span>Disponibles en cuanto se emiten</li>
          </ul>
        </div>
        <div class="login__help">
          <b>¿Necesitas ayuda?</b>
          <span>${I.phone}${esc(t.telefono)}</span>
          <span>${I.clock}${esc(t.horario)}</span>
          <small>${esc(t.direccion)}</small>
        </div>
      </aside>
      <main class="login__main">${inner}</main>
    </div>`;
  }

  function loginEmail() {
    loginLayout(`
      <form class="login__box" id="f-email" novalidate>
        <div><h2>Área de clientes</h2><p class="login__p">Escribe tu email y te enviaremos un código para entrar. Sin contraseñas que recordar.</p></div>
        <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" required value="${esc(C().email)}" aria-describedby="err"></div>
        <p class="error" id="err" role="alert"></p>
        <button class="btn btn--brand btn--block btn--lg" type="submit">Enviarme el código ${I.arrow}</button>
        <p class="hint">Usa el email con el que ${esc(T().nombre)} te envía las facturas.</p>
        <p class="secure">${I.lock}Acceso seguro · solo tú ves tus documentos</p>
      </form>`);
    $('#f-email').addEventListener('submit', e => {
      e.preventDefault();
      const v = $('#email').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { $('#err').textContent = 'Escribe un email válido, por ejemplo nombre@tuempresa.com'; $('#email').setAttribute('aria-invalid', 'true'); $('#email').focus(); return; }
      store.set('email', v); location.hash = '#/codigo';
    });
  }

  function loginCode() {
    const email = store.get('email', C().email);
    loginLayout(`
      <form class="login__box" id="f-code" novalidate>
        <span class="login__mail">${I.mail}</span>
        <div><h2>Revisa tu correo</h2><p class="login__p">Hemos enviado un código de 6 cifras a <b>${esc(email)}</b>. Caduca en 10 minutos.</p></div>
        <fieldset class="code-f"><legend class="sr-only">Código de 6 cifras</legend>
          <div class="code">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" maxlength="1" aria-label="Cifra ${i + 1} de 6" autocomplete="${i ? 'off' : 'one-time-code'}">`).join('')}</div>
        </fieldset>
        <p class="error" id="err" role="alert"></p>
        <button class="btn btn--brand btn--block btn--lg" type="submit">Entrar ${I.arrow}</button>
        <p class="hint">En esta demo el código es <b>123456</b>.</p>
        <div class="login__links"><button type="button" class="link-btn" id="back">Cambiar email</button><button type="button" class="link-btn" id="resend">Reenviar código</button></div>
      </form>`);
    const ins = $$('.code input'); ins[0].focus();
    ins.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(-1);
        if (inp.value && ins[i + 1]) ins[i + 1].focus();
        if (ins.every(x => x.value)) $('#f-code').requestSubmit();
      });
      inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus(); });
      inp.addEventListener('paste', e => {
        const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (d.length) { e.preventDefault(); d.split('').forEach((c, k) => ins[k] && (ins[k].value = c)); (ins[d.length] || ins[5]).focus(); if (d.length === 6) $('#f-code').requestSubmit(); }
      });
    });
    $('#back').onclick = () => { location.hash = '#/acceso'; };
    $('#resend').onclick = () => toast('Te hemos enviado un código nuevo.');
    $('#f-code').addEventListener('submit', e => {
      e.preventDefault();
      if (ins.map(x => x.value).join('') !== '123456') { $('#err').textContent = 'El código no es correcto. Revisa el último email que te hemos enviado.'; ins.forEach(x => x.value = ''); ins[0].focus(); return; }
      store.set('s-logged-' + tenantKey, true); location.hash = '#/facturas';
    });
  }

  /* ---------- Documentos ---------- */
  const tabs = [['facturas', 'Facturas', I.doc], ['albaranes', 'Albaranes', I.truck]];

  function docs(kind) {
    const c = C(), t = T();
    const rows = c[kind];
    const cfg = {
      facturas: { title: 'Facturas', one: 'factura', many: 'facturas', desc: `Todas las facturas que te ha emitido ${esc(t.nombre)}, en PDF.` },
      albaranes: { title: 'Albaranes', one: 'albarán', many: 'albaranes', desc: 'Un albarán por cada pedido que recoges, con el peso y los productos.' }
    }[kind];
    const years = [...new Set(rows.map(r => r.fecha.slice(0, 4)))].sort().reverse();
    const st = { q: '', year: years[0] || D.hoy.slice(0, 4) };
    app.innerHTML = `
    <div class="shell s-shell">
      <header class="topbar"><div class="topbar__in">
        ${logo('Área de clientes')}
        <nav class="tabs tabs--few" aria-label="Secciones">${tabs.map(([h, l, ic]) => `<a href="#/${h}"${h === kind ? ' aria-current="page"' : ''}>${ic}<span>${l}</span></a>`).join('')}</nav>
        <div class="who"><span class="who__avatar" aria-hidden="true">${esc(ini(c.nombre))}</span><span class="who__name"><b>${esc(c.contacto)}</b><span>${esc(c.nombre)}</span></span>
          <button class="icon-btn" id="logout" aria-label="Cerrar sesión" title="Cerrar sesión">${I.out}</button></div>
      </div></header>
      <main class="main" id="main" tabindex="-1">
        <div class="head"><div><h1>${cfg.title}</h1><p>${cfg.desc}</p></div></div>
        <section class="card" aria-label="${cfg.title}">
          <div class="toolbar">
            <div class="search">${I.search}<input type="search" id="q" placeholder="Buscar por número" aria-label="Buscar por número"></div>
            <select id="year" aria-label="Año">${years.map(y => `<option>${y}</option>`).join('')}</select>
          </div>
          <div class="sumbar" id="sum" aria-live="polite"></div>
          <div id="tbl"></div>
        </section>
        <p class="s-help">${I.phone}<span>¿Te falta algún documento? Llama a ${esc(t.nombre)} al <a href="tel:+34${t.telefono.replace(/\s/g, '')}">${esc(t.telefono)}</a>. ${esc(t.horario)}.</span></p>
      </main>
      <footer class="pf"><span>${esc(t.forma)} · ${esc(t.telefono)} · ${esc(t.email)}</span><span>Conectado con Mercagestion</span></footer>
    </div>`;
    $('#logout').onclick = () => { store.set('s-logged-' + tenantKey, false); location.hash = '#/acceso'; };

    const draw = () => {
      const q = st.q.toLowerCase().trim();
      const list = rows.filter(r => r.fecha.startsWith(st.year) && (!q || r.numero.toLowerCase().includes(q)));
      $('#sum').innerHTML = `<span>${plural(list.length, cfg.one, cfg.many)}</span><span>Total <b>${eur(list.reduce((s, r) => s + r.total, 0))}</b></span>`;
      if (!list.length) { $('#tbl').innerHTML = `<div class="empty">${I.search}<p>No hay ${cfg.many} con ese número.</p></div>`; say('Sin resultados'); return; }
      let last = '';
      $('#tbl').innerHTML = `<table class="resp s-tbl"><thead><tr><th scope="col">${cap(cfg.one)}</th><th scope="col">Fecha</th><th scope="col" class="num">Importe</th><th><span class="sr-only">Descargar</span></th></tr></thead><tbody>
        ${list.map(r => {
          const m = mes(r.fecha); const g = m !== last ? `<tr class="grp"><th colspan="4" scope="colgroup">${m}</th></tr>` : ''; last = m;
          return g + `<tr><td class="first"><b>${r.numero}</b></td><td>${fecha(r.fecha)}</td><td class="num">${eur(r.total)}</td>
            <td class="act"><a class="icon-btn" href="${pdfUrl(r.numero)}" target="_blank" rel="noopener" aria-label="Ver ${r.numero}">${I.eye}</a><a class="btn btn--ghost btn--sm" href="${pdfUrl(r.numero)}" download aria-label="Descargar ${r.numero} en PDF">${I.down}<span class="s-dl">PDF</span></a></td></tr>`;
        }).join('')}</tbody></table>`;
      say(plural(list.length, 'resultado'));
    };
    $('#q').addEventListener('input', e => { st.q = e.target.value; draw(); });
    $('#year').addEventListener('change', e => { st.year = e.target.value; draw(); });
    draw();
  }

  function route() {
    document.documentElement.style.setProperty('--brand', T().color);
    document.title = 'Área de clientes · ' + T().nombre;
    const h = path();
    if (!logged()) {
      if (h === 'codigo') loginCode(); else { if (h !== 'acceso') history.replaceState(null, '', '#/acceso'); loginEmail(); }
    } else if (h === 'albaranes' || h === 'facturas') docs(h);
    else { location.replace('#/facturas'); return; }
    const m = $('#main'); if (m && document.activeElement === document.body) m.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
