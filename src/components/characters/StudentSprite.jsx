import { useEffect, useState } from 'react';
import studentPixelImg from '../../assets/student_pixel_transparent.png';
import studentAvatarImg from '../../assets/student_pixel_avatar.png';

export default function StudentSprite({
  expression = 'neutral',
  isSpeaking = false,
  isAvatar = false,
  className = ''
}) {
  const [breathe, setBreathe] = useState(0);

  // Subtle breathing idle animation
  useEffect(() => {
    let frame;
    let start = performance.now();
    const loop = (now) => {
      const elapsed = (now - start) / 1000;
      setBreathe(Math.sin(elapsed * 2.2) * 1.5);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Expression-dependent subtle gestures & tilts
  let headTilt = 0;
  let scaleY = 1;

  if (expression === 'curious' || expression === 'neutral') {
    headTilt = -1.5;
  } else if (expression === 'confused') {
    headTilt = -3.5;
  } else if (expression === 'shocked') {
    headTilt = 2;
    scaleY = 1.04;
  } else if (expression === 'worried') {
    headTilt = -2;
  } else if (expression === 'concerned') {
    headTilt = 1.5;
  }

  if (isAvatar) {
    return (
      <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={studentAvatarImg}
          alt="Student Avatar"
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
      className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}
      style={{
        transform: `translateY(${breathe}px) rotate(${headTilt}deg) scaleY(${scaleY})`,
        transformOrigin: '50% 90%',
        transition: 'transform 0.5s ease-out',
      }}
    >
      <img
        src={studentPixelImg}
        alt="Student Present Self (Callsign Seeker)"
        className="w-auto h-[48vh] sm:h-[56vh] md:h-[62vh] max-h-[580px] object-contain drop-shadow-2xl select-none pointer-events-none"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
