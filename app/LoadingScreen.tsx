'use client'

import { cn } from '@/app/lib/utils'

type LoadingScreenProps = {
  variant?: 'fullscreen' | 'inline'
}

export default function LoadingScreen({ variant = 'fullscreen' }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-color-bg bg-[url(\'/images/TGL-WavesDots.svg\')] bg-no-repeat bg-top bg-cover overflow-hidden',
        variant === 'inline'
          ? 'absolute inset-0 w-full h-full z-[5]'
          : 'fixed inset-0 w-full h-dvh z-[1300]'
      )}
    >
      <div className="w-[220px] h-[220px] flex items-center justify-center [perspective:1000px]">
        <div className="w-[200px] h-[200px] relative [transform-style:preserve-3d] [animation:eliShowcase_3.4s_ease-in-out_infinite]">
          <img
            src="/images/TGL-ELI-ThumbsUp.svg"
            alt="Graphite Lab mascot"
            className="w-full h-full object-contain block relative z-[2] [filter:drop-shadow(0_20px_30px_rgba(0,0,0,0.18))]"
          />
          <div
            aria-hidden="true"
            className="absolute [inset:10%] rounded-3xl bg-[radial-gradient(circle_at_50%_40%,rgba(36,41,101,0.18),transparent_65%)] [transform:translateZ(-30px)] z-[1]"
          />
          <div
            aria-hidden="true"
            className="absolute [inset:12%_14%] rounded-[28px] bg-[linear-gradient(120deg,transparent_10%,rgba(255,255,255,0.45)_45%,transparent_70%)] mix-blend-screen [animation:eliShimmer_3.4s_ease-in-out_infinite] z-[3] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute [inset:12%_16%] rounded-[26px] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.55)_32%,rgba(255,255,255,0.16)_48%,transparent_64%)] mix-blend-screen [animation:eliGlintSweep_3.4s_ease-in-out_infinite] z-[4] pointer-events-none blur-[1.4px]"
          />
        </div>
      </div>
      <style>{`
        @keyframes eliShowcase {
          0%   { transform: rotateX(10deg) rotateY(-18deg) translateY(0); }
          50%  { transform: rotateX(12deg) rotateY(18deg) translateY(-6px); }
          100% { transform: rotateX(10deg) rotateY(-18deg) translateY(0); }
        }
        @keyframes eliShimmer {
          0%   { opacity: 0.06; transform: translateX(-10%) rotate(-12deg); }
          50%  { opacity: 0.12; transform: translateX(10%) rotate(-12deg); }
          100% { opacity: 0.06; transform: translateX(-10%) rotate(-12deg); }
        }
        @keyframes eliGlintSweep {
          0%   { opacity: 0;    transform: translateX(-120%) translateY(4%)  rotate(12deg) scaleY(0.92); }
          38%  { opacity: 0;    transform: translateX(-70%)  translateY(2%)  rotate(12deg) scaleY(0.92); }
          52%  { opacity: 0.22; transform: translateX(-5%)   translateY(0%)  rotate(12deg) scaleY(0.96); }
          70%  { opacity: 0.08; transform: translateX(65%)   translateY(-1%) rotate(12deg) scaleY(0.96); }
          100% { opacity: 0;    transform: translateX(120%)  translateY(-2%) rotate(12deg) scaleY(0.92); }
        }
      `}</style>
    </div>
  )
}
