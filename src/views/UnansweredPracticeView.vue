<template>
  <div class="page">
    <header class="bar">
      <div class="bar-inner">
        <button class="back" @click="$router.push('/modes')">← 返回模式</button>
        <div class="title">
          <div class="h">未作习题</div>
          <div class="s">从当前题库筛选你还没做过的题目</div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="panel">
        <div class="stat">
          <div>当前题库共 <b>{{ total }}</b> 题，已做 <b>{{ done }}</b> 题，未做 <b>{{ remaining }}</b> 题</div>
        </div>
        <div class="actions">
          <button class="btn primary" @click="start" :disabled="remaining === 0">开始练习（随机）</button>
        </div>
        <div class="hint" v-if="remaining === 0">你已完成当前题库所有题目。</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getItem } from '../utils/storage';
import { getCurrentBankId, getCurrentQuestions } from '../utils/questionBank';
import { createPracticeSession } from '../utils/practiceSession';
import { showToast } from '../ui/toast';

const router = useRouter();
const bankId = getCurrentBankId();
const bank = getCurrentQuestions();

const doneSet = computed(() => {
  const records = getItem('PRACTICE_RECORDS', []);
  const set = new Set();
  for (const r of records || []) {
    if (r?.bankId === bankId && Number.isFinite(r.questionId)) set.add(r.questionId);
  }
  return set;
});

const ids = computed(() => bank.map(q => q.id));
const unansweredIds = computed(() => ids.value.filter(id => !doneSet.value.has(id)));

const total = computed(() => ids.value.length);
const done = computed(() => total.value - unansweredIds.value.length);
const remaining = computed(() => unansweredIds.value.length);

function start() {
  if (!remaining.value) {
    showToast('没有未作题目', 'info');
    return;
  }
  const session = createPracticeSession({
    title: '未作习题',
    questionIds: unansweredIds.value
  });
  router.push({ name: 'practice', query: { mode: 'random', sessionId: session.id } });
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f7f7; }
.bar { background: #fff; border-bottom: 1px solid #eef2f7; }
.bar-inner { max-width: 1100px; margin: 0 auto; padding: 14px 16px; display: flex; gap: 12px; align-items: center; }
.back { border: none; background: transparent; color: #2346dc; font-weight: 900; cursor: pointer; }
.h { font-weight: 900; }
.s { margin-top: 4px; color: #6b7280; font-size: 12px; }
.main { max-width: 1100px; margin: 0 auto; padding: 18px 16px 70px; }
.panel { background: #fff; border: 1px solid #eef2f7; border-radius: 14px; padding: 16px; box-shadow: 0 12px 30px rgba(17,24,39,0.06); }
.stat { color: #111827; }
.actions { margin-top: 12px; display: flex; justify-content: flex-end; }
.btn { padding: 10px 14px; border-radius: 999px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; font-weight: 800; }
.btn.primary { background: #2346dc; border-color: #2346dc; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.hint { margin-top: 10px; color: #6b7280; font-size: 12px; }
</style>

