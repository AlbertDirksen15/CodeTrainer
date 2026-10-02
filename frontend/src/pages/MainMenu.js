import '../index.css';
import lessons from '../data/lessons.json';
import React, { useEffect, useMemo, useState } from 'react';

const keyboardLayout = [
  ['1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
  ['CapsLock','A','S','D','F','G','H','J','K','L',';',"'",'Enter'],
  ['Shift-Left','Z','X','C','V','B','N','M',',','.','/','Shift-Right'],
  ['Control','Alt','SPACE','AltGr','Control','ArrowLeft','ArrowRight']
];

const requiresShift = (char) => /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(char || '');
const keyLabel = (char) => char === '\n' ? 'Enter' : char === ' ' ? 'SPACE' : (char || '').toUpperCase();

export default function MainMenu() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isEnglishLayout, setIsEnglishLayout] = useState(true);
  const [errors, setErrors] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ct-theme') || 'light');

  const lesson = lessons[currentLessonIndex];
  const targetCommand = lesson.text;
  const nextChar = targetCommand[inputText.length] || '';
  const maxErrors = Math.max(1, Math.ceil(targetCommand.length * 0.03));
  const progress = Math.round((inputText.length / targetCommand.length) * 100);
  const nextKeys = useMemo(() => {
    const keys = [keyLabel(nextChar)];
    if (requiresShift(nextChar)) keys.push('Shift');
    return keys;
  }, [nextChar]);

  useEffect(() => {
    localStorage.setItem('ct-theme', theme);
  }, [theme]);

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
      if (event.key === 'Shift') {
        setShiftPressed(true);
        return;
      }
      if (isPaused || completed) return;
      if (['Shift','Control','Alt','CapsLock','Tab'].includes(event.key)) return;

      let key = '';
      if (event.key === ' ') key = ' ';
      else if (event.key === 'Enter') key = '\n';
      else if (event.key.length === 1) key = event.key;
      if (!key) return;

      if (event.key === ' ') event.preventDefault();
      setIsEnglishLayout(/^[\x20-\x7E]$/.test(event.key) || event.key === 'Enter');

      if (key === nextChar) {
        const next = inputText + key;
        setInputText(next);
        if (next === targetCommand) setCompleted(true);
      } else {
        setErrors((value) => value + 1);
        setIsPaused(true);
        playErrorSound();
        window.setTimeout(() => setIsPaused(false), 1200);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') setShiftPressed(false);
    };
    const handleBlur = () => setShiftPressed(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [inputText, nextChar, targetCommand, completed, isPaused]);

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
            <span className="screen-status">● READY</span>
          </div>
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
        </div>

        <aside className="info-panel">
          <div className="panel-heading">
            <span>SESSION</span>
            <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? 'DARK' : 'LIGHT'}
            </button>
          </div>
          <div className="stat"><span>USER</span><strong>LOCAL</strong></div>
          <div className="stat"><span>LESSON</span><strong>{currentLessonIndex + 1}/{lessons.length}</strong></div>
          <div className="stat"><span>ERRORS</span><strong>{errors}/{maxErrors}</strong></div>
          <div className="stat"><span>CHARS</span><strong>{inputText.length}/{targetCommand.length}</strong></div>
          <div className="stat"><span>PROGRESS</span><strong>{progress}%</strong></div>
          <div className="progress-track"><i style={{width: `${progress}%`}} /></div>
          <div className="layout-lamp">
            <span className={isEnglishLayout ? 'lamp on' : 'lamp'} />
            <div><small>KEYBOARD</small><strong>{isEnglishLayout ? 'EN' : 'CHECK'}</strong></div>
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
              const baseDisplay = key.startsWith('Shift') ? 'Shift' : key;
              const display = displayKeyLabel(key, shiftPressed);
              const active = nextKeys.includes(baseDisplay) || nextKeys.includes(display) || (requiresShift(nextChar) && key.startsWith('Shift'));
              const special = ['Backspace','Tab','CapsLock','Enter','Shift-Left','Shift-Right','Control','Alt','AltGr','ArrowLeft','ArrowRight'].includes(key);
              return (
                <button
                  tabIndex="-1"
                  key={`${rowIndex}-${keyIndex}-${key}`}
                  className={`key ${special ? 'key-special' : ''} ${key === 'SPACE' ? 'key-space' : ''} ${active ? 'key-active' : ''}`}
                >
                  {display}
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
