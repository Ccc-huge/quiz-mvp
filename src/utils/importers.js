import * as XLSX from 'xlsx';
import Papa from 'papaparse';

function lettersToIndexes(s) {
  const parts = String(s || '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .split(/[|,;/]+/)
    .filter(Boolean);
  const indexes = [];
  for (const p of parts) {
    // 支持 "ABD" 这种无分隔符多选答案
    const chars = /^[A-Z]+$/.test(p) ? p.split('') : [p];
    for (const ch of chars) {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) indexes.push(code - 65);
    }
  }
  return Array.from(new Set(indexes));
}

function numberToIndex(s) {
  const v = String(s || '').trim();
  const n = Number(v);
  if (Number.isFinite(n) && n >= 1) return n - 1;
  return null;
}

function toType(s) {
  const v = String(s || '').trim().toLowerCase();
  if (['single', '单选', '单选题'].includes(v)) return 'single';
  if (['multiple', '多选', '多选题'].includes(v)) return 'multiple';
  if (['judge', '判断', '判断题', 'true/false'].includes(v)) return 'judge';
  if (['fill', '填空', '填空题'].includes(v)) return 'fill';
  return 'single';
}

function parseAnswer({ type, answer, answerText }) {
  if (type === 'fill') return { answerText: String(answerText ?? answer ?? '').trim() };

  if (type === 'judge') {
    const v = String(answer ?? '').trim().toLowerCase();
    // 支持：对/错、true/false、1/0、a/b
    if (['对', 'true', '1', 'a', 't', 'yes', 'y', '正确'].includes(v)) return { answer: [0] };
    if (['错', 'false', '0', 'b', 'f', 'no', 'n', '错误'].includes(v)) return { answer: [1] };
    const idx = lettersToIndexes(v);
    if (idx.length) return { answer: [idx[0]] };
    const nIdx = numberToIndex(v);
    if (nIdx !== null) return { answer: [nIdx] };
    return { answer: [0] };
  }

  const raw = String(answer ?? '').trim();
  const idxs = lettersToIndexes(raw);
  if (idxs.length) return { answer: idxs };
  const nIdx = numberToIndex(raw);
  if (nIdx !== null) return { answer: [nIdx] };
  return { answer: [] };
}

function rowToQuestion(row) {
  const pick = (keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return row[k];
    }
    return '';
  };

  // 兼容：英文模板 + 中文模板
  const rawQuestion = pick(['question', '题干', '题目']);
  const rawAnswer = pick(['answer', '答案']);
  const rawExplanation = pick(['explanation', '解析', '解析/备注', '备注']);

  const rawType = pick(['type', '题型', '类型']);
  let type = toType(rawType);

  const rawOptions = [
    pick(['optionA', '选项A', '选项1']),
    pick(['optionB', '选项B', '选项2']),
    pick(['optionC', '选项C', '选项3']),
    pick(['optionD', '选项D', '选项4']),
    pick(['optionE', '选项E', '选项5']),
    pick(['optionF', '选项F', '选项6'])
  ]
    .map(v => String(v ?? '').trim())
    .filter(Boolean);

  // 如果没给题型，做一次推断
  if (!rawType) {
    const a = String(rawAnswer || '').trim();
    const isJudge =
      rawOptions.length === 2 &&
      (
        (['对', '错'].includes(String(rawOptions[0])) && ['对', '错'].includes(String(rawOptions[1]))) ||
        (['正确', '错误'].includes(String(rawOptions[0])) && ['正确', '错误'].includes(String(rawOptions[1])))
      );
    if (isJudge) type = 'judge';
    else if (/[|,;/]/.test(a) || a.toUpperCase().replace(/\s+/g, '').length >= 2) type = 'multiple';
    else type = 'single';
  }

  const options = type === 'fill' ? [] : rawOptions;

  const base = {
    id: pick(['id', 'ID', '编号']) ? Number(pick(['id', 'ID', '编号'])) : 0,
    type,
    question: String(rawQuestion ?? '').trim(),
    options,
    explanation: String(rawExplanation ?? '').trim(),
    chapterId: String(pick(['chapterId', '章节ID', '章节编号', '章节']))?.trim(),
    chapterName: String(pick(['chapterName', '章节名', '章节名称', '章节']))?.trim(),
    knowledgeId: String(pick(['knowledgeId', '知识点ID', '知识点编号', '知识点']))?.trim(),
    knowledgeName: String(pick(['knowledgeName', '知识点名', '知识点名称', '知识点']))?.trim(),
    difficulty: pick(['difficulty', '难度']) ? Number(pick(['difficulty', '难度'])) : 1,
    tags: pick(['tags', '标签']) ?? ''
  };

  return {
    ...base,
    ...parseAnswer({ type, answer: rawAnswer, answerText: pick(['answerText', '填空答案', '标准答案']) })
  };
}

export async function importFromJsonFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (Array.isArray(data)) return { mode: 'replace', questions: data };
  if (data && Array.isArray(data.questions)) return { mode: 'replace', questions: data.questions };
  throw new Error('JSON 格式不正确：需要数组或 { questions: [] }');
}

export async function importFromCsvFile(file) {
  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) throw new Error(parsed.errors[0].message || 'CSV 解析失败');
  const rows = parsed.data || [];
  return { mode: 'replace', questions: rows.map(rowToQuestion) };
}

export async function importFromXlsxFile(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Excel 没有工作表');
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return { mode: 'replace', questions: rows.map(rowToQuestion) };
}

