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
  // Siempre con separador de miles (4.595,47 €), igual que 10.965,08 €
  const eurFmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
  const eur = n => eurFmt.format(n);
  const fecha = iso => new Date(iso + 'T12:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
  const kg = n => n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const mes = iso => cap(new Date(iso + 'T12:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
  const diasHasta = iso => Math.round((new Date(iso + 'T12:00') - new Date(D.hoy + 'T12:00')) / 864e5);
  const plural = (n, s, p) => `${n} ${n === 1 ? s : (p || s + 's')}`;
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    home: svg('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'),
    box: svg('<path d="m21 8-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>'),
    truck: svg('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    doc: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>'),
    down: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chev: svg('<path d="m9 6 6 6-6 6"/>'),
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    out: svg('<path d="M15 4h4v16h-4M10 16l4-4-4-4M14 12H4"/>'),
    check: svg('<path d="m5 12 5 5 9-10"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
    phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    bank: svg('<path d="M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>'),
    copy: svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
    alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
    lock: svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    bolt: svg('<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>'),
    chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    send: svg('<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>')
  };
  // Marca de cada mayorista de la demo
  const MARKS = {
    laguna: '<path d="M2.5 12c3.2-5 9-6.4 13.2-3.3L20.5 5v14l-4.8-3.7C11.5 18.4 5.7 17 2.5 12z"/><circle cx="8" cy="11" r="1.1" fill="currentColor" stroke="none"/>',
    costanorte: '<path d="M4 13a8 8 0 0 1 16 0z"/><path d="M12 5v8M8.5 6.5 10.5 13M15.5 6.5 13.5 13"/><path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2-1.5 4.5-1.5S19 17 21 17"/>'
  };

  /* ---------- Estado ---------- */
  // Enlaces directos para la presentación: ?m=laguna&vista=panel&entrar=1
  (() => {
    const p = new URLSearchParams(location.search);
    if (p.get('m') && D.mayoristas[p.get('m')]) store.set('tenant', p.get('m'));
    if (p.get('vista') || p.get('m')) store.set('view', p.get('vista') === 'panel' ? 'panel' : 'cliente');
    if (p.get('entrar')) store.set('logged-' + (p.get('m') || store.get('tenant', 'laguna')), true);
  })();
  let tenantKey = store.get('tenant', 'laguna');
  if (!D.mayoristas[tenantKey]) tenantKey = 'laguna';
  let view = store.get('view', 'cliente');
  const T = () => D.mayoristas[tenantKey];
  const C = () => T().clientes[0]; // minorista de la demo
  const logged = () => store.get('logged-' + tenantKey, false);
  const route_ = () => { const [path, qs] = location.hash.replace(/^#\//, '').split('?'); return { path: path || '', q: new URLSearchParams(qs || '') }; };

  function applyBrand() {
    document.documentElement.style.setProperty('--brand', T().color);
    document.title = (view === 'panel' ? 'Panel · ' : 'Área de clientes · ') + T().nombre;
  }
  const say = t => { $('#live').textContent = t; };
  function toast(t) {
    const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t; document.body.append(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2600);
  }
  const mark = () => `<span class="logo__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${MARKS[tenantKey] || ''}</svg></span>`;
  const logo = sub => `<span class="logo">${mark()}<span class="logo__name">${esc(T().nombre)}${sub ? `<span class="logo__sub">${sub}</span>` : ''}</span></span>`;
  const pdfUrl = n => `docs/${tenantKey}-${n}.pdf`;
  const pdfExists = n => !/^P-/.test(n);
  const badge = e => {
    const m = { Pagada: 'b-ok', Pendiente: 'b-warn', Vencida: 'b-bad', 'Pendiente de servir': 'b-warn', Servido: 'b-info', Facturado: 'b-ok', 'Sin facturar': 'b-info', Conectado: 'b-ok', Nunca: 'b-info' };
    return `<span class="badge ${m[e] || 'b-info'}">${esc(e)}</span>`;
  };
  const productos = p => { const n = p.lineas.map(l => l.producto); return n.length <= 2 ? n.join(' y ') : `${n.slice(0, 2).join(', ')} y ${n.length - 2} más`; };
  const vencTxt = f => {
    if (f.estado === 'Pagada') return 'Pagada';
    const d = diasHasta(f.vencimiento);
    return d < 0 ? `Vencida hace ${plural(-d, 'día')}` : d === 0 ? 'Vence hoy' : `Vence en ${plural(d, 'día')}`;
  };
  async function copy(text, ok) {
    try { await navigator.clipboard.writeText(text); toast(ok); } catch { toast('No se ha podido copiar. Selecciona el texto y cópialo.'); }
  }
  const payBox = (concepto) => `
    <div class="pay">
      <div class="pay__row"><span class="pay__ico">${I.bank}</span><div><span class="pay__l">IBAN · ${esc(T().banco)}</span><b class="pay__v">${esc(T().iban)}</b></div>
        <button type="button" class="icon-btn" data-copy="${esc(T().iban.replace(/\s/g, ''))}" data-ok="IBAN copiado" aria-label="Copiar IBAN">${I.copy}</button></div>
      <div class="pay__row"><span class="pay__ico">${I.doc}</span><div><span class="pay__l">Concepto de la transferencia</span><b class="pay__v">${esc(concepto)}</b></div>
        <button type="button" class="icon-btn" data-copy="${esc(concepto)}" data-ok="Concepto copiado" aria-label="Copiar concepto">${I.copy}</button></div>
    </div>`;
  // Botones de copiar en cualquier pantalla
  document.addEventListener('click', e => { const b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy, b.dataset.ok); });

  /* ---------- Barra de la demo ---------- */
  $('#demo-tenant').value = tenantKey;
  $('#demo-tenant').addEventListener('change', e => { tenantKey = e.target.value; store.set('tenant', tenantKey); route(); });
  $$('.demo-bar__seg button').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.view === view);
    b.addEventListener('click', () => {
      view = b.dataset.view; store.set('view', view);
      $$('.demo-bar__seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
      location.hash = view === 'panel' ? '#/panel/clientes' : '#/inicio';
      route();
    });
  });

  /* ---------- Acceso sin contraseña ---------- */
  function loginLayout(inner) {
    const t = T();
    app.innerHTML = `
    <div class="login">
      <aside class="login__side">
        ${logo()}
        <div>
          <h1>Tus pedidos y facturas, siempre a mano.</h1>
          <ul>
            <li><span>${I.box}</span>Consulta tus pedidos y si ya están servidos</li>
            <li><span>${I.truck}</span>Descarga tus albaranes al momento</li>
            <li><span>${I.doc}</span>Tus facturas en PDF, sin tener que pedirlas</li>
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
      store.set('logged-' + tenantKey, true); location.hash = '#/inicio';
    });
  }

  /* ---------- Estructura ---------- */
  function shell(active, content, tabs, whoName, whoSub) {
    app.innerHTML = `
    <div class="shell">
      <header class="topbar"><div class="topbar__in">
        ${logo(view === 'panel' ? 'Panel de gestión' : 'Área de clientes')}
        <nav class="tabs${tabs.length < 4 ? ' tabs--few' : ''}" aria-label="Secciones">${tabs.map(([h, t, ic]) => `<a href="#/${h}"${h === active ? ' aria-current="page"' : ''}>${ic}<span>${t}</span></a>`).join('')}</nav>
        <div class="who"><span class="who__avatar" aria-hidden="true">${esc(view === 'panel' ? whoName.replace('Equipo de ', '').split(' ').map(w => w[0]).slice(0, 2).join('') : whoName.split(' ').map(w => w[0]).slice(0, 2).join(''))}</span><span class="who__name"><b>${esc(whoName)}</b><span>${esc(whoSub)}</span></span>
          ${view === 'cliente' ? `<button class="icon-btn" id="logout" aria-label="Cerrar sesión" title="Cerrar sesión">${I.out}</button>` : ''}</div>
      </div></header>
      <main class="main" id="main" tabindex="-1">${content}</main>
      <footer class="pf"><span>${esc(T().forma)} · ${esc(T().telefono)} · ${esc(T().email)}</span><span>Conectado con Mercagestion</span></footer>
    </div>`;
    const lo = $('#logout'); if (lo) lo.onclick = () => { store.set('logged-' + tenantKey, false); location.hash = '#/acceso'; };
  }
  const clientTabs = [['inicio', 'Resumen', I.home], ['pedidos', 'Pedidos', I.box], ['albaranes', 'Albaranes', I.truck], ['facturas', 'Facturas', I.doc], ['perfil', 'Perfil', I.user]];

  /* ---------- Resumen ---------- */
  function inicio() {
    const c = C(), t = T();
    const pend = c.facturas.filter(f => f.estado !== 'Pagada');
    const venc = pend.filter(f => f.estado === 'Vencida');
    const prox = pend.filter(f => f.estado === 'Pendiente').sort((a, b) => a.vencimiento.localeCompare(b.vencimiento))[0];
    const year = c.facturas.filter(f => f.fecha.startsWith('2026'));
    const porServir = c.pedidos.filter(p => p.estado === 'Pendiente de servir');
    const albMes = c.albaranes.filter(a => a.fecha.startsWith(D.hoy.slice(0, 7)));
    const hoyTxt = cap(new Date(D.hoy + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
    shell('inicio', `
      <div class="head"><div><p class="eyebrow">${hoyTxt}</p><h1>Hola, ${esc(c.contacto.split(' ')[0])}</h1><p>${esc(c.nombre)} · cliente de ${esc(t.nombre)}</p></div>
        <div class="head__act">${pend.length ? `<button class="btn btn--ghost" data-pay="">${I.bank}Pagar facturas</button>` : ''}<button class="btn btn--brand" data-new>${I.box}Nuevo pedido</button></div></div>
      ${venc.length ? `<a class="alert" href="#/facturas?estado=Vencida">${I.alert}<span><b>Tienes ${plural(venc.length, 'factura vencida', 'facturas vencidas')} por ${eur(venc.reduce((s, f) => s + f.total, 0))}.</b> Págala ahora para evitar retrasos en tus próximos pedidos.</span>${I.chev}</a>` : ''}
      <div class="stats">
        <a class="stat stat--brand" href="#/facturas?estado=Pendiente"><span>Pendiente de pago</span><strong>${eur(pend.reduce((s, f) => s + f.total, 0))}</strong><small>${prox ? `Próximo vencimiento: ${fecha(prox.vencimiento)}` : plural(pend.length, 'factura')}</small>${I.chev}</a>
        <a class="stat" href="#/pedidos?estado=Pendiente de servir"><span>Pendientes de servir</span><strong>${porServir.length}</strong><small>${porServir.length ? plural(porServir.length, 'pedido') + ' por salir' : 'Todo servido'}</small>${I.chev}</a>
        <a class="stat" href="#/albaranes"><span>Albaranes este mes</span><strong>${albMes.length}</strong><small>${kg(albMes.reduce((s, a) => s + a.kg, 0))} en total</small>${I.chev}</a>
        <a class="stat" href="#/facturas"><span>Facturado en 2026</span><strong>${eur(year.reduce((s, f) => s + f.total, 0))}</strong><small>${plural(year.length, 'factura')}</small>${I.chev}</a>
      </div>
      <div class="dash">
        <div class="dash__main">
          <section class="card" aria-labelledby="h-fac"><div class="card__head"><h3 id="h-fac">Últimas facturas</h3><a href="#/facturas">Ver todas</a></div>
            <ul class="list list--rows">${c.facturas.slice(0, 4).map(f => `<li data-doc="facturas:${f.numero}">
              <div><b>${f.numero}</b><span class="sub">${fecha(f.fecha)} · ${vencTxt(f)}</span></div>
              <div class="row-r">${badge(f.estado)}<b class="amt">${eur(f.total)}</b><a class="icon-btn" href="${pdfUrl(f.numero)}" download aria-label="Descargar ${f.numero} en PDF">${I.down}</a></div></li>`).join('')}</ul>
          </section>
          <section class="card" aria-labelledby="h-ped"><div class="card__head"><h3 id="h-ped">Últimos pedidos</h3><div class="card__links">${c.pedidos[0] ? `<button type="button" class="link-btn" data-repeat="${c.pedidos[0].numero}">Repetir el último</button>` : ''}<a href="#/pedidos">Ver todos</a></div></div>
            <ul class="list list--rows">${c.pedidos.slice(0, 5).map(p => `<li data-doc="pedidos:${p.numero}">
              <div><b>${p.numero}</b><span class="sub">${fecha(p.fecha)} · ${esc(productos(p))}</span></div>
              <div class="row-r">${badge(p.estado)}<b class="amt">${eur(p.total)}</b></div></li>`).join('')}</ul>
          </section>
        </div>
        <aside class="dash__side">
          <section class="card" aria-labelledby="h-pay"><div class="card__head"><h3 id="h-pay">Cómo pagar</h3></div>
            <div class="card__pad">${pend.length ? `<button class="btn btn--brand btn--block" data-pay="">${I.lock}Pagar con tarjeta o Bizum</button><p class="or"><span>o por transferencia</span></p>` : '<p class="muted">Estás al día. Cuando tengas una factura pendiente podrás pagarla aquí con tarjeta o Bizum.</p>'}${payBox(prox ? prox.numero : 'Nº de factura')}</div>
          </section>
          <section class="card" aria-labelledby="h-cont"><div class="card__head"><h3 id="h-cont">Tu contacto en ${esc(t.nombre)}</h3></div>
            <div class="card__pad contact">
              <div class="contact__who"><span class="who__avatar">${esc(t.comercial.split(' ').map(w => w[0]).join(''))}</span><div><b>${esc(t.comercial)}</b><span class="sub">Comercial</span></div></div>
              <a class="btn btn--ghost btn--block" href="tel:+34${t.comercial_tel.replace(/\s/g, '')}">${I.phone}${esc(t.comercial_tel)}</a>
              <p class="sub">${I.clock}${esc(t.horario)}</p>
            </div>
          </section>
        </aside>
      </div>`, clientTabs, c.contacto, c.nombre);
    $$('[data-doc]').forEach(li => li.addEventListener('click', e => { if (e.target.closest('a,button')) return; const [k, n] = li.dataset.doc.split(':'); openDoc(k, n); }));
  }

  /* ---------- Listados ---------- */
  function listPage(kind, q0) {
    const c = C();
    const cfg = {
      pedidos: { title: 'Pedidos', desc: 'Un pedido pasa a «Servido» cuando sale su albarán y a «Facturado» cuando entra en una factura.', rows: c.pedidos, states: ['Todos', 'Pendiente de servir', 'Servido', 'Facturado'], ph: 'Buscar por número o producto' },
      albaranes: { title: 'Albaranes', desc: 'Un albarán por cada entrega, con el peso y los productos servidos.', rows: c.albaranes, states: ['Todos', 'Sin facturar', 'Facturado'], ph: 'Buscar por número o producto' },
      facturas: { title: 'Facturas', desc: 'Cada factura agrupa los albaranes de una quincena.', rows: c.facturas, states: ['Todas', 'Pendiente', 'Vencida', 'Pagada'], ph: 'Buscar por número de factura' }
    }[kind];
    const pre = q0.get('estado');
    const st = { q: '', estado: cfg.states.includes(pre) ? pre : cfg.states[0], year: '2026', sel: new Set() };
    const sel = kind !== 'pedidos';
    shell(kind, `
      <div class="head"><div><h1>${cfg.title}</h1><p>${cfg.desc}</p></div>${kind === 'pedidos' ? `<button class="btn btn--brand" data-new>${I.box}Nuevo pedido</button>` : kind === 'facturas' && c.facturas.some(f => f.estado !== 'Pagada') ? `<button class="btn btn--brand" data-pay="">${I.lock}Pagar pendientes</button>` : ''}</div>
      <section class="card" aria-label="${cfg.title}">
        <div class="toolbar">
          <div class="search">${I.search}<input type="search" id="q" placeholder="${cfg.ph}" aria-label="${cfg.ph}"></div>
          <select id="year" aria-label="Año"><option>2026</option><option>2025</option></select>
          <div class="chips" role="group" aria-label="Filtrar por estado">${cfg.states.map(s => `<button type="button" class="chip" aria-pressed="${s === st.estado}" data-s="${s}">${s}</button>`).join('')}</div>
        </div>
        <div class="sumbar" id="sum" aria-live="polite"></div>
        ${sel ? `<div class="bulk" id="bulk" hidden><span id="bulk-n"></span><div><button class="btn btn--sm btn--ghost-dark" id="bulk-x">Quitar selección</button><button class="btn btn--sm" id="bulk-dl">${I.down}Descargar en PDF</button></div></div>` : ''}
        <div id="tbl"></div>
      </section>`, clientTabs, c.contacto, c.nombre);

    const stateOf = r => kind === 'albaranes' ? (r.factura ? 'Facturado' : 'Sin facturar') : r.estado;
    const linesOf = r => r.lineas || [];
    const filtered = () => {
      const q = st.q.toLowerCase().trim();
      return cfg.rows.filter(r => r.fecha.startsWith(st.year)
        && (st.estado === cfg.states[0] || stateOf(r) === st.estado)
        && (!q || r.numero.toLowerCase().includes(q) || linesOf(r).some(l => l.producto.toLowerCase().includes(q))));
    };
    const head = {
      pedidos: ['Pedido', 'Fecha', 'Productos', 'Estado', 'Importe'],
      albaranes: ['Albarán', 'Fecha', 'Pedido', 'Peso', 'Factura', 'Importe'],
      facturas: ['Factura', 'Fecha', 'Vencimiento', 'Albaranes', 'Estado', 'Importe']
    }[kind];
    const ref = (k, n) => `<button type="button" class="ref" data-go="${k}:${n}">${n}</button>`;
    const cells = r => ({
      pedidos: () => [`<b>${r.numero}</b>`, fecha(r.fecha), `<span class="clip">${esc(productos(r))}</span>`, badge(r.estado), eur(r.total)],
      albaranes: () => [`<b>${r.numero}</b>`, fecha(r.fecha), ref('pedidos', r.pedido), kg(r.kg), r.factura ? ref('facturas', r.factura) : badge('Sin facturar'), eur(r.total)],
      facturas: () => [`<b>${r.numero}</b>`, fecha(r.fecha), `${fecha(r.vencimiento)}<span class="sub ${r.estado === 'Vencida' ? 'is-bad' : ''}">${r.estado === 'Pagada' ? '' : vencTxt(r)}</span>`, plural(r.albaranes.length, 'albarán', 'albaranes'), badge(r.estado), eur(r.total)]
    }[kind])();
    const hideM = ['Productos', 'Pedido', 'Factura', 'Albaranes', 'Peso', 'Vencimiento'];

    const draw = () => {
      const rows = filtered();
      const tot = rows.reduce((s, r) => s + r.total, 0);
      $('#sum').innerHTML = kind === 'facturas'
        ? `<span>${plural(rows.length, 'factura')}</span><span>Pendiente <b>${eur(rows.filter(r => r.estado === 'Pendiente').reduce((s, r) => s + r.total, 0))}</b></span><span>Vencido <b class="${rows.some(r => r.estado === 'Vencida') ? 'is-bad' : ''}">${eur(rows.filter(r => r.estado === 'Vencida').reduce((s, r) => s + r.total, 0))}</b></span><span>Total <b>${eur(tot)}</b></span>`
        : kind === 'albaranes'
          ? `<span>${plural(rows.length, 'albarán', 'albaranes')}</span><span>Peso <b>${kg(rows.reduce((s, r) => s + r.kg, 0))}</b></span><span>Total <b>${eur(tot)}</b></span>`
          : `<span>${plural(rows.length, 'pedido')}</span><span>Total <b>${eur(tot)}</b></span>`;
      if (!rows.length) { $('#tbl').innerHTML = `<div class="empty">${I.search}<p>No hay ${kind} con estos filtros.</p><button class="btn btn--ghost btn--sm" id="reset">Quitar filtros</button></div>`; $('#reset').onclick = () => { st.q = ''; $('#q').value = ''; st.estado = cfg.states[0]; $$('.chip').forEach(x => x.setAttribute('aria-pressed', x.dataset.s === st.estado)); draw(); }; say('Sin resultados'); return; }
      let last = '';
      const body = rows.map(r => {
        const m = mes(r.fecha); const g = m !== last ? `<tr class="grp"><th colspan="${head.length + (sel ? 2 : 1)}" scope="colgroup">${m}</th></tr>` : ''; last = m;
        return g + `<tr data-row="${r.numero}"${st.sel.has(r.numero) ? ' class="is-sel"' : ''}>${sel ? `<td class="sel"><input type="checkbox" class="check" data-sel="${r.numero}" aria-label="Seleccionar ${r.numero}"${st.sel.has(r.numero) ? ' checked' : ''}></td>` : ''}${cells(r).map((v, i) => `<td class="${[i === head.length - 1 ? 'num' : '', i > 0 && hideM.includes(head[i]) ? 'hide-m' : '', i === 0 ? 'first' : ''].join(' ').trim()}">${v}</td>`).join('')}
          <td class="act"><button class="icon-btn" data-open="${r.numero}" aria-label="Ver ${r.numero}">${I.eye}</button>${sel ? `<a class="icon-btn" href="${pdfUrl(r.numero)}" download aria-label="Descargar ${r.numero} en PDF">${I.down}</a>` : ''}</td></tr>`;
      }).join('');
      $('#tbl').innerHTML = `<table class="resp"><thead><tr>${sel ? `<th class="sel"><input type="checkbox" class="check" id="sel-all" aria-label="Seleccionar todos"></th>` : ''}${head.map((h, i) => `<th scope="col"${i === head.length - 1 ? ' class="num"' : ''}>${h}</th>`).join('')}<th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${body}</tbody></table>`;
      const all = $('#sel-all'); if (all) { const ids = rows.map(r => r.numero); all.checked = ids.length && ids.every(i => st.sel.has(i)); all.indeterminate = !all.checked && ids.some(i => st.sel.has(i)); all.onchange = () => { ids.forEach(i => all.checked ? st.sel.add(i) : st.sel.delete(i)); draw(); syncBulk(); }; }
      say(rows.length + ' resultados');
    };
    const syncBulk = () => { const b = $('#bulk'); if (!b) return; b.hidden = !st.sel.size; $('#bulk-n').textContent = `${plural(st.sel.size, 'documento seleccionado', 'documentos seleccionados')}`; };
    $('#q').addEventListener('input', e => { st.q = e.target.value; draw(); });
    $('#year').addEventListener('change', e => { st.year = e.target.value; draw(); });
    $$('.chip').forEach(ch => ch.addEventListener('click', () => { $$('.chip').forEach(x => x.setAttribute('aria-pressed', x === ch)); st.estado = ch.dataset.s; draw(); }));
    $('#tbl').addEventListener('click', e => {
      const g = e.target.closest('[data-go]'); if (g) { const [k, n] = g.dataset.go.split(':'); openDoc(k, n); return; }
      const o = e.target.closest('[data-open]'); if (o) { openDoc(kind, o.dataset.open); return; }
      if (e.target.closest('a,button,input')) return;
      const tr = e.target.closest('tr[data-row]'); if (tr) openDoc(kind, tr.dataset.row);
    });
    $('#tbl').addEventListener('change', e => { const s = e.target.closest('[data-sel]'); if (!s) return; s.checked ? st.sel.add(s.dataset.sel) : st.sel.delete(s.dataset.sel); s.closest('tr').classList.toggle('is-sel', s.checked); syncBulk(); const all = $('#sel-all'); if (all) { const ids = filtered().map(r => r.numero); all.checked = ids.every(i => st.sel.has(i)); all.indeterminate = !all.checked && ids.some(i => st.sel.has(i)); } });
    const bx = $('#bulk-x'); if (bx) bx.onclick = () => { st.sel.clear(); draw(); syncBulk(); };
    const bd = $('#bulk-dl'); if (bd) bd.onclick = () => { [...st.sel].forEach((n, i) => setTimeout(() => { const a = document.createElement('a'); a.href = pdfUrl(n); a.download = ''; document.body.append(a); a.click(); a.remove(); }, i * 250)); toast(`Descargando ${plural(st.sel.size, 'documento')}`); };
    draw();
  }

  /* ---------- Panel lateral ---------- */
  function drawer(title, sub, body, foot) {
    const wrap = document.createElement('div');
    wrap.className = 'drawer'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'dr-t');
    wrap.innerHTML = `<div class="drawer__panel">
      <div class="drawer__head"><div><h2 id="dr-t">${title}</h2><p>${sub}</p></div><button class="icon-btn" data-close aria-label="Cerrar">${I.x}</button></div>
      <div class="drawer__body">${body}</div>
      ${foot ? `<div class="drawer__foot">${foot}</div>` : ''}
    </div>`;
    const prev = document.activeElement;
    $$('.drawer').forEach(d => d.remove());
    document.body.append(wrap); document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => wrap.classList.add('open'));
    wrap.querySelector('[data-close]').focus();
    const close = () => { wrap.classList.remove('open'); document.body.style.overflow = ''; setTimeout(() => wrap.remove(), 250); document.removeEventListener('keydown', onKey); prev && prev.isConnected && prev.focus(); };
    const onKey = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const f = $$('a,button', wrap); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    return { wrap, close };
  }

  function openDoc(kind, num) {
    const c = C();
    const r = c[kind].find(x => x.numero === num); if (!r) return;
    const lines = r.lineas || (kind === 'facturas' ? r.albaranes.flatMap(a => c.albaranes.find(x => x.numero === a)?.lineas || []) : []);
    const title = { pedidos: 'Pedido', albaranes: 'Albarán', facturas: 'Factura' }[kind];
    const ref = (k, n) => n ? `<button type="button" class="ref" data-go="${k}:${n}">${n}</button>` : '<span class="muted">Pendiente</span>';
    const meta = {
      pedidos: () => [['Fecha', fecha(r.fecha)], r.entrega ? ['Entrega', diaTxt(r.entrega)] : ['Productos', plural(r.lineas.length, 'producto')], ['Albarán', ref('albaranes', r.albaran)], ['Factura', ref('facturas', r.factura)]],
      albaranes: () => [['Fecha', fecha(r.fecha)], ['Peso total', kg(r.kg)], ['Pedido', ref('pedidos', r.pedido)], ['Factura', r.factura ? ref('facturas', r.factura) : '<span class="muted">Sin facturar</span>']],
      facturas: () => [['Fecha', fecha(r.fecha)], ['Vencimiento', `${fecha(r.vencimiento)}${r.estado !== 'Pagada' ? `<span class="sub ${r.estado === 'Vencida' ? 'is-bad' : ''}">${vencTxt(r)}</span>` : ''}`], ['Albaranes', r.albaranes.map(a => ref('albaranes', a)).join(' ')], ['Base + IVA', `${eur(r.base)} + ${eur(r.iva)}`]]
    }[kind]();
    const steps = ['Pedido recibido', 'Servido', 'Facturado'];
    const idx = kind === 'pedidos' ? ({ 'Pendiente de servir': 0, Servido: 1, Facturado: 2 })[r.estado] : -1;
    const body = `
      <div class="doc-top"><div>${kind === 'albaranes' ? badge(r.factura ? 'Facturado' : 'Sin facturar') : badge(r.estado)}</div><strong class="doc-total">${eur(r.total)}</strong></div>
      ${r.obs ? `<p class="note">${I.doc}<span><b>Observaciones:</b> ${esc(r.obs)}</span></p>` : ''}
      ${kind === 'pedidos' ? `<ol class="steps-h">${steps.map((s, i) => `<li class="${i <= idx ? 'done' : ''}${i === idx ? ' now' : ''}"><span></span>${s}</li>`).join('')}</ol>` : ''}
      <dl class="meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      ${kind === 'facturas' && r.estado !== 'Pagada' ? `<section class="pay-block"><h3>Cómo pagar esta factura</h3>${payBox(r.numero)}</section>` : ''}
      <div class="lines-wrap"><table class="lines"><thead><tr><th scope="col">Producto</th><th scope="col" class="num">Cantidad</th><th scope="col" class="num">Precio</th><th scope="col" class="num">Importe</th></tr></thead>
        <tbody>${lines.map(l => `<tr><td>${esc(l.producto)}</td><td class="num">${kg(l.kg)}</td><td class="num">${eur(l.precio)}/kg</td><td class="num">${eur(l.importe)}</td></tr>`).join('')}</tbody></table></div>
      <div class="totals"><div><span>Base imponible</span><span>${eur(r.base)}</span></div><div><span>IVA 10 %</span><span>${eur(r.iva)}</span></div><div class="t"><span>Total</span><span>${eur(r.total)}</span></div></div>`;
    const foot = kind === 'facturas' && r.estado !== 'Pagada'
      ? `<button class="btn btn--brand" data-pay="${r.numero}">${I.lock}Pagar ${eur(r.total)}</button><a class="btn btn--ghost" href="${pdfUrl(r.numero)}" download>${I.down}Descargar PDF</a>`
      : kind !== 'pedidos'
        ? `<a class="btn btn--brand" href="${pdfUrl(r.numero)}" download>${I.down}Descargar PDF</a><a class="btn btn--ghost" href="${pdfUrl(r.numero)}" target="_blank" rel="noopener">${I.eye}Abrir</a>`
        : `<button class="btn btn--brand" data-repeat="${r.numero}">${I.box}Repetir pedido</button>${r.albaran ? `<button class="btn btn--ghost" data-go="albaranes:${r.albaran}">${I.truck}Ver albarán</button>` : ''}${r.factura ? `<button class="btn btn--ghost" data-go="facturas:${r.factura}">${I.doc}Ver factura</button>` : ''}`;
    const { wrap, close } = drawer(`${title} ${esc(r.numero)}`, `${esc(T().nombre)} · ${esc(c.nombre)}`, body, foot);
    wrap.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { const [k, n] = g.dataset.go.split(':'); openDoc(k, n); } });
  }

  /* ---------- Perfil ---------- */
  function perfil() {
    const c = C(), t = T();
    shell('perfil', `
      <div class="head"><div><h1>Perfil</h1><p>Tus datos tal y como constan en ${esc(t.nombre)}.</p></div></div>
      <div class="dash">
        <div class="dash__main">
          <section class="card"><div class="card__head"><h3>Datos de facturación</h3></div>
            <dl class="kv">${[['Empresa', c.nombre], ['NIF', c.nif], ['Persona de contacto', c.contacto], ['Email de acceso', c.email]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
            <div class="card__foot"><p class="muted">¿Algún dato no es correcto? Se actualizan desde el programa de facturación de ${esc(t.nombre)}.</p><a class="btn btn--ghost btn--sm" href="mailto:${esc(t.email)}?subject=${encodeURIComponent('Corrección de datos · ' + c.nombre)}">${I.mail}Pedir un cambio</a></div>
          </section>
          ${avisosCard()}
        </div>
        <aside class="dash__side">
          <section class="card"><div class="card__head"><h3>Cómo pagar</h3></div><div class="card__pad">${payBox('Nº de factura')}</div></section>
          <section class="card"><div class="card__head"><h3>${esc(t.nombre)}</h3></div>
            <div class="card__pad contact"><p class="sub">${esc(t.direccion)}</p><a class="btn btn--ghost btn--block" href="tel:+34${t.telefono.replace(/\s/g, '')}">${I.phone}${esc(t.telefono)}</a><p class="sub">${I.clock}${esc(t.horario)}</p></div>
          </section>
        </aside>
      </div>`, clientTabs, c.contacto, c.nombre);
    bindAvisos();
  }

  /* ---------- Panel del mayorista ---------- */
  const panelTabs = [['panel/clientes', 'Clientes', I.users], ['panel/actividad', 'Actividad', I.chart]];

  function panelClientes() {
    const t = T(), cs = t.clientes;
    const withAccess = cs.filter(c => c.ultimo_acceso);
    const pendOf = c => c.facturas.filter(f => f.estado !== 'Pagada');
    const vencOf = c => c.facturas.filter(f => f.estado === 'Vencida');
    const pend = cs.reduce((s, c) => s + pendOf(c).reduce((a, f) => a + f.total, 0), 0);
    const venc = cs.reduce((s, c) => s + vencOf(c).reduce((a, f) => a + f.total, 0), 0);
    const sinInv = cs.filter(c => c.email && !c.ultimo_acceso).length;
    const A = buildActivity();
    const hace = d => Math.round((new Date(D.hoy + 'T12:00') - new Date(d + 'T12:00')) / 864e5);
    const desc = c => A.ev.filter(e => (!c || e.c.id === c.id) && (e.tipo === 'factura' || e.tipo === 'albaran') && hace(e.d) < 30).length;
    shell('panel/clientes', `
      <div class="head"><div><h1>Clientes</h1><p>Se sincronizan solos con Mercagestion. Aquí ves quién usa el área de clientes y cuánto tiene pendiente cada uno.</p></div>
        ${sinInv ? `<button class="btn btn--brand" data-toast="Invitación enviada a ${plural(sinInv, 'cliente')}">${I.send}Enviar invitaciones (${sinInv})</button>` : ''}</div>
      <div class="stats">
        <div class="stat stat--brand"><span>Usan el área de clientes</span><strong>${withAccess.length} <small class="of">de ${cs.length}</small></strong><small>${Math.round(withAccess.length / cs.length * 100)} % de tus clientes</small></div>
        <div class="stat"><span>Documentos descargados</span><strong>${desc()}</strong><small>en los últimos 30 días</small></div>
        <div class="stat"><span>Pendiente de cobro</span><strong>${eur(pend)}</strong><small>entre todos los clientes</small></div>
        <div class="stat"><span>Vencido</span><strong class="${venc ? 'is-bad' : ''}">${eur(venc)}</strong><small>de ${plural(cs.filter(c => vencOf(c).length).length, 'cliente')}</small></div>
      </div>
      <section class="card" aria-label="Listado de clientes">
        <div class="toolbar">
          <div class="search">${I.search}<input type="search" id="q" placeholder="Buscar cliente o email" aria-label="Buscar cliente o email"></div>
          <div class="chips" role="group" aria-label="Filtrar clientes">${[['todos', 'Todos'], ['vencido', 'Facturas vencidas'], ['nunca', 'No han entrado nunca']].map(([k, l], i) => `<button type="button" class="chip" data-f="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div>
        </div>
        <div id="tbl"></div>
      </section>`, panelTabs, 'Equipo de ' + t.nombre, 'Administración');
    const st = { q: '', f: 'todos' };
    const draw = () => {
      const rows = cs.filter(c => (!st.q || (c.nombre + c.email + c.contacto).toLowerCase().includes(st.q.toLowerCase()))
        && (st.f === 'todos' || (st.f === 'vencido' ? vencOf(c).length : !c.ultimo_acceso)));
      if (!rows.length) { $('#tbl').innerHTML = '<div class="empty"><p>No hay clientes con estos filtros.</p></div>'; return; }
      $('#tbl').innerHTML = `<table class="resp resp--cli"><thead><tr><th scope="col">Cliente</th><th scope="col">Último acceso</th><th scope="col" class="num">Pendiente</th><th scope="col" class="num">Vencido</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>
        ${rows.map(c => { const p = pendOf(c), v = vencOf(c); return `<tr data-cli="${c.id}">
          <td class="first"><b>${esc(c.nombre)}</b><span class="sub">${c.email ? esc(c.email) : '<span class="is-warn">Sin email en Mercagestion</span>'}</span></td>
          <td class="c-acc">${c.ultimo_acceso ? `${fecha(c.ultimo_acceso)}<span class="sub">${plural(desc(c), 'descarga')} en 30 días</span>` : badge('Nunca')}</td>
          <td class="num c-pen">${p.length ? `${eur(p.reduce((s, f) => s + f.total, 0))}<span class="sub">${plural(p.length, 'factura')}</span>` : '<span class="muted">—</span>'}</td>
          <td class="num c-ven">${v.length ? `<b class="is-bad">${eur(v.reduce((s, f) => s + f.total, 0))}</b>` : '<span class="muted">—</span>'}</td>
          <td class="act">${c.email ? `<button class="btn btn--ghost btn--sm" data-toast="${c.ultimo_acceso ? 'Acceso reenviado a' : 'Invitación enviada a'} ${esc(c.nombre)}">${I.send}${c.ultimo_acceso ? 'Reenviar acceso' : 'Invitar'}</button>` : ''}<span class="chev" aria-hidden="true">${I.chev}</span></td></tr>`; }).join('')}
      </tbody></table>`;
    };
    $('#q').addEventListener('input', e => { st.q = e.target.value; draw(); });
    $$('.chip[data-f]').forEach(ch => ch.onclick = () => { $$('.chip[data-f]').forEach(x => x.setAttribute('aria-pressed', x === ch)); st.f = ch.dataset.f; draw(); });
    $('#tbl').addEventListener('click', e => { if (e.target.closest('a,button')) return; const tr = e.target.closest('tr[data-cli]'); if (tr) openClient(tr.dataset.cli); });
    draw();
  }

  function openClient(id) {
    const c = T().clientes.find(x => x.id === id);
    const pend = c.facturas.filter(f => f.estado !== 'Pagada');
    const A = buildActivity(); const ev = A.ev.filter(e => e.c.id === id).slice(0, 6);
    const icon = { acceso: I.user, factura: I.doc, albaran: I.truck, invitacion: I.send };
    const body = `
      <dl class="meta">
        <div><dt>Contacto</dt><dd>${esc(c.contacto)}</dd></div>
        <div><dt>NIF</dt><dd>${esc(c.nif)}</dd></div>
        <div><dt>Email de acceso</dt><dd>${c.email ? esc(c.email) : '<span class="is-warn">Falta en Mercagestion</span>'}</dd></div>
        <div><dt>Último acceso</dt><dd>${c.ultimo_acceso ? fecha(c.ultimo_acceso) : 'Nunca'}</dd></div>
      </dl>
      <section><h3 class="dr-h">Facturas sin pagar</h3>
        ${pend.length ? `<ul class="list list--flat">${pend.map(f => `<li><div><b>${f.numero}</b><span class="sub">${vencTxt(f)}${A.vistas.has(f.numero) ? ' · descargada por el cliente' : ''}</span></div><div class="row-r">${badge(f.estado)}<b class="amt">${eur(f.total)}</b></div></li>`).join('')}</ul>` : '<p class="muted">No tiene facturas pendientes.</p>'}
      </section>
      <section><h3 class="dr-h">Última actividad</h3>
        ${ev.length ? `<ul class="list list--flat">${ev.map(e => `<li><div class="ev-l"><span class="ev-ico ev-${e.tipo}">${icon[e.tipo]}</span><div><b>${e.txt}</b><span class="sub">${e.doc ? e.doc + ' · ' : ''}${fecha(e.d)}, ${e.h}</span></div></div></li>`).join('')}</ul>` : '<p class="muted">Todavía no ha entrado en el área de clientes.</p>'}
      </section>`;
    const foot = `${c.email ? `<button class="btn btn--brand" data-toast="${c.ultimo_acceso ? 'Acceso reenviado a' : 'Invitación enviada a'} ${esc(c.nombre)}">${I.send}${c.ultimo_acceso ? 'Reenviar acceso' : 'Enviar invitación'}</button>` : ''}${pend.length ? `<button class="btn btn--ghost" data-toast="Recordatorio de pago enviado a ${esc(c.nombre)}">${I.mail}Enviar recordatorio de pago</button>` : ''}`;
    const { wrap } = drawer(esc(c.nombre), `Cliente de ${esc(T().nombre)}`, body, foot);
    wrap.addEventListener('click', e => { const b = e.target.closest('[data-toast]'); if (b) toast(b.dataset.toast); });
  }

  /* Actividad: eventos de demo generados de forma estable a partir de los datos */
  function buildActivity() {
    const t = T(); if (t._act) return t._act;
    let seed = [...tenantKey].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const hoy = new Date(D.hoy + 'T12:00');
    const iso = d => d.toISOString().slice(0, 10);
    const hora = (h0, h1) => { const m = Math.floor((h0 + rnd() * (h1 - h0)) * 60); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
    const ev = [];
    t.clientes.forEach((c, ci) => {
      if (!c.ultimo_acceso) {
        if (c.email) ev.push({ d: iso(new Date(hoy - 12 * 864e5)), h: '10:15', tipo: 'invitacion', c, txt: 'Invitación enviada', doc: null });
        return;
      }
      const ultimo = new Date(c.ultimo_acceso + 'T12:00');
      const sesiones = 2 + Math.floor(rnd() * 5);
      for (let s = 0; s < sesiones; s++) {
        const dia = s === 0 ? ultimo : new Date(ultimo - Math.floor(rnd() * 28) * 864e5);
        const h = hora(6, 10.5);
        ev.push({ d: iso(dia), h, tipo: 'acceso', c, txt: 'Ha entrado en el área de clientes', doc: null });
        const docs = [...c.facturas.filter(f => f.fecha <= iso(dia)).slice(0, 2).map(f => ['factura', f]), ...c.albaranes.filter(a => a.fecha <= iso(dia)).slice(0, 3).map(a => ['albaran', a])];
        const n = 1 + Math.floor(rnd() * 2);
        for (let k = 0; k < n && docs.length; k++) {
          const [kind, doc] = docs.splice(Math.floor(rnd() * docs.length), 1)[0];
          ev.push({ d: iso(dia), h: h.replace(/\d\d$/, m => String(Math.min(59, +m + 1 + k)).padStart(2, '0')), tipo: kind, c, txt: kind === 'factura' ? 'Ha descargado la factura' : 'Ha descargado el albarán', doc: doc.numero, estado: doc.estado });
        }
      }
    });
    const sync = [];
    t.clientes.forEach(c => {
      c.pedidos.filter(p => (hoy - new Date(p.fecha + 'T12:00')) / 864e5 < 3).forEach(p => sync.push({ d: p.fecha, h: hora(4, 6), tipo: 'pedido', c, doc: p.numero, txt: 'Pedido recibido' }));
      c.albaranes.filter(a => (hoy - new Date(a.fecha + 'T12:00')) / 864e5 < 3).forEach(a => sync.push({ d: a.fecha, h: hora(5, 7.5), tipo: 'albaran', c, doc: a.numero, txt: 'Albarán emitido' }));
      c.facturas.filter(f => (hoy - new Date(f.fecha + 'T12:00')) / 864e5 < 20).forEach(f => sync.push({ d: f.fecha, h: hora(13, 15), tipo: 'factura', c, doc: f.numero, txt: 'Factura emitida' }));
    });
    const byDate = (a, b) => (b.d + b.h).localeCompare(a.d + a.h);
    ev.sort(byDate); sync.sort(byDate);
    // Un mismo documento descargado dos veces el mismo día cuenta una vez
    const seen = new Set();
    for (let i = ev.length - 1; i >= 0; i--) { const k = ev[i].c.id + ev[i].d + ev[i].tipo + (ev[i].doc || ''); if (seen.has(k)) ev.splice(i, 1); else seen.add(k); }
    // Facturas vencidas o pendientes que el cliente ya ha descargado: prueba de recepción para reclamar el cobro
    const vistas = new Set(ev.filter(e => e.tipo === 'factura').map(e => e.doc));
    return (t._act = { ev, sync, vistas });
  }

  function panelActividad() {
    const t = T(), cs = t.clientes, A = buildActivity();
    const hoyISO = D.hoy;
    const dayDiff = d => Math.round((new Date(hoyISO + 'T12:00') - new Date(d + 'T12:00')) / 864e5);
    const last30 = A.ev.filter(e => dayDiff(e.d) < 30);
    const activos = new Set(last30.filter(e => e.tipo === 'acceso').map(e => e.c.id));
    const descargas = last30.filter(e => e.tipo === 'factura' || e.tipo === 'albaran').length;
    const recibidosHoy = A.sync.filter(e => e.d === hoyISO);
    const cobro = cs.flatMap(c => c.facturas.filter(f => f.estado !== 'Pagada').map(f => ({ c, f, vista: A.vistas.has(f.numero) })))
      .sort((a, b) => (a.f.estado === 'Vencida' ? 0 : 1) - (b.f.estado === 'Vencida' ? 0 : 1) || a.f.vencimiento.localeCompare(b.f.vencimiento));
    const sinEntrar = cs.filter(c => !c.ultimo_acceso || dayDiff(c.ultimo_acceso) > 14);
    // Actividad de los últimos 14 días para el gráfico
    const dias = Array.from({ length: 14 }, (_, i) => { const d = new Date(new Date(hoyISO + 'T12:00') - (13 - i) * 864e5).toISOString().slice(0, 10); return { d, n: A.ev.filter(e => e.d === d).length }; });
    const max = Math.max(...dias.map(x => x.n), 1);
    const dLabel = d => { const n = dayDiff(d); return n === 0 ? 'Hoy' : n === 1 ? 'Ayer' : (x => x[0].toUpperCase() + x.slice(1))(new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })); };
    const icon = { acceso: I.user, factura: I.doc, albaran: I.truck, invitacion: I.send, pedido: I.box };

    shell('panel/actividad', `
      <div class="head"><div><h1>Actividad</h1><p>Qué hacen tus clientes cuando entran y qué documentos llegan desde Mercagestion.</p></div>
        <span class="range">Últimos 30 días</span></div>

      <div class="stats">
        <div class="stat stat--brand"><span>Clientes activos</span><strong>${activos.size} <small class="of">de ${cs.length}</small></strong><small>han entrado en los últimos 30 días</small></div>
        <div class="stat"><span>Documentos descargados</span><strong>${descargas}</strong><small>facturas y albaranes</small></div>
        <div class="stat"><span>Llamadas y emails ahorrados</span><strong>≈ ${Math.round(descargas * .6)}</strong><small>copias que ya no te piden (estimación)</small></div>
        <div class="stat"><span>Documentos recibidos hoy</span><strong>${recibidosHoy.length}</strong><small>desde Mercagestion</small></div>
      </div>

      <div class="act-grid">
        <div class="act-main">
          <section class="card" aria-labelledby="h-chart">
            <div class="card__head"><h3 id="h-chart">Uso del área de clientes</h3><span class="sub">Entradas y descargas por día · últimas 2 semanas</span></div>
            <div class="chart" role="img" aria-label="Entradas y descargas por día en las últimas dos semanas: ${dias.map(x => x.n).join(', ')}">
              ${dias.map(x => `<div class="chart__col${x.d === hoyISO ? ' is-today' : ''}"><span class="chart__v">${x.n || ''}</span><span class="chart__bar" style="height:${Math.max(4, x.n / max * 100)}%"></span><span class="chart__d">${new Date(x.d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase()}</span></div>`).join('')}
            </div>
          </section>

          <section class="card" aria-labelledby="h-feed">
            <div class="card__head"><h3 id="h-feed">Movimientos</h3></div>
            <div class="toolbar">
              <div class="chips" role="group" aria-label="Tipo de movimiento">
                ${[['todo', 'Todo'], ['acceso', 'Accesos'], ['descarga', 'Descargas'], ['invitacion', 'Invitaciones']].map(([k, l], i) => `<button type="button" class="chip" data-f="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}
              </div>
              <select id="f-cli" aria-label="Filtrar por cliente"><option value="">Todos los clientes</option>${cs.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('')}</select>
            </div>
            <div id="feed"></div>
          </section>
        </div>

        <aside class="act-side">
          <section class="card" aria-labelledby="h-cobro">
            <div class="card__head"><h3 id="h-cobro">Cobros pendientes</h3></div>
            <p class="card__intro">Facturas sin cobrar. Si el cliente la ha descargado, tienes constancia de que la ha recibido.</p>
            <ul class="list">${cobro.slice(0, 5).map(x => `<li><div><b>${esc(x.c.nombre)}</b><span class="sub">${x.f.numero} · vence ${fecha(x.f.vencimiento)}</span>
              <span class="seen ${x.vista ? 'is-seen' : ''}">${x.vista ? I.check + 'Descargada por el cliente' : I.eye + 'Aún no la ha descargado'}</span></div>
              <div class="side-r">${badge(x.f.estado)}<b>${eur(x.f.total)}</b></div></li>`).join('')}</ul>
            ${(() => { const v = new Set(cobro.filter(x => x.f.estado === 'Vencida').map(x => x.c.id)).size; const n = v || new Set(cobro.map(x => x.c.id)).size; return `<div class="card__foot"><button class="btn btn--ghost btn--sm" data-toast="Recordatorio de pago enviado a ${n} cliente${n === 1 ? '' : 's'}">${I.mail}${v ? 'Enviar recordatorio a los vencidos' : 'Enviar recordatorio de pago'}</button></div>`; })()}
          </section>

          <section class="card" aria-labelledby="h-inact">
            <div class="card__head"><h3 id="h-inact">Clientes que no entran</h3><span class="sub">hace más de 14 días</span></div>
            <ul class="list">${sinEntrar.length ? sinEntrar.map(c => `<li><div><b>${esc(c.nombre)}</b><span class="sub">${c.ultimo_acceso ? 'Último acceso: ' + fecha(c.ultimo_acceso) : c.email ? 'Nunca ha entrado' : 'Sin email en Mercagestion'}</span></div>
              ${c.email ? `<button class="btn btn--ghost btn--sm" data-toast="Invitación enviada a ${esc(c.nombre)}">${I.send}Invitar</button>` : `<span class="sub" style="text-align:right">Añade su email<br>en Mercagestion</span>`}</li>`).join('') : '<li><span class="sub">Todos tus clientes han entrado recientemente.</span></li>'}</ul>
          </section>

          ${autoAvisos()}
          <section class="card" aria-labelledby="h-sync">
            <div class="card__head"><h3 id="h-sync">Mercagestion</h3>${badge('Conectado')}</div>
            <div class="sync-meta"><div><span>Última recepción</span><b>Hoy, ${A.sync.find(s => s.d === hoyISO)?.h || '—'}</b></div><div><span>Incidencias</span><b>0</b></div></div>
            <ul class="list list--compact">${A.sync.slice(0, 6).map(s => `<li><div class="ev-l"><span class="ev-ico">${icon[s.tipo]}</span><div><b>${s.txt} ${s.doc}</b><span class="sub">${esc(s.c.nombre)}</span></div></div><span class="sub">${s.d === hoyISO ? '' : fecha(s.d) + ' · '}${s.h}</span></li>`).join('')}</ul>
          </section>
        </aside>
      </div>`, panelTabs, 'Equipo de ' + t.nombre, 'Administración');

    const st = { f: 'todo', c: '' };
    const draw = () => {
      const rows = A.ev.filter(e => dayDiff(e.d) < 30 && (st.f === 'todo' || (st.f === 'descarga' ? (e.tipo === 'factura' || e.tipo === 'albaran') : e.tipo === st.f)) && (!st.c || e.c.id === st.c));
      if (!rows.length) { $('#feed').innerHTML = '<p class="empty">No hay movimientos con estos filtros.</p>'; return; }
      const groups = {}; rows.forEach(e => (groups[e.d] = groups[e.d] || []).push(e));
      $('#feed').innerHTML = Object.entries(groups).slice(0, 10).map(([d, es]) => `
        <div class="feed-day"><h4>${dLabel(d)}</h4><ul class="list">${es.map(e => `<li>
          <div class="ev-l"><span class="ev-ico ev-${e.tipo}">${icon[e.tipo]}</span><div><b>${esc(e.c.nombre)}</b><span class="sub">${e.txt}${e.doc ? ` <span class="doc">${e.doc}</span>` : ''}${e.estado && e.estado !== 'Pagada' && e.tipo === 'factura' ? ' · ' + badge(e.estado) : ''}</span></div></div>
          <span class="sub ev-t">${e.h}</span></li>`).join('')}</ul></div>`).join('');
    };
    $$('.chip[data-f]').forEach(ch => ch.onclick = () => { $$('.chip[data-f]').forEach(x => x.setAttribute('aria-pressed', x === ch)); st.f = ch.dataset.f; draw(); });
    $('#f-cli').onchange = e => { st.c = e.target.value; draw(); };
    if (!app._toastBound) { app._toastBound = true; app.addEventListener('click', e => { const b = e.target.closest('[data-toast]'); if (b) toast(b.dataset.toast); }); }
    draw();
  }

  /* ---------- Fase 2: repetir pedido, pagar y avisos ---------- */
  const catalogo = () => {
    const t = T(); if (t._cat) return t._cat;
    const m = {};
    t.clientes.forEach(c => c.pedidos.forEach(p => (p.lineas || []).forEach(l => (m[l.producto] = m[l.producto] || []).push(l.precio))));
    return (t._cat = Object.entries(m).map(([producto, ps]) => ({ producto, precio: Math.round(ps.reduce((a, b) => a + b, 0) / ps.length * 100) / 100 })).sort((a, b) => a.producto.localeCompare(b.producto)));
  };
  const entregas = () => {
    const out = []; let d = new Date(D.hoy + 'T12:00');
    while (out.length < 3) { d = new Date(d.getTime() + 864e5); if (d.getDay() !== 0) out.push(d.toISOString().slice(0, 10)); }
    return out;
  };
  const diaTxt = iso => cap(new Date(iso + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));

  function nuevoPedido(base) {
    const c = C(), cat = catalogo();
    const lines = (base ? base.lineas : []).map(l => ({ producto: l.producto, kg: l.kg, precio: (cat.find(x => x.producto === l.producto) || l).precio }));
    const ent = entregas(); let entrega = ent[0];
    const body = `
      ${base ? `<p class="note">${I.box}<span>Copiado del pedido <b>${base.numero}</b> del ${fecha(base.fecha)}. Ajusta las cantidades antes de enviarlo.</span></p>` : ''}
      <section><h3 class="dr-h">Productos</h3><div id="np-lines"></div>
        <div class="np-add"><label class="sr-only" for="np-prod">Añadir producto</label><select id="np-prod"><option value="">+ Añadir producto</option>${cat.map(p => `<option>${esc(p.producto)}</option>`).join('')}</select></div></section>
      <section><h3 class="dr-h">Entrega</h3><div class="opts" role="radiogroup" aria-label="Día de entrega">${ent.map((d, i) => `<label class="opt"><input type="radio" name="ent" value="${d}"${i ? '' : ' checked'}><span><b>${diaTxt(d)}</b><small>${i === 0 ? 'Si lo envías antes de las 22:00' : 'Reparto de madrugada'}</small></span></label>`).join('')}</div></section>
      <section><h3 class="dr-h"><label for="np-obs">Observaciones</label></h3><textarea id="np-obs" rows="3" placeholder="Por ejemplo: la merluza, en piezas de 2 kg"></textarea></section>
      <div class="totals" id="np-tot"></div>
      <p class="hint">Precios orientativos: pueden variar según la lonja del día. ${esc(T().nombre)} te confirmará el pedido.</p>`;
    const { wrap, close } = drawer(base ? 'Repetir pedido' : 'Nuevo pedido', `${esc(T().nombre)} · ${esc(c.nombre)}`, body,
      `<button class="btn btn--brand" id="np-send">${I.send}Enviar pedido</button><button class="btn btn--ghost" data-close>Cancelar</button>`);
    const draw = () => {
      $('#np-lines', wrap).innerHTML = lines.length ? `<ul class="np-list">${lines.map((l, i) => `<li>
          <div class="np-p"><b>${esc(l.producto)}</b><span class="sub">${eur(l.precio)}/kg</span></div>
          <div class="qty"><button type="button" class="icon-btn" data-q="${i}:-1" aria-label="Medio kilo menos de ${esc(l.producto)}">−</button><label class="sr-only" for="q${i}">Kilos de ${esc(l.producto)}</label><input id="q${i}" inputmode="decimal" value="${String(l.kg).replace('.', ',')}" data-k="${i}"><span aria-hidden="true">kg</span><button type="button" class="icon-btn" data-q="${i}:1" aria-label="Medio kilo más de ${esc(l.producto)}">+</button></div>
          <b class="amt">${eur(l.kg * l.precio)}</b>
          <button type="button" class="icon-btn np-rm" data-rm="${i}" aria-label="Quitar ${esc(l.producto)}">${I.x}</button></li>`).join('')}</ul>`
        : '<p class="muted">Añade los productos que necesitas.</p>';
      const b = lines.reduce((s, l) => s + l.kg * l.precio, 0);
      $('#np-tot', wrap).innerHTML = `<div><span>Base imponible</span><span>${eur(b)}</span></div><div><span>IVA 10 %</span><span>${eur(b * .1)}</span></div><div class="t"><span>Total estimado</span><span>${eur(b * 1.1)}</span></div>`;
      $('#np-send', wrap).disabled = !lines.length;
    };
    wrap.addEventListener('click', e => {
      const q = e.target.closest('[data-q]'); if (q) { const [i, d] = q.dataset.q.split(':').map(Number); lines[i].kg = Math.max(.5, Math.round((lines[i].kg + d * .5) * 10) / 10); draw(); $(`#q${i}`, wrap).focus(); }
      const r = e.target.closest('[data-rm]'); if (r) { const p = lines[+r.dataset.rm].producto; lines.splice(+r.dataset.rm, 1); draw(); say(p + ' quitado'); }
    });
    wrap.addEventListener('change', e => {
      const k = e.target.closest('[data-k]'); if (k) { const v = parseFloat(k.value.replace(',', '.')); lines[+k.dataset.k].kg = isNaN(v) || v <= 0 ? .5 : Math.round(v * 10) / 10; draw(); }
      if (e.target.id === 'np-prod' && e.target.value) {
        const p = cat.find(x => x.producto === e.target.value); const ex = lines.find(l => l.producto === p.producto);
        ex ? ex.kg += 1 : lines.push({ producto: p.producto, kg: 2, precio: p.precio });
        e.target.value = ''; draw(); say(p.producto + ' añadido');
      }
      if (e.target.name === 'ent') entrega = e.target.value;
    });
    $('#np-send', wrap).onclick = () => {
      const n = 'P-' + (Math.max(...c.pedidos.map(p => +p.numero.slice(2))) + 1);
      const ls = lines.map(l => ({ producto: l.producto, kg: l.kg, precio: l.precio, importe: Math.round(l.kg * l.precio * 100) / 100 }));
      const b = Math.round(ls.reduce((s, l) => s + l.importe, 0) * 100) / 100;
      c.pedidos.unshift({ numero: n, fecha: D.hoy, entrega, obs: $('#np-obs', wrap).value.trim(), estado: 'Pendiente de servir', lineas: ls, base: b, iva: Math.round(b * 10) / 100, total: Math.round(b * 110) / 100, albaran: null, factura: null });
      close();
      toast(`Pedido ${n} enviado. Entrega: ${diaTxt(entrega).toLowerCase()}.`);
      if (location.hash.startsWith('#/pedidos')) route(); else location.hash = '#/pedidos';
    };
    draw();
  }

  function pagar(nums) {
    const c = C();
    const pend = c.facturas.filter(f => f.estado !== 'Pagada').sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
    if (!pend.length) { toast('No tienes facturas pendientes.'); return; }
    const sel = new Set(nums && nums.length ? nums : pend.map(f => f.numero));
    let metodo = 'tarjeta';
    const body = `
      <section><h3 class="dr-h">Facturas a pagar</h3><ul class="list list--flat">${pend.map(f => `<li>
        <label class="pick"><input type="checkbox" class="check" value="${f.numero}"${sel.has(f.numero) ? ' checked' : ''}><span><b>${f.numero}</b><span class="sub">${vencTxt(f)}</span></span></label>
        <div class="row-r">${badge(f.estado)}<b class="amt">${eur(f.total)}</b></div></li>`).join('')}</ul></section>
      <section><h3 class="dr-h">Forma de pago</h3><div class="opts" role="radiogroup" aria-label="Forma de pago">
        <label class="opt"><input type="radio" name="met" value="tarjeta" checked><span><b>Tarjeta</b><small>Visa o Mastercard, en la pasarela segura del banco</small></span></label>
        <label class="opt"><input type="radio" name="met" value="bizum"><span><b>Bizum</b><small>Lo confirmas desde la app de tu banco</small></span></label>
        <label class="opt"><input type="radio" name="met" value="transferencia"><span><b>Transferencia</b><small>Tarda uno o dos días en llegar</small></span></label>
      </div><div id="pay-extra"></div></section>
      <p class="secure">${I.lock}${esc(T().nombre)} nunca ve los datos de tu tarjeta.</p>`;
    const { wrap } = drawer('Pagar facturas', `${esc(T().nombre)} · ${esc(c.nombre)}`, body, `<button class="btn btn--brand" id="pay-go"></button><button class="btn btn--ghost" data-close>Cancelar</button>`);
    const total = () => pend.filter(f => sel.has(f.numero)).reduce((s, f) => s + f.total, 0);
    const sync = () => {
      const go = $('#pay-go', wrap); go.disabled = !sel.size;
      go.innerHTML = metodo === 'transferencia' ? `${I.check}Ya he hecho la transferencia` : `${I.lock}Pagar ${eur(total())}`;
      $('#pay-extra', wrap).innerHTML = metodo === 'transferencia' ? `<div style="margin-top:1rem">${payBox([...sel].join(', ') || 'Nº de factura')}</div>` : '';
    };
    wrap.addEventListener('change', e => {
      if (e.target.matches('.pick input')) { e.target.checked ? sel.add(e.target.value) : sel.delete(e.target.value); sync(); }
      if (e.target.name === 'met') { metodo = e.target.value; sync(); }
    });
    $('#pay-go', wrap).onclick = () => {
      const tot = total(), pagadas = [...sel];
      const panel = $('.drawer__panel', wrap);
      if (metodo === 'transferencia') {
        $('.drawer__body', panel).innerHTML = `<div class="paying ok"><span class="ok-ico">${I.clock}</span><h3>Gracias, lo tenemos en cuenta</h3><p>Marcaremos ${plural(pagadas.length, 'la factura', 'las facturas')} como ${pagadas.length === 1 ? 'pagada' : 'pagadas'} en cuanto llegue la transferencia de <b>${eur(tot)}</b>.</p></div>`;
        $('.drawer__foot', panel).innerHTML = `<button class="btn btn--brand" data-close>Hecho</button>`; $('[data-close]', panel).focus(); return;
      }
      $('.drawer__body', panel).innerHTML = `<div class="paying"><span class="spin" aria-hidden="true"></span><h3>${metodo === 'bizum' ? 'Confirma el pago en la app de tu banco' : 'Conectando con la pasarela segura del banco'}</h3><p class="muted">Demostración: no se realiza ningún cargo.</p></div>`;
      $('.drawer__foot', panel).innerHTML = '';
      say('Procesando el pago');
      setTimeout(() => {
        pend.filter(f => sel.has(f.numero)).forEach(f => { f.estado = 'Pagada'; });
        $('.drawer__body', panel).innerHTML = `<div class="paying ok"><span class="ok-ico">${I.check}</span><h3>Pago recibido</h3><p><b>${eur(tot)}</b> · ${pagadas.join(', ')}</p><p class="muted">Te hemos enviado el justificante por email y ${esc(T().nombre)} ya lo ve en su panel.</p></div>`;
        $('.drawer__foot', panel).innerHTML = `<button class="btn btn--brand" data-close>Hecho</button>`;
        $('[data-close]', panel).focus(); say('Pago recibido');
        wrap.addEventListener('click', e => { if (e.target.closest('[data-close]')) setTimeout(route, 280); });
      }, 1800);
    };
    sync();
  }

  const AVISOS = [['factura', 'Hay una factura nueva'], ['vence', 'Una factura vence en 3 días'], ['servido', 'Mi pedido está servido'], ['albaran', 'Hay un albarán nuevo']];
  function avisosCard() {
    const cfg = store.get('avisos-' + tenantKey, { factura: ['email', 'wa'], vence: ['wa'], servido: ['wa'], albaran: [] });
    return `<section class="card" aria-labelledby="h-av"><div class="card__head"><h3 id="h-av">Avisos</h3><span class="sub">Para no tener que entrar a mirar</span></div>
      <form id="f-av"><table class="avisos"><thead><tr><th scope="col">Avísame cuando…</th><th scope="col" class="c">Email</th><th scope="col" class="c">WhatsApp</th></tr></thead><tbody>
      ${AVISOS.map(([k, l]) => `<tr><th scope="row">${l}</th>${['email', 'wa'].map(ch => `<td class="c"><label class="sw"><input type="checkbox" name="${k}" value="${ch}"${(cfg[k] || []).includes(ch) ? ' checked' : ''}><span class="sr-only">${l}: ${ch === 'wa' ? 'WhatsApp' : 'email'}</span><i aria-hidden="true"></i></label></td>`).join('')}</tr>`).join('')}
      </tbody></table>
      <div class="av-foot"><div class="field"><label for="wa">Móvil para WhatsApp</label><input id="wa" type="tel" inputmode="tel" autocomplete="tel" value="${esc(store.get('wa-' + tenantKey, '600 000 100'))}"></div><button class="btn btn--dark" type="submit">Guardar avisos</button></div></form></section>`;
  }
  function bindAvisos() {
    const f = $('#f-av'); if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const cfg = {}; AVISOS.forEach(([k]) => { cfg[k] = $$(`input[name="${k}"]:checked`, f).map(i => i.value); });
      store.set('avisos-' + tenantKey, cfg); store.set('wa-' + tenantKey, $('#wa', f).value.trim());
      toast('Avisos guardados');
    });
  }
  const autoAvisos = () => `
    <section class="card" aria-labelledby="h-auto"><div class="card__head"><h3 id="h-auto">Avisos automáticos</h3></div>
      <p class="card__intro">Tus clientes los reciben por email o WhatsApp sin que tengas que hacer nada.</p>
      <ul class="list">${[['Factura nueva disponible', 42], ['Recordatorio 3 días antes de vencer', 11], ['Aviso de factura vencida', 3], ['Pedido servido', 96]].map(([l, n]) => `<li><div><b>${l}</b><span class="sub">${n} enviados este mes</span></div>
        <label class="sw"><input type="checkbox" checked data-auto="${l}"><span class="sr-only">${l}</span><i aria-hidden="true"></i></label></li>`).join('')}</ul>
    </section>`;

  document.addEventListener('click', e => {
    if (e.target.closest('[data-new]')) { nuevoPedido(null); return; }
    const r = e.target.closest('[data-repeat]'); if (r) { nuevoPedido(C().pedidos.find(p => p.numero === r.dataset.repeat)); return; }
    const p = e.target.closest('[data-pay]'); if (p) pagar(p.dataset.pay ? p.dataset.pay.split(',') : null);
  });
  document.addEventListener('change', e => { const a = e.target.closest('[data-auto]'); if (a) toast(`${a.dataset.auto}: ${a.checked ? 'activado' : 'desactivado'}`); });

  /* ---------- Rutas ---------- */
  function route() {
    applyBrand();
    $$('.drawer').forEach(d => d.remove()); document.body.style.overflow = '';
    const { path: h, q } = route_();
    if (view === 'panel') {
      if (!h.startsWith('panel/')) { location.replace('#/panel/clientes'); return; }
      ({ 'panel/clientes': panelClientes, 'panel/actividad': panelActividad }[h] || panelClientes)();
    } else if (!logged()) {
      if (h === 'codigo') loginCode(); else { if (h !== 'acceso') history.replaceState(null, '', '#/acceso'); loginEmail(); }
    } else {
      if (h.startsWith('panel/') || h === 'acceso' || h === 'codigo' || !h) { location.replace('#/inicio'); return; }
      ({ inicio, pedidos: () => listPage('pedidos', q), albaranes: () => listPage('albaranes', q), facturas: () => listPage('facturas', q), perfil }[h] || inicio)();
    }
    const m = $('#main'); if (m && document.activeElement === document.body) m.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  if (!app._toastBound) { app._toastBound = true; app.addEventListener('click', e => { const b = e.target.closest('[data-toast]'); if (b && !b.closest('.drawer')) toast(b.dataset.toast); }); }
  window.addEventListener('hashchange', route);
  route();
})();
