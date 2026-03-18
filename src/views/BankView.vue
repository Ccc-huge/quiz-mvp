<template>
  <div class="page">
    <header class="top">
      <div class="top-inner">
        <div class="title">
          <div class="h">上传题库</div>
          <div class="s">快速构建你的专属题库，随后可直接进入在线练习。</div>
        </div>
        <div class="top-actions">
          <button class="btn ghost" @click="$router.push('/')">返回首页</button>
        </div>
      </div>
    </header>

    <main class="main">
      <section class="grid">
        <div class="upload-card" @dragover.prevent @drop.prevent="onDrop">
          <div class="upload-inner">
            <div class="cloud">☁</div>
            <div class="upload-text">点击或拖拽文件至此区域上传</div>
            <div class="upload-sub">支持 Excel（xls/xlsx）、CSV、JSON。单个文件不超过 50MB。</div>
            <button class="btn primary" @click.stop="pickFile">选择文件</button>
          </div>
          <input
            ref="fileRef"
            class="file"
            type="file"
            accept=".xls,.xlsx,.csv,.json"
            @change="onFile"
          />
        </div>

        <div class="side">
          <div class="panel">
            <div class="panel-title">上传规则</div>
            <ul class="rules">
              <li>推荐模板列：<b>题干 / 答案 / 选项1~6 / 解析/备注</b></li>
              <li>多选答案支持：<b>ABD</b> 或 <b>A|C</b></li>
              <li>判断题选项建议：<b>正确 / 错误</b>（答案 A=正确，B=错误）</li>
              <li>Word/PDF 可先复制到 Excel 再导入</li>
            </ul>
            <button class="btn ghost full" @click="downloadTemplate">下载 Excel 模板（CSV）</button>
          </div>
        </div>
      </section>

      <section class="panel" style="margin-top: 18px;">
        <div class="panel-title-row">
          <div class="panel-title">最近上传</div>
          <div class="muted">共 {{ banks.length }} 个题库</div>
        </div>

        <div class="table">
          <div class="tr th">
            <div class="td name">题库名称</div>
            <div class="td meta">来源</div>
            <div class="td meta">题目数</div>
            <div class="td meta">上传时间</div>
            <div class="td ops">操作</div>
          </div>
          <div class="tr" v-for="b in banks" :key="b.id">
            <div class="td name">
              <div class="bank-name">{{ b.name }}</div>
              <div class="bank-sub" v-if="b.id === currentId">当前使用中</div>
            </div>
            <div class="td meta">{{ b.sourceFileName }}</div>
            <div class="td meta">{{ b.questions?.length || 0 }}</div>
            <div class="td meta">{{ formatTime(b.createdAt) }}</div>
            <div class="td ops">
              <button class="link" @click="enterPractice(b.id)">进入练习</button>
              <button class="link" @click="setAsCurrent(b.id)">设为当前</button>
              <button class="link danger" @click="removeBank(b.id)">删除</button>
            </div>
          </div>
        </div>
        <div class="hint" v-if="banks.length === 0">暂无上传记录。先上传一个题库吧。</div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from '../ui/toast';
import { downloadTextFile } from '../utils/questionBank';
import { createBank, deleteBank, getCurrentBankId, listBanks, setCurrentBankId } from '../utils/questionBank';
import { importFromCsvFile, importFromJsonFile, importFromXlsxFile } from '../utils/importers';

const router = useRouter();
const route = useRoute();
const fileRef = ref(null);

const banks = ref(listBanks());
const currentId = ref(getCurrentBankId());

function refresh() {
  banks.value = listBanks();
  currentId.value = getCurrentBankId();
}

function pickFile() {
  fileRef.value?.click();
}

function onDrop(e) {
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  handleFile(file);
}

function downloadTemplate() {
  const header = '题干,答案,选项1,选项2,选项3,选项4,选项5,选项6,解析/备注\n';
  const example =
    '依据配电安规，在有分布式电源接入电网的高压配电线路，设备上停电工作，应（ ）。,ABD,断开分布式电源并网点的断路器（开关）,断开分布式电源并网点的隔离开关（刀闸）或熔断器,在用户侧接地,在电网侧接地,,,\n' +
    '依据配电安规，一级动火工作票的有效期为48h。,B,正确,错误,,,,,判断题示例：B=错误\n';
  downloadTextFile('知序-题库导入模板.csv', header + example);
  showToast('已下载模板（CSV）', 'success');
}

async function onFile(e) {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  await handleFile(file);
}

async function handleFile(file) {
  try {
    const name = file.name.toLowerCase();
    let result;
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) result = await importFromXlsxFile(file);
    else if (name.endsWith('.csv')) result = await importFromCsvFile(file);
    else if (name.endsWith('.json')) result = await importFromJsonFile(file);
    else throw new Error('仅支持 xls/xlsx/csv/json');

    const bank = createBank({
      name: file.name.replace(/\.[^.]+$/, ''),
      sourceFileName: file.name,
      questions: result.questions
    });
    showToast(`上传成功：${bank.questions.length} 题`, 'success', 2600);
    refresh();
  } catch (err) {
    showToast(`上传失败：${err?.message || '未知错误'}`, 'error', 3400);
  }
}

function setAsCurrent(id) {
  const ok = setCurrentBankId(id);
  if (ok) {
    showToast('已设为当前题库', 'success');
    refresh();
  } else {
    showToast('题库不存在', 'error');
  }
}

function enterPractice(id) {
  setAsCurrent(id);
  router.push({ name: 'modes', query: { bankId: id } });
}

function removeBank(id) {
  deleteBank(id);
  showToast('已删除题库', 'warning');
  refresh();
}

function formatTime(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

onMounted(() => {
  if (route.query.upload === '1') {
    // 自动弹出选择文件
    setTimeout(() => pickFile(), 50);
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f7f7;
}
.top {
  background: #ffffff;
  border-bottom: 1px solid #eef2f7;
}
.top-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.h {
  font-weight: 900;
  font-size: 22px;
}
.s {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
}
.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 16px 70px;
}
.grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;
  align-items: start;
}
.upload-card {
  background: #fff;
  border: 1px dashed #c7d2fe;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06);
  cursor: pointer;
}
.upload-inner {
  text-align: center;
  padding: 18px 10px;
}
.cloud {
  width: 54px;
  height: 54px;
  margin: 0 auto 10px;
  border-radius: 18px;
  background: #eef2ff;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #2346dc;
}
.upload-text {
  font-weight: 900;
}
.upload-sub {
  margin-top: 8px;
  color: #6b7280;
  font-size: 13px;
}
.side .panel {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06);
}
.panel-title {
  font-weight: 900;
}
.rules {
  margin: 10px 0 12px;
  padding-left: 18px;
  color: #374151;
  font-size: 13px;
  line-height: 1.8;
}
.panel {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06);
}
.panel-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.muted {
  color: #6b7280;
  font-size: 12px;
}
.file {
  display: none;
}
.btn {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-weight: 800;
  font-size: 14px;
}
.btn.primary {
  margin-top: 14px;
  background: #2346dc;
  border-color: #2346dc;
  color: #fff;
}
.btn.ghost {
  border-color: #dbeafe;
  color: #2346dc;
  background: #fff;
}
.btn.full {
  width: 100%;
}
.table {
  margin-top: 12px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  overflow: hidden;
}
.tr {
  display: grid;
  grid-template-columns: 1.2fr 1fr 90px 160px 220px;
}
.tr.th {
  background: #f6f7fb;
  font-weight: 900;
  color: #374151;
}
.td {
  padding: 10px 12px;
  border-bottom: 1px solid #eef2f7;
  font-size: 13px;
  color: #111827;
}
.tr:last-child .td {
  border-bottom: none;
}
.td.meta {
  color: #6b7280;
}
.bank-name {
  font-weight: 900;
}
.bank-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #2346dc;
}
.td.ops {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.link {
  border: none;
  background: transparent;
  color: #2346dc;
  cursor: pointer;
  font-weight: 800;
  padding: 0;
}
.link.danger {
  color: #b91c1c;
}
.hint {
  margin-top: 10px;
  color: #6b7280;
  font-size: 12px;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .tr {
    grid-template-columns: 1fr;
  }
  .tr.th {
    display: none;
  }
  .td.meta {
    display: none;
  }
  .td.ops {
    padding-top: 0;
  }
}
</style>

