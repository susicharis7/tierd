/**
 * Subtle, low-opacity SVG background motifs for page identity.
 * Each variant renders a large decorative vector behind page content.
 */

const ChallengesMotif = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
    <svg
      className="absolute -top-20 -right-32 w-[700px] h-[700px] opacity-[0.035]"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trophy */}
      <path
        d="M176 64h160v32h48c0 53-34 99-80 115v37h48v32H160v-32h48v-37C162 195 128 149 128 96h48V64z"
        stroke="hsl(var(--ember))"
        strokeWidth="3"
        fill="none"
      />
      <rect x="192" y="280" width="128" height="16" rx="4" stroke="hsl(var(--ember))" strokeWidth="2.5" />
      <rect x="176" y="304" width="160" height="12" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
      {/* Laurel left */}
      <path
        d="M120 320c-20-40-30-90-20-140 15 45 35 85 60 115"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M105 310c-15-30-22-70-15-110 12 35 28 68 48 92"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Laurel right */}
      <path
        d="M392 320c20-40 30-90 20-140-15 45-35 85-60 115"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M407 310c15-30 22-70 15-110-12 35-28 68-48 92"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Stars */}
      <circle cx="256" cy="48" r="6" stroke="hsl(var(--ember))" strokeWidth="1.5" />
      <circle cx="220" cy="56" r="3" stroke="hsl(var(--ember))" strokeWidth="1" />
      <circle cx="292" cy="56" r="3" stroke="hsl(var(--ember))" strokeWidth="1" />
    </svg>

    {/* Bottom-left secondary motif */}
    <svg
      className="absolute -bottom-24 -left-20 w-[500px] h-[500px] opacity-[0.02] rotate-12"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M256 60l60 120 132 20-96 93 23 131-119-63-119 63 23-131-96-93 132-20z"
        stroke="hsl(var(--ember))"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  </div>
);

const LeaderboardMotif = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
    <svg
      className="absolute -top-16 -right-24 w-[650px] h-[650px] opacity-[0.035]"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown */}
      <path
        d="M128 220l40-80 48 50 40-70 40 70 48-50 40 80H128z"
        stroke="hsl(var(--ember))"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      <rect x="120" y="220" width="272" height="24" rx="4" stroke="hsl(var(--ember))" strokeWidth="2.5" />
      {/* Crown jewels */}
      <circle cx="256" cy="148" r="6" stroke="hsl(var(--ember-glow))" strokeWidth="1.5" />
      <circle cx="208" cy="172" r="4" stroke="hsl(var(--ember-glow))" strokeWidth="1" />
      <circle cx="304" cy="172" r="4" stroke="hsl(var(--ember-glow))" strokeWidth="1" />
      {/* Podium bars */}
      <rect x="170" y="290" width="60" height="120" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
      <rect x="226" y="260" width="60" height="150" rx="4" stroke="hsl(var(--ember))" strokeWidth="2.5" />
      <rect x="282" y="310" width="60" height="100" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
      {/* Rank numbers */}
      <text x="248" y="300" fill="hsl(var(--ember))" fontSize="20" fontWeight="bold" fontFamily="sans-serif">1</text>
      <text x="194" y="330" fill="hsl(var(--ember))" fontSize="16" fontWeight="bold" fontFamily="sans-serif">2</text>
      <text x="306" y="345" fill="hsl(var(--ember))" fontSize="16" fontWeight="bold" fontFamily="sans-serif">3</text>
      {/* Upward arrows */}
      <path d="M420 380l-20-40-20 40" stroke="hsl(var(--ember-glow))" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M420 360l-20-40-20 40" stroke="hsl(var(--ember-glow))" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>

    <svg
      className="absolute -bottom-20 -left-16 w-[400px] h-[400px] opacity-[0.02] -rotate-6"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ascending bars chart */}
      <rect x="80" y="350" width="50" height="80" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
      <rect x="150" y="300" width="50" height="130" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
      <rect x="220" y="250" width="50" height="180" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
      <rect x="290" y="190" width="50" height="240" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
      <rect x="360" y="120" width="50" height="310" rx="4" stroke="hsl(var(--ember))" strokeWidth="2" />
    </svg>
  </div>
);

const ProfileMotif = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
    <svg
      className="absolute -top-12 -right-28 w-[600px] h-[600px] opacity-[0.035]"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield */}
      <path
        d="M256 80l140 60v120c0 80-56 150-140 180-84-30-140-100-140-180V140l140-60z"
        stroke="hsl(var(--ember))"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M256 120l100 44v88c0 58-40 108-100 130-60-22-100-72-100-130v-88l100-44z"
        stroke="hsl(var(--ember))"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      {/* Badge / checkmark inside shield */}
      <path
        d="M224 256l24 24 40-48"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Progression dots along the shield */}
      <circle cx="256" cy="160" r="4" stroke="hsl(var(--ember-glow))" strokeWidth="1.5" />
      <circle cx="256" cy="190" r="3" stroke="hsl(var(--ember-glow))" strokeWidth="1" opacity="0.6" />
    </svg>

    <svg
      className="absolute -bottom-16 -left-20 w-[450px] h-[450px] opacity-[0.02] rotate-6"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagonal badge */}
      <path
        d="M256 80l120 70v140l-120 70-120-70V150l120-70z"
        stroke="hsl(var(--ember))"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M256 130l80 46v92l-80 46-80-46v-92l80-46z"
        stroke="hsl(var(--ember))"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      {/* Star center */}
      <path
        d="M256 200l12 24 26 4-19 18 4 26-23-12-23 12 4-26-19-18 26-4z"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  </div>
);

const VerificationMotif = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
    <svg
      className="absolute -top-16 -right-28 w-[650px] h-[650px] opacity-[0.035]"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield with checkmark */}
      <path
        d="M256 60l150 65v130c0 85-60 160-150 195-90-35-150-110-150-195V125l150-65z"
        stroke="hsl(var(--ember))"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M210 260l36 36 60-72"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Scan lines */}
      <line x1="160" y1="180" x2="352" y2="180" stroke="hsl(var(--ember))" strokeWidth="1" opacity="0.3" />
      <line x1="170" y1="210" x2="342" y2="210" stroke="hsl(var(--ember))" strokeWidth="1" opacity="0.2" />
      <line x1="180" y1="320" x2="332" y2="320" stroke="hsl(var(--ember))" strokeWidth="1" opacity="0.2" />
      {/* Radar dots */}
      <circle cx="256" cy="150" r="5" stroke="hsl(var(--ember-glow))" strokeWidth="1.5" />
      <circle cx="200" cy="340" r="3" stroke="hsl(var(--ember))" strokeWidth="1" opacity="0.5" />
      <circle cx="312" cy="340" r="3" stroke="hsl(var(--ember))" strokeWidth="1" opacity="0.5" />
    </svg>

    <svg
      className="absolute -bottom-20 -left-16 w-[450px] h-[450px] opacity-[0.02] rotate-12"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Badge / seal */}
      <circle cx="256" cy="256" r="120" stroke="hsl(var(--ember))" strokeWidth="2.5" fill="none" />
      <circle cx="256" cy="256" r="90" stroke="hsl(var(--ember))" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path
        d="M256 170l18 36 40 6-29 28 7 40-36-19-36 19 7-40-29-28 40-6z"
        stroke="hsl(var(--ember-glow))"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  </div>
);

export { ChallengesMotif, LeaderboardMotif, ProfileMotif, VerificationMotif };
