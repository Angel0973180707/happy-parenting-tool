// =========================
// PWA Install Button (Prompt)
// =========================
const btnInstall = document.getElementById("btnInstall");
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  // Chrome/Edge on Android will fire this
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstall) btnInstall.hidden = false;
});

if (btnInstall) {
  btnInstall.addEventListener("click", async () => {
    if (!deferredPrompt) {
      // iOS Safari / already installed / not eligible
      alert(
        "若未出現安裝視窗：\nAndroid：請用 Chrome／三星網路 開啟此頁\niPhone：請用 Safari 分享 → 加入主畫面"
      );
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.hidden = true;
    if (choice.outcome === "accepted") {
      showToast("已送出安裝");
    } else {
      showToast("已取消安裝");
    }
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

document.getElementById("btnClose")?.addEventListener("click", closeOverlay);
document.getElementById("btnClose2")?.addEventListener("click", closeOverlay);
overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

document.getElementById("btnCopyDefault")?.addEventListener("click", () => {
  const t = defaultLineEl.textContent.replace(/^「|」$/g, "");
  copyText(t);
});

let rescueTimer = null;
function stopRescue() {
  if (rescueTimer) clearTimeout(rescueTimer);
  rescueTimer = null;
  if (ring) ring.style.transform = "scale(1)";
  if (cue) cue.textContent = "按「開始急救」跟著呼吸";
  stopCountdown();
}

document.getElementById("btnStopRescue")?.addEventListener("click", () => {
  stopRescue();
  showToast("已停止急救");
});
document.getElementById("btnStop")?.addEventListener("click", () => {
  stopRescue();
  showToast("已停止");
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
    if (countBar) countBar.style.width = (secondsLeft / 60) * 100 + "%";

    if (secondsLeft === 40 && countHint)
      countHint.textContent = "你做得很好。先把聲音放慢、放低。";
    if (secondsLeft === 20 && countHint)
      countHint.textContent = "快到了。只要情緒不繼續升高，你就在回穩。";

    if (secondsLeft <= 0) {
      clearInterval(countTimer);
      countTimer = null;
      if (cue) cue.textContent = "很好，你撐過來了。現在只要陪著就好。";
      if (countHint) countHint.textContent = "收尾：先連結，再界線。等一下再談。";
    }
  }, 1000);
}

// Rescue breathing sequence
function setRing(scale, text) {
  if (!ring) return;
  ring.style.transform = `scale(${scale})`;
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
    { t: 5000, s: 1.0, txt: "腳踩地：感覺重量｜先穩住，再說" },
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
    rescueTimer = setTimeout(() => {
      i++;
      step();
    }, seq[i].t);
  };
  step();
}

document.getElementById("btnStartRescue")?.addEventListener("click", () => {
  startCountdown();
  runRescueBreath();
});

// Open rescue
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

// ---- LIB（完整可跑版）
const LIB = {
  preschool: {
    name: "幼兒",
    hint: "提醒：先安頓情緒，再引導行為。句子短、聲音柔。",
    base: {
      home: "我在。你先抱抱，我們一起呼吸兩次。",
      out: "我在你旁邊。先牽手，等我們穩一點再說。",
      night: "你很難受。我在這裡，我們先慢慢呼吸。",
    },
    tips: [
      {
        title: "我快撐不住了（先穩我自己）",
        cat: "panic",
        items: [
          {
            home: "我先呼吸兩次，等我穩一下再處理。",
            out: "我先把聲音放慢放低，等我穩一下再說。",
            night: "我需要先穩住，我會回來陪你。",
          },
          {
            home: "我先停一下，等一下我們再說。",
            out: "先停一下，我們等一下再處理。",
            night: "我先穩一下，等一下回來抱你。",
          },
        ],
      },
      {
        title: "孩子哭（先接住）",
        cat: "cry",
        items: [
          {
            home: "你很難受。我在。我們先抱抱，再說。",
            out: "我在你旁邊。先牽手，等你穩一點。",
            night: "我在。我不急，我陪你慢慢穩。",
          },
          {
            home: "我看見你哭了。我先陪你呼吸。",
            out: "你可以哭。我在這裡陪你。",
            night: "你要我在，我就在。我們慢慢呼吸。",
          },
        ],
      },
      {
        title: "不合作/頂嘴（先回位）",
        cat: "fight",
        items: [
          {
            home: "我不跟你吵。我會帶你回安全。",
            out: "我們先停一下，等穩了再走。",
            night: "我先回到大人的位置。等穩了再談。",
          },
          {
            home: "你可以生氣，但不可以打人。我在。",
            out: "先牽手站好，等我們穩一點再說。",
            night: "我在。我們先安靜一下，等一下再處理。",
          },
        ],
      },
      {
        title: "公共/規範（先安全）",
        cat: "public",
        items: [
          {
            home: "我們先到沙發角落坐一下，我會回來處理。",
            out: "先站到旁邊，牽手，等一下再說。",
            night: "先躺好，我在。等一下再談規矩。",
          },
          {
            home: "你先在這裡等一下，我很快回來。",
            out: "先到安全的地方站著，我會陪你。",
            night: "先安靜一下，我會回來陪你。",
          },
        ],
      },
    ],
    practice: [
      {
        home: "今天練習：吸 4 吐 6 × 2，嘴巴先慢一拍。",
        out: "今天練習：把聲音放慢、放低，先說『我在』。",
        night: "今天練習：先陪孩子呼吸，再說一句短短的承諾。",
      },
      {
        home: "今天練習：腳踩地，感覺重量，先穩住再說。",
        out: "今天練習：先牽手站旁邊，停 10 秒再決定。",
        night: "今天練習：先抱抱 5 秒，再講一句界線。",
      },
    ],
  },

  elementary: {
    name: "小學",
    hint: "提醒：同理＋界線＋承諾。先讓情緒降下來再談。",
    base: {
      home: "我現在需要先穩一下，等一下我們再說。",
      out: "先停一下，我在。等我們穩一點再處理。",
      night: "我在。我先穩一下，等一下回來陪你。",
    },
    tips: [
      {
        title: "我快撐不住了（先穩住再說）",
        cat: "panic",
        items: [
          {
            home: "我先呼吸兩次，等我穩一下再處理。",
            out: "我先把聲音放慢放低，等我穩一下再說。",
            night: "我需要先穩住，等一下回來處理。",
          },
          {
            home: "我先停一下，等一下我們再說。",
            out: "先停一下，我們換到旁邊再談。",
            night: "先暫停，我不想用情緒處理，等一下再說。",
          },
        ],
      },
      {
        title: "孩子哭（先連結）",
        cat: "cry",
        items: [
          {
            home: "我看見你很難受。我在。先呼吸兩次。",
            out: "你可以難過。我在旁邊。先牽手站好。",
            night: "我在。我沒有不要你。我先穩一下再回來。",
          },
          {
            home: "你現在很不好受。我陪你慢慢穩。",
            out: "先到旁邊，我陪你。等一下再說。",
            night: "你需要我在，我就在。先慢慢呼吸。",
          },
        ],
      },
      {
        title: "頂嘴/不合作（先回大人位置）",
        cat: "fight",
        items: [
          {
            home: "我不跟你吵，我會帶你回安全。",
            out: "我先回到大人的位置。先停一下再走。",
            night: "先停一下。我會回來，我們等穩了再談。",
          },
          {
            home: "你可以生氣，但不可以用傷人的方式。先停一下。",
            out: "先站到旁邊。你在，我也在。等一下再處理。",
            night: "我在。我們先安靜一下，等一下再說。",
          },
        ],
      },
      {
        title: "公共/規範（先安全，再規矩）",
        cat: "public",
        items: [
          {
            home: "你先到安全等待位坐一下，我很快回來。",
            out: "先到旁邊站好、牽手。我會陪你，等一下再談。",
            night: "先躺好。我在。等一下再處理規矩。",
          },
          {
            home: "先喝水坐一下。我們都穩了再回來談。",
            out: "先停 10 秒，回穩後再做選擇。",
            night: "先抱枕坐一下，我會回來處理。",
          },
        ],
      },
    ],
    practice: [
      {
        home: "今天練習：吸 4 吐 6 × 2，先不講道理。",
        out: "今天練習：先停 10 秒，聲音放慢放低。",
        night: "今天練習：一句同理＋一句界線＋一句承諾。",
      },
      {
        home: "今天練習：自問『我在保護關係嗎？』再開口。",
        out: "今天練習：先站到旁邊，再決定下一句話。",
        night: "今天練習：先說『我在』，再說『等一下再談』。",
      },
    ],
  },

  teen: {
    name: "青春期",
    hint: "提醒：少說教、多界線。先降張力，才談責任。",
    base: {
      home: "我不想在高張力談。我先穩一下，等一下再說。",
      out: "我們先停一下。我在。等穩了再談。",
      night: "先暫停。我先穩一下，等一下再回來。",
    },
    tips: [
      {
        title: "我快撐不住了（先降張力）",
        cat: "panic",
        items: [
          {
            home: "我先停一下，等我穩一點再談。",
            out: "先暫停，我們換個位置再說。",
            night: "我先去穩一下，等一下回來。",
          },
          {
            home: "這件事很重要，我不想用情緒處理。等一下再談。",
            out: "我在，但先不討論。等穩了再談。",
            night: "先暫停，我需要冷靜一下。",
          },
        ],
      },
      {
        title: "冷回/頂撞（少拉扯）",
        cat: "fight",
        items: [
          {
            home: "我聽到了。先停一下，等一下再談。",
            out: "我不跟你拉扯。我在旁邊，等你穩了再說。",
            night: "先暫停。我不追問，等一下再談。",
          },
          {
            home: "我尊重你，但我也會守住界線。等一下再說。",
            out: "先回到安全的地方，我陪你。",
            night: "先休息，我們明天再談也可以。",
          },
        ],
      },
      {
        title: "情緒很大（先安全落點）",
        cat: "cry",
        items: [
          {
            home: "我看見你很不舒服。我在。先不要互相刺激。",
            out: "先到旁邊。我在這裡，等你穩一點。",
            night: "我在。我先穩一下再回來陪你。",
          },
          {
            home: "先喝水坐一下。等張力下來再談。",
            out: "先停 10 秒，呼吸兩次。",
            night: "先暫停，我不想讓事情更難。",
          },
        ],
      },
      {
        title: "公共/規範（先收束）",
        cat: "public",
        items: [
          {
            home: "先分開一下。我會回來談規範。",
            out: "先到旁邊，先安全，等一下再談。",
            night: "先暫停，我們等明天也可以。",
          },
          {
            home: "先把現場收住。回穩後再談責任。",
            out: "先離開刺激點。我在。",
            night: "先休息，明天再談比較好。",
          },
        ],
      },
    ],
    practice: [
      {
        home: "今天練習：一句『我在』＋一句『等一下再談』。",
        out: "今天練習：先換位置再對話，張力自然會降。",
        night: "今天練習：先停 10 秒，再決定要不要回應。",
      },
      {
        home: "今天練習：先守界線，不追問、不逼回應。",
        out: "今天練習：先離開刺激點，回穩後再談。",
        night: "今天練習：先讓身體放鬆，肩膀放下。",
      },
    ],
  },
};

function setAge(v) {
  localStorage.setItem(KEY_AGE, v);
  if (ageSel) ageSel.value = v;
}
function getAge() {
  return localStorage.getItem(KEY_AGE) || (ageSel ? ageSel.value : "elementary") || "elementary";
}
function setCtx(v) {
  currentCtx = v;
  localStorage.setItem(KEY_CTX, v);
  ctxBtns.forEach((b) => b.classList.toggle("active", b.dataset.ctx === v));
}
function getCtx() {
  return localStorage.getItem(KEY_CTX) || currentCtx || "home";
}

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
  if (!v) {
    showToast("請先輸入一句話");
    return;
  }
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

// Age switching
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
  const age = getAge();
  const ctx = getCtx();
  const blocks = LIB[age].tips;

  const filtered = tipFilter === "all" ? blocks : blocks.filter((b) => b.cat === tipFilter);

  if (!tipsWrap) return;
  tipsWrap.innerHTML = filtered
    .map((block, idx) => {
      const lines = block.items.map((obj) => obj[ctx]);
      return `
      <details class="faq" ${idx === 0 ? "open" : ""}>
        <summary>${block.title}</summary>

        ${lines
          .map(
            (s) => `
          <button class="chip tip" data-say="${s.replace(/"/g, "&quot;")}">照念：${s}</button>
        `
          )
          .join("")}

        <div class="ctaRow" style="margin-top:8px">
          <button class="btn primary tipRescue" data-line="${lines[0].replace(/"/g, "&quot;")}">用這句直接急救</button>
          <button class="btn ghost tipRescue" data-line="${lines[lines.length - 1].replace(/"/g, "&quot;")}">用另一句急救</button>
        </div>
      </details>
    `;
    })
    .join("");

  tipsWrap.querySelectorAll(".tipRescue").forEach((b) => {
    b.addEventListener("click", () => {
      const line = b.dataset.line?.trim();
      if (line && defaultLineEl) defaultLineEl.textContent = `「${line}」`;
      updateRescueMeta();
      openOverlay();
      startCountdown();
      runRescueBreath();
    });
  });
}

pills.forEach((p) => {
  p.addEventListener("click", () => {
    pills.forEach((x) => x.classList.remove("active"));
    p.classList.add("active");
    tipFilter = p.dataset.cat;
    renderTips();
  });
});

// ===== Practice =====
const practiceLineEl = document.getElementById("practiceLine");
const practiceStatusEl = document.getElementById("practiceStatus");
const btnNewPractice = document.getElementById("btnNewPractice");
const btnCopyPractice = document.getElementById("btnCopyPractice");
const btnDonePractice = document.getElementById("btnDonePractice");

const KEY_PRACTICE_DATE = "hp_m1_practice_date_v2";
const KEY_PRACTICE_LINE = "hp_m1_practice_line_v2";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function pickPracticeLine(force = false) {
  const age = getAge();
  const ctx = getCtx();

  if (!force) {
    const savedDate = localStorage.getItem(KEY_PRACTICE_DATE);
    const savedLine = localStorage.getItem(KEY_PRACTICE_LINE);
    if (savedDate === todayKey() && savedLine) {
      if (practiceLineEl) practiceLineEl.textContent = savedLine;
      const done = localStorage.getItem("hp_m1_practice_done_" + todayKey()) === "1";
      if (practiceStatusEl) practiceStatusEl.textContent = done ? "今日已打卡 ✅" : "今日尚未打卡";
      return;
    }
  }

  const list = LIB[age].practice.map((obj) => obj[ctx]);
  const line = list[Math.floor(Math.random() * list.length)];
  localStorage.setItem(KEY_PRACTICE_LINE, line);
  localStorage.setItem(KEY_PRACTICE_DATE, todayKey());
  if (practiceLineEl) practiceLineEl.textContent = line;
  if (practiceStatusEl) practiceStatusEl.textContent = "今日尚未打卡";
}

btnNewPractice?.addEventListener("click", () => {
  pickPracticeLine(true);
  showToast("已換一句");
});
btnCopyPractice?.addEventListener("click", () => {
  const line = (practiceLineEl?.textContent || "").trim();
  if (line) copyText(line);
});
btnDonePractice?.addEventListener("click", () => {
  localStorage.setItem("hp_m1_practice_done_" + todayKey(), "1");
  if (practiceStatusEl) practiceStatusEl.textContent = "今日已打卡 ✅";
  showToast("完成！✅");
});

// ===== Daily Quiz =====
const quizForm = document.getElementById("dailyQuiz");
const quizResult = document.getElementById("quizResult");
const quizText = document.getElementById("quizText");
const quizHistory = document.getElementById("quizHistory");
const btnQuizHistory = document.getElementById("btnQuizHistory");
const btnQuizClear = document.getElementById("btnQuizClear");
const btnGoRescue = document.getElementById("btnGoRescue");
const btnGoTips = document.getElementById("btnGoTips");

const KEY_QUIZ = "hp_m1_quiz_history_v2";

function loadQuizHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY_QUIZ) || "[]");
  } catch {
    return [];
  }
}
function saveQuizHistory(arr) {
  localStorage.setItem(KEY_QUIZ, JSON.stringify(arr.slice(0, 30)));
}

function scoreToAdvice(score) {
  if (score <= 3) {
    return {
      title: "今天先照顧你自己（先穩再說）",
      text: "建議：立刻做 60 秒急救；用安全延後語句；安排等待位。今天只要情緒不繼續升高，就是在回穩。",
    };
  }
  if (score <= 7) {
    return {
      title: "今天以「延後＋回位」為主",
      text: "建議：先回到大人位置；不在高張力談；用同理＋界線＋承諾。等穩了再談選擇。",
    };
  }
  return {
    title: "今天狀態不錯，可以做「微合作」",
    text: "建議：先肯定孩子感受，再一起選方案。清楚也溫柔。今天適合做小小合作練習。",
  };
}

quizForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(quizForm);
  const vals = ["q1", "q2", "q3", "q4", "q5"].map((k) => Number(fd.get(k)));
  const score = vals.reduce((a, b) => a + b, 0);

  const advice = scoreToAdvice(score);
  if (quizResult) quizResult.hidden = false;
  if (quizHistory) quizHistory.hidden = true;

  if (quizText) {
    quizText.innerHTML = `
      <div class="tag">分數：${score}/10</div>
      <div class="tag">年齡：${LIB[getAge()].name}</div>
      <div class="tag">情境：${CTX_NAME[getCtx()]}</div>
      <br><br>
      <strong>${advice.title}</strong><br>${advice.text}
    `;
  }

  const item = { date: todayKey(), score, age: getAge(), ctx: getCtx(), title: advice.title };
  const hist = loadQuizHistory().filter((x) => x.date !== item.date);
  hist.unshift(item);
  saveQuizHistory(hist);

  if (btnGoRescue) btnGoRescue.onclick = () => { openOverlay(); updateRescueMeta(); };
  if (btnGoTips) btnGoTips.onclick = () => { openTab("t5"); };

  showToast("已儲存今日自評");
});

btnQuizHistory?.addEventListener("click", () => {
  const hist = loadQuizHistory().slice(0, 7);
  if (quizHistory) quizHistory.hidden = false;
  if (quizResult) quizResult.hidden = true;

  if (!quizHistory) return;

  if (hist.length === 0) {
    quizHistory.innerHTML = `<div class="muted">尚無紀錄</div>`;
    return;
  }

  quizHistory.innerHTML = `
    <div style="font-weight:1000; margin-bottom:8px">最近 7 天</div>
    ${hist
      .map(
        (h) => `
      <div class="row">
        <span class="tag">${h.date}</span>
        <span class="tag">分數 ${h.score}/10</span>
        <span class="tag">${LIB[h.age]?.name || h.age}</span>
        <span class="tag">${CTX_NAME[h.ctx] || h.ctx}</span>
        <span class="muted" style="font-weight:900">${h.title}</span>
      </div>
    `
      )
      .join("")}
  `;
});

btnQuizClear?.addEventListener("click", () => {
  localStorage.removeItem(KEY_QUIZ);
  if (quizHistory) {
    quizHistory.hidden = false;
    quizHistory.innerHTML = `<div class="muted">已清除</div>`;
  }
  showToast("已清除紀錄");
});

// Close rescue (and stop)
document.getElementById("btnClose")?.addEventListener("click", () => { closeOverlay(); stopRescue(); });
document.getElementById("btnClose2")?.addEventListener("click", () => { closeOverlay(); stopRescue(); });

// ===== Init =====
(function init() {
  const savedAge = localStorage.getItem(KEY_AGE) || "elementary";
  setAge(savedAge);

  const savedCtx = localStorage.getItem(KEY_CTX) || "home";
  setCtx(savedCtx);

  updateRescueMeta();

  const userSet = localStorage.getItem(KEY_FAV);
  if (!userSet) applySuggestedRescue();

  renderTips();
  pickPracticeLine(false);
})();
