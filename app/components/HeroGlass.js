export default function HeroGlass({ size = 180 }) {
  return (
    <svg viewBox="0 0 220 260" width={size} height={size * (260 / 220)} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* stream being poured */}
      <path d="M118 0 C116 30, 120 50, 118 66" stroke="var(--amber)" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

      {/* glass */}
      <path
        d="M58 70 H162 L150 224 C148 240 136 250 122 250 H98 C84 250 72 240 70 224 L58 70Z"
        fill="rgba(243,236,216,0.35)"
        stroke="var(--pine)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* beer liquid */}
      <path
        d="M65 108 H155 L149 222 C147 236 137 245 124 245 H96 C83 245 73 236 71 222 L65 108Z"
        fill="var(--amber)"
      />

      {/* foam on top of liquid */}
      <path
        d="M62 92 C68 84 78 90 84 84 C90 78 100 88 108 82 C116 76 124 88 132 82 C140 76 150 86 156 92 C158 100 154 112 146 112 H72 C64 112 60 100 62 92Z"
        fill="var(--paper)"
      />
      <circle cx="76" cy="96" r="3" fill="var(--paper-warm)" />
      <circle cx="98" cy="90" r="2.5" fill="var(--paper-warm)" />
      <circle cx="122" cy="94" r="3" fill="var(--paper-warm)" />
      <circle cx="140" cy="98" r="2" fill="var(--paper-warm)" />

      {/* foam overflow drips */}
      <path d="M60 92 C56 98 56 108 62 112" stroke="var(--paper)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M158 92 C163 98 162 106 156 110" stroke="var(--paper)" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* handle */}
      <path d="M162 100 C186 100 186 160 162 160" stroke="var(--pine)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
