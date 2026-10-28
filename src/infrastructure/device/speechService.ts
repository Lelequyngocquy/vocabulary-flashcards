export function cancelSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
}

export function resumeSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
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
    resumeSpeech();
    cancelSpeech();
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
