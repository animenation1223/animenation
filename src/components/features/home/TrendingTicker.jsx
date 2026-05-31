import React from 'react';
import { Flame } from 'lucide-react';

const ITEMS = [
  '🔥 Gojo Satoru Oversized Tee',
  '⚡ Levi Attack Hoodie — SELLING FAST',
  '🌟 Luffy Gear 5 Figure — LIMITED STOCK',
  '👹 Demon Slayer Manga Box Set',
  '💥 Chainsaw Man Pochita Keychain',
  '🎯 Sukuna Domain Expansion Tee — NEW DROP',
  '🏴‍☠️ One Piece Merch — BACK IN STOCK',
  '⚔️ Bleach TYBW Mouse Pad',
  '🎌 Tokyo Revengers Mikey Tee',
  '✨ Spy x Family Sticker Pack',
];

export default function TrendingTicker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="relative overflow-hidden bg-primary/5 border-y border-primary/10 py-2.5">
      <div className="flex items-center gap-3 absolute left-0 z-10 px-4 h-full bg-gradient-to-r from-background via-background/90 to-transparent w-32">
        <Flame className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs font-syne font-bold text-primary uppercase tracking-wider whitespace-nowrap">Trending</span>
      </div>

      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap pl-32">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs text-muted-foreground font-medium mx-6 flex-shrink-0">
            {item}
            <span className="text-primary/40 mx-4">•</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}