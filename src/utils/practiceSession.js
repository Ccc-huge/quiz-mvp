import { getItem, setItem } from './storage';
import { getCurrentBankId } from './questionBank';

const SESSIONS_KEY = 'PRACTICE_SESSIONS';

function generateId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createPracticeSession({ bankId, title, questionIds, meta }) {
  const sessions = getItem(SESSIONS_KEY, []);
  const id = generateId();
  const now = Date.now();
  const session = {
    id,
    bankId: bankId || getCurrentBankId(),
    title: String(title || '').trim() || '练习',
    questionIds: Array.isArray(questionIds) ? questionIds : [],
    meta: meta || {},
    createdAt: now
  };
  sessions.unshift(session);
  setItem(SESSIONS_KEY, sessions.slice(0, 50));
  return session;
}

export function getPracticeSession(id) {
  const sessions = getItem(SESSIONS_KEY, []);
  return (Array.isArray(sessions) ? sessions : []).find(s => s.id === id) || null;
}

export function deletePracticeSession(id) {
  const sessions = getItem(SESSIONS_KEY, []);
  setItem(
    SESSIONS_KEY,
    (Array.isArray(sessions) ? sessions : []).filter(s => s.id !== id)
  );
}

