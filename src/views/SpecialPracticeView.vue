<template>
  <div class="page">
    <header class="bar">
      <div class="bar-inner">
        <button class="back" @click="$router.push('/modes')">← 返回模式</button>
        <div class="title">
          <div class="h">专项刷题</div>
          <div class="s">按标签/难度筛选题目，生成题集进入练习</div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="panel">
        <div class="row">
          <div class="field">
            <div class="label">标签</div>
            <select class="select" v-model="tag">
              <option value="">全部</option>
              <option v-for="t in tags" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="field">
            <div class="label">难度范围（1-5）</div>
            <div class="range">
              <input class="num" type="number" min="1" max="5" v-model.number="minD" />
              <span class="sep">—</span>
              <input class="num" type="number" min="1" max="5" v-model.number="maxD" />
            </div>
          </div>
          <div class="field">
            <div class="label">题量</div>
            <input class="select" type="number" min="1" :max="filteredCount" v-model.number="count" />
          </div>
        </div>

        <div class="hint">筛选后共有 {{ filteredCount }} 题</div>
        <div class="actions">
          <button class="btn primary" @click="start" :disabled="filteredCount === 0">开始练习（随机抽取）</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from '../ui/toast';
import { getCurrentQuestions } from '../utils/questionBank';
import { createPracticeSession } from '../utils/practiceSession';

const router = useRouter();
const bank = getCurrentQuestions();

const tags = Array.from(new Set(bank.flatMap(q => q.tags || []))).filter(Boolean);
const tag = ref('');
const minD = ref(1);
const maxD = ref(5);
const count = ref(20);

const filteredIds = computed(() => {
  const lo = Math.max(1, Math.min(5, Number(minD.value) || 1));
  const hi = Math.max(1, Math.min(5, Number(maxD.value) || 5));
  const min = Math.min(lo, hi);
  const max = Math.max(lo, hi);

  return bank
    .filter(q => {
      const okTag = !tag.value || (q.tags || []).includes(tag.value);
      const d = Number(q.difficulty || 1);
      const okDiff = d >= min && d <= max;
      return okTag && okDiff;
    })
    .map(q => q.id);
});

const filteredCount = computed(() => filteredIds.value.length);

watchEffect(() => {
  if (count.value > filteredCount.value && filteredCount.value > 0) count.value = filteredCount.value;
  if (count.value < 1) count.value = 1;
});

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function start() {
  if (!filteredCount.value) {
    showToast('筛选结果为空', 'warning');
    return;
  }
  const n = Math.min(filteredCount.value, Number(count.value) || filteredCount.value);
  const picked = shuffle(filteredIds.value).slice(0, n);
  const session = createPracticeSession({
    title: '专项刷题',
    questionIds: picked,
    meta: { tag: tag.value, minD: minD.value, maxD: maxD.value, count: n }
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
.row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.field .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.select { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; }
.range { display: flex; align-items: center; gap: 8px; }
.num { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; }
.sep { color: #9ca3af; }
.hint { margin-top: 10px; color: #6b7280; font-size: 12px; }
.actions { margin-top: 12px; display: flex; justify-content: flex-end; }
.btn { padding: 10px 14px; border-radius: 999px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; font-weight: 800; }
.btn.primary { background: #2346dc; border-color: #2346dc; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
</style>

