import React, { useState, useEffect } from 'react';
import HistoryMap from './components/HistoryMap';
import SearchBar from './components/SearchBar';
import Timeline from './components/Timeline';
import { Sun, Moon, X, Calendar, MapPin, ChevronRight, Swords } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function App() {
  const [events, setEvents] = useState([]);
  const [dark, setDark] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState(0);
  const [timeRange, setTimeRange] = useState([-3000, 2026]);

  useEffect(() => {
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stats`);
      setStats(res.data.total_events);
    } catch (err) { console.error(err); }
  };

  const handleSearchResults = (results) => {
    setEvents(results);
    if (results.length > 0) {
      setSelectedEvent(results[0]); 
    }
  };

  // 타임라인 슬라이더 조작 시 현재 지도에 표시된 데이터 필터링
  const filteredEvents = events.filter(e => e.year >= timeRange[0] && e.year <= timeRange[1]);

  return (
    <div className={`${dark ? 'dark bg-slate-950' : 'bg-slate-50'} h-screen w-full relative overflow-hidden font-sans transition-colors duration-500`}>
      
      {/* 1. Leaflet 기반 지도 (README 명세 준수) */}
      <div className="absolute inset-0 z-0">
        <HistoryMap 
          events={filteredEvents} 
          selectedEvent={selectedEvent} 
          dark={dark} 
          onMarkerClick={setSelectedEvent} 
        />
      </div>

      {/* 2. GNB 및 검색바 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchBar onSelect={setSelectedEvent} onResults={handleSearchResults} />
        </div>
        <button 
          onClick={() => setDark(!dark)} 
          className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-2xl border dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:scale-110 transition-all active:scale-95"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* 3. 타임라인 필터 (README 명세 준수) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-full flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Timeline range={timeRange} setRange={setTimeRange} />
        </div>
      </div>

      {/* 4. 상태 표시줄 */}
      <div className="absolute top-8 left-8 z-[1000] hidden lg:flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border dark:border-slate-800 shadow-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 tracking-tight">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
        <span>{stats.toLocaleString()}개의 역사 데이터 가동 중</span>
      </div>

      {/* 5. 교육용 상세 사이드바 (README 명세 준수) */}
      {selectedEvent && (
        <div className="absolute top-0 right-0 h-full z-[2000] w-[450px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l dark:border-slate-800 animate-in slide-in-from-right duration-700 ease-out">
          <div className="h-full flex flex-col p-10 overflow-y-auto no-scrollbar">
            <button 
              onClick={() => setSelectedEvent(null)} 
              className="self-end p-2 mb-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-black bg-red-600 text-white px-3 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5">
                <Swords size={12} /> {selectedEvent.category || "전쟁사"}
              </span>
            </div>
            
            <h2 className="text-4xl font-extrabold dark:text-white mb-6 tracking-tighter leading-[1.1]">
              {selectedEvent.title}
            </h2>

            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl">
                <Calendar size={16} /> 
                {selectedEvent.year > 0 ? `서기 ${selectedEvent.year}년` : `기원전 ${Math.abs(selectedEvent.year)}년`}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-green-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl">
                <MapPin size={16} /> 좌표 확인됨
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">사건 요약</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedEvent.summary}
                </p>
              </section>

              <section className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[24px] border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">교육적 의의</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  본 사건은 {selectedEvent.year > 0 ? '근대/현대' : '고대'} 역사학에서 중요한 위치를 차지하며, 당시의 정치적 역학 관계와 사회적 변화를 보여주는 핵심 사료입니다.
                </p>
              </section>
            </div>

            <div className="mt-auto pt-10">
              <button className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 group hover:bg-blue-700 hover:dark:bg-blue-500 transition-all active:scale-95 shadow-2xl">
                상세 정보 더 보기 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
