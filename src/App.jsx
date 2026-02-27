import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { STRATAGEMS } from './stratagems';
import { LANGS, detectInitialLang, createT } from './i18n';

const ARROWS = {
  W: (
    <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
      <path d="M12 4l-8 8h5v8h6v-8h5z" />
    </svg>
  ),
  S: (
    <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
      <path d="M12 20l8-8h-5V4H9v8H4z" />
    </svg>
  ),
  A: (
    <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
      <path d="M4 12l8 8v-5h8v-6h-8V4z" />
    </svg>
  ),
  D: (
    <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
      <path d="M20 12l-8-8v5H4v6h8v5z" />
    </svg>
  )
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

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const startNext = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * STRATAGEMS.length);
    setCurrentStratagem(STRATAGEMS[randomIndex]);
    setUserInput([]);
    setStartTime(null);
    setResult(null);
    setIsError(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();

      if (e.code === 'Space') {
        e.preventDefault();
        startNext();
        return;
      }

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
          }
        } else {
          setIsError(true);
          setUserInput([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStratagem, userInput, startTime, result, startNext]);

  return (
      <div
          className="relative flex flex-col items-center justify-center min-h-screen p-4 text-white font-mono bg-black bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
                'url(https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/56fcbe062798a21624ec45f1325089995883973f/page_bg_v6.jpg?t=1770747641)'
          }}
      >
        <div className="absolute inset-0 bg-black/70" aria-hidden="true"/>

        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl flex items-center justify-end mb-4">
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
        {!currentStratagem && (
          <>
            <img
              src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/91a4178ade8b8ea577f1053b78072befce1a1cac/logo_2x.png"
              alt={t('title')}
              className="w-[520px] max-w-[90vw] h-auto mb-6 drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)] select-none"
              draggable="false"
            />

            <h1 className="text-5xl font-black mb-16 text-[#f6ff00] tracking-tighter italic border-b-4 border-[#f6ff00] pb-2">
              {t('title')}
            </h1>
          </>
        )}

      {!currentStratagem ? (
          <div className="flex flex-col items-center">
            <button
                onClick={startNext}
                className="px-12 py-6 bg-[#f6ff00] text-black font-black text-2xl rounded-sm hover:bg-[#e6ee00] transition-all uppercase shadow-[0_0_20px_rgba(246,255,0,0.4)]"
            >
              {t('begin')}
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
      ) : (
          <div
              className="bg-[#1a1b1e] p-12 rounded-sm shadow-2xl border-l-8 border-yellow-500 w-full max-w-3xl relative overflow-hidden">
            <div
                className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black select-none pointer-events-none flex items-center gap-4">
              <img
                  src="https://helldivers.wiki.gg/images/Super_Earth_Icon.svg"
                  alt=""
                  className="w-20 h-20 opacity-90"
                  aria-hidden="true"
                  draggable="false"
              />
              <span>{t('superEarth')}</span>
            </div>

          <div className="flex items-center mb-12">
            <div className="w-24 h-24 mr-8 bg-black p-1 border-2 border-yellow-500/30 flex items-center justify-center">
              <img
                src={currentStratagem.icon}
                alt={getStratagemName(currentStratagem)}
                className="max-w-full max-h-full"
              />
            </div>
            <div>
              <div className="text-yellow-500 text-sm font-bold tracking-[0.2em] mb-1">
                {t('stratagemIdentified')}
              </div>
              <h2 className="text-4xl font-black uppercase tracking-wide leading-none">
                {getStratagemName(currentStratagem)}
              </h2>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-12 bg-black/40 p-10 border border-white/10 rounded-sm">
            {currentStratagem.sequence.map((dir, index) => {
              const isTyped = index < userInput.length;
              const isErrorPos = index === userInput.length && isError;
              return (
                <div
                  key={index}
                  className={`w-20 h-20 flex items-center justify-center rounded-sm transition-all duration-75
                    ${
                      isTyped
                        ? 'text-[#f6ff00] drop-shadow-[0_0_8px_rgba(246,255,0,0.8)]'
                        : isErrorPos
                          ? 'text-red-500 animate-pulse'
                          : 'text-gray-700'
                    }
                  `}
                >
                  {ARROWS[dir]}
                </div>
              );
            })}
          </div>

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
                <div className="mt-8 text-yellow-500/50 font-bold animate-pulse uppercase tracking-[0.3em]">
                  {t('nextReady')}
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
              className="mt-16 text-xs text-gray-600 font-bold tracking-[0.2em] uppercase flex gap-8 border-t border-gray-800 pt-8">
            <div>
              <span className="text-yellow-700 mr-2">[W S A D]</span> {t('hintSequence')}
            </div>
            <div>
              <span className="text-yellow-700 mr-2">[SPACE]</span> {t('hintDeployNext')}
            </div>
          </div>
      </div>
    </div>
  );
}

export default App;
