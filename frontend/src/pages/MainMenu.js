import '../index.css';
import mysqlCourse from '../data/courses/mysql/course.json';
import mysqlSelectLesson from '../data/courses/mysql/lessons/001-select.json';
import mysqlConcepts from '../data/courses/mysql/concepts.json';

const courseCatalog = [
  {
    ...mysqlCourse,
    lessons: [mysqlSelectLesson],
    concepts: mysqlConcepts
  }
];
import React, { useEffect, useMemo, useState } from 'react';

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

export default function MainMenu() {
  const [selectedCourseId, setSelectedCourseId] = useState(() => localStorage.getItem('ct-course') || courseCatalog[0].id);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isEnglishLayout, setIsEnglishLayout] = useState(null);
  const [layoutCheck, setLayoutCheck] = useState(() => localStorage.getItem('ct-layout-check') === 'on');
  const [errors, setErrors] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ct-theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);

  const course = courseCatalog.find((item) => item.id === selectedCourseId) || courseCatalog[0];
  const lessons = course.lessons.flatMap((lessonFile) =>
    lessonFile.exercises.map((exercise) => ({
      ...exercise,
      lessonId: lessonFile.id,
      definition: exercise.title
    }))
  );
  const lesson = lessons[currentLessonIndex] || lessons[0];
  const targetCommand = lesson.code;
  const nextChar = targetCommand[inputText.length] || '';
  const maxErrors = Math.max(1, Math.ceil(targetCommand.length * 0.03));
  const progress = Math.round((inputText.length / targetCommand.length) * 100);
  const conceptMap = Object.fromEntries((course.concepts || []).map((concept) => [concept.id, concept]));
  let partOffset = 0;
  const explainedParts = (lesson.parts || []).map((part) => {
    const start = partOffset;
    partOffset += part.text.length;
    const concept = part.concept ? conceptMap[part.concept] : null;
    return { ...part, start, end: partOffset, concept };
  }).filter((part) => part.concept);
  const activePartIndex = explainedParts.findIndex((part) => inputText.length >= part.start && inputText.length < part.end);
  const nextKeys = useMemo(() => {
    const keys = [physicalKeyForChar(nextChar)];
    if (requiresShift(nextChar)) keys.push('Shift-Left');
    return keys;
  }, [nextChar]);

  useEffect(() => {
    localStorage.setItem('ct-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ct-course', selectedCourseId);
  }, [selectedCourseId]);

  const progressKey = `ct-progress:${course.id}:${lesson.id}`;
  const savedLesson = JSON.parse(localStorage.getItem(progressKey) || '{}');

  useEffect(() => {
    if (completed) {
      localStorage.setItem(progressKey, JSON.stringify({
        completed: true,
        errors,
        completedAt: new Date().toISOString()
      }));
    }
  }, [completed, errors, progressKey]);

  const selectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentLessonIndex(0);
    setInputText('');
    setErrors(0);
    setCompleted(false);
    setIsPaused(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('ct-layout-check', layoutCheck ? 'on' : 'off');
  }, [layoutCheck]);

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
            <div className="screen-top-actions"><span className="screen-status">{menuOpen ? '● MENU' : '● READY'}</span><button className="hamburger" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">{menuOpen ? '×' : '☰'}</button></div>
          </div>
          {menuOpen ? (
            <>
              <div className="screen-menu">
                <div className="screen-menu-nav">
                  <strong>COURSES</strong>
                  <span>PROGRESS</span>
                  <span>SETTINGS</span>
                </div>
                <div className="screen-course-list">
                  {courseCatalog.map((item) => {
                    const exercises = item.lessons.flatMap((file) => file.exercises);
                    const done = exercises.filter((exercise) =>
                      JSON.parse(localStorage.getItem(`ct-progress:${item.id}:${exercise.id}`) || '{}').completed
                    ).length;
                    return (
                      <button key={item.id} className={`screen-course ${item.id === course.id ? 'selected' : ''}`} onClick={() => selectCourse(item.id)}>
                        <span><b>{item.title}</b><small>{item.description}</small></span>
                        <em>{done}/{exercises.length}</em>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="screen-footer">
                <span>MENU // COURSES</span>
                <button className="screen-back" onClick={() => setMenuOpen(false)}>BACK TO LESSON</button>
              </div>
            </>
          ) : (
            <>
              <div className="screen-content">
                <p className="screen-kicker">{lesson.definition}</p>
                <div className="code-line">
                  <span className="typed">{inputText}</span>
                  {!completed && <span className="current-char">{nextChar === '\n' ? '↵' : nextChar || ' '}</span>}
                  <span className="remaining">{targetCommand.slice(inputText.length + (completed ? 0 : 1))}</span>
                </div>
              </div>
              <div className="screen-footer">
                <span>NEXT KEY: <b>{keyLabel(nextChar) || 'DONE'}</b></span>
                <span>{completed ? 'LESSON COMPLETE' : 'TYPE TO CONTINUE'}</span>
              </div>
            </>
          )}
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
