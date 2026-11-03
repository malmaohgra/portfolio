/*!
 * Maram · Portfolio — behavior
 * Plain JavaScript, no dependencies. Loaded with `defer`, so the DOM is ready.
 *
 *  1. CONFIG ........ contact links (the only part you normally edit)
 *  2. Links & email . fill links from CONFIG, copy-email button
 *  3. Theme ......... light / dark toggle, remembered per browser
 *  4. Router ........ #dictionary and #inpocket open as their own views
 *  5. Mini search ... typing demo on the dictionary card
 *  6. Butterfly ..... canvas particle swarm in the hero
 */
"use strict";

/* ---------- 1. CONFIG ----------
 * Leave a value empty ("") and its button shows as "Link coming soon". */
const CONFIG = {
  email:    "malmaohgra@gmail.com",
  linkedin: "https://www.linkedin.com/in/malmaohgra",   // e.g. "https://www.linkedin.com/in/malmaohgra"
  github:   "https://github.com/malmaohgra",   // e.g. "https://github.com/malmaohgra"
  blog:     "https://blog.maramalmaohgra.com"    // live blog URL (or its repo)
};

const root = document.documentElement;
const $ = id => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 2. Links & email ---------- */

/** Point a link at `url` (new tab), or disable it when the URL is empty. */
function setLink(el, url){
  if(!el) return;
  if(url){
    el.href = url; el.target = "_blank"; el.rel = "noopener";
    el.removeAttribute("aria-disabled");
  } else {
    el.removeAttribute("href"); el.setAttribute("aria-disabled", "true"); el.title = "Link coming soon";
  }
}

const emailEl = $("email");
emailEl.textContent = CONFIG.email;
emailEl.href = "mailto:" + CONFIG.email;
setLink($("liLink"), CONFIG.linkedin);
setLink($("ghLink"), CONFIG.github);
setLink($("blogLink"), CONFIG.blog);

/** Copy the email; if the clipboard is blocked, select the address so it can be copied by hand. */
async function copyEmail(btn){
  btn.dataset.label ??= btn.innerHTML;          // keep the original label across rapid clicks
  clearTimeout(btn._reset);
  try{
    await navigator.clipboard.writeText(CONFIG.email);
    btn.textContent = "Copied";
  } catch {
    const range = document.createRange(), sel = getSelection();
    range.selectNodeContents(emailEl); sel.removeAllRanges(); sel.addRange(range);
    emailEl.scrollIntoView({ block:"center" });
    btn.textContent = "Selected";
  }
  btn._reset = setTimeout(() => { btn.innerHTML = btn.dataset.label; }, 1600);
}
["copyBtn", "heroCopy"].forEach(id => $(id).addEventListener("click", e => copyEmail(e.currentTarget)));

/* ---------- 3. Theme ----------
 * The saved choice is applied in <head> before paint; this only handles the toggle. */
$("themeBtn").addEventListener("click", () => {
  const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try{ localStorage.setItem("theme", next); }catch{ /* storage blocked: toggle still works for this visit */ }
});

/* ---------- 4. Router ----------
 * A case-study hash shows that article and hides home; any other hash shows home
 * and scrolls to the matching section. */
const CASES = ["dictionary", "inpocket"];
const HOME_TITLE = document.title;

function route(){
  const id = decodeURIComponent(location.hash.slice(1));
  const isCase = CASES.includes(id);
  $("home").hidden = isCase;
  CASES.forEach(c => { $(c).hidden = c !== id; });

  if(isCase){
    const h1 = $(id).querySelector("h1");
    document.title = h1.textContent + " · Maram Almaohgra";
    window.scrollTo({ top:0, behavior:"instant" });
    h1.focus({ preventScroll:true });            // screen readers start at the new view
    return;
  }
  document.title = HOME_TITLE;
  const target = id && $(id);
  if(target) requestAnimationFrame(() => target.scrollIntoView());
}
addEventListener("hashchange", route);
route();

/* ---------- 5. Mini search (dictionary card) ----------
 * Types a meaning, then reveals the word. Pauses off-screen and in background tabs. */
(function miniSearch(){
  const ITEMS = [
    { q:"شخص لا يأتيه النوم في الليل", w:"أَرِق" },
    { q:"آخر الليل قُبيل الفجر",        w:"السَّحَر" },
    { q:"مطر ينزل بعد انقطاع طويل",     w:"الغَيْث" },
    { q:"ريح خفيفة لطيفة",              w:"النَّسِيم" }
  ];
  const q = $("mq"), w = $("mw"), hit = $("mhit");
  q.textContent = ITEMS[0].q; w.textContent = ITEMS[0].w;
  if(reduceMotion) return;

  let i = 0, visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hit);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  (async () => {
    await wait(2600);
    for(;;){
      if(!visible || document.hidden){ await wait(500); continue; }
      i = (i + 1) % ITEMS.length;
      hit.classList.add("off"); await wait(300);
      const text = ITEMS[i].q;
      for(let k = 1; k <= text.length; k++){ q.textContent = text.slice(0, k); await wait(55); }
      await wait(350);
      w.textContent = ITEMS[i].w; hit.classList.remove("off");
      await wait(2400);
    }
  })();
})();

/* ---------- 6. Butterfly swarm ----------
 * A butterfly is drawn off-screen and sampled into points. Each point springs toward
 * its spot (wings gently flap), is pushed away by the pointer, and scatters on click.
 * The loop stops when the canvas is off-screen or the tab is hidden. */
(function butterfly(){
  const cv = $("swarm"), ctx = cv.getContext("2d");
  const LAYERS = ["edge", "blue", "teal", "fg"];  // draw order, back to front
  const REPEL_R2 = 70 * 70;                       // pointer influence radius, squared

  let W = 0, H = 0, colors = {}, start = performance.now();
  let running = false, visible = false, placed = false;
  const mouse = { x:-1e4, y:-1e4 };

  /** Sample the butterfly silhouette into normalized points (-1..1), tagged by color layer. */
  function buildShape(){
    const S = 400, off = document.createElement("canvas");
    off.width = off.height = S;
    const o = off.getContext("2d", { willReadFrequently:true });
    o.fillStyle = "#000";
    [1, -1].forEach(dir => {                      // right wing, then mirrored left wing
      o.save(); o.translate(200, 0); o.scale(dir, 1);
      o.beginPath(); o.moveTo(6,195);             // fore wing
      o.bezierCurveTo(40,120,110,40,178,36); o.bezierCurveTo(194,62,188,122,172,162);
      o.bezierCurveTo(130,192,60,206,6,214); o.closePath(); o.fill();
      o.beginPath(); o.moveTo(6,216);             // hind wing with tail
      o.bezierCurveTo(72,206,152,216,162,252); o.bezierCurveTo(168,292,132,330,98,346);
      o.bezierCurveTo(94,368,86,384,74,390); o.bezierCurveTo(70,372,72,356,60,346);
      o.bezierCurveTo(34,320,14,272,6,234); o.closePath(); o.fill();
      o.restore();
    });
    const alpha = o.getImageData(0, 0, S, S).data, out = [];
    for(let y = 0; y < S; y += 5){
      for(let x = 0; x < S; x += 5){
        const jx = x + Math.random()*4, jy = y + Math.random()*4;
        if(!alpha[((jy|0)*S + (jx|0))*4 + 3]) continue;
        const nx = (jx - 200)/200, ny = (jy - 214)/200;
        const d = Math.hypot(nx*1.1, ny) + (Math.random() - .5)*.09;  // teal near the body, dark at the edge
        out.push({ nx, ny, c: d < .2 ? "teal" : d < .6 ? "blue" : "edge", s: 1.4 + Math.random()*1.4 });
      }
    }
    for(let i = 0; i < 60; i++) out.push({ nx:(Math.random() - .5)*.03, ny:-.16 + i/60*.5, c:"fg", s:1.8 });  // body
    for(let i = 0; i < 26; i++){                                                                           // antennae
      const t = i/26;
      [1, -1].forEach(d => out.push({ nx:d*(.02 + t*.18), ny:-.18 - t*.32 + t*t*.1, c:"fg", s:1.1 }));
    }
    return out;
  }

  const pts = buildShape().map(p => ({ ...p, x:0, y:0, vx:0, vy:0, tx:0, ty:0 }));
  const groups = LAYERS.map(key => ({ key, pts: pts.filter(p => p.c === key) }));  // grouped once: one fillStyle per layer

  function readColors(){
    const cs = getComputedStyle(root);
    LAYERS.forEach(k => { colors[k] = cs.getPropertyValue("--" + k).trim(); });
  }

  function setTarget(p, t){
    const size = Math.min(W, H)*.98, flap = reduceMotion ? 1 : .86 + .14*Math.cos(t*1.7);
    p.tx = W/2 + p.nx*size/2*flap;
    p.ty = H/2 + p.ny*size/2;
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    for(const g of groups){
      ctx.fillStyle = colors[g.key];
      for(const p of g.pts) ctx.fillRect(p.x - p.s/2, p.y - p.s/2, p.s, p.s);
    }
  }

  function resize(){
    const r = cv.getBoundingClientRect();
    if(!r.width) return;                          // hidden (a case study is open)
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height || r.width;
    cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for(const p of pts){
      setTarget(p, 0);
      if(!placed && !reduceMotion){               // first layout: start loosely scattered
        const a = Math.random()*Math.PI*2, rr = Math.random()*Math.min(W, H)*.3;
        p.x = p.tx + Math.cos(a)*rr; p.y = p.ty + Math.sin(a)*rr;
      } else if(reduceMotion){ p.x = p.tx; p.y = p.ty; }
    }
    placed = true;
    draw();
  }

  function tick(now){
    if(!visible || document.hidden){ running = false; return; }
    const t = (now - start)/1000, pull = Math.min(1, Math.max(0, (t - .2)/1.2));
    for(const p of pts){
      setTarget(p, t);
      p.vx += (p.tx - p.x)*.03*pull + (Math.random() - .5)*.12*(1.2 - pull);
      p.vy += (p.ty - p.y)*.03*pull + (Math.random() - .5)*.12*(1.2 - pull);
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx*dx + dy*dy;
      if(d2 < REPEL_R2){
        const f = (1 - d2/REPEL_R2)*2.2, d = Math.sqrt(d2) || 1;
        p.vx += dx/d*f; p.vy += dy/d*f;
      }
      p.vx *= .86; p.vy *= .86; p.x += p.vx; p.y += p.vy;
    }
    draw();
    requestAnimationFrame(tick);
  }

  function wake(){
    if(running || reduceMotion || !visible || document.hidden) return;
    running = true; requestAnimationFrame(tick);
  }

  cv.addEventListener("pointermove", e => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  cv.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });
  cv.addEventListener("click", () => {
    if(reduceMotion) return;
    for(const p of pts){
      const a = Math.random()*Math.PI*2, v = 6 + Math.random()*10;
      p.vx += Math.cos(a)*v; p.vy += Math.sin(a)*v;
    }
    start = performance.now() - 200;            // re-run the gather-in
  });

  const onTheme = () => { readColors(); draw(); };
  readColors();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onTheme);
  new MutationObserver(onTheme).observe(root, { attributes:true, attributeFilter:["data-theme"] });
  new ResizeObserver(resize).observe(cv);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake(); }).observe(cv);
  document.addEventListener("visibilitychange", wake);
})();
