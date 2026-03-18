<template>
  <div class="page">
    <header class="bar">
      <div class="bar-inner">
        <button class="back" @click="$router.back()">← 返回</button>
        <div class="title">
          <div class="h">精准搜题</div>
          <div class="s">按题干关键词/知识点/标签快速定位</div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="search-box">
        <input
          class="search-input"
          v-model="keyword"
          placeholder="输入题干关键词、知识点名称或标签搜索..."
          @keyup.enter="doSearch"
          ref="inputRef"
        />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>

      <div class="filters">
        <div class="filter-item">
          <span class="filter-label">题型：</span>
          <select class="filter-select" v-model="typeFilter">
            <option value="">全部</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
            <option value="judge">判断题</option>
            <option value="fill">填空题</option>
          </select>
        </div>
        <div class="filter-item">
          <span class="filter-label">难度：</span>
          <select class="filter-select" v-model="difficultyFilter">
            <option value="">全部</option>
            <option value="1">简单</option>
            <option value="2">一般</option>
            <option value="3">中等</option>
            <option value="4">困难</option>
            <option value="5">极难</option>
          </select>
        </div>
      </div>

      <div class="result-info" v-if="hasSearched">
        找到 <span class="count">{{ resultCount }}</span> 道题目
      </div>

      <div class="result-list" v-if="results.length > 0">
        <div class="result-item" v-for="q in results" :key="q.id" @click="viewQuestion(q)">
          <div class="result-header">
            <span class="type-tag" :class="q.type">{{ typeLabel(q.type) }}</span>
            <span class="diff-tag" :class="'d' + q.difficulty">{{ difficultyLabel(q.difficulty) }}</span>
            <span class="chapter">{{ q.chapterName }} - {{ q.knowledgeName }}</span>
          </div>
          <div class="result-question">{{ q.question }}</div>
          <div class="result-tags" v-if="q.tags && q.tags.length">
            <span class="tag" v-for="t in q.tags" :key="t">{{ t }}</span>
          </div>
        </div>
      </div>

      <div class="empty" v-else-if="hasSearched">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">未找到匹配的题目</div>
        <div class="empty-hint">试试调整搜索词或筛选条件</div>
      </div>

      <div class="tips" v-if="!hasSearched">
        <div class="tips-title">搜索提示</div>
        <ul class="tips-list">
          <li>支持按<strong>题干内容</strong>搜索，如"变量"、"数组"</li>
          <li>支持按<strong>知识点名称</strong>搜索，如"变量声明"</li>
          <li>支持按<strong>标签</strong>搜索，如"JavaScript"</li>
          <li>可以使用多个关键词，用空格分隔</li>
        </ul>
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
            :class="{
              correct: isCorrectAnswer(idx),
              selected: isUserSelected(idx)
            }"
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
        <button class="btn primary" @click="practiceThis(selectedQuestion)">练习此题</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentQuestions } from '../utils/questionBank';
import { getItem, setItem } from '../utils/storage';
import { createPracticeSession } from '../utils/practiceSession';

const router = useRouter();

const keyword = ref('');
const typeFilter = ref('');
const difficultyFilter = ref('');
const results = ref([]);
const hasSearched = ref(false);
const inputRef = ref(null);
const selectedQuestion = ref(null);

const allQuestions = ref([]);

const resultCount = computed(() => results.value.length);

onMounted(() => {
  allQuestions.value = getCurrentQuestions();
  nextTick(() => {
    inputRef.value?.focus();
  });
});

function doSearch() {
  const kw = (keyword.value || '').trim().toLowerCase();
  
  if (!kw && !typeFilter.value && !difficultyFilter.value) {
    results.value = [];
    hasSearched.value = true;
    return;
  }

  const kwList = kw.split(/\s+/).filter(Boolean);

  results.value = allQuestions.value.filter(q => {
    let match = true;

    if (kwList.length > 0) {
      match = kwList.some(k => {
        const inQuestion = q.question.toLowerCase().includes(k);
        const inKnowledge = (q.knowledgeName || '').toLowerCase().includes(k);
        const inChapter = (q.chapterName || '').toLowerCase().includes(k);
        const inTags = (q.tags || []).some(t => t.toLowerCase().includes(k));
        return inQuestion || inKnowledge || inChapter || inTags;
      });
    }

    if (typeFilter.value && q.type !== typeFilter.value) {
      match = false;
    }

    if (difficultyFilter.value && q.difficulty !== Number(difficultyFilter.value)) {
      match = false;
    }

    return match;
  });

  hasSearched.value = true;
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

function isUserSelected(idx) {
  return false;
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

function practiceThis(q) {
  const session = createPracticeSession({
    title: '搜题练习',
    questionIds: [q.id]
  });
  selectedQuestion.value = null;
  router.push({ name: 'practice', query: { mode: 'order', sessionId: session.id } });
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

.search-box { display: flex; gap: 10px; margin-bottom: 16px; }
.search-input { flex: 1; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; outline: none; }
.search-input:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.1); }
.search-btn { padding: 12px 24px; background: #1890ff; color: #fff; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
.search-btn:hover { background: #40a9ff; }

.filters { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-label { font-size: 13px; color: #666; }
.filter-select { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; outline: none; }

.result-info { margin-bottom: 12px; font-size: 14px; color: #666; }
.result-info .count { color: #1890ff; font-weight: 700; }

.result-list { display: flex; flex-direction: column; gap: 12px; }
.result-item { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 14px; cursor: pointer; transition: all 0.2s; }
.result-item:hover { border-color: #1890ff; box-shadow: 0 2px 8px rgba(24,144,255,0.1); }
.result-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
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
.chapter { font-size: 12px; color: #999; }
.result-question { font-size: 15px; line-height: 1.6; color: #333; margin-bottom: 8px; }
.result-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { padding: 2px 8px; background: #f5f5f5; border-radius: 4px; font-size: 11px; color: #666; }

.empty { text-align: center; padding: 40px 20px; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-size: 16px; color: #333; margin-bottom: 8px; }
.empty-hint { font-size: 13px; color: #999; }

.tips { background: #fff; border-radius: 8px; padding: 16px; margin-top: 20px; }
.tips-title { font-weight: 600; margin-bottom: 10px; font-size: 14px; }
.tips-list { margin: 0; padding-left: 20px; font-size: 13px; color: #666; line-height: 1.8; }
.tips-list li { margin-bottom: 4px; }

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
.btn { flex: 1; padding: 10px 0; border-radius: 6px; border: 1px solid #ddd; background: #fff; font-size: 14px; cursor: pointer; }
.btn:hover { background: #f5f5f5; }
.btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.btn.primary:hover { background: #40a9ff; }
</style>
