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
      alert("若未出現安裝視窗：\nAndroid：請用 Chrome／三星網路開啟此頁\niPhone：請用 Safari 分享 → 加入主畫面");
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.hidden = true;
    if (choice.outcome === "accepted") showToast("已送出安裝");
    else showToast("已取消安裝");
  });
}

window.addEventListener("appinstalled", () => {
  if (btnInstall) btnInstall.hidden = true;
  showToast("安裝完成 ✅");
});

// =========================
// Install Hint Modal (方案 B)
// =========================
const installOverlay = document.getElementById("installOverlay");
const btnInstallHint = document.getElementById("btnInstallHint");
const btnInstallClose = document.getElementById("btnInstallClose");
const btnInstallClose2 = document.getElementById("btnInstallClose2");
const btnInstallCopyLink = document.getElementById("btnInstallCopyLink");

function openInstallOverlay(){
  if(!installOverlay) return;
  installOverlay.classList.add("show");
  installOverlay.setAttribute("aria-hidden","false");
}
function closeInstallOverlay(){
  if(!installOverlay) return;
  installOverlay.classList.remove("show");
  installOverlay.setAttribute("aria-hidden","true");
}

btnInstallHint?.addEventListener("click", openInstallOverlay);
btnInstallClose?.addEventListener("click", closeInstallOverlay);
btnInstallClose2?.addEventListener("click", closeInstallOverlay);
installOverlay?.addEventListener("click", (e)=>{ if(e.target === installOverlay) closeInstallOverlay(); });

btnInstallCopyLink?.addEventListener("click", async ()=>{
  await copyText(location.href);
});

// ===== Tabs =====
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function openTab(id){
  tabs.forEach(t=>{
    const active = t.dataset.tab === id;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });
  panels.forEach(p => p.classList.toggle("active", p.id === id));
}

tabs.forEach(t => t.addEventListener("click", () => openTab(t.dataset.tab)));
document.querySelectorAll("[data-jump]").forEach(btn=>{
  btn.addEventListener("click", ()=> openTab(btn.dataset.jump));
});

// ===== Toast =====
const toast = document.getElementById("toast");
let toastTimer = null;
function showToast(msg){
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove("show"), 1400);
}

// ===== Clipboard =====
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("已複製");
  }catch(e){
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy");
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

function openOverlay(){
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden","false");
}
function closeOverlay(){
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden","true");
}

document.getElementById("btnClose").addEventListener("click", closeOverlay);
document.getElementById("btnClose2").addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e)=>{ if(e.target === overlay) closeOverlay(); });

document.getElementById("btnCopyDefault").addEventListener("click", ()=>{
  const t = defaultLineEl.textContent.replace(/^「|」$/g,"");
  copyText(t);
});

let rescueTimer = null;
function stopRescue(){
  if(rescueTimer) clearTimeout(rescueTimer);
  rescueTimer = null;
  ring.style.transform = "scale(1)";
  cue.textContent = "按「開始急救」跟著呼吸";
  stopCountdown();
}
document.getElementById("btnStopRescue").addEventListener("click", ()=>{ stopRescue(); showToast("已停止急救"); });
document.getElementById("btnStop").addEventListener("click", ()=>{ stopRescue(); showToast("已停止"); });

// ===== 60s Countdown =====
const countNum = document.getElementById("countNum");
const countBar = document.getElementById("countBar");
const countHint = document.getElementById("countHint");
let countTimer = null;
let secondsLeft = 60;

function stopCountdown(){
  if(countTimer) clearInterval(countTimer);
  countTimer = null;
  secondsLeft = 60;
  countNum.textContent = "60";
  countBar.style.width = "100%";
  countHint.textContent = "現在只要撐完這 1 分鐘。先不要講道理。";
}
function startCountdown(){
  stopCountdown();
  secondsLeft = 60;
  countNum.textContent = secondsLeft;
  countBar.style.width = "100%";

  countTimer = setInterval(()=>{
    secondsLeft--;
    countNum.textContent = secondsLeft;
    countBar.style.width = (secondsLeft/60*100) + "%";

    if(secondsLeft === 40) countHint.textContent = "你做得很好。先把聲音放慢、放低。";
    if(secondsLeft === 20) countHint.textContent = "快到了。只要情緒不繼續升高，你就做對了。";

    if(secondsLeft <= 0){
      clearInterval(countTimer);
      countTimer = null;
      cue.textContent = "很好，你撐過來了。現在只要陪著就好。";
      countHint.textContent = "收尾：先連結，再界線。等一下再談。";
    }
  }, 1000);
}

// Rescue breathing sequence
function setRing(scale, text){
  ring.style.transform = `scale(${scale})`;
  cue.textContent = text;
}
function runRescueBreath(){
  if(rescueTimer) clearTimeout(rescueTimer);
  rescueTimer = null;

  const seq = [
    {t:4000, s:1.18, txt:"吸氣 4 秒（鼻吸）"},
    {t:6000, s:0.92, txt:"吐氣 6 秒（慢慢吐）"},
    {t:4000, s:1.18, txt:"吸氣 4 秒（再一次）"},
    {t:6000, s:0.92, txt:"吐氣 6 秒（慢慢吐）"},
    {t:5000, s:1.00, txt:"腳踩地：感覺重量｜先穩住，再說"},
  ];

  let i = 0;
  const step = ()=>{
    if(i >= seq.length){
      ring.style.transform = "scale(1)";
      cue.textContent = "很好。現在照念上面的那一句。";
      rescueTimer = null;
      return;
    }
    setRing(seq[i].s, seq[i].txt);
    rescueTimer = setTimeout(()=>{ i++; step(); }, seq[i].t);
  };
  step();
}

document.getElementById("btnStartRescue").addEventListener("click", ()=>{
  startCountdown();
  runRescueBreath();
});

// Open rescue
document.getElementById("btnOpenRescue").addEventListener("click", ()=>{
  openOverlay();
  updateRescueMeta();
});

// ===== Age + Context Segmentation =====
const KEY_AGE = "hp_m1_age_group_v2";
const KEY_CTX = "hp_m1_context_v2";
const ageSel = document.getElementById("ageGroup");
const ctxBtns = document.querySelectorAll(".ctx");

let currentCtx = localStorage.getItem(KEY_CTX) || "home";
const CTX_NAME = { home:"家裡", out:"外出", night:"睡前" };

// ===== FULL LIB (可直接跑) =====
const LIB = {
  preschool:{
    name:"幼兒",
    hint:"提醒：語速慢、句子短、先抱穩再引導。",
    base:{
      home:"我在，我先穩一下，等一下抱抱再說。",
      out:"我在，我先穩一下，我們到旁邊再說。",
      night:"我在，我先穩一下，等一下陪你睡。"
    },
    practice:[
      {home:"吸 4 吐 6 × 2：我先穩住，再陪你。", out:"聲音放低：我在，我們先到旁邊。", night:"慢慢吐氣：我在，我會陪你。"},
      {home:"腳踩地：我現在先穩住。", out:"看一個點：我先穩一下。", night:"肩膀放下：我先穩一下。"},
      {home:"先不講道理：先抱穩。", out:"先保安全：先牽好。", night:"先安撫：再談規矩。"}
    ],
    tips:[
      {cat:"panic", title:"我快爆了（先穩住）", items:[
        {home:"我先呼吸兩次，等一下再處理。", out:"我先停一下，我們到旁邊。", night:"我先穩一下，等一下再說。"},
        {home:"我需要先穩住，才不會用生氣處理。", out:"我需要先穩住，我會回來。", night:"我先穩住，我還在。"}
      ]},
      {cat:"cry", title:"孩子哭（先連結）", items:[
        {home:"我在，你可以哭，我陪你。", out:"我在，我們到旁邊，我陪你。", night:"我在，哭一下沒關係，我陪你。"},
        {home:"你很難受，我知道，我先抱抱你。", out:"我知道你很難受，我在。", night:"你需要我，我在。"}
      ]},
      {cat:"fight", title:"頂嘴/不合作（先降張力）", items:[
        {home:"我先停一下，等我們都穩一點再說。", out:"先停一下，我們到旁邊再說。", night:"我先穩一下，等一下再談。"},
        {home:"我不跟你吵，我會帶你回安全。", out:"我不跟你吵，我會帶你回安全。", night:"我不跟你吵，我們先安靜。"}
      ]},
      {cat:"public", title:"公共/規範（先安全）", items:[
        {home:"我們先回到安全的位置，再說。", out:"先牽好手，等一下再講。", night:"先安靜，我們等一下再談。"},
        {home:"我會陪你，但我需要先穩住。", out:"我在，但我們先站旁邊。", night:"我在，我先穩一下。"}
      ]}
    ]
  },

  elementary:{
    name:"小學",
    hint:"提醒：同理＋界線＋承諾。先穩，再談規則。",
    base:{
      home:"我現在需要先穩一下，等一下我們再說。",
      out:"我先穩一下，我們到旁邊再說。",
      night:"我先穩一下，等一下再談。"
    },
    practice:[
      {home:"吸 4 吐 6 × 2：先穩住，再說。", out:"先降音量：慢慢說、慢慢走。", night:"放下肩膀：我先穩一下。"},
      {home:"我先回到大人的位置。", out:"我先回到大人的位置。", night:"我可以清楚，也可以溫柔。"},
      {home:"不在高張力談重要的事。", out:"先安全，後規則。", night:"先連結，再界線。"}
    ],
    tips:[
      {cat:"panic", title:"我快爆了（先救我自己）", items:[
        {home:"我先呼吸兩次，等一下再處理。", out:"我先停一下，我們到旁邊。", night:"我先穩一下，等一下再說。"},
        {home:"這件事很重要，我不想用生氣處理。", out:"我需要先穩住，我會回來。", night:"我在，我會回來。"}
      ]},
      {cat:"cry", title:"孩子哭（連結不中斷）", items:[
        {home:"我在，你很難受我知道，等一下我們一起處理。", out:"我在，我們到旁邊，我陪你。", night:"我在，你可以哭一下，我陪你。"},
        {home:"你先在這裡抱抱枕，我很快回來。", out:"你先站我旁邊，我很快回來。", night:"你先喝水，我很快回來。"}
      ]},
      {cat:"fight", title:"頂嘴/不合作（先降張力）", items:[
        {home:"我先停一下，等我們都穩一點再談。", out:"先到旁邊，再談。", night:"先穩一下，等一下再談。"},
        {home:"我不跟你吵，我會帶你回安全。", out:"我不跟你吵，我會帶你回安全。", night:"我不跟你吵，我們先安靜。"}
      ]},
      {cat:"public", title:"公共/規範（先安全）", items:[
        {home:"我們先回到安全的位置，再說。", out:"先遵守安全，等一下再講原因。", night:"先安靜，我們等一下再談。"},
        {home:"我會陪你，但我需要先穩住。", out:"我在，但我們先站旁邊。", night:"我在，我先穩一下。"}
      ]}
    ]
  },

  teen:{
    name:"青春期",
    hint:"提醒：尊重界線、避免對抗、留出口。先穩再談。",
    base:{
      home:"我先穩一下，等一下我們再談。",
      out:"我先穩一下，我們換個地方談。",
      night:"我先穩一下，明天再談也可以。"
    },
    practice:[
      {home:"慢慢吐氣：我先穩一下，再開口。", out:"先停一下：我不在這裡對抗。", night:"留出口：明天再談也可以。"},
      {home:"我可以清楚，也可以尊重。", out:"我可以清楚，也可以尊重。", night:"我先收住語氣，再說。"},
      {home:"先不搶輸贏，先保關係。", out:"先不搶輸贏，先保關係。", night:"先降張力，再談事。"}
    ],
    tips:[
      {cat:"panic", title:"我快爆了（先降張力）", items:[
        {home:"我先停一下，等一下再談。", out:"我先停一下，我們換個地方。", night:"我先穩一下，明天再談也可以。"},
        {home:"我需要先穩住，才不會說傷人的話。", out:"我需要先穩住，我會回來。", night:"我先穩住，我還在。"}
      ]},
      {cat:"cry", title:"孩子崩潰/委屈（先承接）", items:[
        {home:"我在，我先聽你說，不急著評價。", out:"我在，我先聽你說。", night:"我在，我先聽你說。"},
        {home:"你先休息一下，我等一下回來，我們再談。", out:"你先坐一下，我等一下回來。", night:"先睡，明天再談也可以。"}
      ]},
      {cat:"fight", title:"頂嘴/對抗（先退出戰場）", items:[
        {home:"我不跟你對抗，我們等一下再談。", out:"我不在這裡對抗，我們換地方。", night:"我先停一下，明天再談。"},
        {home:"我先回到大人的位置，等一下再說。", out:"我先回到大人的位置。", night:"我先穩住，再談。"}
      ]},
      {cat:"public", title:"公共/規範（先安全）", items:[
        {home:"先安全，等一下再談原因。", out:"先做到安全，等一下再談。", night:"先停一下，等一下再談。"},
        {home:"我會在，但我需要先穩住。", out:"我在，但我們先到旁邊。", night:"我在，我先穩一下。"}
      ]}
    ]
  }
};

// ===== Default Rescue Line (customizable) =====
const KEY_FAV = "hp_m1_fav_line_v2";
const favInput = document.getElementById("favLine");

function setAge(v){
  localStorage.setItem(KEY_AGE, v);
  ageSel.value = v;
}
function getAge(){
  return localStorage.getItem(KEY_AGE) || ageSel.value || "elementary";
}
function setCtx(v){
  currentCtx = v;
  localStorage.setItem(KEY_CTX, v);
  ctxBtns.forEach(b=> b.classList.toggle("active", b.dataset.ctx === v));
}
function getCtx(){
  return localStorage.getItem(KEY_CTX) || currentCtx || "home";
}

function updateRescueMeta(){
  const age = getAge();
  const ctx = getCtx();
  rescueMeta.textContent = `年齡：${LIB[age].name}｜情境：${CTX_NAME[ctx]}`;
  tipHint.textContent = LIB[age].hint;
}

function suggestedRescue(){
  const age = getAge();
  const ctx = getCtx();
  return LIB[age].base[ctx];
}
function applySuggestedRescue(){
  defaultLineEl.textContent = `「${suggestedRescue()}」`;
  updateRescueMeta();
}
function loadFav(){
  const userSet = localStorage.getItem(KEY_FAV);
  if(userSet){
    defaultLineEl.textContent = userSet;
    favInput.value = userSet.replace(/^「|」$/g,"");
  }else{
    favInput.value = "";
    applySuggestedRescue();
  }
  updateRescueMeta();
}
loadFav();

document.getElementById("saveFav").addEventListener("click", ()=>{
  const v = favInput.value.trim();
  if(!v){ showToast("請先輸入一句話"); return; }
  localStorage.setItem(KEY_FAV, `「${v}」`);
  loadFav();
  showToast("已儲存預設句");
});
document.getElementById("resetFav").addEventListener("click", ()=>{
  localStorage.removeItem(KEY_FAV);
  loadFav();
  showToast("已恢復建議句");
});

// ===== Context switching =====
ctxBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    setCtx(btn.dataset.ctx);
    const userSet = localStorage.getItem(KEY_FAV);
    if(!userSet) applySuggestedRescue();
    renderTips();
    pickPracticeLine(true);
    updateRescueMeta();
    showToast("已切換情境");
  });
});

// Age switching
ageSel.addEventListener("change", ()=>{
  setAge(ageSel.value);
  const userSet = localStorage.getItem(KEY_FAV);
  if(!userSet) applySuggestedRescue();
  renderTips();
  pickPracticeLine(true);
  updateRescueMeta();
  showToast("已切換年齡");
});

// ===== Chips (global): copy + set rescue line =====
document.addEventListener("click", async (e)=>{
  const btn = e.target.closest(".chip");
  if(!btn) return;
  const line = btn.dataset.say?.trim();
  if(!line) return;
  defaultLineEl.textContent = `「${line}」`;
  updateRescueMeta();
  await copyText(line);
});

// ===== Tips rendering (age × ctx) =====
const tipsWrap = document.getElementById("tipsWrap");
const pills = document.querySelectorAll(".pill");
let tipFilter = "all";

function renderTips(){
  const age = getAge();
  const ctx = getCtx();
  const blocks = LIB[age].tips;

  const filtered = tipFilter === "all"
    ? blocks
    : blocks.filter(b => b.cat === tipFilter);

  tipsWrap.innerHTML = filtered.map((block, idx)=>{
    const lines = block.items.map(obj => obj[ctx]);
    return `
      <details class="faq" ${idx===0 ? "open":""}>
        <summary>${block.title}</summary>

        ${lines.map(s=>`
          <button class="chip tip" data-say="${s.replace(/"/g,'&quot;')}">照念：${s}</button>
        `).join("")}

        <div class="ctaRow" style="margin-top:8px">
          <button class="btn primary tipRescue" data-line="${lines[0].replace(/"/g,'&quot;')}">用這句直接急救</button>
          <button class="btn ghost tipRescue" data-line="${lines[lines.length-1].replace(/"/g,'&quot;')}">用另一句急救</button>
        </div>
      </details>
    `;
  }).join("");

  tipsWrap.querySelectorAll(".tipRescue").forEach(b=>{
    b.addEventListener("click", ()=>{
      const line = b.dataset.line?.trim();
      if(line){
        defaultLineEl.textContent = `「${line}」`;
      }
      updateRescueMeta();
      openOverlay();
      startCountdown();
      runRescueBreath();
    });
  });
}

pills.forEach(p=>{
  p.addEventListener("click", ()=>{
    pills.forEach(x=>x.classList.remove("active"));
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

function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function pickPracticeLine(force=false){
  const age = getAge();
  const ctx = getCtx();

  if(!force){
    const savedDate = localStorage.getItem(KEY_PRACTICE_DATE);
    const savedLine = localStorage.getItem(KEY_PRACTICE_LINE);
    if(savedDate === todayKey() && savedLine){
      practiceLineEl.textContent = savedLine;
      const done = localStorage.getItem("hp_m1_practice_done_"+todayKey()) === "1";
      practiceStatusEl.textContent = done ? "今日已打卡 ✅" : "今日尚未打卡";
      return;
    }
  }

  const list = LIB[age].practice.map(obj => obj[ctx]);
  const line = list[Math.floor(Math.random()*list.length)];
  localStorage.setItem(KEY_PRACTICE_LINE, line);
  localStorage.setItem(KEY_PRACTICE_DATE, todayKey());
  practiceLineEl.textContent = line;
  practiceStatusEl.textContent = "今日尚未打卡";
}

btnNewPractice?.addEventListener("click", ()=>{ pickPracticeLine(true); showToast("已換一句"); });
btnCopyPractice?.addEventListener("click", ()=>{
  const line = practiceLineEl.textContent.trim();
  if(line) copyText(line);
});
btnDonePractice?.addEventListener("click", ()=>{
  localStorage.setItem("hp_m1_practice_done_"+todayKey(), "1");
  practiceStatusEl.textContent = "今日已打卡 ✅";
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

function loadQuizHistory(){
  try{ return JSON.parse(localStorage.getItem(KEY_QUIZ) || "[]"); }
  catch{ return []; }
}
function saveQuizHistory(arr){
  localStorage.setItem(KEY_QUIZ, JSON.stringify(arr.slice(0, 30)));
}

function scoreToAdvice(score){
  if(score <= 3){
    return { title:"今天先救你自己（先穩再說）",
      text:"建議：立刻做 60 秒急救；用安全延後語句；安排等待位。今天以『情緒不繼續升高』為目標。" };
  }
  if(score <= 7){
    return { title:"今天以「延後＋回位」為主",
      text:"建議：先回到大人位置；不在高張力談；用同理＋界線＋承諾。等穩了再談選擇。" };
  }
  return { title:"今天狀態不錯，可以做「微合作」",
    text:"建議：先肯定孩子感受，再一起選方案。清楚也溫柔。今天適合做小小合作練習。" };
}

quizForm?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const fd = new FormData(quizForm);
  const vals = ["q1","q2","q3","q4","q5"].map(k => Number(fd.get(k)));
  const score = vals.reduce((a,b)=>a+b,0);

  const advice = scoreToAdvice(score);
  quizResult.hidden = false;
  quizHistory.hidden = true;

  quizText.innerHTML = `
    <div class="tag">分數：${score}/10</div>
    <div class="tag">年齡：${LIB[getAge()].name}</div>
    <div class="tag">情境：${CTX_NAME[getCtx()]}</div>
    <br><br>
    <strong>${advice.title}</strong><br>${advice.text}
  `;

  const item = { date: todayKey(), score, age: getAge(), ctx: getCtx(), title: advice.title };
  const hist = loadQuizHistory().filter(x => x.date !== item.date);
  hist.unshift(item);
  saveQuizHistory(hist);

  btnGoRescue.onclick = ()=>{ openOverlay(); updateRescueMeta(); };
  btnGoTips.onclick = ()=>{ openTab("t5"); };

  showToast("已儲存今日自評");
});

btnQuizHistory?.addEventListener("click", ()=>{
  const hist = loadQuizHistory().slice(0, 7);
  quizHistory.hidden = false;
  quizResult.hidden = true;

  if(hist.length === 0){
    quizHistory.innerHTML = `<div class="muted">尚無紀錄</div>`;
    return;
  }

  quizHistory.innerHTML = `
    <div style="font-weight:1000; margin-bottom:8px">最近 7 天</div>
    ${hist.map(h=>`
      <div class="row">
        <span class="tag">${h.date}</span>
        <span class="tag">分數 ${h.score}/10</span>
        <span class="tag">${LIB[h.age]?.name || h.age}</span>
        <span class="tag">${CTX_NAME[h.ctx] || h.ctx}</span>
        <span class="muted" style="font-weight:900">${h.title}</span>
      </div>
    `).join("")}
  `;
});

btnQuizClear?.addEventListener("click", ()=>{
  localStorage.removeItem(KEY_QUIZ);
  quizHistory.hidden = false;
  quizHistory.innerHTML = `<div class="muted">已清除</div>`;
  showToast("已清除紀錄");
});

// Close rescue
document.getElementById("btnClose").addEventListener("click", ()=>{ closeOverlay(); stopRescue(); });
document.getElementById("btnClose2").addEventListener("click", ()=>{ closeOverlay(); stopRescue(); });

// ===== Init =====
(function init(){
  const savedAge = localStorage.getItem(KEY_AGE) || "elementary";
  setAge(savedAge);

  const savedCtx = localStorage.getItem(KEY_CTX) || "home";
  setCtx(savedCtx);

  updateRescueMeta();

  const userSet = localStorage.getItem(KEY_FAV);
  if(!userSet) applySuggestedRescue();

  renderTips();
  pickPracticeLine(false);
})();
