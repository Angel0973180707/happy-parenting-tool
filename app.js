// =========================
// PWA Install Button (Prompt)
// =========================
const btnInstall = document.getElementById("btnInstall");
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstall) btnInstall.hidden = false;
});

if (btnInstall) {
  btnInstall.addEventListener("click", async () => {
    if (!deferredPrompt) {
      alert("若未出現安裝視窗：\nAndroid：請用 Chrome／三星網路開啟此頁 → 加入主畫面\niPhone：請用 Safari → 分享 → 加入主畫面");
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.hidden = true;
    showToast(choice.outcome === "accepted" ? "已送出安裝" : "已取消安裝");
  });
}

window.addEventListener("appinstalled", () => {
  if (btnInstall) btnInstall.hidden = true;
  showToast("安裝完成 ✅");
});

// ===== Tabs =====
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function openTab(id) {
  tabs.forEach((t) => {
    const active = t.dataset.tab === id;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });
  panels.forEach((p) => p.classList.toggle("active", p.id === id));
}

tabs.forEach((t) => t.addEventListener("click", () => openTab(t.dataset.tab)));
document.querySelectorAll("[data-jump]").forEach((btn) => {
  btn.addEventListener("click", () => openTab(btn.dataset.jump));
});

// ===== Toast =====
const toast = document.getElementById("toast");
let toastTimer = null;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}

// ===== Clipboard =====
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("已複製");
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("已複製");
  }
}

// =========================
// ✅ 內建資料庫 LIB（不再依賴外部變數）
// =========================
const LIB = {
  preschool: {
    name: "幼兒",
    hint: "提醒：先連結＋短句＋抱抱的安全感",
    base: {
      home: "我在，我先抱你一下，我們一起呼吸兩次。",
      out: "我在你旁邊，我們先停一下，慢慢吐氣。",
      night: "你很難受，我在，我們先安靜呼吸。"
    },
    practice: [
      { home: "我先放慢聲音，先抱抱再說。", out: "我先蹲下來，看著你。", night: "我先把燈光放柔，慢慢說。" }
    ],
    tips: [
      {
        cat: "cry",
        title: "孩子哭（先抱回安全）",
        items: [
          { home: "我在，我先抱你一下。", out: "我抱著你，慢慢吐氣。", night: "我陪你，先呼吸兩次。" },
          { home: "你可以哭，我在這裡。", out: "你不舒服我知道，我在。", night: "我不急，我陪你。" }
        ]
      },
      {
        cat: "panic",
        title: "我快撐不住（先讓情緒不升高）",
        items: [
          { home: "我先深呼吸兩次，等一下再處理。", out: "我先穩一下，我們先停。", night: "我先安靜一下，我在。" }
        ]
      }
    ]
  },

  elementary: {
    name: "小學",
    hint: "提醒：同理＋界線＋承諾（先穩住，再說）",
    base: {
      home: "我現在需要先穩一下，等一下我們再說。",
      out: "我先停一下、穩住，再處理。",
      night: "我在，我先穩一下，等一下回來。"
    },
    practice: [
      { home: "我先呼吸 4/6 兩輪，再開口。", out: "我先把聲音放慢放低。", night: "我先不講道理，只陪你穩住。" },
      { home: "我先回到大人的位置。", out: "我先停一下，等我穩好。", night: "我在，我不走開。" }
    ],
    tips: [
      {
        cat: "fight",
        title: "頂嘴/不合作（先回位）",
        items: [
          { home: "我不跟你吵，我會帶你回安全。", out: "我先停一下，我們換個方式說。", night: "這件事重要，我們等一下再談。" },
          { home: "我先回到大人的位置。", out: "我先穩住，我們再處理。", night: "我在，我先穩一下。" }
        ]
      },
      {
        cat: "panic",
        title: "我快爆了（先讓情緒不升高）",
        items: [
          { home: "我先呼吸兩次，我會回來處理。", out: "我先停一下，等我穩好。", night: "我先安靜一下，等一下再談。" }
        ]
      },
      {
        cat: "public",
        title: "公共/規範（先落地）",
        items: [
          { home: "先停一下，我們先把自己穩住。", out: "現在先做到一件事：站旁邊、慢慢吐氣。", night: "先休息，明天再處理。" }
        ]
      }
    ]
  },

  teen: {
    name: "青春期",
    hint: "提醒：尊重＋不對抗＋延後談（關係不斷線）",
    base: {
      home: "我先穩一下，我會回來談，但不是現在。",
      out: "我不跟你硬碰，我先停一下。",
      night: "我在，我先不逼你說，等你準備好。"
    },
    practice: [
      { home: "我先不反擊，先穩住自己。", out: "我先把話收短，先停一下。", night: "我先不追問，只留一句：我在。" }
    ],
    tips: [
      {
        cat: "fight",
        title: "頂嘴/衝突（不對抗）",
        items: [
          { home: "我聽到你的不爽，我先停一下，等一下再談。", out: "我不在這裡吵，我們換個時間。", night: "我先不逼你說，我在。" }
        ]
      },
      {
        cat: "panic",
        title: "我快爆了（先讓情緒不升高）",
        items: [
          { home: "我先離開 30 秒讓自己穩住，等一下回來。", out: "我先停一下，不在這裡升高。", night: "我先安靜一下，等一下再說。" }
        ]
      }
    ]
  }
};

// ===== Overlay + Rescue =====
const overlay = document.getElementById("overlay");
const ring = document.getElementById("ring");
const cue = document.getElementById("cue");
const defaultLineEl = document.getElementById("defaultLine");
const tipHint = document.getElementById("tipHint");
const rescueMeta = document.getElementById("rescueMeta");

function openOverlay() {
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
}
function closeOverlay() {
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
}

document.getElementById("btnClose")?.addEventListener("click", () => { closeOverlay(); stopRescue(); });
document.getElementById("btnClose2")?.addEventListener("click", () => { closeOverlay(); stopRescue(); });
overlay?.addEventListener("click", (e) => { if (e.target === overlay) { closeOverlay(); stopRescue(); } });

document.getElementById("btnCopyDefault")?.addEventListener("click", () => {
  const t = defaultLineEl.textContent.replace(/^「|」$/g, "");
  copyText(t);
});

// ===== 60s Countdown =====
const countNum = document.getElementById("countNum");
const countBar = document.getElementById("countBar");
const countHint = document.getElementById("countHint");
let countTimer = null;
let secondsLeft = 60;

function stopCountdown() {
  if (countTimer) clearInterval(countTimer);
  countTimer = null;
  secondsLeft = 60;
  if (countNum) countNum.textContent = "60";
  if (countBar) countBar.style.width = "100%";
  if (countHint) countHint.textContent = "現在只要撐完這 1 分鐘。先不要講道理。";
}

function startCountdown() {
  stopCountdown();
  secondsLeft = 60;
  if (countNum) countNum.textContent = secondsLeft;
  if (countBar) countBar.style.width = "100%";

  countTimer = setInterval(() => {
    secondsLeft--;
    if (countNum) countNum.textContent = secondsLeft;
    if (countBar) countBar.style.width = (secondsLeft / 60 * 100) + "%";

    if (secondsLeft === 40 && countHint) countHint.textContent = "你做得很好。先把聲音放慢、放低。";
    if (secondsLeft === 20 && countHint) countHint.textContent = "快到了。只要情緒不繼續升高，你就做對了。";

    if (secondsLeft <= 0) {
      clearInterval(countTimer);
      countTimer = null;
      if (cue) cue.textContent = "很好，你撐過來了。現在只要陪著就好。";
      if (countHint) countHint.textContent = "收尾：先連結，再界線。等一下再談。";
    }
  }, 1000);
}

// Rescue breathing sequence
let rescueTimer = null;
function stopRescue() {
  if (rescueTimer) clearTimeout(rescueTimer);
  rescueTimer = null;
  if (ring) ring.style.transform = "scale(1)";
  if (cue) cue.textContent = "按「開始急救」跟著呼吸";
  stopCountdown();
}

document.getElementById("btnStopRescue")?.addEventListener("click", () => { stopRescue(); showToast("已停止急救"); });
document.getElementById("btnStop")?.addEventListener("click", () => { stopRescue(); showToast("已停止"); });

function setRing(scale, text) {
  if (ring) ring.style.transform = `scale(${scale})`;
  if (cue) cue.textContent = text;
}

function runRescueBreath() {
  if (rescueTimer) clearTimeout(rescueTimer);
  rescueTimer = null;

  const seq = [
    { t: 4000, s: 1.18, txt: "吸氣 4 秒（鼻吸）" },
    { t: 6000, s: 0.92, txt: "吐氣 6 秒（慢慢吐）" },
    { t: 4000, s: 1.18, txt: "吸氣 4 秒（再一次）" },
    { t: 6000, s: 0.92, txt: "吐氣 6 秒（慢慢吐）" },
    { t: 5000, s: 1.00, txt: "腳踩地：感覺重量｜先穩住，再說" }
  ];

  let i = 0;
  const step = () => {
    if (i >= seq.length) {
      if (ring) ring.style.transform = "scale(1)";
      if (cue) cue.textContent = "很好。現在照念上面的那一句。";
      rescueTimer = null;
      return;
    }
    setRing(seq[i].s, seq[i].txt);
    rescueTimer = setTimeout(() => { i++; step(); }, seq[i].t);
  };
  step();
}

document.getElementById("btnStartRescue")?.addEventListener("click", () => {
  startCountdown();
  runRescueBreath();
});

document.getElementById("btnOpenRescue")?.addEventListener("click", () => {
  openOverlay();
  updateRescueMeta();
});

// ===== Age + Context Segmentation =====
const KEY_AGE = "hp_m1_age_group_v2";
const KEY_CTX = "hp_m1_context_v2";
const ageSel = document.getElementById("ageGroup");
const ctxBtns = document.querySelectorAll(".ctx");

let currentCtx = localStorage.getItem(KEY_CTX) || "home";
const CTX_NAME = { home: "家裡", out: "外出", night: "睡前" };

function setAge(v) { localStorage.setItem(KEY_AGE, v); if (ageSel) ageSel.value = v; }
function getAge() { return localStorage.getItem(KEY_AGE) || (ageSel ? ageSel.value : "elementary") || "elementary"; }
function setCtx(v) {
  currentCtx = v;
  localStorage.setItem(KEY_CTX, v);
  ctxBtns.forEach((b) => b.classList.toggle("active", b.dataset.ctx === v));
}
function getCtx() { return localStorage.getItem(KEY_CTX) || currentCtx || "home"; }

function updateRescueMeta() {
  const age = getAge();
  const ctx = getCtx();
  if (rescueMeta) rescueMeta.textContent = `年齡：${LIB[age].name}｜情境：${CTX_NAME[ctx]}`;
  if (tipHint) tipHint.textContent = LIB[age].hint;
}

// ===== Default Rescue Line (customizable) =====
const KEY_FAV = "hp_m1_fav_line_v2";
const favInput = document.getElementById("favLine");

function suggestedRescue() {
  const age = getAge();
  const ctx = getCtx();
  return LIB[age].base[ctx];
}
function applySuggestedRescue() {
  if (defaultLineEl) defaultLineEl.textContent = `「${suggestedRescue()}」`;
  updateRescueMeta();
}
function loadFav() {
  const userSet = localStorage.getItem(KEY_FAV);
  if (userSet) {
    if (defaultLineEl) defaultLineEl.textContent = userSet;
    if (favInput) favInput.value = userSet.replace(/^「|」$/g, "");
  } else {
    if (favInput) favInput.value = "";
    applySuggestedRescue();
  }
  updateRescueMeta();
}
loadFav();

document.getElementById("saveFav")?.addEventListener("click", () => {
  const v = (favInput?.value || "").trim();
  if (!v) { showToast("請先輸入一句話"); return; }
  localStorage.setItem(KEY_FAV, `「${v}」`);
  loadFav();
  showToast("已儲存預設句");
});
document.getElementById("resetFav")?.addEventListener("click", () => {
  localStorage.removeItem(KEY_FAV);
  loadFav();
  showToast("已恢復建議句");
});

// ===== Context switching =====
ctxBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    setCtx(btn.dataset.ctx);
    const userSet = localStorage.getItem(KEY_FAV);
    if (!userSet) applySuggestedRescue();
    renderTips();
    pickPracticeLine(true);
    updateRescueMeta();
    showToast("已切換情境");
  });
});

ageSel?.addEventListener("change", () => {
  setAge(ageSel.value);
  const userSet = localStorage.getItem(KEY_FAV);
  if (!userSet) applySuggestedRescue();
  renderTips();
  pickPracticeLine(true);
  updateRescueMeta();
  showToast("已切換年齡");
});

// ===== Chips (global): copy + set rescue line =====
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  const line = btn.dataset.say?.trim();
  if (!line) return;
  if (defaultLineEl) defaultLineEl.textContent = `「${line}」`;
  updateRescueMeta();
  await copyText(line);
});

// ===== Tips rendering (age × ctx) =====
const tipsWrap = document.getElementById("tipsWrap");
const pills = document.querySelectorAll(".pill");
let tipFilter = "all";

function renderTips() {
  if (!tipsWrap) return;
  const age = getAge();
  const ctx = getCtx();
  const blocks = LIB[age].tips;

  const filtered = tipFilter === "all" ? blocks : blocks.filter((b) => b.cat === tipFilter);

  tipsWrap.innerHTML = filtered.map((block, idx) => {
    const lines = block.items.map((obj) => obj[ctx]);
    return `
      <details class="faq" ${idx === 0 ? "open" : ""}>
        <summary>${block.title}</summary>
        ${lines.map((s) => `
          <button class="chip tip" data-say="${s.replace(/"/g, "&quot;")}">照念：${s}</button>
        `).join("")}
        <div class="ctaRow" style="margin-top:8px">
          <button class="btn primary tipRescue" data-line="${lines[0].replace(/"/g, "&quot;")}">用這句直接急救</button>
          <button class="btn ghost tipRescue" data-line="${lines[lines.length - 1].replace(/"/g, "&quot;")}">用另一句急救</button>
        </div>
      </details>
    `;
  }).join("");

  tipsWrap.querySelectorAll(".tipRescue").forEach((b) => {
    b.addEventListener("click", () => {
      const line = b.dataset.line?.trim();
      if (line && defaultLineEl) defaultLineEl.textContent = `「${line}」`;
      updateRescue
