<template>
  <div class="page">
    <header class="bar">
      <div class="bar-inner">
        <button class="back" @click="$router.push('/')">← 返回首页</button>
        <div class="title">
          <div class="h">错题本</div>
          <div class="s">共 {{ items.length }} 道错题，累计错误 {{ totalWrongCount }} 次</div>
        </div>
      </div>
    </header>

    <main class="main" v-if="items.length > 0">
      <div class="action-bar">
        <button class="btn primary large" @click="startPractice">
          🔄 开始重练错题
        </button>
        <button class="btn secondary" @click="clearWrongs">
          🗑 清空错题记录
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num">{{ items.length }}</div>
          <div class="stat-label">错题数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ masteredCount }}</div>
          <div class="stat-label">已掌握</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ remainingCount }}</div>
          <div class="stat-label">待练习</div>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">整体进度</span>
          <span class="progress-percent">{{ progressPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-hint">答对后将移出错题本</div>
      </div>

      <div class="filter-bar">
        <button 
          class="filter-btn" 
          :class="{ active: filterType === 'all' }"
          @click="filterType = 'all'"
        >
          全部
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filterType === 'single' }"
          @click="filterType = 'single'"
        >
          单选
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filterType === 'multiple' }"
          @click="filterType = 'multiple'"
        >
          多选
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filterType === 'judge' }"
          @click="filterType = 'judge'"
        >
          判断
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filterType === 'fill' }"
          @click="filterType = 'fill'"
        >
          填空
        </button>
      </div>

      <div class="question-list">
        <div class="question-card" v-for="q in filteredItems" :key="q.id">
          <div class="card-header">
            <span class="type-tag" :class="q.type">{{ typeLabel(q.type) }}</span>
            <span class="diff-tag" :class="'d' + q.difficulty">{{ difficultyLabel(q.difficulty) }}</span>
            <span class="chapter">{{ q.chapterName }} - {{ q.knowledgeName }}</span>
            <span class="wrong-count">❌ {{ getWrongCount(q.id) }}次</span>
          </div>
          <div class="card-question" @click="viewQuestion(q)">{{ q.question }}</div>
          <div class="card-tags" v-if="q.tags && q.tags.length">
            <span class="tag" v-for="t in q.tags" :key="t">{{ t }}</span>
          </div>
        </div>
      </div>
    </main>

    <main class="main empty" v-else>
      <div class="empty-icon">✅</div>
      <div class="empty-title">太棒了！</div>
      <div class="empty-sub">您目前没有错题，保持下去！</div>
      <div class="empty-actions">
        <button class="btn primary" @click="$router.push('/modes')">去刷题</button>
      </div>
    </main>
  </div>

  <div class="modal-overlay" v-if="selectedQuestion" @click.self="selectedQuestion = null">
    <div class="modal">
      <div class="modal-header">
        <span class="type-tag" :class="selectedQuestion.type">{{ typeLabel(selectedQuestion.type) }}</span>
        <button class="modal-close" @click="selectedQuestion = null">×</button>
      </div>
      <div class="modal-body">
        <div class="modal-chapter">{{ selectedQuestion.chapterName }} - {{ selectedQuestion.knowledgeName }}</div>
        <div class="modal-question">{{ selectedQuestion.question }}</div>
        
        <div class="modal-options" v-if="selectedQuestion.options && selectedQuestion.options.length">
          <div
            class="modal-option"
            :class="{ correct: isCorrectAnswer(idx) }"
            v-for="(opt, idx) in selectedQuestion.options"
            :key="idx"
          >
            {{ optionPrefix(idx) }}. {{ opt }}
          </div>
        </div>

        <div class="modal-answer" v-if="selectedQuestion.type === 'fill'">
          <div class="answer-label">正确答案：</div>
          <div class="answer-text">{{ selectedQuestion.answerText }}</div>
        </div>

        <div class="modal-explanation" v-if="selectedQuestion.explanation">
          <div class="exp-label">解析：</div>
          <div class="exp-text">{{ selectedQuestion.explanation }}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="toggleFav(selectedQuestion)">
          {{ isFavorited(selectedQuestion.id) ? '取消收藏' : '收藏本题' }}
        </button>
        <button class="btn primary" @click="practiceSingle(selectedQuestion)">练习此题</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getItem, setItem } from '../utils/storage';
import { getCurrentQuestions } from '../utils/questionBank';
import { createPracticeSession } from '../utils/practiceSession';
import { showToast } from '../ui/toast';

const router = useRouter();

const items = ref([]);
const filterType = ref('all');
const selectedQuestion = ref(null);
const wrongRecords = ref({});

const totalWrongCount = computed(() => {
  return Object.values(wrongRecords.value).reduce((sum, count) => sum + count, 0);
});

const masteredCount = computed(() => {
  return items.value.filter(q => getWrongCount(q.id) === 0).length;
});

const remainingCount = computed(() => {
  return items.value.length;
});

const progressPercent = computed(() => {
  if (items.value.length === 0) return 100;
  const wrongOnly = items.value.filter(q => {
    const count = wrongRecords.value[q.id] || 0;
    return count > 0;
  });
  const progress = ((items.value.length - wrongOnly.length) / items.value.length) * 100;
  return Math.round(progress);
});

const filteredItems = computed(() => {
  if (filterType.value === 'all') return items.value;
  return items.value.filter(q => q.type === filterType.value);
});

onMounted(() => {
  const wrongIds = getItem('WRONG_QUESTIONS', []);
  const bank = getCurrentQuestions();
  items.value = bank.filter(q => wrongIds.includes(q.id));
  
  const records = getItem('WRONG_RECORDS', {});
  wrongRecords.value = records;
});

function getWrongCount(id) {
  return wrongRecords.value[id] || 0;
}

function typeLabel(type) {
  const map = { single: '单选', multiple: '多选', judge: '判断', fill: '填空' };
  return map[type] || type;
}

function difficultyLabel(d) {
  const map = { 1: '简单', 2: '一般', 3: '中等', 4: '困难', 5: '极难' };
  return map[d] || '一般';
}

function optionPrefix(idx) {
  return String.fromCharCode(65 + idx);
}

function isCorrectAnswer(idx) {
  const q = selectedQuestion.value;
  if (!q) return false;
  if (q.type === 'fill') return false;
  return (q.answer || []).includes(idx);
}

function viewQuestion(q) {
  selectedQuestion.value = q;
}

function isFavorited(id) {
  const favs = getItem('FAVORITE_QUESTIONS', []);
  return favs.includes(id);
}

function toggleFav(q) {
  if (!q) return;
  const favs = getItem('FAVORITE_QUESTIONS', []);
  const idx = favs.indexOf(q.id);
  if (idx === -1) {
    favs.push(q.id);
  } else {
    favs.splice(idx, 1);
  }
  setItem('FAVORITE_QUESTIONS', favs);
}

function startPractice() {
  if (items.value.length === 0) {
    showToast('没有错题可练习', 'info');
    return;
  }
  const session = createPracticeSession({
    title: '错题重练',
    questionIds: items.value.map(q => q.id)
  });
  router.push({ name: 'practice', query: { mode: 'order', sessionId: session.id } });
}

function practiceSingle(q) {
  const session = createPracticeSession({
    title: '错题练习',
    questionIds: [q.id]
  });
  selectedQuestion.value = null;
  router.push({ name: 'practice', query: { mode: 'order', sessionId: session.id } });
}

function clearWrongs() {
  if (items.value.length === 0) {
    showToast('没有错题记录', 'info');
    return;
  }
  if (confirm('确定要清空所有错题记录吗？')) {
    setItem('WRONG_QUESTIONS', []);
    setItem('WRONG_RECORDS', {});
    items.value = [];
    wrongRecords.value = {};
    showToast('已清空错题记录', 'success');
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f7f7; }
.bar { background: #fff; border-bottom: 1px solid #eef2f7; }
.bar-inner { max-width: 1100px; margin: 0 auto; padding: 14px 16px; display: flex; gap: 12px; align-items: center; }
.back { border: none; background: transparent; color: #2346dc; font-weight: 900; cursor: pointer; font-size: 14px; }
.h { font-weight: 900; font-size: 18px; }
.s { margin-top: 4px; color: #6b7280; font-size: 12px; }
.main { max-width: 800px; margin: 0 auto; padding: 18px 16px 70px; }

.action-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.btn { padding: 10px 20px; border-radius: 8px; border: 1px solid #ddd; background: #fff; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn:hover { background: #f5f5f5; }
.btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.btn.primary:hover { background: #40a9ff; }
.btn.secondary { background: #fff; color: #666; }
.btn.large { padding: 14px 28px; font-size: 16px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.stat-card { background: #fff; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8; }
.stat-num { font-size: 28px; font-weight: 700; color: #1890ff; }
.stat-label { font-size: 12px; color: #999; margin-top: 4px; }

.progress-section { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #e8e8e8; }
.progress-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.progress-label { font-size: 14px; font-weight: 500; }
.progress-percent { font-size: 14px; color: #1890ff; font-weight: 600; }
.progress-bar { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #1890ff, #52c41a); border-radius: 4px; transition: width 0.3s; }
.progress-hint { font-size: 12px; color: #999; margin-top: 8px; }

.filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #ddd; background: #fff; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.filter-btn:hover { border-color: #1890ff; }
.filter-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }

.question-list { display: flex; flex-direction: column; gap: 12px; }
.question-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 10px; padding: 14px; transition: all 0.2s; }
.question-card:hover { border-color: #1890ff; box-shadow: 0 2px 8px rgba(24,144,255,0.1); }
.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.type-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.type-tag.single { background: #e6f7ff; color: #1890ff; }
.type-tag.multiple { background: #f6ffed; color: #52c41a; }
.type-tag.judge { background: #fff7e6; color: #fa8c16; }
.type-tag.fill { background: #f9f0ff; color: #722ed1; }
.diff-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.diff-tag.d1 { background: #f6ffed; color: #52c41a; }
.diff-tag.d2 { background: #e6f7ff; color: #1890ff; }
.diff-tag.d3 { background: #fff7e6; color: #fa8c16; }
.diff-tag.d4 { background: #fff1f0; color: #f5222d; }
.diff-tag.d5 { background: #fff1f0; color: #a8071a; }
.chapter { font-size: 12px; color: #999; flex: 1; }
.wrong-count { font-size: 12px; color: #f5222d; }
.card-question { font-size: 15px; line-height: 1.6; cursor: pointer; margin-bottom: 8px; }
.card-question:hover { color: #1890ff; }
.card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { padding: 2px 8px; background: #f5f5f5; border-radius: 4px; font-size: 11px; color: #666; }

.empty { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-title { font-size: 24px; font-weight: 700; color: #52c41a; margin-bottom: 8px; }
.empty-sub { font-size: 14px; color: #999; margin-bottom: 24px; }
.empty-actions { display: flex; justify-content: center; gap: 12px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; width: 100%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #eee; }
.modal-close { background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 0; line-height: 1; }
.modal-body { padding: 16px; overflow-y: auto; flex: 1; }
.modal-chapter { font-size: 12px; color: #999; margin-bottom: 10px; }
.modal-question { font-size: 16px; line-height: 1.6; margin-bottom: 16px; font-weight: 500; }
.modal-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.modal-option { padding: 10px 12px; border: 1px solid #e8e8e8; border-radius: 6px; font-size: 14px; }
.modal-option.correct { border-color: #52c41a; background: #f6ffed; }
.modal-answer { padding: 10px; background: #f6ffed; border-radius: 6px; margin-bottom: 16px; }
.answer-label { font-size: 12px; color: #52c41a; margin-bottom: 4px; }
.answer-text { font-size: 14px; font-weight: 500; }
.modal-explanation { padding: 12px; background: #fafafa; border-radius: 6px; }
.exp-label { font-size: 12px; color: #666; margin-bottom: 4px; }
.exp-text { font-size: 14px; color: #333; line-height: 1.5; }
.modal-footer { padding: 14px 16px; border-top: 1px solid #eee; display: flex; gap: 10px; }
</style>
