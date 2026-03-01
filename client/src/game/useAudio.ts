import { useEffect, useRef, useState } from 'react';

const SOUNDS = {
  select: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  move: 'https://assets.mixkit.co/active_storage/sfx/2568/2571-preview.mp3', // Reusing similar for move
  attack: 'https://assets.mixkit.co/active_storage/sfx/1100/1100-preview.mp3',
  victory: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  defeat: 'https://assets.mixkit.co/active_storage/sfx/253/253-preview.mp3',
  siege: 'https://assets.mixkit.co/active_storage/sfx/150/150-preview.mp3',
};

const BGM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3'; // Epic-ish placeholder

export const useAudio = () => {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgmRef.current = new Audio(BGM_URL);
    bgmRef.current.loop = true;
    bgmRef.current.volume = volume;
    
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playSound = (soundName: keyof typeof SOUNDS) => {
    if (isMuted) return;
    const audio = new Audio(SOUNDS[soundName]);
    audio.volume = volume;
    audio.play().catch(e => console.log("Audio play blocked by browser policy"));
  };

  const startMusic = () => {
    if (bgmRef.current && bgmRef.current.paused) {
      bgmRef.current.play().catch(e => console.log("BGM play blocked by browser policy"));
    }
  };

  return {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playSound,
    startMusic
  };
};
