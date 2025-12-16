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
    if(secondsLeft === 20) countHint.textContent = "快到了。只要不升級，你就在贏。";

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

const LIB = {
  preschool: {
    name: "幼兒（3–6）",
    hint: "短句＋安全感，先讓身體穩下來。",
    base: {
      home: "我先抱抱你，我們一起呼吸兩次，等一下再說。",
      out: "我先帶你到旁邊，我在，先呼吸兩次。",
      night:"你可以難過，我陪你。睡前先休息，明天再說。"
    },
    tips: [
      {cat:"panic", title:"🔥 我快爆了", items:[
        {home:"我需要先穩一下，我會回來陪你。", out:"我先帶你到旁邊，我需要先穩一下。", night:"我先穩一下，睡前先不講。"},
        {home:"先停一下，我要用溫柔的聲音跟你說。", out:"先停一下，我們先離開這裡。", night:"先停一下，現在先休息。"}
      ]},
      {cat:"cry", title:"😢 孩子哭", items:[
        {home:"你可以哭，我在這裡。先抱抱，呼吸兩次。", out:"我在，先抱抱，我們先呼吸兩次。", night:"你可以哭，我陪你。先抱抱再睡。"},
        {home:"我看見你很難過，我陪你，等一下再說。", out:"我看見你很難過，我陪你先離開。", night:"我陪你安靜一下，明天再說。"}
      ]},
      {cat:"fight", title:"😤 不合作", items:[
        {home:"我聽到你不想，我們先停一下，等一下再選。", out:"我聽到你不想，我們先離開一下。", night:"我聽到你不想，睡前先休息。"},
        {home:"你先坐這裡抱抱枕，我很快回來。", out:"你先牽我的手，我們先到旁邊。", night:"你先抱娃娃，我陪你安靜。"}
      ]},
      {cat:"public", title:"🧍 公共場合", items:[
        {home:"我先帶你到旁邊，我在，你不用怕。", out:"我先帶你到旁邊，我在，你不用怕。", night:"我們先回房間，睡前先安靜。"},
        {home:"我們先離開一下，等你穩了再回來。", out:"我們先離開現場，等你穩了再回來。", night:"現在先休息，明天再處理。"}
      ]},
    ],
    practice: [
      {home:"先穩住，再說。", out:"先降溫，不升級。", night:"睡前先安撫。"},
      {home:"不是不要你，我會回來。", out:"我在，我們先到旁邊。", night:"我在，先休息。"},
      {home:"我先呼吸兩次，再處理。", out:"先呼吸兩次，再走。", night:"先抱抱，再睡。"},
      {home:"我可以溫柔，也可以清楚。", out:"我會保護你，也保護現場。", night:"我陪你安靜。"}
    ]
  },

  elementary: {
    name: "小學（6–12）",
    hint: "同理＋界線＋承諾，先止血再處理。",
    base: {
      home:"我現在需要先穩一下，等一下我們再說。",
      out:"我先帶你到旁邊，我需要先穩一下，等一下再說。",
      night:"睡前先休息，我在。明天我們再好好談。"
    },
    tips: [
      {cat:"panic", title:"🔥 我快爆了", items:[
        {home:"我需要先穩一下，等一下我會回來處理。", out:"我需要先穩一下，我們先離開這裡。", night:"我需要先穩一下，睡前先不談。"},
        {home:"先停一下。我想用更好的方式跟你說。", out:"先停一下，我們先到旁邊。", night:"先停一下，明天再說。"}
      ]},
      {cat:"cry", title:"😢 孩子哭", items:[
        {home:"我看見你很難受，我在這裡。先一起呼吸兩次。", out:"我看見你很難受，我陪你先離開，呼吸兩次。", night:"我看見你很難受，睡前我陪你安靜一下。"},
        {home:"你可以哭，我陪你。等你準備好，我們再說。", out:"你可以哭，我陪你。等你穩一點我們再回去。", night:"你可以哭，我陪你。明天再談。"}
      ]},
      {cat:"fight", title:"😤 頂嘴/不合作", items:[
        {home:"我聽到你不想。先停一下，等我穩好再談選擇。", out:"我聽到你不想。先離開現場，等我穩好再談。", night:"我聽到你不想。睡前先休息，明天再談。"},
        {home:"我不跟你吵。我們等一下用合作的方法處理。", out:"我不跟你吵。我們先安靜走到旁邊。", night:"我不跟你吵。睡前先安靜。"}
      ]},
      {cat:"public", title:"🧍 公共/規範", items:[
        {home:"我先帶你到旁邊。我在，你不用害怕。", out:"我先帶你到旁邊。我在，你不用害怕。", night:"我們先回房間，睡前先安靜。"},
        {home:"我們先離開現場，等你穩了再回來。", out:"我們先離開現場，等你穩了再回來。", night:"今晚先休息，明天再處理。"}
      ]},
    ],
    practice: [
      {home:"先穩住，再說。", out:"先降溫，不升級。", night:"睡前先安撫。"},
      {home:"我是教養者，不是對手。", out:"我不在外面升級衝突。", night:"睡前不談對錯。"},
      {home:"我不在高張力談重要的事。", out:"先離開現場再談。", night:"先睡，明天再談。"},
      {home:"我會回來，我們會處理。", out:"我會帶你回安全。", night:"我在，我們明天處理。"}
    ]
  },

  teen: {
    name: "青春期（12+）",
    hint: "先降溫，再談界線；不反擊，但不退位。",
    base: {
      home:"我先停一下，等我冷靜，我們再談。",
      out:"我先停一下，我們先離開現場，等我冷靜再談。",
      night:"睡前不談衝突。我在。明天再談。"
    },
    tips: [
      {cat:"panic", title:"🔥 我快爆了", items:[
        {home:"我先停一下，等我冷靜，我們再談。", out:"我先停一下，我們先離開現場，等我冷靜再談。", night:"睡前我先停一下，明天再談。"},
        {home:"我不想用情緒講話，我需要 10 分鐘。", out:"我需要 10 分鐘，我們先離開這裡。", night:"我需要 10 分鐘，睡前先不談。"}
      ]},
      {cat:"fight", title:"😤 頂撞/挑釁", items:[
        {home:"我聽到了。我先不反擊，等一下再談界線。", out:"我先不反擊，我們先到旁邊再談界線。", night:"我先不反擊，明天再談界線。"},
        {home:"你可以不同意，但不能用傷人的方式說。等一下再談。", out:"你可以不同意，但我們先離開這裡再說。", night:"你可以不同意，睡前先不談。"}
      ]},
      {cat:"cry", title:"🧊 冷漠/不理人", items:[
        {home:"我尊重你想安靜，等你準備好再找我。", out:"我尊重你想安靜，我們先把現場過完。", night:"你先休息，明天想談再說。"},
        {home:"我在這裡，不追問，但我會關心你。", out:"我在這裡，不追問，我們先離開。", night:"我在，先睡。"}
      ]},
      {cat:"public", title:"📱 規範/公共", items:[
        {home:"規則不改，但方式可以談。等我穩好我們再討論。", out:"規則不改，我們先離開現場再討論。", night:"規則明天談，睡前先休息。"},
        {home:"我願意聽你理由，先把情緒放下再談。", out:"我願意聽你理由，我們先到旁邊。", night:"我願意聽，但不是睡前。"}
      ]},
    ],
    practice: [
      {home:"我先停一下，再談。", out:"先離開現場，再談。", night:"睡前先停一下。"},
      {home:"我不反擊，我守住界線。", out:"外面不升級。", night:"睡前不升級。"},
      {home:"我願意聽，但不是用吵的。", out:"我願意聽，先離開。", night:"我願意聽，明天談。"},
      {home:"關係不斷線，界線不鬆動。", out:"先安全，再界線。", night:"先安撫，再界線。"}
    ]
  }
};

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

// ===== Default Rescue Line (customizable) =====
const KEY_FAV = "hp_m1_fav_line_v2";
const favInput = document.getElementById("favLine");

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

    // 若使用者沒自訂救場句，切換建議句
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
        localStorage.removeItem(KEY_FAV); // 讓錦囊急救以情境句優先（你要保留自訂就刪掉這行）
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

// ===== Practice (age × ctx) =====
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

btnNewPractice.addEventListener("click", ()=>{ pickPracticeLine(true); showToast("已換一句"); });
btnCopyPractice.addEventListener("click", ()=>{
  const line = practiceLineEl.textContent.trim();
  if(line) copyText(line);
});
btnDonePractice.addEventListener("click", ()=>{
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
    return {
      title: "今天先救你自己（先穩再說）",
      text: "建議：立刻做 60 秒急救；用「安全延後語句」；安排孩子等待位。今天以『不升級』為勝利。",
    };
  }
  if(score <= 7){
    return {
      title: "今天以「延後＋回位」為主",
      text: "建議：先回到大人位置；不在高張力談；用『同理＋界線＋承諾』。等穩了再談選擇。",
    };
  }
  return {
    title: "今天狀態不錯，可以做「微合作」",
    text: "建議：先肯定孩子感受，再一起選方案。清楚也溫柔。今天適合做小小合作練習。",
  };
}

quizForm.addEventListener("submit", (e)=>{
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

btnQuizHistory.addEventListener("click", ()=>{
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

btnQuizClear.addEventListener("click", ()=>{
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
  // init age + ctx
  const savedAge = localStorage.getItem(KEY_AGE) || "elementary";
  setAge(savedAge);

  const savedCtx = localStorage.getItem(KEY_CTX) || "home";
  setCtx(savedCtx);

  // set meta
  updateRescueMeta();

  // apply suggested if no custom
  const userSet = localStorage.getItem(KEY_FAV);
  if(!userSet) applySuggestedRescue();

  // pills default
  pills[0].classList.add("active");

  renderTips();
  pickPracticeLine(false);
})();
