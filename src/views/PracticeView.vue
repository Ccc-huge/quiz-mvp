<template>
  <div class="practice-page" v-if="currentQuestion">
    <header class="practice-header">
      <div class="header-content">
        <div class="progress-circle">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle" :stroke-dasharray="progressPercent + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="20.35" class="percentage">{{ progressPercent }}%</text>
          </svg>
        </div>
        <div class="header-info">
          <div class="question-num">第 {{ currentIndex + 1 }} 题 / 共 {{ total }} 题</div>
          <div class="question-tags">
            <span class="type-badge" :class="currentQuestion.type">{{ typeLabel(currentQuestion.type) }}</span>
            <span class="diff-badge" :class="'d' + currentQuestion.difficulty">{{ difficultyLabel(currentQuestion.difficulty) }}</span>
            <span class="mark-badge" v-if="isMarked" @click="toggleMark">
              <span class="mark-icon">📌</span> 已标记
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" :class="{ active: isFavorite }" @click="toggleFavorite" title="收藏">
            <span v-if="isFavorite">★</span>
            <span v-else>☆</span>
          </button>
          <button class="action-btn nav-btn" @click="showNavigator = !showNavigator" title="题号">
            <span>☰</span>
          </button>
        </div>
      </div>
      
      <div class="stats-bar">
        <div class="stat-item correct">
          <span class="stat-icon">✓</span>
          <span class="stat-value">{{ correctCount }}</span>
          <span class="stat-label">正确</span>
        </div>
        <div class="stat-item wrong">
          <span class="stat-icon">✗</span>
          <span class="stat-value">{{ wrongCount }}</span>
          <span class="stat-label">错误</span>
        </div>
        <div class="stat-item marked">
          <span class="stat-icon">📌</span>
          <span class="stat-value">{{ markedCount }}</span>
          <span class="stat-label">标记</span>
        </div>
        <div class="stat-item remaining">
          <span class="stat-icon">○</span>
          <span class="stat-value">{{ remainingCount }}</span>
          <span class="stat-label">待答</span>
        </div>
      </div>
    </header>

    <div class="question-navigator" v-if="showNavigator">
      <div class="nav-header">
        <span class="nav-title">题号导航</span>
        <button class="nav-close" @click="showNavigator = false">×</button>
      </div>
      <div class="nav-content">
        <div class="nav-legend">
          <span class="legend-item"><span class="dot correct"></span>正确</span>
          <span class="legend-item"><span class="dot wrong"></span>错误</span>
          <span class="legend-item"><span class="dot marked"></span>标记</span>
          <span class="legend-item"><span class="dot current"></span>当前</span>
          <span class="legend-item"><span class="dot pending"></span>待答</span>
        </div>
        <div class="nav-grid">
          <button
            v-for="(q, idx) in list"
            :key="q.id"
            class="nav-item"
            :class="getNavClass(idx)"
            @click="jumpToQuestion(idx)"
          >
            {{ idx + 1 }}
          </button>
        </div>
      </div>
    </div>

    <main class="practice-main">
      <div class="question-card">
        <div class="question-chapter">
          {{ currentQuestion.chapterName }} · {{ currentQuestion.knowledgeName }}
        </div>
        <h2 class="question-text">{{ currentQuestion.question }}</h2>
      </div>

      <div class="options-list" v-if="isOptionType">
        <div
          v-for="(opt, idx) in currentQuestion.options"
          :key="idx"
          class="option-item"
          :class="{
            selected: selectedIndexes.includes(idx),
            correct: submitted && isCorrectAnswer(idx),
            wrong: submitted && selectedIndexes.includes(idx) && !isCorrectAnswer(idx),
            disabled: submitted
          }"
          @click="!submitted && selectOption(idx)"
        >
          <div class="option-marker">{{ optionPrefix(idx) }}</div>
          <div class="option-content">{{ opt }}</div>
          <div class="option-status" v-if="submitted">
            <span v-if="isCorrectAnswer(idx)" class="status-icon correct">✓</span>
            <span v-else-if="selectedIndexes.includes(idx)" class="status-icon wrong">✗</span>
          </div>
        </div>
      </div>

      <div class="fill-section" v-else-if="currentQuestion.type === 'fill'">
        <input 
          class="fill-input" 
          v-model="fillAnswer" 
          placeholder="请输入答案"
          :disabled="submitted"
          @keyup.enter="!submitted && submitAnswer()"
        />
      </div>

      <div class="result-card" v-if="submitted" :class="{ correct: isCorrect, wrong: !isCorrect }">
        <div class="result-header">
          <span class="result-icon">{{ isCorrect ? '🎉' : '😞' }}</span>
          <span class="result-text">{{ isCorrect ? '回答正确' : '回答错误' }}</span>
        </div>
        <div class="result-detail">
          <div class="detail-row">
            <span class="detail-label">你的答案：</span>
            <span class="detail-value">{{ userAnswerText }}</span>
          </div>
          <div class="detail-row" v-if="!isCorrect">
            <span class="detail-label">正确答案：</span>
            <span class="detail-value correct">{{ correctAnswerText }}</span>
          </div>
        </div>
        <div class="explanation" v-if="currentQuestion.explanation">
          <div class="exp-title">📖 解析</div>
          <div class="exp-content">{{ currentQuestion.explanation }}</div>
        </div>
      </div>
    </main>

    <footer class="practice-footer">
      <button 
        class="mark-btn"
        :class="{ active: isMarked }"
        @click="toggleMark"
      >
        {{ isMarked ? '✓ 已标记' : '📌 标记此题' }}
      </button>
      <button 
        class="next-btn"
        @click="skipQuestion"
      >
        下一题 →
      </button>
      <button 
        class="submit-btn" 
        @click="submitted ? nextQuestion() : submitAnswer()"
        :disabled="!canSubmit && !submitted"
      >
        {{ submitted ? '下一题 →' : '提交答案' }}
      </button>
    </footer>
  </div>

  <div class="practice empty" v-else>
    <div class="empty-illustration">📚</div>
    <div class="empty-title">没有可练习的题目</div>
    <div class="empty-sub">请返回选择其他模式，或先在题库中枢上传题库。</div>
    <div class="empty-actions">
      <button class="btn-outline" @click="$router.push('/modes')">返回模式选择</button>
      <button class="btn-solid" @click="$router.push('/bank')">去题库中枢</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getItem, setItem } from '../utils/storage';
import { showToast } from '../ui/toast';
import { getCurrentBankId, getCurrentQuestions } from '../utils/questionBank';
import { getPracticeSession } from '../utils/practiceSession';

const route = useRoute();
const router = useRouter();

const list = ref([]);
const currentIndex = ref(0);
const currentQuestion = ref(null);

const selectedIndexes = ref([]);
const fillAnswer = ref('');
const submitted = ref(false);

const isCorrect = ref(false);
const userAnswerText = ref('');
const correctAnswerText = ref('');
const isFavorite = ref(false);
const correctCount = ref(0);
const wrongCount = ref(0);
const questionResults = ref({});
const markedQuestions = ref(new Set());
const isMarked = ref(false);
const showNavigator = ref(false);

const total = computed(() => list.value.length);

const markedCount = computed(() => markedQuestions.value.size);

const remainingCount = computed(() => {
  return total.value - correctCount.value - wrongCount.value - markedCount.value;
});

const progressPercent = computed(() => {
  const answered = correctCount.value + wrongCount.value;
  if (total.value === 0) return 0;
  return Math.round((correctCount.value / total.value) * 100);
});

const canSubmit = computed(() => {
  if (currentQuestion.value?.type === 'fill') {
    return fillAnswer.value.trim().length > 0;
  }
  return selectedIndexes.value.length > 0;
});

const isOptionType = computed(() => {
  const q = currentQuestion.value;
  return q && (q.type === 'single' || q.type === 'multiple' || q.type === 'judge');
});

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function optionPrefix(idx) {
  return String.fromCharCode(65 + idx);
}

function typeLabel(type) {
  const map = { single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题' };
  return map[type] || type;
}

function difficultyLabel(d) {
  const map = { 1: '简单', 2: '一般', 3: '中等', 4: '困难', 5: '极难' };
  return map[d] || '一般';
}

function loadQuestion(index) {
  const q = list.value[index];
  if (!q) return;

  currentIndex.value = index;
  currentQuestion.value = q;

  selectedIndexes.value = [];
  fillAnswer.value = '';
  submitted.value = false;

  isCorrect.value = false;
  userAnswerText.value = '';
  correctAnswerText.value = '';

  const favorites = getItem('FAVORITE_QUESTIONS', []);
  isFavorite.value = favorites.includes(q.id);
  isMarked.value = markedQuestions.value.has(q.id);
}

function selectOption(idx) {
  if (submitted.value) return;
  const q = currentQuestion.value;
  const selected = [...selectedIndexes.value];

  if (q.type === 'single' || q.type === 'judge') {
    selectedIndexes.value = [idx];
    return;
  }

  if (q.type === 'multiple') {
    const p = selected.indexOf(idx);
    if (p === -1) selected.push(idx);
    else selected.splice(p, 1);
    selectedIndexes.value = selected;
  }
}

function isCorrectAnswer(idx) {
  const q = currentQuestion.value;
  if (!q || q.type === 'fill') return false;
  return (q.answer || []).includes(idx);
}

function submitAnswer() {
  const q = currentQuestion.value;
  if (!q || !canSubmit.value) return;

  let correct = false;
  let userText = '';
  let correctText = '';

  if (q.type === 'fill') {
    const user = (fillAnswer.value || '').trim();
    const std = (q.answerText || '').trim();
    userText = user || '未作答';
    correctText = std;
    correct = user && user.toLowerCase() === std.toLowerCase();
  } else {
    const selected = [...selectedIndexes.value].sort();
    const ans = (q.answer || []).slice().sort();
    userText = selected.length ? selected.map(optionPrefix).join(',') : '未作答';
    correctText = ans.map(optionPrefix).join(',');
    correct = selected.length === ans.length && selected.every((v, i) => v === ans[i]);
  }

  submitted.value = true;
  isCorrect.value = correct;
  userAnswerText.value = userText;
  correctAnswerText.value = correctText;

  questionResults.value[q.id] = correct;
  if (correct) {
    correctCount.value++;
    removeWrong(q.id);
  } else {
    wrongCount.value++;
    addWrong(q.id);
  }
  saveRecord(q.id, correct);
  
  if (isMarked.value) {
    markedQuestions.value.delete(q.id);
    isMarked.value = false;
  }
}

function saveRecord(questionId, correct) {
  const records = getItem('PRACTICE_RECORDS', []);
  records.push({
    bankId: getCurrentBankId(),
    questionId,
    isCorrect: correct,
    time: Date.now()
  });
  setItem('PRACTICE_RECORDS', records);
}

function addWrong(id) {
  const wrong = getItem('WRONG_QUESTIONS', []);
  if (!wrong.includes(id)) {
    wrong.push(id);
    setItem('WRONG_QUESTIONS', wrong);
  }
}

function removeWrong(id) {
  const wrong = getItem('WRONG_QUESTIONS', []);
  const idx = wrong.indexOf(id);
  if (idx !== -1) {
    wrong.splice(idx, 1);
    setItem('WRONG_QUESTIONS', wrong);
  }
}

function toggleFavorite() {
  const q = currentQuestion.value;
  if (!q) return;
  const favorites = getItem('FAVORITE_QUESTIONS', []);
  const idx = favorites.indexOf(q.id);
  if (idx === -1) {
    favorites.push(q.id);
    isFavorite.value = true;
    showToast('已收藏', 'success');
  } else {
    favorites.splice(idx, 1);
    isFavorite.value = false;
    showToast('已取消收藏', 'info');
  }
  setItem('FAVORITE_QUESTIONS', favorites);
}

function toggleMark() {
  const q = currentQuestion.value;
  if (!q) return;
  
  if (markedQuestions.value.has(q.id)) {
    markedQuestions.value.delete(q.id);
    isMarked.value = false;
    showToast('已取消标记', 'info');
  } else {
    markedQuestions.value.add(q.id);
    isMarked.value = true;
    showToast('已标记此题', 'info');
  }
}

function skipQuestion() {
  const next = findNextUnanswered();
  if (next === -1) {
    showToast('所有题目已完成', 'info');
    return;
  }
  loadQuestion(next);
  showNavigator.value = false;
}

function findNextUnanswered() {
  const current = currentIndex.value;
  for (let i = current + 1; i < list.value.length; i++) {
    const q = list.value[i];
    if (!questionResults.value.hasOwnProperty(q.id) && !markedQuestions.value.has(q.id)) {
      return i;
    }
  }
  for (let i = 0; i < current; i++) {
    const q = list.value[i];
    if (!questionResults.value.hasOwnProperty(q.id) && !markedQuestions.value.has(q.id)) {
      return i;
    }
  }
  return -1;
}

function jumpToQuestion(index) {
  if (index >= 0 && index < list.value.length) {
    loadQuestion(index);
    showNavigator.value = false;
  }
}

function getNavClass(index) {
  const q = list.value[index];
  if (!q) return {};
  
  return {
    correct: questionResults.value[q.id] === true,
    wrong: questionResults.value[q.id] === false,
    marked: markedQuestions.value.has(q.id),
    current: index === currentIndex.value,
    pending: !questionResults.value.hasOwnProperty(q.id) && !markedQuestions.value.has(q.id)
  };
}

function nextQuestion() {
  const next = findNextUnanswered();
  if (next === -1) {
    showToast('恭喜！所有题目已完成', 'success');
    return;
  }
  loadQuestion(next);
}

onMounted(() => {
  const mode = route.query.mode || 'order';
  const sessionId = String(route.query.sessionId || '').trim();
  const bank = getCurrentQuestions();

  if (sessionId) {
    const session = getPracticeSession(sessionId);
    if (!session) {
      showToast('练习会话不存在或已过期', 'warning');
      router.replace('/modes');
      return;
    }
    const idSet = new Set(session.questionIds || []);
    const picked = bank.filter(q => idSet.has(q.id));
    list.value = mode === 'random' ? shuffle(picked) : picked;
  } else {
    list.value = mode === 'random' ? shuffle(bank) : bank;
  }

  if (!list.value.length) {
    currentQuestion.value = null;
    return;
  }
  loadQuestion(0);
});
</script>

<style scoped>
.practice-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #fafbfc 100%);
  display: flex;
  flex-direction: column;
}

.practice-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-circle {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.circular-chart {
  display: block;
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: #4caf50;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dasharray 0.5s ease;
}

.percentage {
  fill: #333;
  font-size: 8px;
  font-weight: 600;
  text-anchor: middle;
}

.header-info {
  flex: 1;
}

.question-num {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.question-tags {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.type-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.type-badge.single { background: #e6f7ff; color: #1890ff; }
.type-badge.multiple { background: #f6ffed; color: #52c41a; }
.type-badge.judge { background: #fff7e6; color: #fa8c16; }
.type-badge.fill { background: #f9f0ff; color: #722ed1; }

.diff-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}
.diff-badge.d1 { background: #f6ffed; color: #52c41a; }
.diff-badge.d2 { background: #e6f7ff; color: #1890ff; }
.diff-badge.d3 { background: #fff7e6; color: #fa8c16; }
.diff-badge.d4 { background: #fff1f0; color: #f5222d; }
.diff-badge.d5 { background: #fff1f0; color: #a8071a; }

.mark-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: #fff7e6;
  color: #fa8c16;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mark-icon {
  font-size: 10px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #eee;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #ddd;
}

.action-btn.active {
  color: #faad14;
  border-color: #faad14;
  background: #fffbe6;
}

.action-btn.nav-btn:hover {
  background: #e6f7ff;
  border-color: #1890ff;
}

.stats-bar {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px 14px;
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.stat-item.correct .stat-icon { color: #52c41a; }
.stat-item.wrong .stat-icon { color: #f5222d; }
.stat-item.marked .stat-icon { color: #fa8c16; }
.stat-item.remaining .stat-icon { color: #999; }
.stat-value { font-weight: 600; color: #333; }
.stat-label { color: #999; }

.question-navigator {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  z-index: 200;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
}

.nav-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.nav-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.nav-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
}

.dot.correct { background: #52c41a; }
.dot.wrong { background: #f5222d; }
.dot.marked { background: #fa8c16; }
.dot.current { background: #1890ff; border: 2px solid #1890ff; }
.dot.pending { background: #f0f0f0; border: 2px solid #ddd; }

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.nav-item {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0f0f0;
  color: #666;
}

.nav-item:hover {
  background: #e0e0e0;
}

.nav-item.correct {
  background: #52c41a;
  color: #fff;
}

.nav-item.wrong {
  background: #f5222d;
  color: #fff;
}

.nav-item.marked {
  background: #fa8c16;
  color: #fff;
}

.nav-item.current {
  background: #fff;
  border: 2px solid #1890ff;
  color: #1890ff;
}

.nav-item.pending {
  background: #f0f0f0;
  border: 2px solid #ddd;
  color: #999;
}

.practice-main {
  flex: 1;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px 100px;
}

.question-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}

.question-chapter {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.question-text {
  font-size: 18px;
  line-height: 1.7;
  color: #222;
  margin: 0;
  font-weight: 500;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #fff;
  border: 2px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover:not(.disabled) {
  border-color: #1890ff;
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24,144,255,0.15);
}

.option-item.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.option-item.correct {
  border-color: #52c41a;
  background: #f6ffed;
}

.option-item.wrong {
  border-color: #f5222d;
  background: #fff1f0;
}

.option-item.disabled {
  cursor: default;
}

.option-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.option-item.selected .option-marker {
  background: #1890ff;
  color: #fff;
}

.option-item.correct .option-marker {
  background: #52c41a;
  color: #fff;
}

.option-item.wrong .option-marker {
  background: #f5222d;
  color: #fff;
}

.option-content {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
}

.option-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  font-size: 18px;
  font-weight: 700;
}

.status-icon.correct {
  color: #52c41a;
}

.status-icon.wrong {
  color: #f5222d;
}

.fill-section {
  margin-bottom: 20px;
}

.fill-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid #eee;
  border-radius: 12px;
  background: #fff;
  transition: all 0.2s;
}

.fill-input:focus {
  outline: none;
  border-color: #1890ff;
}

.fill-input:disabled {
  background: #f5f5f5;
  color: #666;
}

.result-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card.correct {
  border-left: 4px solid #52c41a;
}

.result-card.wrong {
  border-left: 4px solid #f5222d;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.result-icon {
  font-size: 32px;
}

.result-text {
  font-size: 20px;
  font-weight: 600;
}

.result-card.correct .result-text {
  color: #52c41a;
}

.result-card.wrong .result-text {
  color: #f5222d;
}

.result-detail {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
}

.detail-value.correct {
  color: #52c41a;
}

.explanation {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.exp-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.exp-text {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.practice-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 14px 20px;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
  display: flex;
  gap: 10px;
  max-width: 720px;
  margin: 0 auto;
}

.mark-btn {
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.mark-btn:hover {
  background: #f5f5f5;
  border-color: #fa8c16;
}

.mark-btn.active {
  background: #fff7e6;
  border-color: #fa8c16;
  color: #fa8c16;
}

.next-btn {
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.next-btn:hover {
  background: #f5f5f5;
  border-color: #1890ff;
}

.submit-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.next {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.practice.empty {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f0f4ff 0%, #fafbfc 100%);
  padding: 40px 20px;
  text-align: center;
}

.empty-illustration {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.empty-sub {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
  max-width: 300px;
}

.empty-actions {
  display: flex;
  gap: 12px;
}

.btn-outline, .btn-solid {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
}

.btn-outline:hover {
  background: #f5f5f5;
}

.btn-solid {
  border: none;
  background: #1890ff;
  color: #fff;
}

.btn-solid:hover {
  background: #40a9ff;
}

@media (max-width: 768px) {
  .question-navigator {
    width: 100%;
  }
  
  .stats-bar {
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .nav-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
