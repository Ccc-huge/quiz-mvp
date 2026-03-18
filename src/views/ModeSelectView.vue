<template>
  <div class="mode-page">
    <header class="mode-header">
      <div class="header-inner">
        <button class="back-btn" @click="$router.push('/bank')">
          <span class="back-icon">←</span>
        </button>
        <div class="header-title">
          <h1>选择刷题模式</h1>
          <p>当前题库：{{ currentBankName }}</p>
        </div>
      </div>
    </header>

    <main class="mode-main">
      <div class="mode-grid">
        <div class="mode-column">
          <button class="mode-card" @click="$router.push('/modes/special')">
            <div class="card-icon green">🎯</div>
            <div class="card-content">
              <div class="card-title">专项刷题</div>
              <div class="card-desc">按标签/难度筛选</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
          
          <button class="mode-card" @click="$router.push('/modes/type')">
            <div class="card-icon red">🔲</div>
            <div class="card-content">
              <div class="card-title">题型刷题</div>
              <div class="card-desc">按题型专项练习</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
          
          <button class="mode-card" @click="goPractice('random')">
            <div class="card-icon yellow">🔀</div>
            <div class="card-content">
              <div class="card-title">乱序刷题</div>
              <div class="card-desc">随机抽取题目</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
          
          <button class="mode-card" @click="$router.push('/favorite')">
            <div class="card-icon blue">📌</div>
            <div class="card-content">
              <div class="card-title">我的收藏</div>
              <div class="card-desc">收藏的题目</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
        </div>

        <div class="mode-center">
          <button class="big-mode order" @click="goPractice('order')">
            <div class="big-icon">📝</div>
            <div class="big-title">顺序练习</div>
            <div class="big-desc">按题库顺序逐一练习</div>
            <div class="big-action">开始 →</div>
          </button>
          
          <button class="big-mode exam" @click="toast('功能开发中：模拟考试')">
            <div class="big-icon">🧾</div>
            <div class="big-title">模拟考试</div>
            <div class="big-desc">计时作答 · 自动评分</div>
            <div class="big-tag">即将上线</div>
          </button>
        </div>

        <div class="mode-column">
          <button class="mode-card" @click="$router.push('/wrong')">
            <div class="card-icon pink">🧾</div>
            <div class="card-content">
              <div class="card-title">我的错题</div>
              <div class="card-desc">巩固薄弱知识点</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
          
          <button class="mode-card" @click="$router.push('/modes/unanswered')">
            <div class="card-icon indigo">✏️</div>
            <div class="card-content">
              <div class="card-title">未作习题</div>
              <div class="card-desc">尚未作答的题目</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
          
          <button class="mode-card" @click="$router.push('/modes/knowledge')">
            <div class="card-icon orange">📖</div>
            <div class="card-content">
              <div class="card-title">刷知识点</div>
              <div class="card-desc">按章节知识点练习</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
          
          <button class="mode-card" @click="toast('功能开发中：自我测评')">
            <div class="card-icon teal">🧠</div>
            <div class="card-content">
              <div class="card-title">自我测评</div>
              <div class="card-desc">能力评估测试</div>
            </div>
            <div class="card-arrow">→</div>
          </button>
        </div>
      </div>
    </main>

    <footer class="mode-footer">
      <button class="home-btn" @click="$router.push('/')">
        <span>🏠</span> 返回首页
      </button>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from '../ui/toast';
import { getBankById, getCurrentBankId, setCurrentBankId } from '../utils/questionBank';

const route = useRoute();
const router = useRouter();

const currentBankId = ref(getCurrentBankId());

const currentBankName = computed(() => {
  const id = currentBankId.value;
  const bank = id ? getBankById(id) : null;
  return bank?.name || '未选择';
});

function toast(msg) {
  showToast(msg, 'info');
}

function goPractice(mode) {
  router.push({ name: 'practice', query: { mode } });
}

onMounted(() => {
  const bankId = String(route.query.bankId || '').trim();
  if (bankId) {
    const ok = setCurrentBankId(bankId);
    if (ok) currentBankId.value = bankId;
  }
});
</script>

<style scoped>
.mode-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #fafbfc 100%);
  display: flex;
  flex-direction: column;
}

.mode-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 20px;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  border-color: #ddd;
}

.back-icon {
  font-size: 20px;
  color: #333;
}

.header-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: #222;
  margin: 0 0 4px;
}

.header-title p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.mode-main {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 100px;
  width: 100%;
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 32px;
  align-items: start;
}

.mode-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mode-center {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 20px;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
}

.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: #1890ff;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.card-icon.green { background: #f6ffed; }
.card-icon.red { background: #fff1f0; }
.card-icon.yellow { background: #fffbe6; }
.card-icon.blue { background: #e6f7ff; }
.card-icon.pink { background: #fff0f6; }
.card-icon.indigo { background: #f0f5ff; }
.card-icon.orange { background: #fff7e6; }
.card-icon.teal { background: #f0ffff; }

.card-content {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.card-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.card-arrow {
  font-size: 18px;
  color: #ccc;
  transition: all 0.2s;
}

.mode-card:hover .card-arrow {
  color: #1890ff;
  transform: translateX(4px);
}

.big-mode {
  width: 220px;
  padding: 28px 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.big-mode.order {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.35);
  color: #fff;
}

.big-mode.order:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.45);
}

.big-mode.exam {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 12px 40px rgba(17, 153, 142, 0.3);
  color: #fff;
}

.big-mode.exam:hover {
  transform: translateY(-4px) scale(1.02);
}

.big-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.big-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.big-desc {
  font-size: 13px;
  opacity: 0.85;
  margin-bottom: 16px;
}

.big-action {
  padding: 10px 20px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
}

.big-mode:hover .big-action {
  background: rgba(255,255,255,0.3);
}

.big-tag {
  position: absolute;
  top: 12px;
  right: -28px;
  background: rgba(255,255,255,0.25);
  padding: 4px 32px;
  font-size: 11px;
  font-weight: 600;
  transform: rotate(45deg);
}

.mode-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 14px 20px;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
  display: flex;
  justify-content: center;
}

.home-btn {
  padding: 12px 32px;
  border: 1px solid #ddd;
  border-radius: 25px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

@media (max-width: 768px) {
  .mode-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .mode-center {
    order: -1;
    flex-direction: row;
    justify-content: center;
    gap: 16px;
    padding-top: 0;
  }
  
  .big-mode {
    width: 160px;
    padding: 20px 16px;
  }
  
  .big-icon {
    font-size: 28px;
  }
  
  .big-title {
    font-size: 16px;
  }
}
</style>
