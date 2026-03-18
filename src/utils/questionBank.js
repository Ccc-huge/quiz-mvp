import { questions as defaultQuestions } from '../data/questions';
import { getItem, setItem } from './storage';

const BANKS_KEY = 'QUESTION_BANKS';
const CURRENT_ID_KEY = 'QUESTION_BANK_CURRENT_ID';
const LEGACY_KEY = 'QUESTION_BANK_CURRENT';

function normalizeQuestion(raw) {
  const q = { ...raw };
  if (!q || typeof q !== 'object') return null;

  q.id = typeof q.id === 'number' ? q.id : Number(q.id);
  if (!Number.isFinite(q.id)) q.id = 0;

  q.type = String(q.type || '').toLowerCase();
  if (!['single', 'multiple', 'judge', 'fill'].includes(q.type)) q.type = 'single';

  q.question = String(q.question ?? '').trim();
  q.explanation = String(q.explanation ?? '').trim();

  q.chapterId = String(q.chapterId ?? '').trim() || 'ch';
  q.chapterName = String(q.chapterName ?? '').trim() || '默认章节';
  q.knowledgeId = String(q.knowledgeId ?? '').trim() || 'k';
  q.knowledgeName = String(q.knowledgeName ?? '').trim() || '默认知识点';

  q.difficulty = Number(q.difficulty ?? 1);
  if (!Number.isFinite(q.difficulty) || q.difficulty < 1) q.difficulty = 1;

  q.tags = Array.isArray(q.tags)
    ? q.tags.map(t => String(t).trim()).filter(Boolean)
    : String(q.tags ?? '')
        .split('|')
        .map(t => t.trim())
        .filter(Boolean);

  if (q.type === 'fill') {
    q.options = [];
    q.answerText = String(q.answerText ?? q.answer ?? '').trim();
    delete q.answer;
  } else {
    q.options = Array.isArray(q.options) ? q.options.map(String) : [];
    const a = Array.isArray(q.answer) ? q.answer : [];
    q.answer = a.map(n => Number(n)).filter(n => Number.isFinite(n));
    delete q.answerText;
  }

  if (!q.question) return null;
  return q;
}

function ensureIds(list) {
  let maxId = 0;
  const used = new Set();
  for (const q of list) {
    if (q.id > maxId) maxId = q.id;
    if (q.id > 0) used.add(q.id);
  }
  const seen = new Set();
  for (const q of list) {
    if (!q.id || seen.has(q.id)) {
      maxId += 1;
      q.id = maxId;
    }
    seen.add(q.id);
  }
  return list;
}

function ensureBootstrap() {
  const banks = getItem(BANKS_KEY, null);
  if (Array.isArray(banks) && banks.length) return;

  // 兼容旧版本：如果 legacy KEY 有题库，迁移成一个 bank
  const legacy = getItem(LEGACY_KEY, null);
  const initialQuestions = Array.isArray(legacy) && legacy.length ? legacy : defaultQuestions;

  const bankId = generateId();
  const normalized = ensureIds((initialQuestions || []).map(normalizeQuestion).filter(Boolean));
  const now = Date.now();

  const initial = [
    {
      id: bankId,
      name: '默认题库',
      sourceFileName: '内置题库',
      createdAt: now,
      updatedAt: now,
      questions: normalized
    }
  ];
  setItem(BANKS_KEY, initial);
  setItem(CURRENT_ID_KEY, bankId);
  cleanupIds(normalized);
}

export function listBanks() {
  ensureBootstrap();
  const banks = getItem(BANKS_KEY, []);
  return Array.isArray(banks) ? banks : [];
}

export function getCurrentBankId() {
  ensureBootstrap();
  return getItem(CURRENT_ID_KEY, null);
}

export function getBankById(id) {
  const banks = listBanks();
  return banks.find(b => b.id === id) || null;
}

export function setCurrentBankId(id) {
  const bank = getBankById(id);
  if (!bank) return false;
  setItem(CURRENT_ID_KEY, id);
  cleanupIds(bank.questions || []);
  return true;
}

export function getCurrentQuestions() {
  ensureBootstrap();
  const currentId = getCurrentBankId();
  const bank = currentId ? getBankById(currentId) : null;
  const questions = bank?.questions || [];
  const normalized = ensureIds((questions || []).map(normalizeQuestion).filter(Boolean));
  return normalized;
}

export function createBank({ name, sourceFileName, questions }) {
  ensureBootstrap();
  const banks = listBanks();
  const now = Date.now();
  const bankId = generateId();
  const normalized = ensureIds((questions || []).map(normalizeQuestion).filter(Boolean));

  const bank = {
    id: bankId,
    name: String(name || '').trim() || '未命名题库',
    sourceFileName: String(sourceFileName || '').trim() || '导入文件',
    createdAt: now,
    updatedAt: now,
    questions: normalized
  };

  const next = [bank, ...banks];
  setItem(BANKS_KEY, next);
  setItem(CURRENT_ID_KEY, bankId);
  cleanupIds(normalized);
  return bank;
}

export function deleteBank(id) {
  ensureBootstrap();
  const banks = listBanks();
  const next = banks.filter(b => b.id !== id);
  setItem(BANKS_KEY, next);
  const current = getCurrentBankId();
  if (current === id) {
    const fallback = next[0]?.id || null;
    setItem(CURRENT_ID_KEY, fallback);
    cleanupIds((next[0]?.questions) || []);
  }
}

export function exportBankJson(id) {
  const bank = getBankById(id);
  if (!bank) return JSON.stringify([], null, 2);
  return JSON.stringify(bank.questions || [], null, 2);
}

export function clearAllBanks() {
  setItem(BANKS_KEY, []);
  setItem(CURRENT_ID_KEY, null);
  cleanupIds([]);
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function cleanupIds(questionList) {
  const ids = new Set(questionList.map(q => q.id));
  const wrong = getItem('WRONG_QUESTIONS', []).filter(id => ids.has(id));
  const fav = getItem('FAVORITE_QUESTIONS', []).filter(id => ids.has(id));
  setItem('WRONG_QUESTIONS', wrong);
  setItem('FAVORITE_QUESTIONS', fav);
}

function generateId() {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

