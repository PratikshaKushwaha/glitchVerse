import { useEffect, useState } from 'react';
import futureSelfPixelImg from '../../assets/future_self_pixel_transparent.png';
import futureSelfAvatarImg from '../../assets/future_self_pixel_avatar.png';

export default function FutureSelfSprite({
  expression = 'serious',
  isSpeaking = false,
  isDissolving = false,
  isAvatar = false,
  className = ''
}) {
  const [breathe, setBreathe] = useState(0);
  const [glitchOffset, setGlitchOffset] = useState(0);

  // Idle floating / breathing motion
  useEffect(() => {
    let frame;
    let start = performance.now();
    const loop = (now) => {
      const elapsed = (now - start) / 1000;
      setBreathe(Math.sin(elapsed * 2.0) * 2.0);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Micro-glitch jitter for holographic manifestation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.4) {
        setGlitchOffset((Math.random() - 0.5) * 5);
        setTimeout(() => setGlitchOffset(0), 100);
      }
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Expression-dependent gestures
  let headTilt = 0;
  let scaleY = 1;

  if (expression === 'knowing') {
    headTilt = 1.5;
  } else if (expression === 'determined') {
    headTilt = 0.5;
    scaleY = 1.02;
  } else if (expression === 'grave') {
    headTilt = -1.5;
  } else if (expression === 'urgent') {
    headTilt = 2.0;
    scaleY = 1.03;
  } else if (expression === 'hopeful') {
    headTilt = -1.0;
  }

  if (isAvatar) {
    return (
      <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={futureSelfAvatarImg}
          alt="Future Self Avatar"
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300"
          style={{
            imageRendering: 'pixelated',
            transform: `scale(1.15) rotate(${headTilt}deg)`,
            transformOrigin: '50% 60%',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center select-none pointer-events-none ${className} ${
        isDissolving ? 'opacity-0 scale-95 blur-sm transition-all duration-[2400ms]' : ''
      }`}
      style={{
        transform: `translateY(${breathe}px) translateX(${glitchOffset}px) rotate(${headTilt}deg) scaleY(${scaleY})`,
        transformOrigin: '50% 90%',
        transition: 'transform 0.4s ease-out',
      }}
    >
      <img
        src={futureSelfPixelImg}
        alt="Holographic Future Self (Lead Developer // 2042 Reality Engine)"
        className="w-auto h-[48vh] sm:h-[56vh] md:h-[62vh] max-h-[580px] object-contain select-none pointer-events-none transition-all duration-500"
        style={{
          imageRendering: 'pixelated',
          filter: isSpeaking
            ? 'drop-shadow(0 0 25px rgba(56,189,248,0.95)) drop-shadow(0 0 50px rgba(14,165,233,0.7)) brightness(1.12)'
            : 'drop-shadow(0 0 15px rgba(56,189,248,0.6)) brightness(1.02)',
        }}
      />
    </div>
  );
}
