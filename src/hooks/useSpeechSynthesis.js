import { useEffect, useState } from 'react';

export function useVoices() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  return voices;
}

export function speak(text, { voiceName = '', rate = 1, pitch = 1 }) {
  if (!text) return;
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.name === voiceName) || voices.find((v) => v.lang.startsWith('es')) || voices[0];
  const utt = new SpeechSynthesisUtterance(text);
  utt.voice = voice;
  utt.rate = rate;
  utt.pitch = pitch;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
} 