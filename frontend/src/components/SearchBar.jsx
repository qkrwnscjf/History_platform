import React, { useState, useEffect, useRef } from 'react';
import { Search, Map as MapIcon, History } from 'lucide-react';
import axios from 'axios';

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const res = await axios.get(`http://localhost:8000/api/search?q=${query}`);
          setResults(res.data);
          setIsOpen(true);
        } catch (err) { console.error(err); }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-[24px] shadow-2xl border dark:border-slate-700 px-6 py-4 transition-all focus-within:ring-4 ring-blue-500/10">
        <Search className="text-slate-400 mr-4" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search historical events, eras, or places..."
          className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500"
        />
        <div className="h-6 w-[1px] bg-slate-100 dark:bg-slate-700 mx-4"></div>
        <MapIcon className="text-blue-500 cursor-pointer hover:scale-110 transition" size={20} />
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-20 w-full bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border dark:border-slate-800 overflow-hidden z-[100] p-4">
          <div className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <History size={12} /> Suggestion
          </div>
          {results.map((res) => (
            <div
              key={res._id}
              onClick={() => { 
                onSelect(res); 
                setQuery(''); 
                setIsOpen(false); 
              }}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl cursor-pointer flex items-center justify-between group transition-all"
            >
              <div>
                <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                  {res.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {res.year > 0 ? `${res.year} AD` : `${Math.abs(res.year)} BC`}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ChevronRight 아이콘을 위해 추가 import 가 필요할 수 있으나 생략 (lucide-react 에 포함됨)
import { ChevronRight } from 'lucide-react';
