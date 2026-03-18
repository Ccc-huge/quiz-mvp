<template>
  <div class="page">
    <section class="hero">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="brand" @click="$router.push('/')">
            <span class="spark" aria-hidden="true">✦</span>
            <span class="brand-text">知序</span>
            <span class="brand-en">KnowSeq</span>
          </div>

          <nav class="nav">
            <a class="nav-link" @click="$router.push('/bank')">题库中枢</a>
          </nav>

          <div class="header-actions">
            <button class="login-btn" @click="showComingSoon">登录</button>
          </div>
        </div>
      </header>

      <div class="hero-inner">
        <div class="hero-left">
          <h1 class="hero-title">文档一键上传<br />生成题库</h1>
          <p class="hero-subtitle">
            支持上传 Word、Excel、Txt、Pdf 等多种格式的试题文档导入后，支持练习题库、题库对接、发起考试等功能
          </p>

          <div class="hero-actions">
            <button class="primary-btn" @click="triggerUpload">立即上传</button>
            <button class="link-btn" @click="$router.push('/bank')">题库中枢</button>
          </div>
        </div>

        <div class="hero-right" aria-hidden="true">
          <div class="mock-window">
            <div class="mock-titlebar">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
              <div class="mock-url">app.knowseq.com</div>
            </div>
            <div class="mock-body">
              <div class="mock-head">
                <div class="mock-h">上传题库</div>
                <button class="mock-btn">选择文件</button>
              </div>
              <div class="mock-grid">
                <div class="mock-chip">单选题</div>
                <div class="mock-chip">多选题</div>
                <div class="mock-chip">判断题</div>
                <div class="mock-chip">填空题</div>
                <div class="mock-chip">简答题</div>
                <div class="mock-chip">综合题</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        ref="fileInputRef"
        class="file-input"
        type="file"
        accept=""
        @change="onFilePicked"
      />
    </section>

    <section class="features" id="features">
      <div class="features-inner">
        <h2 class="features-title">上传题库后，你可以</h2>

        <div class="card-grid">
          <button class="feature-card" @click="$router.push('/search')">
            <div class="icon">🔎</div>
            <div class="name">精准搜题</div>
            <div class="desc">上传后支持按题干/知识点检索，快速定位题目</div>
          </button>

          <button class="feature-card" @click="goPractice('random')">
            <div class="icon">▶</div>
            <div class="name">在线练习</div>
            <div class="desc">顺序/随机练习，支持解析与记录</div>
          </button>

          <button class="feature-card" @click="toast('下一步实现：按章节/知识点练习')">
            <div class="icon">☁</div>
            <div class="name">章节练习</div>
            <div class="desc">按章节/知识点刷题，巩固薄弱点</div>
          </button>

          <button class="feature-card" @click="toast('下一步实现：模拟考试（计时+交卷）')">
            <div class="icon">🧾</div>
            <div class="name">发起考试</div>
            <div class="desc">定量抽题、计时作答，自动评分</div>
          </button>

          <button class="feature-card" @click="$router.push('/wrong')">
            <div class="icon">✍</div>
            <div class="name">错题重练</div>
            <div class="desc">自动沉淀错题，支持反复练习</div>
          </button>

          <button class="feature-card" @click="toast('MVP 暂未实现：题库分享/售卖')">
            <div class="icon">💰</div>
            <div class="name">出售题库</div>
            <div class="desc">分享/售卖题库，打通内容价值</div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { showToast } from '../ui/toast';

const router = useRouter();
const fileInputRef = ref(null);

function goPractice(mode) {
  router.push({ name: 'practice', query: { mode } });
}

function toast(message) {
  showToast(message, 'info');
}

function showComingSoon() {
  showToast('功能开发中，敬请期待', 'info');
}

function onLogin() {
  showToast('MVP：暂不接入账号系统（后续可接微信/手机号登录）', 'info');
}

function triggerUpload() {
  router.push({ name: 'bank', query: { upload: '1' } });
}

async function onFilePicked(e) {
  // 保留占位 input，避免旧浏览器事件警告；实际导入已迁移到“题库中枢”
  e.target.value = '';
  showToast('请在“题库中枢”完成上传导入', 'info');
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-color);
}

.hero {
  background: radial-gradient(1200px 600px at 10% 10%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0)),
    linear-gradient(180deg, #3b6cf6 0%, #2a54e8 55%, #2346dc 100%);
  color: #ffffff;
  padding-bottom: 42px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--topbar-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.topbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.spark {
  opacity: 0.9;
}
.brand-text {
  font-weight: 800;
  letter-spacing: 0.2px;
}
.brand-en {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 18px;
}
.nav-link {
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  font-size: 14px;
}
.nav-link:hover {
  color: rgba(255, 255, 255, 1);
}
.login-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  background: #ffffff;
  color: #2346dc;
  font-weight: 700;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;
}

.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 16px 0;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 26px;
  align-items: center;
}
.hero-left {
  max-width: 520px;
}
.hero-title {
  margin: 0 0 16px;
  font-size: 54px;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.hero-subtitle {
  margin: 0;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  line-height: 1.8;
}
.hero-actions {
  margin-top: 22px;
}
.primary-btn {
  padding: 12px 18px;
  border-radius: 999px;
  border: none;
  background: #ffffff;
  color: #2346dc;
  font-weight: 800;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.14);
  cursor: pointer;
}
.link-btn {
  margin-left: 10px;
  padding: 12px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}

.hero-right {
  display: flex;
  justify-content: flex-end;
}
.mock-window {
  width: 460px;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
}
.mock-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(245, 247, 252, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red {
  background: #ff5f57;
}
.dot.yellow {
  background: #ffbd2e;
}
.dot.green {
  background: #28c840;
}
.mock-url {
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
}
.mock-body {
  padding: 16px 16px 18px;
  color: #111827;
}
.mock-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.mock-h {
  font-weight: 800;
  font-size: 14px;
}
.mock-btn {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 12px;
  cursor: default;
}
.mock-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.mock-chip {
  padding: 9px 10px;
  border-radius: 10px;
  background: #f5f7ff;
  border: 1px solid #edf0ff;
  font-size: 12px;
  text-align: center;
  color: #374151;
}

.file-input {
  display: none;
}

.features {
  padding: 44px 16px 70px;
  background: #ffffff;
}
.features-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.features-title {
  margin: 0 0 22px;
  text-align: center;
  font-size: 34px;
  font-weight: 900;
  color: #111827;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.feature-card {
  text-align: left;
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 18px 16px;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06);
  cursor: pointer;
}
.feature-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 45px rgba(17, 24, 39, 0.09);
}
.icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eef2ff;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #2346dc;
  margin-bottom: 10px;
}
.name {
  font-weight: 900;
  margin-bottom: 6px;
  color: #111827;
}
.desc {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 860px) {
  .nav {
    display: none;
  }
  .hero-inner {
    grid-template-columns: 1fr;
    padding-top: 34px;
  }
  .hero-right {
    justify-content: flex-start;
  }
  .hero-title {
    font-size: 40px;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>

