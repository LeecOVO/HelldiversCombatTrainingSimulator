import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { STRATAGEMS } from './stratagems';
import { LANGS, detectInitialLang, createT } from './i18n';

const ARROWS = {
  W: (
    <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-12 sm:h-12 fill-current">
      <path d="M12 4l-8 8h5v8h6v-8h5z" />
    </svg>
  ),
  S: (
    <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-12 sm:h-12 fill-current">
      <path d="M12 20l8-8h-5V4H9v8H4z" />
    </svg>
  ),
  A: (
    <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-12 sm:h-12 fill-current">
      <path d="M4 12l8 8v-5h8v-6h-8V4z" />
    </svg>
  ),
  D: (
    <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-12 sm:h-12 fill-current">
      <path d="M20 12l-8-8v5H4v6h8v5z" />
    </svg>
  )
};

const SCREENS = {
  HOME: 'HOME',
  SPECIALIZED_SELECT: 'SPECIALIZED_SELECT',
  TRAINING: 'TRAINING',
  TREASON: 'TREASON'
};

const getRating = (ms, length) => {
  const avgPerKey = ms / length;
  if (avgPerKey < 100) return 5;
  if (avgPerKey < 200) return 4;
  if (avgPerKey < 350) return 3;
  if (avgPerKey < 500) return 2;
  return 1;
};

function App() {
  const [lang, setLang] = useState(() => detectInitialLang());
  const t = useMemo(() => createT(lang), [lang]);

  const getStratagemName = useCallback(
    (stratagem) => {
      const name = stratagem?.name;
      if (!name) return '';
      if (typeof name === 'string') return name; // 兼容旧数据
      return name[lang] ?? name.zh ?? name.en ?? '';
    },
    [lang]
  );

  const [currentStratagem, setCurrentStratagem] = useState(null);
  const [userInput, setUserInput] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [trainingMode, setTrainingMode] = useState('random'); // 'random' or 'specialized'
  const [specializedStratagem, setSpecializedStratagem] = useState(null);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const startNext = useCallback(() => {
    if (trainingMode === 'specialized' && specializedStratagem) {
      setCurrentStratagem(specializedStratagem);
    } else {
      const randomIndex = Math.floor(Math.random() * STRATAGEMS.length);
      setCurrentStratagem(STRATAGEMS[randomIndex]);
    }
    setUserInput([]);
    setStartTime(null);
    setResult(null);
    setIsError(false);
  }, [trainingMode, specializedStratagem]);

  const handleStartRandom = useCallback(() => {
    setTrainingMode('random');
    setSpecializedStratagem(null);
    const randomIndex = Math.floor(Math.random() * STRATAGEMS.length);
    setCurrentStratagem(STRATAGEMS[randomIndex]);
    setCurrentScreen(SCREENS.TRAINING);
    setUserInput([]);
    setStartTime(null);
    setResult(null);
    setIsError(false);
  }, []);

  useEffect(() => {
    if (currentScreen === SCREENS.TRAINING && !currentStratagem) {
      // 只有在真的没有战略配备时才启动下一个，避免重复调用
      const randomIndex = Math.floor(Math.random() * STRATAGEMS.length);
      setCurrentStratagem(STRATAGEMS[randomIndex]);
    }
  }, [currentScreen, currentStratagem]);

  const handleSelectSpecialized = useCallback((stratagem) => {
    setTrainingMode('specialized');
    setSpecializedStratagem(stratagem);
    setCurrentStratagem(stratagem);
    setCurrentScreen(SCREENS.TRAINING);
    setUserInput([]);
    setStartTime(null);
    setResult(null);
    setIsError(false);
  }, []);

  const goBack = useCallback(() => {
    if (currentScreen === SCREENS.TRAINING) {
      if (trainingMode === 'specialized') {
        setCurrentScreen(SCREENS.SPECIALIZED_SELECT);
      } else {
        setCurrentScreen(SCREENS.HOME);
      }
      setCurrentStratagem(null);
    } else if (currentScreen === SCREENS.SPECIALIZED_SELECT || currentScreen === SCREENS.TREASON) {
      setCurrentScreen(SCREENS.HOME);
    }
  }, [currentScreen, trainingMode]);

  const handleInput = useCallback((key) => {
    if (!currentStratagem || result) return;

    if (['W', 'S', 'A', 'D'].includes(key)) {
      let currentStartTime = startTime;
      if (userInput.length === 0) {
        currentStartTime = Date.now();
        setStartTime(currentStartTime);
      }

      const nextIndex = userInput.length;
      if (key === currentStratagem.sequence[nextIndex]) {
        const newUserInput = [...userInput, key];
        setUserInput(newUserInput);
        setIsError(false);

        if (newUserInput.length === currentStratagem.sequence.length) {
          const endTime = Date.now();
          const duration = endTime - currentStartTime;
          setResult({
            ms: duration,
            rating: getRating(duration, currentStratagem.sequence.length)
          });
          setConsecutiveErrors(0);
        }
      } else {
        setIsError(true);
        setUserInput([]);
        const newErrorCount = consecutiveErrors + 1;
        setConsecutiveErrors(newErrorCount);
        if (newErrorCount >= 5) {
          setCurrentScreen(SCREENS.TREASON);
          setConsecutiveErrors(0);
        }
      }
    }
  }, [currentStratagem, result, startTime, userInput, consecutiveErrors]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();

      if (e.code === 'Space') {
        if (currentScreen === SCREENS.TRAINING) {
          e.preventDefault();
          startNext();
        } else if (currentScreen === SCREENS.HOME) {
          e.preventDefault();
          handleStartRandom();
        }
        return;
      }

      if (e.key === 'Escape') {
        goBack();
        return;
      }

      handleInput(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, startNext, handleStartRandom, handleInput, goBack]);

  const stratagemsByType = useMemo(() => {
    const groups = {
      supply: [],
      orbital: [],
      hangar: [],
      bridge: [],
      engineering: [],
      robotics: [],
      mission: []
    };
    STRATAGEMS.forEach((s) => {
      if (groups[s.type]) {
        groups[s.type].push(s);
      } else {
        // 兜底，如果没有类型则归入 supply 或其他
        groups.supply.push(s);
      }
    });
    return groups;
  }, []);

  return (
      <div
          className="relative flex flex-col items-center justify-center min-h-screen p-4 text-white font-mono bg-black bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
                'url(/background.jpg)'
          }}
      >
        <div className="absolute inset-0 bg-black/70" aria-hidden="true"/>

        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl flex items-center justify-between mb-4">
            <div>
              {currentScreen !== SCREENS.HOME && (
                  <button
                      onClick={goBack}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-sm uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                    {t('back')}
                  </button>
              )}
            </div>
            <label className="text-xs text-gray-400 font-bold tracking-[0.2em] uppercase flex items-center gap-3">
              <span>{t('langLabel')}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[#1a1b1e] border border-gray-700 text-white px-3 py-2 rounded-sm"
              >
                {Object.entries(LANGS).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

        {/* 只在开始界面显示：顶部 Logo + 标题；开始后不显示 */}
        {currentScreen === SCREENS.HOME && (
          <>
            <img
              src="/logo.png"
              alt={t('title')}
              className="w-[520px] max-w-[90vw] h-auto mb-6 drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)] select-none"
              draggable="false"
            />

            <h1 className="text-5xl font-black mb-16 text-[#f6ff00] tracking-tighter italic border-b-4 border-[#f6ff00] pb-2">
              {t('title')}
            </h1>
          </>
        )}

      {currentScreen === SCREENS.HOME ? (
          <div className="flex flex-col items-center gap-6">
            <button
                onClick={handleStartRandom}
                className="w-full max-w-sm px-12 py-6 bg-[#f6ff00] text-black font-black text-2xl rounded-sm hover:bg-[#e6ee00] transition-all uppercase shadow-[0_0_20px_rgba(246,255,0,0.4)]"
            >
              {t('randomTraining')}
            </button>

            <button
                onClick={() => setCurrentScreen(SCREENS.SPECIALIZED_SELECT)}
                className="w-full max-w-sm px-12 py-6 bg-transparent border-4 border-[#f6ff00] text-[#f6ff00] font-black text-2xl rounded-sm hover:bg-[#f6ff00]/10 transition-all uppercase"
            >
              {t('specializedTraining')}
            </button>

            {/* 首页版权/归属与开源声明：开始后不显示 */}
            <div className="mt-8 max-w-3xl text-center text-[11px] leading-relaxed text-white/60">
              <p className="font-semibold tracking-wide text-white/70">
                {t('disclaimerTitle')}
              </p>
              <p className="mt-2">{t('disclaimerLine1')}</p>
              <p className="mt-2">
                {t('disclaimerLine2')}{' '}
                <span className="font-mono text-yellow-500/80">CC BY 4.0</span>
                {t('disclaimerLine2Suffix')}
              </p>
            </div>
          </div>
      ) : currentScreen === SCREENS.TREASON ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700 bg-black/40 p-12 backdrop-blur-sm border border-white/10 rounded-sm max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-bold mb-8 tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              {t('treasonTitle')}
            </h1>
            <div className="space-y-6 text-xl sm:text-2xl font-medium tracking-wide text-gray-200 uppercase">
              {t('treasonBody').split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
              ))}
            </div>
            <p className="mt-12 text-lg text-gray-400 italic">
              {t('treasonThanks')}
            </p>
            <button
                onClick={() => setCurrentScreen(SCREENS.HOME)}
                className="mt-16 px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-black text-xl rounded-sm transition-all uppercase tracking-[0.2em]"
            >
              {t('treasonDismiss')}
            </button>
          </div>
      ) : currentScreen === SCREENS.SPECIALIZED_SELECT ? (
          <div className="w-full max-w-5xl bg-[#1a1b1e] p-8 rounded-sm shadow-2xl border-l-8 border-[#f6ff00]">
            <h2 className="text-3xl font-black mb-8 text-[#f6ff00] uppercase tracking-tighter">
              {t('selectStratagem')}
            </h2>
            <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
              {Object.entries({
                supply: t('categorySupply'),
                orbital: t('categoryOrbital'),
                hangar: t('categoryHangar'),
                bridge: t('categoryBridge'),
                engineering: t('categoryEngineering'),
                robotics: t('categoryRobotics'),
                mission: t('categoryMission')
              }).map(([type, label]) => (
                  <div key={type} className="mb-10 last:mb-0">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">
                      {label}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {stratagemsByType[type].map((strat, idx) => (
                          <button
                              key={idx}
                              onClick={() => handleSelectSpecialized(strat)}
                              className="flex flex-col items-center p-3 bg-black/40 border border-white/5 hover:border-[#f6ff00]/50 hover:bg-[#f6ff00]/5 transition-all group"
                          >
                            <div className="w-12 h-12 mb-2 p-1 bg-black border border-white/10 group-hover:border-[#f6ff00]/30 transition-all">
                              <img src={strat.icon} alt="" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[9px] font-bold text-center uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors line-clamp-2">
                              {getStratagemName(strat)}
                            </span>
                          </button>
                      ))}
                    </div>
                  </div>
              ))}
            </div>
          </div>
      ) : (
          <div
              className="bg-[#1a1b1e] p-12 rounded-sm shadow-2xl border-l-8 border-yellow-500 w-full max-w-3xl relative overflow-hidden">
            <div
                className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black select-none pointer-events-none flex items-center gap-4">
              <img
                  src="/icons/Super_Earth_Icon.svg"
                  alt=""
                  className="w-20 h-20 opacity-90"
                  aria-hidden="true"
                  draggable="false"
              />
              <span>{t('superEarth')}</span>
            </div>

          <div className="flex items-center mb-12 flex-col sm:flex-row text-center sm:text-left">
            <div className="w-24 h-24 mb-4 sm:mb-0 sm:mr-8 bg-black p-1 border-2 border-yellow-500/30 flex items-center justify-center">
              {currentStratagem && (
                <img
                  src={currentStratagem.icon}
                  alt={getStratagemName(currentStratagem)}
                  className="max-w-full max-h-full"
                />
              )}
            </div>
            <div>
              <div className="text-yellow-500 text-sm font-bold tracking-[0.2em] mb-1">
                {t('stratagemIdentified')}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wide leading-none">
                {currentStratagem ? getStratagemName(currentStratagem) : '...'}
              </h2>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4 justify-start sm:justify-center mb-12 bg-black/40 p-4 sm:p-10 border border-white/10 rounded-sm overflow-x-auto w-full custom-scrollbar">
            {currentStratagem?.sequence.map((dir, index) => {
              const isTyped = index < userInput.length;
              const isErrorPos = index === userInput.length && isError;
              return (
                <div
                  key={index}
                  className={`w-12 h-12 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center rounded-sm transition-all duration-75
                    ${
                      isTyped
                        ? 'text-[#f6ff00] drop-shadow-[0_0_8px_rgba(246,255,0,0.8)]'
                        : isErrorPos
                          ? 'text-red-500 animate-pulse'
                          : 'text-gray-700'
                    }
                  `}
                >
                  <div className="flex-shrink-0 scale-90 sm:scale-110">
                    {ARROWS[dir]}
                  </div>
                </div>
              );
            })}
          </div>

          {isMobile && !result && (
            <div className="flex flex-col items-center gap-2 mb-12">
              <button
                className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30"
                onClick={() => handleInput('W')}
              >
                <div className="flex items-center justify-center">{ARROWS.W}</div>
              </button>
              <div className="flex gap-8">
                <button
                  className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30"
                  onClick={() => handleInput('A')}
                >
                  <div className="flex items-center justify-center">{ARROWS.A}</div>
                </button>
                <button
                  className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30"
                  onClick={() => handleInput('S')}
                >
                  <div className="flex items-center justify-center">{ARROWS.S}</div>
                </button>
                <button
                  className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30"
                  onClick={() => handleInput('D')}
                >
                  <div className="flex items-center justify-center">{ARROWS.D}</div>
                </button>
              </div>
            </div>
          )}

          <div className="h-32 flex flex-col items-center justify-center">
            {result ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="text-6xl font-black text-yellow-400 mb-3 tracking-tighter">
                  {result.ms}{' '}
                  <span className="text-2xl opacity-70">{t('ms')}</span>
                </div>
                <div className="text-4xl text-yellow-500 tracking-widest">
                  {'★'.repeat(result.rating)}{'☆'.repeat(5 - result.rating)}
                </div>
                <div className="mt-8">
                  <button
                      onClick={startNext}
                      className="px-8 py-3 bg-[#f6ff00] text-black font-black text-xl rounded-sm hover:bg-[#e6ee00] transition-all uppercase shadow-[0_0_20px_rgba(246,255,0,0.4)]"
                  >
                    {t('hintDeployNext')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-gray-600 font-bold uppercase tracking-[0.5em] animate-pulse">
                  {t('waiting')}
                </div>
                {isError && (
                  <div className="text-red-500 font-black mt-4 uppercase">
                    {t('inputError')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

          <div
              className="mt-16 text-xs text-gray-600 font-bold tracking-[0.2em] uppercase flex flex-col sm:flex-row items-center gap-4 sm:gap-8 border-t border-gray-800 pt-8 text-center sm:text-left">
            <div>
              <span className="text-yellow-700 mr-2">[W S A D]</span> {t('hintSequence')}
            </div>
            <div>
              <span className="text-yellow-700 mr-2">[SPACE]</span> {t('hintDeployNext')}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <a
                href="https://github.com/LeecOVO/HelldiversCombatTrainingSimulator"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f6ff00] transition-colors flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded-sm bg-black/20"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
      </div>
    </div>
  );
}

export default App;
