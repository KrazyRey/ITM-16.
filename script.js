// =============================================
//  QUIZ DATA
// =============================================
const questions = [
  { type: 'mc', text: 'What is data presentation?', options: ['Collecting raw data', 'Organizing and summarizing information to make it meaningful', 'Destroying unnecessary data', 'Memorizing information'], answer: 1 },
  { type: 'mc', text: 'Which method uses sentences and paragraphs to explain information?', options: ['Graphical', 'Tabular', 'Textual', 'Statistical'], answer: 2 },
  { type: 'mc', text: 'Textual presentation is most suitable for:', options: ['Large datasets', 'Complex numerical comparisons', 'Small amounts of data', 'Continuous data only'], answer: 2 },
  { type: 'mc', text: 'Tabular presentation organizes data into:', options: ['Pictures and symbols', 'Rows and columns', 'Paragraphs and essays', 'Bars and slices'], answer: 1 },
  { type: 'mc', text: 'Which graph is best used to show trends over time?', options: ['Pie Chart', 'Bar Graph', 'Line Graph', 'Pictograph'], answer: 2 },
  { type: 'mc', text: 'A graph that compares categories using rectangular bars is called a:', options: ['Histogram', 'Pie Chart', 'Line Graph', 'Bar Graph'], answer: 3 },
  { type: 'mc', text: 'Which graphical tool displays parts of a whole using slices?', options: ['Pie Chart', 'Histogram', 'Flowchart', 'Control Chart'], answer: 0 },
  { type: 'mc', text: 'A Pareto Chart is best described as:', options: ['A circular graph', 'A bar graph in ascending order', 'A bar graph in descending order with a cumulative line', 'A chart showing process steps'], answer: 2 },
  { type: 'mc', text: 'Which tool is also known as a Fishbone Diagram?', options: ['Control Chart', 'Flowchart', 'Run Chart', 'Cause-and-Effect Diagram'], answer: 3 },
  { type: 'mc', text: 'Which graphical tool monitors a process over time to determine stability?', options: ['Run Chart', 'Control Chart', 'Pie Chart', 'Pictograph'], answer: 1 },
  { type: 'tf', text: 'Graphical presentation makes complex data easier to understand.', answer: true },
  { type: 'tf', text: 'Tables are not useful for numerical data.', answer: false },
  { type: 'tf', text: 'A Run Chart helps track changes and trends over time.', answer: true },
  { type: 'tf', text: 'Flowcharts use symbols and arrows to represent steps in a process.', answer: true },
  { type: 'tf', text: 'Quality improvement focuses on reducing errors and increasing efficiency.', answer: true },
];

const letters = ['A', 'B', 'C', 'D'];

// =============================================
//  QUIZ STATE
// =============================================
let currentQ = 0;
let userAnswers = new Array(questions.length).fill(null);
let answered = new Array(questions.length).fill(false);
let quizFinished = false;

// =============================================
//  QUIZ RENDER
// =============================================
function renderQuiz() {
  currentQ = 0;
  userAnswers = new Array(questions.length).fill(null);
  answered = new Array(questions.length).fill(false);
  quizFinished = false;

  const container = document.getElementById('quizContainer');
  container.innerHTML = `
    <div class="qi-header">
      <div class="qi-progress-wrap">
        <div class="qi-progress-track">
          <div class="qi-progress-fill" id="quizProgressFill" style="width:0%"></div>
        </div>
        <span class="qi-progress-label" id="quizProgressLabel">0 / ${questions.length}</span>
      </div>
      <div class="qi-dots" id="quizDots"></div>
    </div>

    <div class="qi-viewport" id="quizViewport">
      <div class="qi-card-track" id="quizCardTrack"></div>
    </div>

    <div class="qi-nav">
      <button class="qi-btn-prev" id="quizPrevBtn" onclick="quizPrev()">← Prev</button>
      <button class="qi-btn-next" id="quizNextBtn" onclick="quizNext()">Next →</button>
    </div>

    <div class="qi-results" id="quizResults" style="display:none;"></div>
  `;

  buildDots();
  buildCards();
  goToQuestion(0, false);
}

function buildDots() {
  const wrap = document.getElementById('quizDots');
  wrap.innerHTML = '';
  questions.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'qi-dot';
    d.id = `dot-${i}`;
    d.title = `Question ${i + 1}`;
    d.onclick = () => goToQuestion(i, true);
    wrap.appendChild(d);
  });
}

function buildCards() {
  const track = document.getElementById('quizCardTrack');
  track.innerHTML = '';
  questions.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'qi-card';
    card.id = `qcard-${i}`;

    const partLabel = i < 10 ? 'Multiple Choice' : 'True or False';
    const typeIcon = i < 10 ? '⊙' : '◈';

    let optionsHTML = '';
    if (q.type === 'mc') {
      optionsHTML = `<div class="qi-options">
        ${q.options.map((opt, j) => `
          <button class="qi-opt" id="qi-opt-${i}-${j}" onclick="selectAnswer(${i}, ${j})">
            <span class="qi-opt-letter">${letters[j]}</span>
            <span class="qi-opt-text">${opt}</span>
          </button>
        `).join('')}
      </div>`;
    } else {
      optionsHTML = `<div class="qi-tf">
        <button class="qi-tf-btn qi-tf-true" id="qi-tf-${i}-true" onclick="selectAnswer(${i}, true)">
          <span class="qi-tf-icon">✓</span> TRUE
        </button>
        <button class="qi-tf-btn qi-tf-false" id="qi-tf-${i}-false" onclick="selectAnswer(${i}, false)">
          <span class="qi-tf-icon">✗</span> FALSE
        </button>
      </div>`;
    }

    card.innerHTML = `
      <div class="qi-card-top">
        <span class="qi-card-badge">${typeIcon} ${partLabel}</span>
        <span class="qi-card-num">${i + 1} <span style="opacity:0.4">/ ${questions.length}</span></span>
      </div>
      <div class="qi-card-q">${q.text}</div>
      ${optionsHTML}
      <div class="qi-feedback" id="qi-feedback-${i}" style="display:none;"></div>
    `;
    track.appendChild(card);
  });
}

// =============================================
//  NAVIGATION
// =============================================
function goToQuestion(idx, animate) {
  if (idx < 0 || idx >= questions.length) return;
  const track = document.getElementById('quizCardTrack');
  const cards = track.querySelectorAll('.qi-card');
  cards.forEach((c, i) => {
    c.classList.remove('qi-card-active', 'qi-card-prev', 'qi-card-next');
    if (i < idx) c.classList.add('qi-card-prev');
    else if (i > idx) c.classList.add('qi-card-next');
    else c.classList.add('qi-card-active');
  });
  currentQ = idx;
  updateProgress();
  updateDots();
  updateNavBtns();
}

function quizNext() {
  if (quizFinished) return;
  if (currentQ < questions.length - 1) goToQuestion(currentQ + 1, true);
  else finishQuiz();
}

function quizPrev() {
  if (currentQ > 0) goToQuestion(currentQ - 1, true);
}

// =============================================
//  ANSWER SELECTION
// =============================================
function selectAnswer(qIdx, value) {
  if (answered[qIdx]) return;
  const q = questions[qIdx];
  userAnswers[qIdx] = value;
  answered[qIdx] = true;
  const isCorrect = value === q.answer;

  if (q.type === 'mc') {
    for (let j = 0; j < 4; j++) {
      const btn = document.getElementById(`qi-opt-${qIdx}-${j}`);
      if (!btn) continue;
      btn.disabled = true;
      if (j === q.answer) btn.classList.add('qi-opt-correct');
      else if (j === value && !isCorrect) btn.classList.add('qi-opt-wrong');
      else btn.classList.add('qi-opt-dim');
    }
  } else {
    ['true', 'false'].forEach(v => {
      const btn = document.getElementById(`qi-tf-${qIdx}-${v}`);
      if (!btn) return;
      btn.disabled = true;
      const boolVal = v === 'true';
      if (boolVal === q.answer) btn.classList.add('qi-opt-correct');
      else if (boolVal === value && !isCorrect) btn.classList.add('qi-opt-wrong');
      else btn.classList.add('qi-opt-dim');
    });
  }

  const fb = document.getElementById(`qi-feedback-${qIdx}`);
  fb.style.display = 'flex';
  fb.className = `qi-feedback ${isCorrect ? 'qi-feedback-correct' : 'qi-feedback-wrong'}`;
  fb.innerHTML = isCorrect
    ? `<span class="qi-fb-icon">✓</span><span>Correct! Well done.</span>`
    : `<span class="qi-fb-icon">✗</span><span>Incorrect. Nice Try.</span>`;

  updateDots();
  updateProgress();

  setTimeout(() => {
    if (currentQ === qIdx) {
      if (currentQ < questions.length - 1) quizNext();
      else finishQuiz();
    }
  }, 1300);
}

// =============================================
//  FINISH
// =============================================
function finishQuiz() {
  quizFinished = true;
  const score = userAnswers.reduce((acc, ans, i) => ans === questions[i].answer ? acc + 1 : acc, 0);
  const pct = Math.round((score / questions.length) * 100);

  let grade, gradeColor, msg;
  if (pct >= 90) { grade = 'Outstanding!'; gradeColor = '#5a9e4a'; msg = 'Excellent mastery of the material.'; }
  else if (pct >= 75) { grade = 'Great Job!'; gradeColor = '#b06a2e'; msg = 'You have a solid understanding.'; }
  else if (pct >= 60) { grade = 'Good Effort'; gradeColor = '#c9834a'; msg = 'Review a few areas to strengthen your knowledge.'; }
  else { grade = 'Keep Practicing'; gradeColor = '#c0533e'; msg = 'Re-read the material and try again!'; }

  const res = document.getElementById('quizResults');
  res.style.display = 'block';

  const summary = questions.map((q, i) => {
    const correct = userAnswers[i] === q.answer;
    let answerText = '';
    if (q.type === 'mc') {
      answerText = userAnswers[i] !== null ? q.options[userAnswers[i]] : 'Not answered';
    } else {
      answerText = userAnswers[i] !== null ? (userAnswers[i] ? 'TRUE' : 'FALSE') : 'Not answered';
    }
    let correctText = '';
    if (q.type === 'mc') correctText = q.options[q.answer];
    else correctText = q.answer ? 'TRUE' : 'FALSE';
    return `
      <div class="qi-summary-item ${correct ? 'qi-s-correct' : 'qi-s-wrong'}">
        <span class="qi-s-icon">${correct ? '✓' : '✗'}</span>
        <div class="qi-s-body">
          <div class="qi-s-q">Q${i + 1}: ${q.text}</div>
          ${!correct ? `<div class="qi-s-a">Your answer: <strong>${answerText}</strong> · Correct: <strong>${correctText}</strong></div>` : `<div class="qi-s-a">Your answer: <strong>${answerText}</strong></div>`}
        </div>
      </div>`;
  }).join('');

  // SVG ring
  const circumference = 2 * Math.PI * 50;
  const offset = circumference * (1 - pct / 100);

  res.innerHTML = `
    <div class="qi-score-card">
      <div class="qi-score-ring">
        <svg viewBox="0 0 120 120" class="qi-ring-svg">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="9"/>
          <circle cx="60" cy="60" r="50" fill="none" stroke="${gradeColor}" stroke-width="9"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"/>
        </svg>
        <div class="qi-score-inner">
          <div class="qi-score-pct">${pct}<span style="font-size:1.5rem">%</span></div>
          <div class="qi-score-frac">${score}/${questions.length}</div>
        </div>
      </div>
      <div class="qi-score-grade" style="color:${gradeColor}">${grade}</div>
      <div class="qi-score-msg">${msg}</div>
      <button class="btn-primary qi-retry-btn" onclick="retryQuiz()">↺ Try Again</button>
    </div>
    <div class="qi-summary">
      <div class="qi-summary-title">Question Review</div>
      ${summary}
    </div>
  `;

  const viewport = document.getElementById('quizViewport');
  const nav = document.querySelector('.qi-nav');
  if (viewport) viewport.style.display = 'none';
  if (nav) nav.style.display = 'none';

  res.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function retryQuiz() {
  renderQuiz();
  document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
}

// =============================================
//  UI HELPERS
// =============================================
function updateProgress() {
  const done = answered.filter(Boolean).length;
  const pct = (done / questions.length) * 100;
  const fill = document.getElementById('quizProgressFill');
  const label = document.getElementById('quizProgressLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${questions.length}`;
}

function updateDots() {
  questions.forEach((_, i) => {
    const d = document.getElementById(`dot-${i}`);
    if (!d) return;
    d.className = 'qi-dot';
    if (i === currentQ) d.classList.add('qi-dot-active');
    if (answered[i]) {
      d.classList.add(userAnswers[i] === questions[i].answer ? 'qi-dot-correct' : 'qi-dot-wrong');
    }
  });
}

function updateNavBtns() {
  const prev = document.getElementById('quizPrevBtn');
  const next = document.getElementById('quizNextBtn');
  if (!prev || !next) return;
  prev.disabled = currentQ === 0;
  next.textContent = currentQ === questions.length - 1 ? 'Finish ✓' : 'Next →';
}

// =============================================
//  INTERSECTION OBSERVER
// =============================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', () => {
  renderQuiz();
  document.querySelectorAll('.reveal, .chart-card, .tool-card, .adv-card, .method-card, .tool-item').forEach(el => {
    observer.observe(el);
  });
});

// =============================================
//  CHART CARD EXPAND / COLLAPSE (zoom + shrink)
// =============================================
function toggleChartCard(card) {
  const grid = card.closest('.charts-grid');
  const isExpanded = card.classList.contains('chart-expanded');

  // Collapse everything
  document.querySelectorAll('.chart-card.chart-expanded').forEach(c => c.classList.remove('chart-expanded'));

  if (isExpanded) {
    // Clicked the already-expanded card → collapse, remove grid state
    grid.classList.remove('has-expanded');
  } else {
    // Expand this card, mark grid so siblings shrink
    card.classList.add('chart-expanded');
    grid.classList.add('has-expanded');
    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
  }
}

// =============================================
//  TOOL CARD EXPAND / COLLAPSE (zoom + shrink)
// =============================================
function toggleToolCard(card) {
  const grid = card.closest('.tools-grid');
  const isExpanded = card.classList.contains('tool-expanded');

  // Collapse everything
  document.querySelectorAll('.tool-card.tool-expanded').forEach(c => c.classList.remove('tool-expanded'));

  if (isExpanded) {
    grid.classList.remove('has-expanded');
  } else {
    card.classList.add('tool-expanded');
    grid.classList.add('has-expanded');
    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
  }
}

// =============================================
//  INTRO OVERLAY
// =============================================
function spawnIntroParticles() {
  const container = document.getElementById('introParticles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'intro-particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 20}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${Math.random() * 8 + 5}s;
      animation-delay: ${Math.random() * 6}s;
      opacity: ${Math.random() * 0.5 + 0.3};
    `;
    container.appendChild(p);
  }
}

function dismissIntro() {
  const overlay = document.getElementById('introOverlay');
  if (!overlay) return;
  overlay.classList.add('dismissing');
  overlay.addEventListener('animationend', () => {
    overlay.classList.add('hidden');
  }, { once: true });
}

// =============================================
//  THANK YOU PARTICLES + OBSERVER
// =============================================
function spawnTyParticles() {
  const container = document.getElementById('tyParticles');
  if (!container) return;
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'ty-particle';
    const size = Math.random() * 5 + 2;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 15}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${Math.random() * 10 + 6}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.5 + 0.2};
    `;
    container.appendChild(p);
  }
}

const tyObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('ty-visible');
  });
}, { threshold: 0.2 });

document.addEventListener('DOMContentLoaded', () => {
  spawnIntroParticles();
  spawnTyParticles();
  const tyInner = document.querySelector('.thankyou-inner');
  if (tyInner) tyObserver.observe(tyInner);
});
