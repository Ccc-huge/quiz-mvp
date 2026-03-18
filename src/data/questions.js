export const questions = [
  {
    id: 1,
    type: 'single', // single/multiple/judge/fill
    question: '下面哪个选项是 JavaScript 中声明变量的关键字？',
    options: ['var', 'def', 'let', 'int'],
    answer: [0, 2],
    explanation: '在 JS 中 var/let/const 都可声明变量，这里给出了 var 和 let。',
    chapterId: 'ch1',
    chapterName: '基础语法',
    knowledgeId: 'k1',
    knowledgeName: '变量声明',
    difficulty: 1,
    tags: ['JavaScript', '变量']
  },
  {
    id: 2,
    type: 'multiple',
    question: '以下哪些是 JavaScript 中的基本数据类型？',
    options: ['Number', 'String', 'Array', 'Boolean'],
    answer: [0, 1, 3],
    explanation: 'Array 属于引用类型。',
    chapterId: 'ch1',
    chapterName: '基础语法',
    knowledgeId: 'k2',
    knowledgeName: '数据类型',
    difficulty: 2,
    tags: ['JavaScript', '类型']
  },
  {
    id: 3,
    type: 'judge',
    question: 'null == undefined 的结果为 true。',
    options: ['对', '错'],
    answer: [0],
    explanation: '宽松相等下（==）为 true，严格相等（===）为 false。',
    chapterId: 'ch1',
    chapterName: '基础语法',
    knowledgeId: 'k2',
    knowledgeName: '数据类型',
    difficulty: 1,
    tags: ['JavaScript', '==']
  },
  {
    id: 4,
    type: 'fill',
    question: '请填写 JavaScript 中表示「不是数字」的特殊值：____。',
    options: [],
    answerText: 'NaN',
    explanation: 'NaN 是 Not a Number 的缩写。',
    chapterId: 'ch1',
    chapterName: '基础语法',
    knowledgeId: 'k3',
    knowledgeName: '特殊值',
    difficulty: 2,
    tags: ['JavaScript', 'NaN']
  }
];

