import React from 'react';

export const StudentIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-32' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className} select-none overflow-hidden`}>
      {/* Decorative background glow & bubbles */}
      <div className="absolute inset-0 bg-radial from-blue-100/60 to-transparent rounded-full -scale-110"></div>
      
      <svg
        viewBox="0 0 280 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain filter drop-shadow-sm"
      >
        {/* Soft floating stars & particles */}
        <circle cx="25" cy="40" r="3" fill="#FBBF24" opacity="0.8" />
        <circle cx="260" cy="50" r="4" fill="#60A5FA" opacity="0.6" />
        <circle cx="140" cy="20" r="2.5" fill="#38BDF8" opacity="0.7" />
        <path d="M 40 70 L 43 76 L 49 77 L 44 82 L 46 88 L 40 84 L 34 88 L 36 82 L 31 77 L 37 76 Z" fill="#FBBF24" opacity="0.85" />
        <path d="M 235 30 L 237 34 L 241 35 L 238 38 L 239 42 L 235 40 L 231 42 L 232 38 L 229 35 L 233 34 Z" fill="#F59E0B" opacity="0.8" />

        {/* --- BOY (Left) --- */}
        {/* Hair */}
        <path d="M 70 65 C 65 40, 95 35, 105 45 C 115 38, 130 45, 128 65 C 128 75, 120 85, 100 85 C 80 85, 70 78, 70 65 Z" fill="#1E293B" />
        {/* Face */}
        <ellipse cx="98" cy="70" rx="18" ry="19" fill="#FED7AA" />
        {/* Cheeks */}
        <circle cx="87" cy="75" r="3" fill="#FCA5A5" opacity="0.6" />
        <circle cx="109" cy="75" r="3" fill="#FCA5A5" opacity="0.6" />
        {/* Eyes (happy curved) */}
        <path d="M 88 68 Q 92 65 96 68" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 102 68 Q 106 65 110 68" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Smile */}
        <path d="M 94 77 Q 99 82 104 77" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Blue Primary School Uniform Shirt */}
        <path d="M 80 88 L 72 135 L 122 135 L 118 88 Z" fill="#1976D2" />
        {/* White Collar */}
        <polygon points="98,90 85,88 92,99" fill="#FFFFFF" />
        <polygon points="98,90 112,88 105,99" fill="#FFFFFF" />
        {/* Red Scarf tip */}
        <polygon points="98,93 94,106 102,106" fill="#DC2626" />

        {/* --- GIRL (Right) --- */}
        {/* Hair back & Pigtails */}
        <circle cx="150" cy="65" r="7" fill="#1E293B" />
        <circle cx="205" cy="65" r="7" fill="#1E293B" />
        <path d="M 148 68 C 140 85, 145 105, 142 110" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
        <path d="M 207 68 C 215 85, 210 105, 213 110" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
        {/* Bows */}
        <circle cx="147" cy="72" r="4" fill="#EF4444" />
        <circle cx="208" cy="72" r="4" fill="#EF4444" />
        {/* Face */}
        <ellipse cx="178" cy="70" rx="18" ry="19" fill="#FED7AA" />
        {/* Cheeks */}
        <circle cx="167" cy="76" r="3.5" fill="#FCA5A5" opacity="0.7" />
        <circle cx="189" cy="76" r="3.5" fill="#FCA5A5" opacity="0.7" />
        {/* Bangs */}
        <path d="M 160 56 C 165 65, 190 65, 196 56 C 190 48, 166 48, 160 56 Z" fill="#1E293B" />
        {/* Eyes (sparkling) */}
        <path d="M 168 69 Q 172 66 176 69" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 182 69 Q 186 66 190 69" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Cheerful Smile */}
        <path d="M 174 77 Q 179 83 184 77" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Uniform Dress */}
        <path d="M 162 88 L 152 135 L 206 135 L 196 88 Z" fill="#2563EB" />
        {/* Peter pan white collar */}
        <path d="M 178 90 C 168 90 166 98 172 100 C 176 98 178 93 178 90 Z" fill="#FFFFFF" />
        <path d="M 178 90 C 188 90 190 98 184 100 C 180 98 178 93 178 90 Z" fill="#FFFFFF" />

        {/* --- SHARED OPEN BOOK (Center Bottom) --- */}
        <g transform="translate(100, 115)">
          {/* Left Page */}
          <path d="M 38 12 C 22 8, 8 10, 0 16 L 3 45 C 12 39, 26 38, 38 41 Z" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
          {/* Right Page */}
          <path d="M 38 12 C 54 8, 68 10, 76 16 L 73 45 C 64 39, 50 38, 38 41 Z" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
          {/* Book Spine & Cover */}
          <path d="M -3 18 L 0 49 C 14 42, 28 42, 38 44 C 48 42, 62 42, 76 49 L 79 18" fill="none" stroke="#1D4ED8" strokeWidth="3" />
          {/* Text lines in book */}
          <line x1="8" y1="22" x2="30" y2="20" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="28" x2="28" y2="26" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="34" x2="26" y2="32" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="46" y1="20" x2="68" y2="22" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="48" y1="26" x2="68" y2="28" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="32" x2="66" y2="34" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          {/* Golden star rising from book */}
          <path d="M 38 2 L 40 7 L 45 8 L 41 12 L 42 17 L 38 14 L 34 17 L 35 12 L 31 8 L 36 7 Z" fill="#F59E0B" />
        </g>
      </svg>
    </div>
  );
};
