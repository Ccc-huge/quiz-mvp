<template>
  <div class="page">
    <header class="bar">
      <div class="bar-inner">
        <button class="back" @click="$router.push('/modes')">← 返回模式</button>
        <div class="title">
          <div class="h">刷知识点</div>
          <div class="s">选择章节与知识点，生成题集进入练习</div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="panel">
        <div class="row">
          <div class="field">
            <div class="label">章节</div>
            <select class="select" v-model="chapterName">
              <option v-for="c in chapters" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="field">
            <div class="label">知识点</div>
            <select class="select" v-model="knowledgeName">
              <option v-for="k in knowledges" :key="k" :value="k">{{ k }}</option>
            </select>
          </div>
        </div>
        <div class="hint">该知识点共 {{ count }} 题</div>
        <div class="actions">
          <button class="btn primary" @click="start" :disabled="count === 0">开始练习</button>
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

const chapters = Array.from(new Set(bank.map(q => q.chapterName || '默认章节'))).filter(Boolean);
const chapterName = ref(chapters[0] || '默认章节');

const knowledgeName = ref('');
const knowledges = computed(() => {
  const list = bank
    .filter(q => (q.chapterName || '默认章节') === chapterName.value)
    .map(q => q.knowledgeName || '默认知识点');
  return Array.from(new Set(list)).filter(Boolean);
});

watchEffect(() => {
  if (!knowledgeName.value) knowledgeName.value = knowledges.value[0] || '默认知识点';
  if (!knowledges.value.includes(knowledgeName.value)) knowledgeName.value = knowledges.value[0] || '';
});

const ids = computed(() =>
  bank
    .filter(
      q =>
        (q.chapterName || '默认章节') === chapterName.value &&
        (q.knowledgeName || '默认知识点') === knowledgeName.value
    )
    .map(q => q.id)
);

const count = computed(() => ids.value.length);

function start() {
  if (!count.value) {
    showToast('该知识点暂无题目', 'warning');
    return;
  }
  const session = createPracticeSession({
    title: `知识点练习 - ${knowledgeName.value}`,
    questionIds: ids.value,
    meta: { chapterName: chapterName.value, knowledgeName: knowledgeName.value }
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
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.select { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; }
.hint { margin-top: 10px; color: #6b7280; font-size: 12px; }
.actions { margin-top: 12px; display: flex; justify-content: flex-end; }
.btn { padding: 10px 14px; border-radius: 999px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; font-weight: 800; }
.btn.primary { background: #2346dc; border-color: #2346dc; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 860px) { .row { grid-template-columns: 1fr; } }
</style>

