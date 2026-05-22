// ── BENKU'S CUSHION VISUALIZER ENGINE ────────────────────────────────

const DEFS = [
  { id: 'c1', label: 'Terracotta Round' },
  { id: 'c2', label: 'Purple Pleated' },
  { id: 'c3', label: 'Gold Swirl' },
  { id: 'c4', label: 'Orange Puffed' },
  { id: 'c5', label: 'Peach Pleated' },
  { id: 'c6', label: 'Brown Rect' },
  { id: 'c7', label: 'Rust Bolster' },
  { id: 'c8', label: 'Taupe Bolster' }
];

const SWATCHES = [
  { c: '601', h: '#d6cfc4' }, { c: '602', h: '#c9c2b2' }, { c: '603', h: '#bdb6a6' }, { c: '604', h: '#b3a898' },
  { c: '605', h: '#c8ceb5' }, { c: '606', h: '#b8bfa0' }, { c: '607', h: '#a8b090' }, { c: '608', h: '#939c7c' },
  { c: '609', h: '#7a836a' }, { c: '610', h: '#2f4a6e' }, { c: '611', h: '#3a5a80' }, { c: '612', h: '#4a6a90' },
  { c: '613', h: '#5a7a9f' }, { c: '614', h: '#c8b830' }, { c: '615', h: '#e8d835' }, { c: '616', h: '#f0e040' },
  { c: '617', h: '#8fae60' }, { c: '618', h: '#6e9050' }, { c: '619', h: '#5c8040' }, { c: '620', h: '#1a7080' },
  { c: '621', h: '#1560a0' }, { c: '622', h: '#2060b0' }, { c: '623', h: '#2870c0' }, { c: '624', h: '#3880d0' },
  { c: '625', h: '#4890e0' }, { c: '626', h: '#5098e8' }, { c: '627', h: '#d4c8b8' }, { c: '628', h: '#c0b0a0' },
  { c: '629', h: '#a89488' }, { c: '630', h: '#8c1a28' }, { c: '631', h: '#a02030' }, { c: '632', h: '#c03040' },
  { c: '633', h: '#d04050' }, { c: '634', h: '#c06828' }, { c: '635', h: '#d07830' }, { c: '636', h: '#c0902c' },
  { c: '637', h: '#d0a030' }, { c: '638', h: '#b86418' }, { c: '639', h: '#c87420' }, { c: '640', h: '#e08430' },
  { c: '641', h: '#a06858' }, { c: '642', h: '#c08070' }, { c: '643', h: '#c8b4a0' }, { c: '644', h: '#5c3828' },
  { c: '645', h: '#7a4c38' }, { c: '646', h: '#926050' }, { c: '647', h: '#a87060' }, { c: '648', h: '#603040' },
  { c: '649', h: '#803858' }, { c: '650', h: '#a04870' }, { c: '651', h: '#482038' }, { c: '652', h: '#602848' },
  { c: '653', h: '#7c3860' }, { c: '654', h: '#6a5828' }, { c: '655', h: '#7a6830' }, { c: '656', h: '#3a3018' },
  { c: '657', h: '#585020' }, { c: '658', h: '#484020' }, { c: '659', h: '#383018' }
];

document.addEventListener("DOMContentLoaded", function () {
  // Check if Visualizer DOM elements exist (only on pages carrying the visualizer layout)
  const canvas = document.getElementById('cv');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const cImgs = {};
  const tintCache = {};

  // State
  let bgImg = null;
  let placed = [];
  let selUid = null;
  let uidSeq = 0;
  let dragging = false;
  let dragOX = 0;
  let dragOY = 0;
  let cW = 800;
  let cH = 500;

  // ── PRELOAD IMAGES ───────────────────────────────────────────────────
  Object.entries(IMGS).forEach(([id, src]) => {
    const img = new Image();
    img.src = src;
    cImgs[id] = img;
  });

  // ── TINT FUNCTION ────────────────────────────────────────────────────
  function tint(defId, hex) {
    const key = defId + '_' + hex;
    if (tintCache[key]) return tintCache[key];
    const s = cImgs[defId];
    const ow = s.naturalWidth || 400;
    const oh = s.naturalHeight || 400;
    const off = document.createElement('canvas');
    off.width = ow;
    off.height = oh;
    const oc = off.getContext('2d');
    oc.drawImage(s, 0, 0, ow, oh);
    const id = oc.getImageData(0, 0, ow, oh);
    const d = id.data;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 8) continue;
      const lum = 0.299 * d[i] / 255 + 0.587 * d[i + 1] / 255 + 0.114 * d[i + 2] / 255;
      d[i] = Math.min(255, Math.round(lum * r * 1.65 + d[i] * 0.3));
      d[i + 1] = Math.min(255, Math.round(lum * g * 1.65 + d[i + 1] * 0.3));
      d[i + 2] = Math.min(255, Math.round(lum * b * 1.65 + d[i + 2] * 0.3));
    }
    oc.putImageData(id, 0, 0);
    tintCache[key] = off;
    return off;
  }

  // ── DRAW/RENDER FUNCTIONS ────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, cW, cH);
    if (bgImg) ctx.drawImage(bgImg, 0, 0, cW, cH);
    placed.forEach(c => {
      if (c.uid === selUid) return;
      drawOne(c, false);
    });
    const sel = placed.find(p => p.uid === selUid);
    if (sel) drawOne(sel, true);
  }

  function drawOne(c, selected) {
    const img = cImgs[c.defId];
    if (!img || !img.naturalWidth) return;
    const asp = img.naturalWidth / img.naturalHeight;
    const dW = c.size;
    const dH = c.size / asp;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot * Math.PI / 180);
    ctx.globalAlpha = c.opacity;
    ctx.drawImage(c.tint ? tint(c.defId, c.tint) : img, -dW / 2, -dH / 2, dW, dH);
    ctx.globalAlpha = 1;
    if (selected) {
      ctx.strokeStyle = 'rgba(242,160,176,0.95)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(-dW / 2 - 6, -dH / 2 - 6, dW + 12, dH + 12);
      ctx.setLineDash([]);
      [[-dW / 2 - 6, -dH / 2 - 6], [dW / 2 + 6, -dH / 2 - 6], [dW / 2 + 6, dH / 2 + 6], [-dW / 2 - 6, dH / 2 + 6]].forEach(([hx, hy]) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f2a0b0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  // ── ADD CUSHION ───────────────────────────────────────────────────────
  window.addCushion = function (defId) {
    if (!bgImg) {
      alert('Please upload your photo first!');
      return;
    }
    const uid = ++uidSeq;
    const n = placed.length;
    const cols = 3;
    const col = n % cols;
    const row = Math.floor(n / cols);
    const marginX = Math.round(cW * 0.18);
    const marginY = Math.round(cH * 0.22);
    const gapX = Math.round((cW - marginX * 2) / (cols - 1));
    const gapY = Math.round(cH * 0.38);
    const jx = ((n * 73) % 50) - 25;
    const jy = ((n * 37) % 40) - 20;
    const x = marginX + col * gapX + jx;
    const y = marginY + row * gapY + jy;
    placed.push({ uid, defId, x, y, size: 160, rot: 0, opacity: 1, tint: null });
    addListItem(uid);
    selectCushion(uid);
    document.getElementById('countPill').textContent = placed.length;
    render();
    status('✓ Added ' + DEFS.find(d => d.id === defId).label + ' — drag it to position!');
  };

  // ── PLACED LIST ────────────────────────────────────────────────────────
  function addListItem(uid) {
    document.getElementById('emsg').style.display = 'none';
    const c = placed.find(p => p.uid === uid);
    const def = DEFS.find(d => d.id === c.defId);
    const div = document.createElement('div');
    div.className = 'pi sel';
    div.id = 'pi' + uid;
    div.dataset.uid = uid;
    div.innerHTML =
      `<img class="pi-thumb" src="${IMGS[c.defId]}"/>` +
      `<div style="flex:1;min-width:0"><div class="pi-name">${def.label}</div><div class="pi-sub">tap to select</div></div>` +
      `<div class="pi-dot" id="dot${uid}" style="background:${c.tint || '#f2c2d0'}"></div>` +
      `<button class="pi-del" title="Remove">✕</button>`;
    div.addEventListener('click', e => {
      if (!e.target.classList.contains('pi-del')) selectCushion(+div.dataset.uid);
    });
    div.querySelector('.pi-del').addEventListener('click', e => {
      e.stopPropagation();
      removeCushion(+div.dataset.uid);
    });
    document.getElementById('plist').appendChild(div);
  }

  function removeCushion(uid) {
    placed = placed.filter(p => p.uid !== uid);
    const el = document.getElementById('pi' + uid);
    if (el) el.remove();
    if (selUid === uid) {
      selUid = placed.length ? placed[placed.length - 1].uid : null;
      if (selUid) selectCushion(selUid);
      else {
        document.getElementById('nsm').style.display = 'block';
        document.getElementById('adjBox').style.display = 'none';
      }
    }
    if (!placed.length) document.getElementById('emsg').style.display = 'block';
    document.getElementById('countPill').textContent = placed.length;
    render();
    status('Cushion removed');
  }

  // ── SELECT ────────────────────────────────────────────────────────────
  function selectCushion(uid) {
    selUid = uid;
    document.querySelectorAll('.pi').forEach(el => el.classList.toggle('sel', +el.dataset.uid === uid));
    const c = placed.find(p => p.uid === uid);
    if (!c) return;
    document.getElementById('sz').value = c.size;
    document.getElementById('rot').value = c.rot;
    document.getElementById('opa').value = Math.round(c.opacity * 100);
    document.getElementById('szv').textContent = c.size + 'px';
    document.getElementById('rotv').textContent = c.rot + '°';
    document.getElementById('opav').textContent = Math.round(c.opacity * 100) + '%';
    document.querySelectorAll('.sw').forEach(s => s.classList.remove('on'));
    document.getElementById('nocol').classList.toggle('on', !c.tint);
    if (c.tint) {
      const sw = document.querySelector(`.sw[data-hex="${c.tint}"]`);
      if (sw) sw.classList.add('on');
    }
    document.getElementById('nsm').style.display = 'none';
    document.getElementById('adjBox').style.display = 'block';
    render();
  }

  // ── COLOUR ────────────────────────────────────────────────────────────
  function applyColour(hex, swEl) {
    const c = placed.find(p => p.uid === selUid);
    if (!c) return;
    c.tint = hex;
    document.querySelectorAll('.sw').forEach(s => s.classList.remove('on'));
    document.getElementById('nocol').classList.toggle('on', !hex);
    if (swEl) swEl.classList.add('on');
    const dot = document.getElementById('dot' + selUid);
    if (dot) dot.style.background = hex || '#f2c2d0';
    render();
  }

  // ── BUILD PICKER CARDS ────────────────────────────────────────────────
  const cgrid = document.getElementById('cgrid');
  DEFS.forEach(def => {
    const card = document.createElement('div');
    card.className = 'ccard';
    card.title = 'Click to add ' + def.label;
    card.innerHTML = `<img src="${IMGS[def.id]}" alt="${def.label}"/><div class="clabel">${def.label}</div><div class="cadd">+</div>`;
    card.addEventListener('click', () => window.addCushion(def.id));
    cgrid.appendChild(card);
  });

  // ── BUILD SWATCHES ────────────────────────────────────────────────────
  const swgrid = document.getElementById('swgrid');
  SWATCHES.forEach(s => {
    const sw = document.createElement('div');
    sw.className = 'sw';
    sw.style.background = s.h;
    sw.title = s.c;
    sw.dataset.hex = s.h;
    sw.addEventListener('click', () => applyColour(s.h, sw));
    swgrid.appendChild(sw);
  });
  document.getElementById('nocol').addEventListener('click', () => applyColour(null, null));

  // ── SLIDERS EVENT LISTENERS ───────────────────────────────────────────
  document.getElementById('sz').addEventListener('input', e => {
    const c = placed.find(p => p.uid === selUid);
    if (!c) return;
    c.size = +e.target.value;
    document.getElementById('szv').textContent = c.size + 'px';
    render();
  });
  document.getElementById('rot').addEventListener('input', e => {
    const c = placed.find(p => p.uid === selUid);
    if (!c) return;
    c.rot = +e.target.value;
    document.getElementById('rotv').textContent = c.rot + '°';
    render();
  });
  document.getElementById('opa').addEventListener('input', e => {
    const c = placed.find(p => p.uid === selUid);
    if (!c) return;
    c.opacity = +e.target.value / 100;
    document.getElementById('opav').textContent = e.target.value + '%';
    render();
  });

  // ── UPLOAD ────────────────────────────────────────────────────────────
  function loadPhoto(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = ev => {
      const img = new Image();
      img.onload = () => {
        bgImg = img;
        let w = img.width, h = img.height;
        if (w > 1100) {
          h = Math.round(h * 1100 / w);
          w = 1100;
        }
        if (h > 720) {
          w = Math.round(w * 720 / h);
          h = 720;
        }
        cW = w;
        cH = h;
        canvas.width = w;
        canvas.height = h;
        document.getElementById('ec').style.display = 'none';
        canvas.style.display = 'block';
        document.getElementById('sb').style.display = 'flex';
        render();
        status('Photo loaded! Click a cushion design to place it.');
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(file);
  }
  document.getElementById('bgfile').addEventListener('change', e => loadPhoto(e.target.files[0]));
  const upzone = document.getElementById('upzone');
  ['dragover', 'dragenter'].forEach(ev => upzone.addEventListener(ev, e => {
    e.preventDefault();
    upzone.style.background = '#fce8ed';
  }));
  upzone.addEventListener('dragleave', () => upzone.style.background = '');
  upzone.addEventListener('drop', e => {
    e.preventDefault();
    upzone.style.background = '';
    loadPhoto(e.dataTransfer.files[0]);
  });

  // ── CANVAS INTERACTION ────────────────────────────────────────────────
  function pos(e) {
    const r = canvas.getBoundingClientRect(), sx = cW / r.width, sy = cH / r.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
  }

  function hit(px, py, c) {
    const img = cImgs[c.defId];
    if (!img) return false;
    const asp = (img.naturalWidth / img.naturalHeight) || 1;
    const hw = c.size / 2 + 18, hh = (c.size / asp) / 2 + 18;
    const a = -c.rot * Math.PI / 180, dx = px - c.x, dy = py - c.y;
    const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
    return Math.abs(rx) < hw && Math.abs(ry) < hh;
  }

  function pick(px, py) {
    for (let i = placed.length - 1; i >= 0; i--) {
      if (hit(px, py, placed[i])) return placed[i];
    }
    return null;
  }

  canvas.addEventListener('mousedown', e => {
    const p = pos(e), h = pick(p.x, p.y);
    if (h) {
      if (h.uid !== selUid) selectCushion(h.uid);
      dragging = true;
      dragOX = p.x - h.x;
      dragOY = p.y - h.y;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });
  canvas.addEventListener('mousemove', e => {
    const p = pos(e);
    if (dragging) {
      const c = placed.find(q => q.uid === selUid);
      if (c) {
        c.x = p.x - dragOX;
        c.y = p.y - dragOY;
        render();
      }
    } else {
      canvas.style.cursor = pick(p.x, p.y) ? 'grab' : 'crosshair';
    }
  });
  canvas.addEventListener('mouseup', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });
  canvas.addEventListener('mouseleave', () => {
    dragging = false;
  });
  canvas.addEventListener('click', e => {
    if (dragging) return;
    const p = pos(e);
    if (!pick(p.x, p.y)) {
      const c = placed.find(q => q.uid === selUid);
      if (c) {
        c.x = p.x;
        c.y = p.y;
        render();
      }
    }
  });

  // ── TOUCH SUPPORT: single-finger drag + two-finger pinch-to-resize ────
  let pinching = false;
  let pinchStartDist = 0;
  let pinchStartSize = 0;

  function getTouchDist(e) {
    const t = e.touches;
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const c = placed.find(q => q.uid === selUid);
      if (c) {
        pinching = true;
        dragging = false;
        pinchStartDist = getTouchDist(e);
        pinchStartSize = c.size;
      }
      return;
    }
    pinching = false;
    const p = pos(e), h = pick(p.x, p.y);
    if (h) {
      if (h.uid !== selUid) selectCushion(h.uid);
      dragging = true;
      dragOX = p.x - h.x;
      dragOY = p.y - h.y;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 2 && pinching) {
      const c = placed.find(q => q.uid === selUid);
      if (!c) return;
      const dist = getTouchDist(e);
      const ratio = dist / pinchStartDist;
      const newSize = Math.round(Math.min(600, Math.max(40, pinchStartSize * ratio)));
      c.size = newSize;
      const szEl = document.getElementById('sz');
      if (szEl) {
        szEl.value = newSize;
        document.getElementById('szv').textContent = newSize + 'px';
      }
      render();
      return;
    }
    if (dragging && e.touches.length === 1) {
      const p = pos(e);
      const c = placed.find(q => q.uid === selUid);
      if (c) {
        c.x = p.x - dragOX;
        c.y = p.y - dragOY;
        render();
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    if (e.touches.length < 2) pinching = false;
    if (e.touches.length === 0) dragging = false;
  });

  // ── TOOLBAR BUTTONS ────────────────────────────────────────────────────
  document.getElementById('btnDup').addEventListener('click', () => {
    const c = placed.find(p => p.uid === selUid);
    if (!c) {
      alert('Select a cushion first.');
      return;
    }
    const uid = ++uidSeq;
    placed.push({ uid, defId: c.defId, x: c.x + 40, y: c.y + 40, size: c.size, rot: c.rot, opacity: c.opacity, tint: c.tint });
    addListItem(uid);
    selectCushion(uid);
    document.getElementById('countPill').textContent = placed.length;
    render();
    status('Duplicated!');
  });
  document.getElementById('btnFwd').addEventListener('click', () => {
    const idx = placed.findIndex(p => p.uid === selUid);
    if (idx < 0 || idx === placed.length - 1) return;
    [placed[idx], placed[idx + 1]] = [placed[idx + 1], placed[idx]];
    render();
    status('Moved forward');
  });
  document.getElementById('btnBk').addEventListener('click', () => {
    const idx = placed.findIndex(p => p.uid === selUid);
    if (idx <= 0) return;
    [placed[idx], placed[idx - 1]] = [placed[idx - 1], placed[idx]];
    render();
    status('Moved backward');
  });
  document.getElementById('btnRem').addEventListener('click', () => {
    if (!selUid) {
      alert('Select a cushion first.');
      return;
    }
    removeCushion(selUid);
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    if (!placed.length) return;
    if (!confirm('Remove all ' + placed.length + ' cushion(s)?')) return;
    placed = [];
    selUid = null;
    document.querySelectorAll('.pi').forEach(el => el.remove());
    document.getElementById('emsg').style.display = 'block';
    document.getElementById('nsm').style.display = 'block';
    document.getElementById('adjBox').style.display = 'none';
    document.getElementById('countPill').textContent = 0;
    render();
    status('All cleared');
  });
  document.getElementById('btnDl').addEventListener('click', () => {
    if (!bgImg) {
      alert('Upload your photo first!');
      return;
    }
    const tmp = document.createElement('canvas');
    tmp.width = cW;
    tmp.height = cH;
    const tc = tmp.getContext('2d');
    tc.drawImage(bgImg, 0, 0, cW, cH);
    placed.forEach(c => {
      const img = cImgs[c.defId];
      if (!img || !img.naturalWidth) return;
      const asp = img.naturalWidth / img.naturalHeight;
      const dW = c.size, dH = c.size / asp;
      tc.save();
      tc.translate(c.x, c.y);
      tc.rotate(c.rot * Math.PI / 180);
      tc.globalAlpha = c.opacity;
      tc.drawImage(c.tint ? tint(c.defId, c.tint) : img, -dW / 2, -dH / 2, dW, dH);
      tc.restore();
    });
    tc.save();
    tc.font = 'bold 14px Georgia,serif';
    tc.fillStyle = 'rgba(255,255,255,0.65)';
    tc.textAlign = 'right';
    tc.fillText("✨ Benku's Home Bliss Studio", tmp.width - 10, tmp.height - 10);
    tc.restore();
    const a = document.createElement('a');
    a.download = 'benku-cushion-preview.jpg';
    a.href = tmp.toDataURL('image/jpeg', 0.93);
    a.click();
    status('Downloaded! 🎉');
  });

  // ── KEYBOARD SHORTCUTS ─────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (document.activeElement.tagName === 'INPUT') return;
    const c = placed.find(p => p.uid === selUid);
    if (!c) return;
    const step = e.shiftKey ? 12 : 3;
    if (e.key === 'ArrowLeft') {
      c.x -= step;
      render();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
      c.x += step;
      render();
      e.preventDefault();
    }
    if (e.key === 'ArrowUp') {
      c.y -= step;
      render();
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      c.y += step;
      render();
      e.preventDefault();
    }
    if (e.key === '+' || e.key === '=') {
      c.size = Math.min(600, c.size + 10);
      document.getElementById('sz').value = c.size;
      document.getElementById('szv').textContent = c.size + 'px';
      render();
    }
    if (e.key === '-') {
      c.size = Math.max(40, c.size - 10);
      document.getElementById('sz').value = c.size;
      document.getElementById('szv').textContent = c.size + 'px';
      render();
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      removeCushion(c.uid);
      e.preventDefault();
    }
    if (e.key === 'd' || e.key === 'D') {
      document.getElementById('btnDup').click();
    }
  });

  // ── STATUS BAR ─────────────────────────────────────────────────────────
  let stTimer = null;
  function status(msg) {
    document.getElementById('sb').style.display = 'flex';
    document.getElementById('stxt').textContent = msg;
    clearTimeout(stTimer);
    stTimer = setTimeout(() => {
      document.getElementById('stxt').textContent = placed.length + ' cushion(s) on canvas';
    }, 3000);
  }
});
