const DURATION_SECONDS = 5 * 60; // 5 menit
let idx = 0;
const answers = {};
let timeLeft = DURATION_SECONDS;
let timer = null;

const screenIntro = document.getElementById('screenIntro');
const screenQuiz = document.getElementById('screenQuiz');
const screenResult = document.getElementById('screenResult');
const btnStart = document.getElementById('btnStart');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnSubmit = document.getElementById('btnSubmit');
const qText = document.getElementById('qText');
const choicesBox = document.getElementById('choices');
const numgrid = document.getElementById('numgrid');
const sidebarNumgrid = document.getElementById('sidebarNumgrid');
const totalSoal = document.getElementById('totalSoal');
const terjawab = document.getElementById('terjawab');
const raguCount = document.getElementById('raguCount');
const kosongCount = document.getElementById('kosongCount');
const progressBar = document.getElementById('progressBar');
const qCounter = document.getElementById('qCounter');
const timeBox = document.getElementById('timeLeft');
const scoreBox = document.getElementById('scoreBox');
const reviewList = document.getElementById('reviewList');

const fmtTime = s => {
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const ss = (s%60).toString().padStart(2,'0');
  return `${m}:${ss}`;
};

function startTimer(){
  timeBox.textContent = fmtTime(timeLeft);
  timer = setInterval(()=>{
    timeLeft--; timeBox.textContent = fmtTime(timeLeft);
    if(timeLeft <= 0){ clearInterval(timer); submitExam(); }
  },1000);
}

function renderNumgrid(){
  if (!numgrid || !sidebarNumgrid) return;
  numgrid.innerHTML = "";
  sidebarNumgrid.innerHTML = "";
  let jawab = 0, ragu = 0, kosong = 0;
  QUESTIONS.forEach((q,i)=>{
    // Main content nav
    const b = document.createElement("button");
    b.className = "nav-btn";
    b.textContent = i+1;
    // Status warna
    if(q.ragu) {
      b.style.background = '#ffb300';
      b.style.color = '#fff';
      b.style.border = '2px solid #ffb300';
    } else if(answers[q.id] != null) {
      b.style.background = '#4caf50';
      b.style.color = '#fff';
      b.style.border = '2px solid #4caf50';
    } else {
      b.style.background = '#e0d7f7';
      b.style.color = '#6c3fcf';
      b.style.border = 'none';
    }
    if(i === idx) {
      b.style.background = '#6c3fcf';
      b.style.color = '#fff';
    }
    b.onclick = ()=>{ idx=i; renderQuestion(); renderNumgrid(); };
    numgrid.appendChild(b);
    // Sidebar nav
    const sb = document.createElement("button");
    sb.className = "nav-btn";
    sb.textContent = i+1;
    if(q.ragu) {
      sb.style.background = '#ffb300';
      sb.style.color = '#fff';
      sb.style.border = '2px solid #ffb300';
    } else if(answers[q.id] != null) {
      sb.style.background = '#4caf50';
      sb.style.color = '#fff';
      sb.style.border = '2px solid #4caf50';
    } else {
      sb.style.background = '#e0d7f7';
      sb.style.color = '#6c3fcf';
      sb.style.border = 'none';
    }
    if(i === idx) {
      sb.style.background = '#6c3fcf';
      sb.style.color = '#fff';
    }
    sb.onclick = ()=>{ idx=i; renderQuestion(); renderNumgrid(); };
    sidebarNumgrid.appendChild(sb);
  });
  // Update summary
  if (totalSoal) totalSoal.textContent = QUESTIONS.length;
  let terjawabCount = 0, raguCountVal = 0, kosongCountVal = 0;
  QUESTIONS.forEach(q => {
    if (answers[q.id] != null) terjawabCount++;
    if (q.ragu) raguCountVal++;
    if (answers[q.id] == null) kosongCountVal++;
  });
  if (terjawab) terjawab.textContent = terjawabCount;
  if (raguCount) raguCount.textContent = raguCountVal;
  if (kosongCount) kosongCount.textContent = kosongCountVal;
  // Progress bar
  if (progressBar) {
    const percent = Math.round(((idx+1)/QUESTIONS.length)*100);
    progressBar.style.width = percent + '%';
  }
}

function renderQuestion(){
  const q = QUESTIONS[idx];
  qCounter.textContent = `${idx+1}/${QUESTIONS.length}`;
  qText.textContent = `${idx+1}. ${q.text}`;
  choicesBox.innerHTML = "";
  const abjad = ['A','B','C','D','E','F','G'];
  q.choices.forEach((c,ci)=>{
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.innerHTML = `<b>${abjad[ci]}.</b> ${c}`;
    if(answers[q.id] === ci) btn.classList.add("active");
    btn.onclick = ()=>{ answers[q.id] = ci; renderQuestion(); renderNumgrid(); };
    choicesBox.appendChild(btn);
  });
  // Ragu-ragu
  const raguBox = document.getElementById('ragu');
  raguBox.checked = !!q.ragu;
  raguBox.onchange = ()=>{ q.ragu = raguBox.checked; renderNumgrid(); };
  btnPrev.disabled = idx===0;
  btnNext.disabled = idx===QUESTIONS.length-1;
  btnSubmit.style.display = (idx===QUESTIONS.length-1) ? '' : 'none';
}

function submitExam(){
  let correct = 0;
  reviewList.innerHTML = "";
  QUESTIONS.forEach((q,i)=>{
    const chosen = answers[q.id];
    const key = ANSWER_KEY[q.id];
    if(chosen === key) correct++;
    const li = document.createElement("li");
    li.innerHTML = `<b>${i+1}. ${q.text}</b><br>
      Jawaban Anda: ${chosen!=null?q.choices[chosen]:'<i>belum</i>'}<br>
      Kunci: <span class="text-success">${q.choices[key]}</span>`;
    reviewList.appendChild(li);
  });
  const score = Math.round((correct/QUESTIONS.length)*100);
  scoreBox.textContent = `Nilai: ${score} (Benar ${correct} dari ${QUESTIONS.length})`;
  scoreBox.className = "panel";
  scoreBox.classList.remove("d-none");
  screenQuiz.classList.add("d-none");
  screenResult.classList.remove("d-none");
  clearInterval(timer);
}


window.addEventListener('DOMContentLoaded', function() {
  renderNumgrid();
  btnStart.onclick = ()=>{
    screenIntro.classList.add("d-none");
    screenQuiz.classList.remove("d-none");
    renderQuestion(); renderNumgrid(); startTimer();
  };
  btnPrev.onclick = ()=>{ if(idx>0){ idx--; renderQuestion(); renderNumgrid(); } };
  btnNext.onclick = ()=>{ if(idx<QUESTIONS.length-1){ idx++; renderQuestion(); renderNumgrid(); } };
  btnSubmit.onclick = ()=>{ if(confirm("Kumpulkan jawaban?")) submitExam(); };
});
