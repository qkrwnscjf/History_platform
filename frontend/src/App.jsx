import React, { useState, useEffect } from 'react';
import HistoryMap from './components/HistoryMap';
import SearchBar from './components/SearchBar';
import { Sun, Moon, Info, X, Calendar, MapPin, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function App() {
  const [events, setEvents] = useState([]);
  const [dark, setDark] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState(0);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stats`);
      setStats(res.data.total_events);
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`${dark ? 'dark bg-slate-950' : 'bg-slate-50'} h-screen w-full relative overflow-hidden font-sans transition-colors duration-500`}>
      
      {/* 1. 심플 벡터 지도 (배경) */}
      <div className="absolute inset-0 z-0">
        <HistoryMap events={events} selectedEvent={selectedEvent} dark={dark} onMarkerClick={setSelectedEvent} />
      </div>

      {/* 2. 구글/애플 스타일 중앙 플로팅 검색바 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
        <div className="relative group">
          <SearchBar onSelect={(ev) => setSelectedEvent(ev)} />
          {/* 다크모드 스위치 (검색바 우측에 작게 배치) */}
          <button 
            onClick={() => setDark(!dark)} 
            className="absolute -right-14 top-1 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:scale-110 transition-all"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* 3. 하단 상태 표시 (애플 감성) */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-2xl border dark:border-slate-800 shadow-sm text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        {stats} Events Loaded
      </div>

      {/* 4. 플로팅 정보 카드 (선택 시 나타남) */}
      {selectedEvent && (
        <div className="absolute bottom-10 right-10 z-40 w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] border dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-500 scale-in">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                {selectedEvent.category || "History"}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-300 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold dark:text-white mb-4 tracking-tight leading-tight">
              {selectedEvent.title}
            </h2>

            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <Calendar size={14} /> {selectedEvent.year > 0 ? `${selectedEvent.year} AD` : `${Math.abs(selectedEvent.year)} BC`}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <MapPin size={14} /> Location Ready
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 line-clamp-4">
              {selectedEvent.summary}
            </p>

            <button className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group hover:bg-blue-600 transition-all active:scale-95">
              Learn More <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
