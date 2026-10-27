// Web Audio API Synthesized Sound Effects
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTapSound(isMuted = false): void {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
    if (navigator.vibrate) navigator.vibrate(8);
  } catch {}
}

export function playFlipSound(isMuted = false): void {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
    if (navigator.vibrate) navigator.vibrate(12);
  } catch {}
}

export function playChimeSound(isMuted = false): void {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 880.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.23);
    });
    if (navigator.vibrate) navigator.vibrate([15, 30, 20]);
  } catch {}
}

export function playCorrectSound(isMuted = false): void {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.1, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.26);
    });
  } catch {}
}

export function playErrorSound(isMuted = false): void {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  } catch {}
}

export function speakText(
  text: string,
  rate = 0.9,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
  } catch {}

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const engVoice = voices.find(
    (v) =>
      (v.lang === 'en-US' || v.lang === 'en-GB') &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
  );
  if (engVoice) u.voice = engVoice;

  u.onstart = () => {
    if (onStart) onStart();
  };
  u.onend = () => {
    if (onEnd) onEnd();
  };
  u.onerror = () => {
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(u);
  } catch {}
}

export function getWordTypeBadgeClass(typeStr: string): string {
  const t = (typeStr || '').trim().toLowerCase();
  if (t === 'n' || t.startsWith('noun')) return 'badge-pos-noun';
  if (t === 'v' || t.startsWith('verb')) return 'badge-pos-verb';
  if (t === 'adj' || t.startsWith('adj')) return 'badge-pos-adj';
  if (t === 'adv' || t.startsWith('adv')) return 'badge-pos-adv';
  if (t === 'phrase' || t === 'phr' || t.startsWith('phras')) return 'badge-pos-phrase';
  if (t === 'idiom') return 'badge-pos-idiom';
  return 'badge-pos-default';
}

export function getWordTypeLabel(typeStr: string): string {
  const t = (typeStr || '').trim().toLowerCase();
  if (t === 'n') return 'noun';
  if (t === 'v') return 'verb';
  if (t === 'adj') return 'adj';
  if (t === 'adv') return 'adv';
  return typeStr || 'vocab';
}
