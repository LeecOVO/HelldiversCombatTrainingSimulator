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
    title: '战略配备模拟训练终端',
    begin: '开始同步（空格）',
    superEarth: '超级地球',
    stratagemIdentified: '战略配备已确认：',
    nextReady: '— 下一向指令就绪：按空格 —',
    waiting: '等待手动输入指令…',
    inputError: '输入违规——序列已重置',
    hintSequence: '战略配备输入序列',
    hintDeployNext: '申请下一次投放',
    next: '申请下一向 (空格)',
    back: '返回上级目录',
    randomTraining: '随机模拟演习',
    specializedTraining: '专项配备训练',
    selectStratagem: '选择战术演习科目',
    ms: '毫秒',
    langLabel: '语言',
    categorySupply: '爱国行政中心',
    categoryOrbital: '轨道大炮',
    categoryHangar: '机库',
    categoryBridge: '舰桥',
    categoryEngineering: '工程湾',
    categoryRobotics: '机器人工作站',
    categoryMission: '任务相关',

    disclaimerTitle: '关于本终端 / 版权与开源声明',
    disclaimerLine1:
        '本软件为非官方粉丝制作的开源训练终端，与原作及其开发/发行/运营方无任何隶属、授权或合作关系。',
    disclaimerLine2:
        '游戏相关名称、商标、Logo、图片等素材的权利归其各自权利人所有。本软件源代码以开源方式提供与分发，使用、修改与再发布需遵循 ',
    disclaimerLine2Suffix: ' 协议。',

    treasonTitle: '超级地球真理部',
    treasonBody: '请遵守以下爱国服务公告。\n注意力不集中将被视为叛国。',
    treasonThanks: '感谢您的配合。',
    treasonDismiss: '为了超级地球！我将全力以赴！',
  },
  en: {
    title: 'STRATAGEM SIMULATION TERMINAL',
    begin: 'SYNC START (Space)',
    superEarth: 'SUPER EARTH',
    stratagemIdentified: 'STRATAGEM CONFIRMED:',
    nextReady: '— NEXT DIRECTIVE READY: PRESS SPACE —',
    waiting: 'Awaiting manual input sequence…',
    inputError: 'INPUT VIOLATION — SEQUENCE RESET',
    hintSequence: 'STRATAGEM INPUT SEQUENCE',
    hintDeployNext: 'REQUEST NEXT DEPLOYMENT',
    next: 'NEXT REQUEST (SPACE)',
    back: 'RETURN TO DIRECTORY',
    randomTraining: 'RANDOM SIMULATION',
    specializedTraining: 'SPECIALIZED DIRECTIVE',
    selectStratagem: 'SELECT TACTICAL SUBJECT',
    ms: 'MS',
    langLabel: 'Language',
    categorySupply: 'Patriotic Administration Center',
    categoryOrbital: 'Orbital Cannons',
    categoryHangar: 'Hangar',
    categoryBridge: 'Bridge',
    categoryEngineering: 'Engineering Bay',
    categoryRobotics: 'Robotics Workshop',
    categoryMission: 'Mission Related',

    disclaimerTitle: 'ABOUT THIS TERMINAL / RIGHTS & OPEN-SOURCE NOTICE',
    disclaimerLine1:
        'This is an unofficial, fan-made, open-source training terminal. It is not affiliated with, endorsed by, or sponsored by the game’s developers/publishers/operators.',
    disclaimerLine2:
        'All game-related names, trademarks, logos, and images belong to their respective rights holders. This software is distributed as open source; use, modification, and redistribution must comply with the ',
    disclaimerLine2Suffix: ' license.',

    treasonTitle: 'Super Earth Ministry of Truth',
    treasonBody: 'Please observe the following Patriotic Service Announcement.\nDeviations in attention will be considered treason.',
    treasonThanks: 'Thank you for your cooperation.',
    treasonDismiss: 'FOR SUPER EARTH! I WILL DO MY BEST!',
  },
};

export const createT = (lang) => {
  const dict = MESSAGES[lang] || MESSAGES.zh;
  return (key) => dict[key] ?? MESSAGES.zh[key] ?? key;
};
