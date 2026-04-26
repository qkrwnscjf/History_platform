import React from 'react';

export default function Timeline({ range, setRange }) {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-20 border dark:border-slate-800">
      <div className="flex justify-between mb-4 text-xs font-bold text-slate-500">
        <span>3000 BC</span>
        <span className="text-blue-500 text-sm">Selected Range: {range[0]} ~ {range[1]}</span>
        <span>2026 AD</span>
      </div>
      <input
        type="range"
        min="-3000"
        max="2026"
        value={range[1]}
        onChange={(e) => setRange([range[0], parseInt(e.target.value)])}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="mt-2 flex justify-between px-2 overflow-x-auto gap-4 py-2 no-scrollbar">
        {['Ancient', 'Medieval', 'Early Modern', 'Modern', 'Contemporary'].map(era => (
          <span key={era} className="text-[10px] uppercase tracking-widest text-slate-400 whitespace-nowrap">{era}</span>
        ))}
      </div>
    </div>
  );
}
