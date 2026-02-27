export const LANGS = {
  zh: '中文',
  en: 'English',
};

export const detectInitialLang = () => {
  const saved = localStorage.getItem('lang');
  if (saved === 'zh' || saved === 'en') return saved;

  const nav = (navigator.language || '').toLowerCase();
  // 中文优先：只有明确英文环境才默认 en
  if (nav.startsWith('en')) return 'en';
  return 'zh';
};

export const MESSAGES = {
  zh: {
    title: '绝地潜兵战略配备训练终端',
    begin: '开始训练（空格）',
    superEarth: '超级地球',
    stratagemIdentified: '战略配备已确认：',
    nextReady: '— 下一次投放就绪：按空格 —',
    waiting: '等待输入指令…',
    inputError: '输入错误——序列已重置',
    hintSequence: '战略配备输入序列',
    hintDeployNext: '投放 / 下一项',
    ms: '毫秒',
    langLabel: '语言',

    disclaimerTitle: '免责声明 / 版权与开源声明',
    disclaimerLine1:
        '本软件为非官方粉丝制作的开源训练终端，与原作及其开发/发行/运营方无任何隶属、授权或合作关系。',
    disclaimerLine2:
        '游戏相关名称、商标、Logo、图片等素材的权利归其各自权利人所有。本软件源代码以开源方式提供与分发，使用、修改与再发布需遵循 ',
    disclaimerLine2Suffix: ' 协议（完全可商用，但必须注明来源，详见 LICENSE 文件）。',
  },
  en: {
    title: 'HELLDIVERS STRATAGEM TRAINING TERMINAL',
    begin: 'Start Training (Space)',
    superEarth: 'SUPER EARTH',
    stratagemIdentified: 'STRATAGEM CONFIRMED:',
    nextReady: '— DROP READY: PRESS SPACE —',
    waiting: 'Awaiting input…',
    inputError: 'INPUT ERROR — SEQUENCE RESET',
    hintSequence: 'STRATAGEM INPUT SEQUENCE',
    hintDeployNext: 'DROP / NEXT',
    ms: 'MS',
    langLabel: 'Language',

    disclaimerTitle: 'DISCLAIMER / RIGHTS & OPEN-SOURCE NOTICE',
    disclaimerLine1:
        'This is an unofficial, fan-made, open-source training terminal. It is not affiliated with, endorsed by, or sponsored by the game’s developers/publishers/operators.',
    disclaimerLine2:
        'All game-related names, trademarks, logos, and images belong to their respective rights holders. This software is distributed as open source; use, modification, and redistribution must comply with the ',
    disclaimerLine2Suffix: ' license (fully commercializable, but attribution is required; see LICENSE file).',
  },
};

export const createT = (lang) => {
  const dict = MESSAGES[lang] || MESSAGES.zh;
  return (key) => dict[key] ?? MESSAGES.zh[key] ?? key;
};
