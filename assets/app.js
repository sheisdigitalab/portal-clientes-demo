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
  const eur = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
  const fecha = iso => new Date(iso + 'T12:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
  const kg = n => n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';
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
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    out: svg('<path d="M15 4h4v16h-4M10 16l4-4-4-4M14 12H4"/>'),
    check: svg('<path d="m5 12 5 5 9-10"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
    bolt: svg('<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>'),
    palette: svg('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16" cy="10" r="1.2"/><path d="M12 21a2.5 2.5 0 0 1 0-5h1.5a3 3 0 0 0 3-3"/>'),
    chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    send: svg('<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>')
  };

  /* ---------- Estado ---------- */
  // Enlaces directos para la presentación: ?m=laguna&vista=panel&entrar=1
  (() => {
    const p = new URLSearchParams(location.search);
    if (p.get('m') && D.mayoristas[p.get('m')]) store.set('tenant', p.get('m'));
    if (p.get('vista')) store.set('view', p.get('vista') === 'panel' ? 'panel' : 'cliente');
    if (p.get('entrar')) store.set('logged-' + (p.get('m') || store.get('tenant', 'laguna')), true);
  })();
  let tenantKey = store.get('tenant', 'laguna');
  if (!D.mayoristas[tenantKey]) tenantKey = 'laguna';
  let view = store.get('view', 'cliente');
  const T = () => D.mayoristas[tenantKey];
  const C = () => T().clientes[0]; // minorista de la demo
  const logged = () => store.get('logged-' + tenantKey, false);

  function applyBrand() {
    document.documentElement.style.setProperty('--brand', store.get('color-' + tenantKey, T().color));
    document.title = (view === 'panel' ? 'Panel · ' : 'Área de clientes · ') + T().nombre;
  }
  const say = t => { $('#live').textContent = t; };
  function toast(t) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.append(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2600);
  }
  const logo = (sub) => `<span class="logo"><span class="logo__mark" aria-hidden="true">${esc(T().iniciales)}</span><span class="logo__name">${esc(T().nombre)}${sub ? `<span class="logo__sub">${sub}</span>` : ''}</span></span>`;
  const pdfUrl = n => `docs/${tenantKey}-${n}.pdf`;
  const badge = e => {
    const m = { Pagada: 'b-ok', Entregado: 'b-ok', Pendiente: 'b-warn', 'En reparto': 'b-info', Preparando: 'b-info', Vencida: 'b-bad', Facturado: 'b-ok', 'Sin facturar': 'b-warn' };
    return `<span class="badge ${m[e] || 'b-info'}">${esc(e)}</span>`;
  };

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
  function loginEmail() {
    app.innerHTML = `
    <div class="login">
      <aside class="login__side">
        ${logo()}
        <div>
          <h1>Tus pedidos y facturas, siempre a mano.</h1>
          <ul>
            <li>${I.box}Sigue el estado de tus pedidos</li>
            <li>${I.truck}Consulta y descarga tus albaranes</li>
            <li>${I.doc}Descarga tus facturas en PDF cuando quieras</li>
          </ul>
        </div>
        <small>${esc(T().direccion)}</small>
      </aside>
      <main class="login__main">
        <form class="login__box" id="f-email" novalidate>
          <div><h2>Área de clientes</h2><p style="margin-top:.5rem">Escribe tu email y te enviaremos un código para entrar. Sin contraseñas.</p></div>
          <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" required value="${esc(C().email)}"></div>
          <p class="error" id="err" role="alert"></p>
          <button class="btn btn--brand btn--block" type="submit">Enviarme el código ${I.arrow}</button>
          <p class="hint">Usa el email con el que ${esc(T().nombre)} te envía las facturas. ¿No te llega? Llámanos al <b>${esc(T().telefono)}</b>.</p>
        </form>
      </main>
    </div>`;
    $('#f-email').addEventListener('submit', e => {
      e.preventDefault();
      const v = $('#email').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { $('#err').textContent = 'Revisa el email.'; $('#email').focus(); return; }
      store.set('email', v); location.hash = '#/codigo';
    });
  }

  function loginCode() {
    const email = store.get('email', C().email);
    app.innerHTML = `
    <div class="login">
      <aside class="login__side">${logo()}<div><h1>Revisa tu correo.</h1></div><small>${esc(T().direccion)}</small></aside>
      <main class="login__main">
        <form class="login__box" id="f-code" novalidate>
          <div><h2>Introduce el código</h2><p style="margin-top:.5rem">Lo hemos enviado a <b>${esc(email)}</b>. Caduca en 10 minutos.</p></div>
          <fieldset style="border:0;padding:0;margin:0"><legend class="sr-only">Código de 6 cifras</legend>
            <div class="code">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" maxlength="1" aria-label="Cifra ${i + 1}" autocomplete="${i ? 'off' : 'one-time-code'}">`).join('')}</div>
          </fieldset>
          <p class="error" id="err" role="alert"></p>
          <button class="btn btn--brand btn--block" type="submit">Entrar ${I.arrow}</button>
          <p class="hint">En esta demo el código es <b>123456</b>.</p>
          <div style="display:flex;justify-content:space-between"><button type="button" class="link-btn" id="back">Cambiar email</button><button type="button" class="link-btn" id="resend">Reenviar código</button></div>
        </form>
      </main>
    </div>`;
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
      if (ins.map(x => x.value).join('') !== '123456') { $('#err').textContent = 'El código no es correcto. En la demo es 123456.'; ins.forEach(x => x.value = ''); ins[0].focus(); return; }
      store.set('logged-' + tenantKey, true); location.hash = '#/inicio';
    });
  }

  /* ---------- Estructura del área de clientes ---------- */
  function shell(active, content, tabs, whoName, whoSub) {
    app.innerHTML = `
    <div class="shell">
      <header class="topbar"><div class="topbar__in">
        ${logo(view === 'panel' ? 'Panel de gestión' : 'Área de clientes')}
        <nav class="tabs" aria-label="Secciones">${tabs.map(([h, t, ic]) => `<a href="#/${h}"${h === active ? ' aria-current="page"' : ''}>${ic}${t}</a>`).join('')}</nav>
        <div class="who"><span class="who__avatar" aria-hidden="true">${esc(view === 'panel' ? T().iniciales : whoName.split(' ').map(w => w[0]).slice(0, 2).join(''))}</span><span class="who__name"><b>${esc(whoName)}</b><span>${esc(whoSub)}</span></span>
          ${view === 'cliente' ? `<button class="icon-btn" id="logout" aria-label="Cerrar sesión" title="Cerrar sesión">${I.out}</button>` : ''}</div>
      </div></header>
      <main class="main" id="main" tabindex="-1">${content}</main>
      <footer class="pf"><span>${esc(T().forma)} · ${esc(T().telefono)} · ${esc(T().email)}</span><span>Área de clientes conectada con Mercagestion</span></footer>
    </div>`;
    const lo = $('#logout'); if (lo) lo.onclick = () => { store.set('logged-' + tenantKey, false); location.hash = '#/acceso'; };
  }
  const clientTabs = [['inicio', 'Resumen', I.home], ['pedidos', 'Pedidos', I.box], ['albaranes', 'Albaranes', I.truck], ['facturas', 'Facturas', I.doc], ['perfil', 'Perfil', I.user]];

  function inicio() {
    const c = C(); const pend = c.facturas.filter(f => f.estado !== 'Pagada');
    const year = c.facturas.filter(f => f.fecha.startsWith('2026'));
    const activos = c.pedidos.filter(p => p.estado !== 'Entregado');
    shell('inicio', `
      <div class="head"><div><h1>Hola, ${esc(c.contacto.split(' ')[0])}</h1><p>${esc(c.nombre)} · cliente de ${esc(T().nombre)}</p></div></div>
      <div class="stats">
        <div class="stat stat--brand"><span>Pendiente de pago</span><strong>${eur(pend.reduce((s, f) => s + f.total, 0))}</strong><small>${pend.length} factura${pend.length === 1 ? '' : 's'}</small></div>
        <div class="stat"><span>Pedidos en curso</span><strong>${activos.length}</strong><small>${activos[0] ? 'Último: ' + esc(activos[0].estado.toLowerCase()) : 'Todo entregado'}</small></div>
        <div class="stat"><span>Facturado en 2026</span><strong>${eur(year.reduce((s, f) => s + f.total, 0))}</strong><small>${year.length} facturas</small></div>
        <div class="stat"><span>Albaranes este mes</span><strong>${c.albaranes.filter(a => a.fecha.startsWith('2026-09')).length}</strong><small>septiembre</small></div>
      </div>
      <div class="grid2">
        <section class="card" aria-labelledby="h-ped"><div class="card__head"><h3 id="h-ped">Últimos pedidos</h3><a href="#/pedidos">Ver todos</a></div>
          <ul class="list">${c.pedidos.slice(0, 5).map(p => `<li><div><b>${p.numero}</b><span class="sub">${fecha(p.fecha)} · ${p.lineas.length} productos</span></div><div style="display:flex;gap:1rem;align-items:center">${badge(p.estado)}<b>${eur(p.total)}</b></div></li>`).join('')}</ul>
        </section>
        <section class="card" aria-labelledby="h-fac"><div class="card__head"><h3 id="h-fac">Últimas facturas</h3><a href="#/facturas">Ver todas</a></div>
          <ul class="list">${c.facturas.slice(0, 4).map(f => `<li><div><b>${f.numero}</b><span class="sub">${fecha(f.fecha)} · ${badge(f.estado)}</span></div><div style="display:flex;gap:.75rem;align-items:center"><b>${eur(f.total)}</b><a class="icon-btn" href="${pdfUrl(f.numero)}" download aria-label="Descargar ${f.numero} en PDF">${I.down}</a></div></li>`).join('')}</ul>
        </section>
      </div>`, clientTabs, c.contacto, c.nombre);
  }

  function listPage(kind) {
    const c = C();
    const cfg = {
      pedidos: { title: 'Pedidos', desc: 'Todos tus pedidos y su estado de entrega.', rows: c.pedidos, states: ['Todos', 'Preparando', 'En reparto', 'Entregado'] },
      albaranes: { title: 'Albaranes', desc: 'Un albarán por cada entrega. Descárgalos en PDF.', rows: c.albaranes, states: ['Todos', 'Sin facturar', 'Facturado'] },
      facturas: { title: 'Facturas', desc: 'Tus facturas agrupan los albaranes de cada quincena.', rows: c.facturas, states: ['Todas', 'Pendiente', 'Vencida', 'Pagada'] }
    }[kind];
    const st = { q: '', estado: cfg.states[0], year: '2026', sel: new Set() };
    shell(kind, `
      <div class="head"><div><h1>${cfg.title}</h1><p>${cfg.desc}</p></div></div>
      <section class="card" aria-label="${cfg.title}">
        <div class="toolbar">
          <div class="search">${I.search}<input type="search" id="q" placeholder="Buscar por número${kind === 'pedidos' ? ' o producto' : ''}" aria-label="Buscar"></div>
          <select id="year" aria-label="Año"><option>2026</option><option>2025</option></select>
          <div class="chips" role="group" aria-label="Filtrar por estado">${cfg.states.map((s, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-s="${s}">${s}</button>`).join('')}</div>
        </div>
        ${kind !== 'pedidos' ? `<div class="bulk" id="bulk" hidden><span id="bulk-n"></span><button class="btn btn--sm" id="bulk-dl">${I.down}Descargar seleccionados</button></div>` : ''}
        <div id="tbl"></div>
      </section>`, clientTabs, c.contacto, c.nombre);

    const stateOf = r => kind === 'albaranes' ? (r.factura ? 'Facturado' : 'Sin facturar') : r.estado;
    const draw = () => {
      const q = st.q.toLowerCase();
      const rows = cfg.rows.filter(r => r.fecha.startsWith(st.year)
        && (st.estado === cfg.states[0] || stateOf(r) === st.estado)
        && (!q || r.numero.toLowerCase().includes(q) || (r.lineas || []).some(l => l.producto.toLowerCase().includes(q))));
      if (!rows.length) { $('#tbl').innerHTML = `<p class="empty">No hay ${kind} con estos filtros.</p>`; say('Sin resultados'); return; }
      const head = {
        pedidos: ['Pedido', 'Fecha', 'Productos', 'Estado', 'Importe'],
        albaranes: ['Albarán', 'Fecha', 'Pedido', 'Peso', 'Factura', 'Importe'],
        facturas: ['Factura', 'Fecha', 'Vencimiento', 'Albaranes', 'Estado', 'Importe']
      }[kind];
      const cells = r => ({
        pedidos: () => [`<button class="row-link" data-open="${r.numero}">${r.numero}</button>`, fecha(r.fecha), r.lineas.length + ' productos', badge(r.estado), eur(r.total)],
        albaranes: () => [`<button class="row-link" data-open="${r.numero}">${r.numero}</button>`, fecha(r.fecha), r.pedido, kg(r.kg), r.factura ? r.factura : badge('Sin facturar'), eur(r.total)],
        facturas: () => [`<button class="row-link" data-open="${r.numero}">${r.numero}</button>`, fecha(r.fecha), fecha(r.vencimiento), r.albaranes.length + ' albaranes', badge(r.estado), eur(r.total)]
      }[kind])();
      const hideM = ['Productos', 'Pedido', 'Factura', 'Vencimiento', 'Albaranes', 'Peso'];
      $('#tbl').innerHTML = `<table class="resp"><thead><tr>${kind !== 'pedidos' ? '<th class="sel"><span class="sr-only">Seleccionar</span></th>' : ''}${head.map((h, i) => `<th${i === head.length - 1 ? ' class="num"' : ''}>${h}</th>`).join('')}<th><span class="sr-only">Acciones</span></th></tr></thead>
        <tbody>${rows.map(r => `<tr>${kind !== 'pedidos' ? `<td class="sel"><input type="checkbox" class="check" data-sel="${r.numero}" aria-label="Seleccionar ${r.numero}"${st.sel.has(r.numero) ? ' checked' : ''}></td>` : ''}${cells(r).map((v, i) => `<td class="${[i === head.length - 1 ? 'num' : '', i > 0 && hideM.includes(head[i]) ? 'hide-m' : '', i === 0 ? 'first' : ''].join(' ').trim()}">${v}</td>`).join('')}
          <td class="act"><button class="icon-btn" data-open="${r.numero}" aria-label="Ver ${r.numero}">${I.eye}</button>${kind !== 'pedidos' ? `<a class="icon-btn" href="${pdfUrl(r.numero)}" download aria-label="Descargar ${r.numero} en PDF">${I.down}</a>` : ''}</td></tr>`).join('')}</tbody></table>`;
      say(rows.length + ' resultados');
    };
    const syncBulk = () => { const b = $('#bulk'); if (!b) return; b.hidden = !st.sel.size; $('#bulk-n').textContent = `${st.sel.size} seleccionado${st.sel.size === 1 ? '' : 's'}`; };
    $('#q').addEventListener('input', e => { st.q = e.target.value; draw(); });
    $('#year').addEventListener('change', e => { st.year = e.target.value; draw(); });
    $$('.chip').forEach(ch => ch.addEventListener('click', () => { $$('.chip').forEach(x => x.setAttribute('aria-pressed', x === ch)); st.estado = ch.dataset.s; draw(); }));
    $('#tbl').addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) openDoc(kind, o.dataset.open); });
    $('#tbl').addEventListener('change', e => { const s = e.target.closest('[data-sel]'); if (!s) return; s.checked ? st.sel.add(s.dataset.sel) : st.sel.delete(s.dataset.sel); syncBulk(); });
    const bd = $('#bulk-dl'); if (bd) bd.onclick = () => { [...st.sel].forEach((n, i) => setTimeout(() => { const a = document.createElement('a'); a.href = pdfUrl(n); a.download = ''; document.body.append(a); a.click(); a.remove(); }, i * 250)); toast(`Descargando ${st.sel.size} documentos`); };
    draw();
  }

  function openDoc(kind, num) {
    const c = C();
    const r = c[kind].find(x => x.numero === num);
    const lines = r.lineas || (kind === 'facturas' ? r.albaranes.flatMap(a => c.albaranes.find(x => x.numero === a)?.lineas || []) : []);
    const title = { pedidos: 'Pedido', albaranes: 'Albarán', facturas: 'Factura' }[kind];
    const meta = {
      pedidos: () => [['Fecha', fecha(r.fecha)], ['Estado', r.estado], ['Albarán', r.albaran || 'Pendiente'], ['Productos', r.lineas.length]],
      albaranes: () => [['Fecha', fecha(r.fecha)], ['Pedido', r.pedido], ['Peso total', kg(r.kg)], ['Factura', r.factura || 'Sin facturar']],
      facturas: () => [['Fecha', fecha(r.fecha)], ['Vencimiento', fecha(r.vencimiento)], ['Estado', r.estado], ['Albaranes', r.albaranes.join(', ')]]
    }[kind]();
    const steps = ['Recibido', 'Preparando', 'En reparto', 'Entregado'];
    const idx = kind === 'pedidos' ? steps.indexOf(r.estado) : -1;
    const wrap = document.createElement('div');
    wrap.className = 'drawer'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'dr-t');
    wrap.innerHTML = `<div class="drawer__panel">
      <div class="drawer__head"><div><h2 id="dr-t">${title} ${esc(r.numero)}</h2><p>${esc(T().nombre)} · ${esc(c.nombre)}</p></div><button class="icon-btn" data-close aria-label="Cerrar">${I.x}</button></div>
      <div class="drawer__body">
        ${kind !== 'albaranes' ? `<div>${badge(kind === 'pedidos' ? r.estado : r.estado)}</div>` : ''}
        <dl class="meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        ${kind === 'pedidos' ? `<ol class="timeline">${steps.map((s, i) => `<li class="${i <= Math.max(idx, 0) ? 'done' : ''}">${s}</li>`).join('')}</ol>` : ''}
        <table class="lines"><thead><tr><th>Producto</th><th class="num">Cantidad</th><th class="num">Precio</th><th class="num">Importe</th></tr></thead>
          <tbody>${lines.map(l => `<tr><td>${esc(l.producto)}</td><td class="num">${kg(l.kg)}</td><td class="num">${eur(l.precio)}/kg</td><td class="num">${eur(l.importe)}</td></tr>`).join('')}</tbody></table>
        <div class="totals"><div><span>Base imponible</span><span>${eur(r.base)}</span></div><div><span>IVA 10 %</span><span>${eur(r.iva)}</span></div><div class="t"><span>Total</span><span>${eur(r.total)}</span></div></div>
      </div>
      <div class="drawer__foot">${kind !== 'pedidos' ? `<a class="btn btn--brand" href="${pdfUrl(r.numero)}" download>${I.down}Descargar PDF</a><a class="btn btn--ghost" href="${pdfUrl(r.numero)}" target="_blank" rel="noopener">${I.eye}Ver</a>`
        : (r.albaran ? `<button class="btn btn--ghost" data-go="${r.albaran}">${I.truck}Ver albarán ${r.albaran}</button>` : `<p class="hint" style="margin:0">El albarán estará disponible cuando salga el pedido.</p>`)}</div>
    </div>`;
    const prev = document.activeElement;
    document.body.append(wrap); document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => wrap.classList.add('open'));
    wrap.querySelector('[data-close]').focus();
    const close = () => { wrap.classList.remove('open'); document.body.style.overflow = ''; setTimeout(() => wrap.remove(), 250); document.removeEventListener('keydown', onKey); prev && prev.focus(); };
    const onKey = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const f = $$('a,button', wrap); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('[data-close]')) close();
      const g = e.target.closest('[data-go]'); if (g) { close(); location.hash = '#/albaranes'; setTimeout(() => openDoc('albaranes', g.dataset.go), 300); }
    });
  }

  function perfil() {
    const c = C();
    shell('perfil', `
      <div class="head"><div><h1>Perfil</h1><p>Tus datos tal y como constan en ${esc(T().nombre)}.</p></div></div>
      <div class="grid2">
        <section class="card"><div class="card__head"><h3>Datos de facturación</h3></div>
          <ul class="list">${[['Empresa', c.nombre], ['NIF', c.nif], ['Contacto', c.contacto], ['Email de acceso', c.email]].map(([k, v]) => `<li><span class="sub" style="margin:0">${k}</span><b>${esc(v)}</b></li>`).join('')}</ul>
        </section>
        <section class="card"><div class="card__head"><h3>¿Algún dato no es correcto?</h3></div>
          <div style="padding:1.35rem;display:grid;gap:1rem"><p style="color:var(--muted)">Tus datos se actualizan desde el programa de facturación de ${esc(T().nombre)}. Si algo ha cambiado, avísanos y lo corregimos.</p>
          <a class="btn btn--ghost" href="mailto:${esc(T().email)}" style="justify-self:start">${I.mail}Escribir a ${esc(T().nombre)}</a></div>
        </section>
      </div>`, clientTabs, c.contacto, c.nombre);
  }

  /* ---------- Panel del mayorista ---------- */
  const panelTabs = [['panel/clientes', 'Clientes', I.users], ['panel/actividad', 'Actividad', I.chart], ['panel/aspecto', 'Aspecto y web', I.palette]];

  function panelClientes() {
    const cs = T().clientes;
    const withAccess = cs.filter(c => c.ultimo_acceso);
    const pend = cs.reduce((s, c) => s + c.facturas.filter(f => f.estado !== 'Pagada').reduce((a, f) => a + f.total, 0), 0);
    shell('panel/clientes', `
      <div class="head"><div><h1>Clientes</h1><p>Los clientes se crean solos desde Mercagestion. Aquí ves quién usa el área de clientes.</p></div>
        <button class="btn btn--brand" id="invite-all">${I.send}Invitar a los que no han entrado</button></div>
      <div class="stats">
        <div class="stat stat--brand"><span>Clientes</span><strong>${cs.length}</strong><small>sincronizados con Mercagestion</small></div>
        <div class="stat"><span>Han entrado alguna vez</span><strong>${withAccess.length}</strong><small>${Math.round(withAccess.length / cs.length * 100)} % del total</small></div>
        <div class="stat"><span>Descargas este mes</span><strong>${cs.reduce((s, c) => s + c.descargas, 0)}</strong><small>facturas y albaranes</small></div>
        <div class="stat"><span>Pendiente de cobro</span><strong>${eur(pend)}</strong><small>entre todos los clientes</small></div>
      </div>
      <section class="card" aria-label="Listado de clientes">
        <div class="toolbar"><div class="search">${I.search}<input type="search" id="q" placeholder="Buscar cliente o email" aria-label="Buscar cliente"></div></div>
        <div id="tbl"></div>
      </section>`, panelTabs, 'Equipo de ' + T().nombre, 'Administración');
    const draw = q => {
      const rows = cs.filter(c => !q || (c.nombre + c.email).toLowerCase().includes(q.toLowerCase()));
      $('#tbl').innerHTML = `<table class="resp"><thead><tr><th>Cliente</th><th>Email de acceso</th><th>Último acceso</th><th>Facturas pendientes</th><th class="num">Documentos</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>
        ${rows.map(c => { const p = c.facturas.filter(f => f.estado !== 'Pagada'); return `<tr>
          <td><b style="font-weight:500">${esc(c.nombre)}</b><span class="sub">${esc(c.contacto)}</span></td>
          <td data-l="Email">${c.email ? esc(c.email) : badge('Sin email en Mercagestion')}</td>
          <td data-l="Último acceso">${c.ultimo_acceso ? fecha(c.ultimo_acceso) : badge('Nunca')}</td>
          <td data-l="Pendiente">${p.length ? `${p.length} · ${eur(p.reduce((s, f) => s + f.total, 0))}` : '—'}</td>
          <td class="num" data-l="Documentos">${c.albaranes.length + c.facturas.length}</td>
          <td class="act">${c.email ? `<button class="btn btn--ghost btn--sm" data-inv="${esc(c.nombre)}">${I.send}${c.ultimo_acceso ? 'Reenviar acceso' : 'Invitar'}</button>` : ''}</td></tr>`; }).join('')}
      </tbody></table>`;
    };
    $('#q').addEventListener('input', e => draw(e.target.value)); draw('');
    $('#tbl').addEventListener('click', e => { const b = e.target.closest('[data-inv]'); if (b) toast(`Invitación enviada a ${b.dataset.inv}`); });
    $('#invite-all').onclick = () => toast(`Invitación enviada a ${cs.filter(c => c.email && !c.ultimo_acceso).length} clientes`);
  }

  function panelActividad() {
    const cs = T().clientes;
    const ev = cs.flatMap(c => c.ultimo_acceso ? [
      { f: c.ultimo_acceso, t: `${c.nombre} ha descargado ${c.facturas[0]?.numero || 'un albarán'}`, i: I.down },
      { f: c.ultimo_acceso, t: `${c.nombre} ha entrado en el área de clientes`, i: I.user }] : []).sort((a, b) => b.f.localeCompare(a.f)).slice(0, 12);
    const sync = cs[0].albaranes.slice(0, 4).map(a => ({ f: a.fecha, t: `Mercagestion ha enviado el albarán ${a.numero}`, i: I.bolt }));
    shell('panel/actividad', `
      <div class="head"><div><h1>Actividad</h1><p>Qué hacen tus clientes y qué llega desde Mercagestion.</p></div></div>
      <div class="grid2">
        <section class="card"><div class="card__head"><h3>Clientes</h3></div><ul class="list">${ev.map(e => `<li><div style="display:flex;gap:.75rem;align-items:center"><span class="icon-btn" aria-hidden="true" style="pointer-events:none">${e.i}</span><span>${esc(e.t)}</span></div><span class="sub">${fecha(e.f)}</span></li>`).join('')}</ul></section>
        <section class="card"><div class="card__head"><h3>Sincronización con Mercagestion</h3>${badge('Conectado')}</div><ul class="list">${sync.map(e => `<li><div style="display:flex;gap:.75rem;align-items:center"><span class="icon-btn" aria-hidden="true" style="pointer-events:none">${e.i}</span><span>${esc(e.t)}</span></div><span class="sub">${fecha(e.f)}</span></li>`).join('')}</ul></section>
      </div>`, panelTabs, 'Equipo de ' + T().nombre, 'Administración');
  }

  function panelAspecto() {
    const colors = ['#0e6e8c', '#b4442e', '#1f5f8b', '#2f6b3a', '#6b3fa0', '#141c28'];
    const cur = store.get('color-' + tenantKey, T().color);
    shell('panel/aspecto', `
      <div class="head"><div><h1>Aspecto y web</h1><p>Tu área de clientes con tu marca, dentro de tu web.</p></div></div>
      <section class="card"><div class="card__head"><h3>Marca</h3></div>
        <div class="brandbox">
          <div style="display:grid;gap:1.25rem;align-content:start">
            <div class="field"><label>Logo</label><div style="display:flex;gap:1rem;align-items:center">${logo()}<button class="btn btn--ghost btn--sm" type="button" id="up">Cambiar logo</button></div></div>
            <div class="field"><span style="font-size:var(--fs-6);font-weight:500;color:var(--ink)">Color principal</span><div class="swatches" role="group" aria-label="Color principal">${colors.map(c => `<button type="button" style="background:${c}" data-c="${c}" aria-label="Color ${c}" aria-pressed="${c === cur}"></button>`).join('')}</div></div>
            <div class="field"><label for="dom">Dirección del área de clientes</label><input id="dom" value="${esc(T().dominio)}" readonly></div>
          </div>
          <div><p style="font-size:var(--fs-6);color:var(--muted);margin-bottom:.5rem">Vista previa</p><div class="preview"><div class="preview__top">${logo()}</div><div class="preview__body"><div class="preview__line" style="width:60%"></div><div class="preview__line"></div><div class="preview__line" style="width:80%"></div><span class="btn btn--brand btn--sm" style="justify-self:start">Descargar PDF</span></div></div></div>
        </div>
      </section>
      <section class="card"><div class="card__head"><h3>Añadirlo a tu web</h3></div>
        <div style="padding:1.35rem;display:grid;gap:1rem">
          <p style="color:var(--muted)">Pon este botón en el menú de tu web. Funciona en WordPress, Wix o cualquier otra.</p>
          <div class="embed">&lt;a href="https://${esc(T().dominio)}"&gt;Área de clientes&lt;/a&gt;</div>
          <button class="btn btn--ghost btn--sm" id="copy" style="justify-self:start">Copiar código</button>
        </div>
      </section>`, panelTabs, 'Equipo de ' + T().nombre, 'Administración');
    $$('.swatches button').forEach(b => b.onclick = () => { store.set('color-' + tenantKey, b.dataset.c); applyBrand(); $$('.swatches button').forEach(x => x.setAttribute('aria-pressed', x === b)); say('Color actualizado'); });
    $('#up').onclick = () => toast('En la versión final podrás subir tu logo.');
    $('#copy').onclick = async () => { try { await navigator.clipboard.writeText(`<a href="https://${T().dominio}">Área de clientes</a>`); toast('Código copiado'); } catch { toast('Selecciona el código y cópialo'); } };
  }

  /* ---------- Rutas ---------- */
  function route() {
    applyBrand();
    const h = location.hash.replace(/^#\//, '') || '';
    if (view === 'panel') {
      if (!h.startsWith('panel/')) { location.replace('#/panel/clientes'); return; }
      ({ 'panel/clientes': panelClientes, 'panel/actividad': panelActividad, 'panel/aspecto': panelAspecto }[h] || panelClientes)();
    } else if (!logged()) {
      if (h === 'codigo') loginCode(); else { if (h !== 'acceso') history.replaceState(null, '', '#/acceso'); loginEmail(); }
    } else {
      if (h.startsWith('panel/') || h === 'acceso' || h === 'codigo' || !h) { location.replace('#/inicio'); return; }
      ({ inicio, pedidos: () => listPage('pedidos'), albaranes: () => listPage('albaranes'), facturas: () => listPage('facturas'), perfil }[h] || inicio)();
    }
    const m = $('#main'); if (m && document.activeElement === document.body) m.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
