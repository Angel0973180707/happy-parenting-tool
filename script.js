// Tabs

const tabs = document.querySelectorAll(".tab");

const panels = document.querySelectorAll(".panel");

tabs.forEach(btn => {

btn.addEventListener("click", () => {

// 1. 移除所有 Tab 按鈕的 active 狀態

tabs.forEach(b => b.classList.remove("active"));

// 2. 移除所有 Panel 區塊的 active 狀態 (隱藏)

panels.forEach(p => p.classList.remove("active"));

// 3. 設置點擊的按鈕為 active 狀態 (高亮)

btn.classList.add("active");

// 4. 顯示對應的 Panel 區塊

const targetPanelId = btn.dataset.tab;

const targetPanel = document.getElementById(targetPanelId);

if (targetPanel) {

targetPanel.classList.add("active");

}

});

});

// Elements

const defaultLineEl = document.getElementById("defaultLine");

const favInput = document.getElementById("favLine");

const cue = document.getElementById("cue");

const ring = document.getElementById("ring");

const ageHint = document.getElementById("ageHint");

// Storage keys

const KEY_FAV = "happy_parenting_fav_line";

const KEY_AGE = "happy_parenting_age";

const KEY_REPAIR = "happy_parenting_repair";

// Age label

const AGE_LABEL = { toddler: "幼兒", school: "小學", teen: "青春期" };

// Phrase libraries by age - 豐富句庫 (此處使用優化後的句庫)

const LIB = {

toddler: {

rescueDefault: "先穩住，再說。我會回來陪你。",

delay: [

"我知道你很難受，我先穩住我的身體，等一下我會回來陪你。",

"這件事我不想用生氣處理，我需要 30 秒，等一下我們再說。",

"我在，我沒有不要你。我會先抱著自己，等一下回來抱你。"

],

tips: {

hot: ["我需要先穩住，等一下我會回來處理。", "我不想用更大的聲音跟你說話。先停。"],

cry: ["我看見你很難受，我在這裡。來，先一起呼吸兩次，用鼻子。", "你可以哭，我陪你。但請在這裡哭，等你準備好，我們再說。"],

rude: ["我聽到你不想。先停一下，等我穩好再談選擇。", "我不跟你吵。我們等一下用合作的方法處理，現在先離開。"],

public: ["我先帶你到旁邊角落。媽媽在這裡，你不用害怕。", "我們先帶你離開現場，等你身體穩了，我們再回去。"]

},

repair: ["剛剛媽媽沒有處理好，我想再試一次。", "我很在乎你。我還在學，但我會回來陪你。"]

},

school: {

rescueDefault: "我現在需要先穩一下，等一下我們再說。",

delay: [

"我知道你很難受，現在我們先不談，等我穩好再一起處理。",

"這件事很重要，我不想用生氣處理，我們等一下再說。",

"我在，我沒有不要你。我先穩一下，等一下回來。"

],

tips: {

hot: ["我需要先穩一下，等一下我會回來處理。","先停一下。我想用更好的方式跟你說。"],

cry: ["我看見你很難受，我在這裡。先一起深呼吸兩次。", "你可以哭，我陪你。等你準備好，我們再談事件。"],

rude: ["我聽到你不想。先停一下，等我穩好再談選擇。", "我不跟你吵。我們等一下用合作的方法處理。"],

public: ["我先帶你到旁邊。我在，你不用害怕。", "我們先離開現場，等你穩了再回來。"]

},

repair: ["剛剛我沒有處理好，我想再試一次。", "我很在乎你。我還在學，但我會回來陪你。"]

},

teen: { // 青少年句庫強化：尊重、界線、談判

rescueDefault: "我必須先穩住，才能跟你談。給我五分鐘。",

delay: [

"我不想用情緒對你說話，那對你不公平。我先停一下，等一下回來談。",

"我聽到你很不滿。這件事我們會談出一個共識，但不是用吵架的方式。",

"我尊重你的情緒，但我也要保護我們的關係底線。我先停一下，請你也冷靜。"

],

tips: {

hot: ["我需要先穩一下，等一下我會回來跟你談判。", "先停。我希望能把界線講清楚，不想互傷關係。"],

cry: ["我看見你很難受。我在。你不用解釋，先陪我深呼吸兩次。", "你可以先安靜一下，我在旁邊。你準備好，我們只談解決方案。"],

rude: ["我聽到你用詞不當。請修正。現在先停，等一下我們談選擇與責任。", "我不跟你互嗆，那是浪費時間。我們等一下用談判的方法處理。"],

public: ["我先帶你到一個安靜的地方。我尊重你，但公共場合我們需要保護彼此。", "我們先離開現場，等你穩了，我們再談你遇到的困難。"]

},

repair: ["剛剛我沒有處理好，我想再試一次，我們能不能重新來過？", "我很在乎你。我還在學著尊重你，我會回來把話講好。"]

}

};

// Current age

let currentAge = localStorage.getItem(KEY_AGE) || "school";

// Helpers

function setCue(text){ cue.textContent = text; }

function setDefaultLine(line){

// ensure it looks like a quote

const s = line.trim();

const shown = s.startsWith("「") ? s : 「${s}」;

defaultLineEl.textContent = shown;

}

// Load fav line into defaultLine (if exists)

function loadFav(){

const saved = localStorage.getItem(KEY_FAV);

if(saved){

setDefaultLine(saved);

favInput.value = saved;

}else{

setDefaultLine(LIB[currentAge].rescueDefault);

favInput.value = "";

}

}

// Apply age + render phrases

function applyAge(age){

currentAge = age;

localStorage.setItem(KEY_AGE, age);

ageHint.textContent = 目前：${AGE_LABEL[age]}（已套用 ${AGE_LABEL[age]} 專屬句庫）;

// Update active age chip

document.querySelectorAll(".age").forEach(btn => {

btn.classList.remove("active-age");

if (btn.dataset.age === age) {

btn.classList.add("active-age");

}

});

// if no custom fav, switch to age default

const saved = localStorage.getItem(KEY_FAV);

if(!saved){

setDefaultLine(LIB[currentAge].rescueDefault);

}

renderPhrases();

}

// Render dynamic phrases by updating dataset.line

function renderPhrases(){

// Rescue delay chips (使用 ID 選擇器更穩健)

const delays = LIB[currentAge].delay;

document.querySelector(".delay1").dataset.line = delays[0] || "";

document.querySelector(".delay2").dataset.line = delays[1] || "";

document.querySelector(".delay3").dataset.line = delays[2] || "";

// Tips categories

const tips = LIB[currentAge].tips;

const map = [

{sel:".t-hot-1", line: tips.hot?.[0]},

{sel:".t-hot-2", line: tips.hot?.[1]},

{sel:".t-cry-1", line: tips.cry?.[0]},

{sel:".t-cry-2", line: tips.cry?.[1]},

{sel:".t-rude-1", line: tips.rude?.[0]},

{sel:".t-rude-2", line: tips.rude?.[1]},

{sel:".t-public-1", line: tips.public?.[0]},

{sel:".t-public-2", line: tips.public?.[1]},

];

map.forEach(item=>{

const el = document.querySelector(item.sel);

if(el && item.line) el.dataset.line = item.line;

});

// Repair phrases

const reps = LIB[currentAge].repair;

document.querySelector(".rep1").dataset.line = reps?.[0] || "";

document.querySelector(".rep2").dataset.line = reps?.[1] || "";

}

// Age buttons

document.querySelectorAll(".age").forEach(btn=>{

btn.addEventListener("click", ()=> applyAge(btn.dataset.age));

});

// Save / reset fav line

document.getElementById("saveFav").addEventListener("click", () => {

const v = favInput.value.trim();

if(!v){ alert("請先輸入一句你想設成預設的救場句"); return; }

localStorage.setItem(KEY_FAV, v);

loadFav();

alert("已儲存！回到「現場急救」你會看到預設句已更新。");

});

document.getElementById("resetFav").addEventListener("click", () => {

localStorage.removeItem(KEY_FAV);

loadFav();

alert("已恢復預設（會跟著年齡句庫切換）。");

});

// Quick line buttons (chips/tips): set default line and jump to rescue

function bindLineButtons(selector){

document.querySelectorAll(selector).forEach(btn=>{

btn.addEventListener("click", ()=>{

const line = (btn.dataset.line || "").trim();

if(!line) return;

setDefaultLine(line);

// 點擊句庫後，自動切換到急救面板

document.querySelector('[data-tab="rescue"]').click();

// 在急救面板中將 quote 框短暫高亮

const quoteBox = document.getElementById("defaultLine");

quoteBox.style.transition = 'background 0.3s ease';

quoteBox.style.backgroundColor = '#fff0e1';

setTimeout(() => {

quoteBox.style.backgroundColor = '';

}, 500);

});

});

}

bindLineButtons(".chip");

bindLineButtons(".tip");

// Rescue breathing (4-6), stoppable

let timeouts = [];

function stopRescue(){

timeouts.forEach(t => clearTimeout(t));

timeouts = [];

ring.style.transform = "scale(1)";

setCue("準備好了就按「急救」");

}

document.getElementById("btnStop").addEventListener("click", stopRescue);

document.getElementById("btnRescue").addEventListener("click", ()=>{

stopRescue();

const seq = [

{t:4000, msg:"吸氣 4 秒（鼻吸）", scale:1.18},

{t:6000, msg:"吐氣 6 秒（慢慢吐）", scale:0.92},

{t:4000, msg:"吸氣 4 秒（再一次）", scale:1.18},

{t:6000, msg:"吐氣 6 秒（慢慢吐）", scale:0.92},

{t:5000, msg:"腳踩地：感覺重量｜先穩住，再說", scale:1.00},

];

let acc = 0;

seq.forEach((s, idx)=>{

const tid = setTimeout(()=>{

setCue(s.msg);

ring.style.transform = scale(${s.scale});

if(idx === seq.length - 1){

const tid2 = setTimeout(()=>{

ring.style.transform = "scale(1)";

setCue("很好。現在可以用下面那句話（照念）。");

}, s.t);

timeouts.push(tid2);

}

}, acc);

timeouts.push(tid);

acc += s.t;

});

});

// Quiz

const quiz = document.getElementById("quiz");

const result = document.getElementById("result");

quiz.addEventListener("submit", (e)=>{

e.preventDefault();

const data = new FormData(quiz);

let score = 0;

for(const [,v] of data.entries()){

score += Number(v);

}

// 0~10

let title, msg, action;

if(score <= 3){

title = "今天偏【疲累模式】";

msg = "你不是做不好，你是能量不足。今天的策略：少講道理，多用「延後＋等待位」。";

action = "建議：把預設救場句設成「先穩住，再說」。";

}else if(score <= 7){

title = "今天在【可穩定區】";

msg = "你有機會在現場踩煞車。記得：角色回位後再談界線，成功率最高。";

action = "建議：練一句「我是教養者，不是對手」。";

}else{

title = "今天在【高穩定區】";

msg = "你有餘裕做「合作式引導」。可以多練習用溫柔＋清楚的語句，讓孩子內化。";

action = "建議：衝突前先練 1 次『先穩住，再說』當預防。";

}

result.hidden = false;

result.innerHTML = <strong>${title}</strong><p>${msg}</p><p class="mini">${action}</p>;

});

// Repair save/load (local)

document.getElementById("saveRepair").addEventListener("click", ()=>{

const payload = {

r1: document.getElementById("r1").value.trim(),

r2: document.getElementById("r2").value.trim(),

r3: document.getElementById("r3").value.trim(),

t: new Date().toISOString(),

age: currentAge

};

localStorage.setItem(KEY_REPAIR, JSON.stringify(payload));

alert("已保存在本機（這台裝置）");

});

document.getElementById("loadRepair").addEventListener("click", ()=>{

const raw = localStorage.getItem(KEY_REPAIR);

if(!raw){ alert("尚無保存紀錄"); return; }

const payload = JSON.parse(raw);

document.getElementById("r1").value = payload.r1 || "";

document.getElementById("r2").value = payload.r2 || "";

document.getElementById("r3").value = payload.r3 || "";

// restore age if present

if(payload.age && LIB[payload.age]){

applyAge(payload.age);

}

alert("已載入上次紀錄");

});

// Init

// 確保初始化時，點擊第一個按鈕，讓畫面進入 active 狀態

document.addEventListener('DOMContentLoaded', () => {

applyAge(currentAge);

loadFav();

// 模擬點擊第一個 Tab，確保畫面正確顯示

const activeTab = document.querySelector('.tab.active');

if (activeTab) {

// 確保 active class 被正確應用到 panel

document.getElementById(activeTab.dataset.tab).classList.add("active");

} else {

// 預設點擊第一個 Tab (現場急救)

document.querySelector('[data-tab="rescue"]').click();

}

});
