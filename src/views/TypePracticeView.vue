<template>
  <div class="page">
    <header class="bar">
      <div class="bar-inner">
        <button class="back" @click="$router.push('/modes')">← 返回模式</button>
        <div class="title">
          <div class="h">题型刷题</div>
          <div class="s">选择一个题型，生成题集进入练习</div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="grid">
        <button class="card" @click="start('single')">
          <div class="name">单选题</div>
          <div class="desc">从当前题库筛选单选题练习</div>
        </button>
        <button class="card" @click="start('multiple')">
          <div class="name">多选题</div>
          <div class="desc">从当前题库筛选多选题练习</div>
        </button>
        <button class="card" @click="start('judge')">
          <div class="name">判断题</div>
          <div class="desc">从当前题库筛选判断题练习</div>
        </button>
        <button class="card" @click="start('fill')">
          <div class="name">填空题</div>
          <div class="desc">从当前题库筛选填空题练习</div>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { showToast } from '../ui/toast';
import { getCurrentQuestions } from '../utils/questionBank';
import { createPracticeSession } from '../utils/practiceSession';

const router = useRouter();

function label(type) {
  return { single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题' }[type] || type;
}

function start(type) {
  const bank = getCurrentQuestions();
  const ids = bank.filter(q => q.type === type).map(q => q.id);
  if (!ids.length) {
    showToast(`当前题库没有${label(type)}`, 'warning');
    return;
  }
  const session = createPracticeSession({
    title: `题型刷题 - ${label(type)}`,
    questionIds: ids,
    meta: { type }
  });
  router.push({ name: 'practice', query: { mode: 'random', sessionId: session.id } });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f7f7;
}
.bar {
  background: #ffffff;
  border-bottom: 1px solid #eef2f7;
}
.bar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.back {
  border: none;
  background: transparent;
  color: #2346dc;
  font-weight: 900;
  cursor: pointer;
}
.h {
  font-weight: 900;
}
.s {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}
.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 16px 70px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.card {
  text-align: left;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06);
}
.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 45px rgba(17, 24, 39, 0.09);
}
.name {
  font-weight: 900;
  font-size: 16px;
}
.desc {
  margin-top: 8px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
}
@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

