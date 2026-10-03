import '../index.css';
import mysqlCourse from '../data/courses/mysql/course.json';
import mysqlConcepts from '../data/courses/mysql/concepts.json';
import mysqlSelectLesson from '../data/courses/mysql/lessons/001-select.json';
import mysqlWhereLesson from '../data/courses/mysql/lessons/002-where.json';
import legacyLessons from '../data/lessons.json';

const javascriptConcepts = [
  { id: 'js.function', title: 'function', explanation: 'Объявляем новую функцию.' },
  { id: 'js.function-name', title: 'Имя функции', explanation: 'Задаём имя функции, чтобы потом её вызывать.' },
  { id: 'js.parameter', title: 'Параметр', explanation: 'Указываем данные, которые функция получает при вызове.' },
  { id: 'js.block-open', title: '{', explanation: 'Открываем тело функции — здесь находятся её команды.' },
  { id: 'js.return', title: 'return', explanation: 'Возвращаем результат работы функции.' },
  { id: 'js.template', title: 'Шаблонная строка', explanation: 'Создаём строку и вставляем в неё значение переменной через ${...}.' },
  { id: 'js.block-close', title: '}', explanation: 'Закрываем тело функции.' },
  { id: 'js.let', title: 'let', explanation: 'Создаём переменную, значение которой можно изменить.' },
  { id: 'js.const', title: 'const', explanation: 'Создаём переменную, которую нельзя переназначить.' },
  { id: 'js.variable-name', title: 'Имя переменной', explanation: 'Даём переменной понятное имя.' },
  { id: 'js.assignment', title: '=', explanation: 'Присваиваем переменной значение.' },
  { id: 'js.value', title: 'Значение', explanation: 'Записываем значение, которое будет храниться в переменной.' },
  { id: 'js.statement-end', title: ';', explanation: 'Завершаем инструкцию JavaScript.' }
];

const javascriptParts = {
  1: [
    { text: 'function', concept: 'js.function' },
    { text: ' ', kind: 'whitespace' },
    { text: 'greet', concept: 'js.function-name' },
    { text: '(', kind: 'syntax' },
    { text: 'name', concept: 'js.parameter' },
    { text: ') ', kind: 'syntax' },
    { text: '{', concept: 'js.block-open' },
    { text: '\n  ', kind: 'whitespace' },
    { text: 'return', concept: 'js.return' },
    { text: ' ', kind: 'whitespace' },
    { text: '`Hello, ${name}!`', concept: 'js.template' },
    { text: ';', concept: 'js.statement-end' },
    { text: '\n', kind: 'whitespace' },
    { text: '}', concept: 'js.block-close' }
  ],
  2: [
    { text: 'let', concept: 'js.let' },
    { text: ' ', kind: 'whitespace' },
    { text: 'age', concept: 'js.variable-name' },
    { text: ' ', kind: 'whitespace' },
    { text: '=', concept: 'js.assignment' },
    { text: ' ', kind: 'whitespace' },
    { text: '30', concept: 'js.value' },
    { text: ';', concept: 'js.statement-end' },
    { text: '\n', kind: 'whitespace' },
    { text: 'const', concept: 'js.const' },
    { text: ' ', kind: 'whitespace' },
    { text: 'name', concept: 'js.variable-name' },
    { text: ' ', kind: 'whitespace' },
    { text: '=', concept: 'js.assignment' },
    { text: ' ', kind: 'whitespace' },
    { text: "'Alice'", concept: 'js.value' },
    { text: ';', concept: 'js.statement-end' }
  ]
};

const courseCatalog = [
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Исходный курс CodeTrainer.',
    concepts: javascriptConcepts,
    lessons: legacyLessons.map((item) => ({ ...item, id: `js-${item.id}`, code: item.text, parts: javascriptParts[item.id] || [] }))
  },
  {
    ...mysqlCourse,
    concepts: mysqlConcepts,
    lessons: [mysqlSelectLesson, mysqlWhereLesson].flatMap((file) => file.exercises.map((exercise) => ({ ...exercise, definition: exercise.title })))
  }
];
import React, { useEffect, useMemo, useRef, useState } from 'react';

const keyboardLayout = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
  ['CapsLock','A','S','D','F','G','H','J','K','L',';',"'",'Enter'],
  ['Shift-Left','Z','X','C','V','B','N','M',',','.','/','Shift-Right'],
  ['Control','Alt','SPACE','AltGr','Control','ArrowLeft','ArrowRight']
];

const requiresShift = (char) => /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(char || '');
const keyLabel = (char) => char === '\n' ? 'Enter' : char === ' ' ? 'SPACE' : (char || '').toUpperCase();

const shiftedToBase = {
  '~': '`', '!': '1', '@': '2', '#': '3', [String.fromCharCode(36)]: '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
};
const baseToShifted = Object.fromEntries(
  Object.entries(shiftedToBase).map(([shifted, base]) => [base, shifted])
);
const codeToBaseKey = {
  Backquote: '`',
  Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
  Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0',
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
  Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/',
  Space: 'SPACE', Enter: 'Enter'
};
const physicalKeyFromEvent = (event) => {
  if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
  return codeToBaseKey[event.code] || '';
};
const charFromPhysicalKey = (key, shift) => {
  if (key === 'Enter') return '\n';
  if (key === 'SPACE') return ' ';
  if (/^[A-Z]$/.test(key)) return shift ? key : key.toLowerCase();
  return shift && baseToShifted[key] ? baseToShifted[key] : key;
};
const physicalKeyForChar = (char) => {
  if (shiftedToBase[char]) return shiftedToBase[char];
  if (char === '\n') return 'Enter';
  if (char === ' ') return 'SPACE';
  if (/^[a-zA-Z]$/.test(char || '')) return char.toUpperCase();
  return char || '';
};

const startCyberAmbient = async () => {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;

  const ctx = new Ctx();
  if (ctx.state === 'suspended') await ctx.resume();
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  master.gain.value = 0.11;
  filter.type = 'lowpass';
  filter.frequency.value = 950;
  filter.Q.value = 1.4;
  filter.connect(master);
  master.connect(ctx.destination);

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.16;
  droneGain.connect(filter);
  const droneA = ctx.createOscillator();
  const droneB = ctx.createOscillator();
  droneA.type = 'sawtooth';
  droneB.type = 'triangle';
  droneA.frequency.value = 55;
  droneB.frequency.value = 82.41;
  droneB.detune.value = -7;
  droneA.connect(droneGain);
  droneB.connect(droneGain);
  droneA.start();
  droneB.start();

  const notes = [110, 130.81, 98, 146.83, 110, 164.81, 98, 130.81];
  let step = 0;
  const pulse = () => {
    if (ctx.state === 'closed') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = step % 4 === 3 ? 'square' : 'triangle';
    osc.frequency.value = notes[step % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now + 0.45);
    step += 1;
  };
  pulse();
  const timer = window.setInterval(pulse, 620);

  return () => {
    window.clearInterval(timer);
    try {
      droneA.stop();
      droneB.stop();
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04);
      window.setTimeout(() => ctx.close(), 180);
    } catch {}
  };
};

const startCyberTrack = async () => {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  if (ctx.state === 'suspended') await ctx.resume();

  const master = ctx.createGain();
  const musicBus = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  master.gain.value = 0.16;
  musicBus.gain.value = 0.72;
  filter.type = 'lowpass';
  filter.frequency.value = 2200;
  filter.Q.value = 0.8;
  musicBus.connect(filter);
  filter.connect(master);
  master.connect(ctx.destination);

  const tempo = 92;
  const beat = 60 / tempo;
  const bass = [55,55,65.41,55,73.42,73.42,49,49];
  const lead = [220,261.63,293.66,329.63,293.66,261.63,196,220];
  const chords = [[110,130.81,164.81],[130.81,164.81,196],[146.83,174.61,220],[98,123.47,146.83]];
  let step = 0;

  const tone = (freq, type, start, duration, volume, destination = musicBus) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  };

  const kick = (start) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, start);
    osc.frequency.exponentialRampToValueAtTime(42, start + 0.16);
    gain.gain.setValueAtTime(0.34, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.24);
  };

  const hat = (start) => {
    const length = Math.floor(ctx.sampleRate * 0.045);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    const hp = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    hp.type = 'highpass';
    hp.frequency.value = 5200;
    gain.gain.setValueAtTime(0.055, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
    src.buffer = buffer;
    src.connect(hp);
    hp.connect(gain);
    gain.connect(master);
    src.start(start);
  };

  const sequence = () => {
    if (ctx.state === 'closed') return;
    const now = ctx.currentTime + 0.025;
    if (step % 2 === 0) kick(now);
    hat(now + beat / 2);
    tone(bass[step % bass.length], 'sawtooth', now, beat * 0.7, 0.12);
    if (step % 4 === 0) {
      chords[Math.floor(step / 4) % chords.length].forEach((freq) =>
        tone(freq, 'triangle', now, beat * 3.7, 0.035)
      );
    }
    if (step % 2 === 1) tone(lead[step % lead.length], 'square', now, beat * 0.38, 0.032);
    step = (step + 1) % 16;
  };

  sequence();
  const timer = window.setInterval(sequence, beat * 1000);
  return () => {
    window.clearInterval(timer);
    try {
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04);
      window.setTimeout(() => ctx.close(), 180);
    } catch {}
  };
};


const musicModes = [
  { id: 'ambient', label: 'AMBIENT' },
  { id: 'track', label: 'CYBER TRACK' },
  { id: 'terminal-groove', label: 'TERMINAL GROOVE', src: `${import.meta.env.BASE_URL}Terminal%20Groove.mp3` },
  { id: 'night-terminal', label: 'NIGHT TERMINAL', src: `${import.meta.env.BASE_URL}Night%20Terminal.mp3` }
];

const startAudioFile = async (src) => {
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.55;
  await audio.play();
  return () => {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    } catch {}
  };
};

const startMusicMode = async (mode) => {
  if (mode === 'ambient') return startCyberAmbient();
  if (mode === 'track') return startCyberTrack();
  const item = musicModes.find((entry) => entry.id === mode);
  if (item?.src) return startAudioFile(item.src);
  return startCyberAmbient();
};

export default function MainMenu() {
  const [selectedCourseId, setSelectedCourseId] = useState(() => localStorage.getItem('ct-course') || 'mysql');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isEnglishLayout, setIsEnglishLayout] = useState(null);
  const [layoutCheck, setLayoutCheck] = useState(() => localStorage.getItem('ct-layout-check') === 'on');
  const [errors, setErrors] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ct-theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState('COURSES');
  const [musicOn, setMusicOn] = useState(false);
  const [musicMode, setMusicMode] = useState(() => localStorage.getItem('ct-music-mode') || 'ambient');
  const musicStopRef = useRef(null);
  const activeExplainRef = useRef(null);
  const explainBodyRef = useRef(null);

  const course = courseCatalog.find((item) => item.id === selectedCourseId) || courseCatalog[1];
  const lessons = course.lessons;
  const lesson = lessons[currentLessonIndex] || lessons[0];
  const targetCommand = lesson.code;
  const nextChar = targetCommand[inputText.length] || '';
  const maxErrors = Math.max(1, Math.ceil(targetCommand.length * 0.03));
  const progress = Math.round((inputText.length / targetCommand.length) * 100);
  const progressKey = `ct-progress:${course.id}:${lesson.id}`;
  const savedLesson = JSON.parse(localStorage.getItem(progressKey) || '{}');
  const conceptMap = Object.fromEntries((course.concepts || []).map((concept) => [concept.id, concept]));
  let partOffset = 0;
  const explainedParts = (lesson.parts || []).map((part) => {
    const start = partOffset;
    partOffset += part.text.length;
    return { ...part, start, end: partOffset, concept: part.concept ? conceptMap[part.concept] : null };
  }).filter((part) => part.concept);
  const activePartIndex = explainedParts.findIndex((part) => inputText.length >= part.start && inputText.length < part.end);
  const nextKeys = useMemo(() => {
    const keys = [physicalKeyForChar(nextChar)];
    if (requiresShift(nextChar)) keys.push('Shift-Left');
    return keys;
  }, [nextChar]);

  useEffect(() => {
    if (menuOpen || !activeExplainRef.current || !explainBodyRef.current) return;

    const container = explainBodyRef.current;
    const active = activeExplainRef.current;
    const activeCenter = active.offsetTop + active.offsetHeight / 2;
    const centerLine = container.clientHeight / 2;

    // Let the active explanation move naturally down to the middle.
    // After that, keep it around the middle and scroll older text upward.
    const targetScrollTop = Math.max(0, activeCenter - centerLine);
    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
  }, [inputText, activePartIndex, menuOpen, currentLessonIndex]);

  useEffect(() => {
    localStorage.setItem('ct-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ct-course', selectedCourseId);
  }, [selectedCourseId]);

  const selectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentLessonIndex(0);
    setInputText('');
    setErrors(0);
    setCompleted(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('ct-layout-check', layoutCheck ? 'on' : 'off');
  }, [layoutCheck]);

  useEffect(() => () => {
    if (musicStopRef.current) musicStopRef.current();
  }, []);

  const toggleMusic = async () => {
    if (musicOn) {
      if (musicStopRef.current) musicStopRef.current();
      musicStopRef.current = null;
      setMusicOn(false);
      localStorage.setItem('ct-music', 'off');
      return;
    }
    try {
      const stopMusic = await startMusicMode(musicMode);
      if (stopMusic) {
        musicStopRef.current = stopMusic;
        setMusicOn(true);
        localStorage.setItem('ct-music', 'on');
      }
    } catch {
      setMusicOn(false);
      localStorage.setItem('ct-music', 'off');
    }
  };

  const selectMusicMode = async (mode) => {
    if (mode === musicMode) return;
    localStorage.setItem('ct-music-mode', mode);
    setMusicMode(mode);
    if (!musicOn) return;
    if (musicStopRef.current) musicStopRef.current();
    try {
      musicStopRef.current = await startMusicMode(mode);
    } catch {
      musicStopRef.current = null;
      setMusicOn(false);
    }
  };

  useEffect(() => {
    if (completed) {
      localStorage.setItem(progressKey, JSON.stringify({ completed: true, errors, completedAt: new Date().toISOString() }));
    }
  }, [completed, errors, progressKey]);

  const playErrorSound = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 440;
      gain.gain.value = 0.12;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (menuOpen || isPaused || completed) return;
      if (['Shift','Control','Alt','CapsLock','Tab'].includes(event.key)) return;

      let typedChar = '';
      if (layoutCheck) {
        if (event.key === ' ') typedChar = ' ';
        else if (event.key === 'Enter') typedChar = '\n';
        else if (event.key.length === 1) typedChar = event.key;
      } else {
        const physicalKey = physicalKeyFromEvent(event);
        if (physicalKey) typedChar = charFromPhysicalKey(physicalKey, event.shiftKey);
      }
      if (!typedChar) return;

      if (event.code === 'Space') event.preventDefault();
      const isAsciiInput = /^[\x20-\x7E]$/.test(event.key) || event.key === 'Enter';
      setIsEnglishLayout(isAsciiInput);

      if (typedChar === nextChar) {
        const next = inputText + typedChar;
        setInputText(next);
        if (next === targetCommand) setCompleted(true);
      } else {
        setErrors((value) => value + 1);
        setIsPaused(true);
        playErrorSound();
        window.setTimeout(() => setIsPaused(false), 1200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, nextChar, targetCommand, completed, isPaused, layoutCheck, menuOpen]);

  const restartLesson = () => {
    setInputText('');
    setErrors(0);
    setCompleted(false);
    setIsPaused(false);
  };

  const nextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex((value) => value + 1);
      setInputText('');
      setErrors(0);
      setCompleted(false);
    }
  };

  return (
    <main className={`trainer theme-${theme}`}>
      {isPaused && (
        <div className="error-overlay">
          <div className="error-card">
            <strong>INPUT ERROR</strong>
            <span>Проверь символ и продолжай.</span>
          </div>
        </div>
      )}

      <section className="workspace">
        <div className="screen-shell">
          <div className="screen-topline">
            <span>LESSON {String(currentLessonIndex + 1).padStart(2,'0')}</span>
            <div className="screen-top-actions">
              <span className="screen-status">{menuOpen ? '● MENU' : '● READY'}</span>
              <button className="hamburger" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">{menuOpen ? '×' : '☰'}</button>
            </div>
          </div>
          <div className="screen-body">
            <aside className="explain-terminal">
              {menuOpen ? (
                <>
                  <div className="explain-terminal-head">MENU</div>
                  <nav className="side-menu-tabs">
                    {['COURSES','PROGRESS','SETTINGS'].map((section) => (
                      <button key={section} className={menuSection === section ? 'active' : ''} onClick={() => setMenuSection(section)}>{section}</button>
                    ))}
                  </nav>
                  <div className="explain-terminal-foot">SYSTEM // MENU</div>
                </>
              ) : (
                <>
                  <div className="explain-terminal-head">CODE EXPLAIN</div>
                  <div className="explain-terminal-body" ref={explainBodyRef}>
                    {explainedParts.length ? explainedParts.map((part, index) => {
                      const state = inputText.length >= part.end ? 'done' : index === activePartIndex ? 'active' : 'future';
                      return (
                        <div ref={state === 'active' ? activeExplainRef : null} className={`explain-line ${state}`} key={`${part.start}-${part.text}`}>
                          <strong>{state === 'done' ? '✓' : state === 'active' ? '▶' : '·'} {part.text}</strong>
                          <span>{part.concept.explanation}</span>
                        </div>
                      );
                    }) : <div className="explain-line active"><strong>▶ {course.title}</strong><span>{lesson.definition}</span></div>}
                  </div>
                  <div className="explain-terminal-foot">SYNTAX // {course.title.toUpperCase()}</div>
                </>
              )}
            </aside>
            <div className="lesson-terminal">
              {menuOpen ? (
                <div className="terminal-menu">
                  <div className="terminal-menu-content">
                    {menuSection === 'COURSES' && <>
                      <strong>COURSES</strong>
                      <div className="course-choice-list">
                        {courseCatalog.map((item) => (
                          <button key={item.id} className={item.id === course.id ? 'selected' : ''} onClick={() => selectCourse(item.id)}>
                            <b>{item.title}</b><span>{item.description}</span>
                          </button>
                        ))}
                      </div>
                    </>}
                    {menuSection === 'PROGRESS' && <><strong>PROGRESS // {course.title}</strong><span>{savedLesson.completed || completed ? `LESSON ${String(currentLessonIndex + 1).padStart(2,'0')} // COMPLETE` : `LESSON ${String(currentLessonIndex + 1).padStart(2,'0')} // NOT COMPLETE`}</span><small>{progress}% CURRENT</small></>}
                    {menuSection === 'SETTINGS' && <>
                      <strong>SETTINGS</strong>
                      <span>LAYOUT CHECK // {layoutCheck ? 'ON' : 'OFF'}</span>
                      <small>THEME // {theme.toUpperCase()}</small>
                      <div className="music-setting">
                        <span>MUSIC // {musicOn ? 'ON' : 'OFF'}</span>
                        <button onClick={toggleMusic}>{musicOn ? 'MUSIC OFF' : 'MUSIC ON'}</button>
                      </div>
                      <div className="music-selector">
                        <button
                          onClick={() => {
                            const index = musicModes.findIndex((item) => item.id === musicMode);
                            const nextIndex = (index - 1 + musicModes.length) % musicModes.length;
                            selectMusicMode(musicModes[nextIndex].id);
                          }}
                          aria-label="Previous music mode"
                        >‹</button>
                        <span>{musicModes.find((item) => item.id === musicMode)?.label || 'AMBIENT'}</span>
                        <button
                          onClick={() => {
                            const index = musicModes.findIndex((item) => item.id === musicMode);
                            const nextIndex = (index + 1) % musicModes.length;
                            selectMusicMode(musicModes[nextIndex].id);
                          }}
                          aria-label="Next music mode"
                        >›</button>
                      </div>
                    </>}
                  </div>
                  <button className="screen-back" onClick={() => setMenuOpen(false)}>BACK TO LESSON</button>
                </div>
              ) : completed ? (
                <div className="lesson-complete">
                  <div className="complete-scan" />
                  <div className="complete-glitch" data-text="LESSON COMPLETE">LESSON COMPLETE</div>
                  <div className="complete-meta">DATA VERIFIED // {course.title.toUpperCase()} // LESSON {String(currentLessonIndex + 1).padStart(2,'0')}</div>
                  <div className="complete-bar"><i /></div>
                  {currentLessonIndex < lessons.length - 1 ? (
                    <button className="complete-next" onClick={nextLesson}>NEXT LESSON →</button>
                  ) : (
                    <div className="complete-course">COURSE MODULE COMPLETE</div>
                  )}
                </div>
              ) : (
                <div className="screen-content">
                  <p className="screen-kicker">{lesson.definition}</p>
                  <div className="code-line">
                    <span className="typed">{inputText}</span>
                    <span className="current-char">{nextChar === '\n' ? '↵' : nextChar || ' '}</span>
                    <span className="remaining">{targetCommand.slice(inputText.length + 1)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="info-panel">
          <div className="panel-heading">
            <span>SESSION</span>
            <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? 'DARK' : 'LIGHT'}
            </button>
          </div>
          <div className="stat"><span>USER</span><strong>LOCAL</strong></div>
          <div className="stat"><span>SAVED</span><strong>{savedLesson.completed ? 'COMPLETE' : 'NOT YET'}</strong></div>
          <div className="stat"><span>LESSON</span><strong>{currentLessonIndex + 1}/{lessons.length}</strong></div>
          <div className="stat"><span>ERRORS</span><strong>{errors}/{maxErrors}</strong></div>
          <div className="stat"><span>CHARS</span><strong>{inputText.length}/{targetCommand.length}</strong></div>
          <div className="stat"><span>PROGRESS</span><strong>{progress}%</strong></div>
          <div className="progress-track"><i style={{width: `${progress}%`}} /></div>
          <div className="layout-lamp">
            <span className={layoutCheck ? (isEnglishLayout === true ? 'lamp on' : 'lamp') : 'lamp on'} />
            <div>
              <small>LAYOUT CHECK</small>
              <strong>{layoutCheck ? 'ON' : 'OFF'}</strong>
            </div>
            <button
              className="theme-toggle"
              onClick={() => setLayoutCheck((value) => !value)}
              title={layoutCheck ? 'Require actual Windows input characters' : 'Use physical keys as US layout'}
            >
              {layoutCheck ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>
          <div className="panel-actions">
            <button onClick={restartLesson}>RESTART</button>
            <button onClick={nextLesson} disabled={!completed || currentLessonIndex === lessons.length - 1}>NEXT</button>
          </div>
        </aside>
      </section>

      <section className="keyboard-deck" aria-label="Virtual keyboard">
        {keyboardLayout.map((row, rowIndex) => (
          <div className="key-row" key={rowIndex}>
            {row.map((key, keyIndex) => {
              const display = key.startsWith('Shift') ? 'Shift' : key;
              const shiftedLabel = baseToShifted[key];
              const targetPhysicalKey = physicalKeyForChar(nextChar);
              const active =
                key === targetPhysicalKey ||
                (requiresShift(nextChar) && key === 'Shift-Left');
              const special = ['Backspace','Tab','CapsLock','Enter','Shift-Left','Shift-Right','Control','Alt','AltGr','ArrowLeft','ArrowRight'].includes(key);
              return (
                <button
                  tabIndex="-1"
                  key={`${rowIndex}-${keyIndex}-${key}`}
                  className={`key ${special ? 'key-special' : ''} ${key === 'SPACE' ? 'key-space' : ''} ${active ? 'key-active' : ''}`}
                >
                  {shiftedLabel ? (
                    <span className="key-symbols">
                      <span>{shiftedLabel}</span>
                      <span>{display}</span>
                    </span>
                  ) : (display === 'ArrowLeft' ? '←' : display === 'ArrowRight' ? '→' : display)}
                </button>
              );
            })}
          </div>
        ))}
      </section>

      <footer className="trainer-footer">
        <span>CODE MEMORY TRAINER // TERMINAL 01</span>
        <span>VITE BUILD</span>
      </footer>
    </main>
  );
}
