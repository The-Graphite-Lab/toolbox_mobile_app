'use client'

import type { CSSProperties } from 'react'

export default function LoadingScreen() {
  return (
    <div style={styles.screen}>
      <div style={styles.stage}>
        <div style={styles.card}>
          <img
            src="/images/TGL-ELI-ThumbsUp.svg"
            alt="Graphite Lab mascot"
            style={styles.image}
          />
          <div style={styles.glow} aria-hidden="true" />
          <div style={styles.highlight} aria-hidden="true" />
          <div style={styles.glint} aria-hidden="true" />
        </div>
      </div>
      <style>{`
        @keyframes eliShowcase {
          0% {
            transform: rotateX(10deg) rotateY(-18deg) translateY(0);
          }
          50% {
            transform: rotateX(12deg) rotateY(18deg) translateY(-6px);
          }
          100% {
            transform: rotateX(10deg) rotateY(-18deg) translateY(0);
          }
        }

        @keyframes eliShimmer {
          0% {
            opacity: 0.06;
            transform: translateX(-10%) rotate(-12deg);
          }
          50% {
            opacity: 0.12;
            transform: translateX(10%) rotate(-12deg);
          }
          100% {
            opacity: 0.06;
            transform: translateX(-10%) rotate(-12deg);
          }
        }

        @keyframes eliGlintSweep {
          0% {
            opacity: 0;
            transform: translateX(-140%) rotate(18deg);
          }
          35% {
            opacity: 0;
            transform: translateX(-60%) rotate(18deg);
          }
          50% {
            opacity: 0.45;
            transform: translateX(0%) rotate(18deg);
          }
          65% {
            opacity: 0.15;
            transform: translateX(70%) rotate(18deg);
          }
          100% {
            opacity: 0;
            transform: translateX(140%) rotate(18deg);
          }
        }
      `}</style>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  screen: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-bg)',
    backgroundImage: 'url(/images/TGL-WavesDots.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundSize: 'auto 100vh',
    zIndex: 1300,
    overflow: 'hidden',
  },
  stage: {
    width: '220px',
    height: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: '1000px',
  },
  card: {
    width: '200px',
    height: '200px',
    position: 'relative',
    transformStyle: 'preserve-3d',
    animation: 'eliShowcase 3.4s ease-in-out infinite',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    position: 'relative',
    zIndex: 2,
    filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.18))',
  },
  glow: {
    position: 'absolute',
    inset: '10%',
    borderRadius: '24px',
    background: 'radial-gradient(circle at 50% 40%, rgba(36, 41, 101, 0.18), transparent 65%)',
    transform: 'translateZ(-30px)',
    zIndex: 1,
  },
  highlight: {
    position: 'absolute',
    inset: '12% 14%',
    borderRadius: '28px',
    background:
      'linear-gradient(120deg, transparent 10%, rgba(255, 255, 255, 0.45) 45%, transparent 70%)',
    mixBlendMode: 'screen',
    animation: 'eliShimmer 3.4s ease-in-out infinite',
    zIndex: 3,
    pointerEvents: 'none',
  },
  glint: {
    position: 'absolute',
    inset: '8% 10%',
    borderRadius: '30px',
    background:
      'linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.85) 45%, transparent 60%)',
    mixBlendMode: 'screen',
    animation: 'eliGlintSweep 3.4s ease-in-out infinite',
    zIndex: 4,
    pointerEvents: 'none',
    filter: 'blur(0.6px)',
  },
}
