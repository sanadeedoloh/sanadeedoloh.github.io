import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  Calendar as CalendarIcon,
  X,
  Edit2,
  Check,
  Plus,
  Filter,
  Users,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';
import { useEvents } from '../context/EventContext';

const TECH_OPTIONS = ["Dee", "Geng", "Jay", "K", "Oat", "PK", "Freelance"];

export const CalendarPage: React.FC = () => {
  const { events, addEvent, updateEvent } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1));
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [viewMode, setViewMode] = useState('event');
  const [selectedTech, setSelectedTech] = useState('All');

  const techList = useMemo(() => ['All', ...TECH_OPTIONS], []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const getFilteredEventsForDay = (day: number) => {
    let dayEvents = events.filter(e => e.day === day && e.month === currentMonth.getMonth());

    if (viewMode === 'tech' && selectedTech !== 'All') {
      dayEvents = dayEvents.filter(e =>
        e['Tech 1'] === selectedTech ||
        e['Tech 2'] === selectedTech ||
        e['Tech 3'] === selectedTech
      );
    }
    return dayEvents.sort((a, b) => a['Live Time'].localeCompare(b['Live Time']));
  };

  const assetColor = (asset: string) => {
    switch(asset?.trim()) {
      case 'SLD': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SBD HP#1': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SBD HP#2': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SBD HP#2 (Upsize)': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Payday': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'D-Day': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Mid-Month': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'MC x Celeb': return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Barter Tier 1': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const assetDotColor = (asset: string) => {
    switch(asset?.trim()) {
      case 'SLD': return 'bg-blue-500';
      case 'SBD HP#1': return 'bg-purple-500';
      case 'SBD HP#2': return 'bg-purple-500';
      case 'SBD HP#2 (Upsize)': return 'bg-purple-500';
      case 'Payday': return 'bg-emerald-500';
      case 'D-Day': return 'bg-rose-500';
      case 'Mid-Month': return 'bg-cyan-500';
      case 'MC x Celeb': return 'bg-amber-500';
      case 'Barter Tier 1': return 'bg-pink-500';
      default: return 'bg-slate-400';
    }
  };

  const toggleTechInForm = (techName: string) => {
    const currentTechs = [editForm['Tech 1'], editForm['Tech 2'], editForm['Tech 3']].filter(Boolean);

    if (currentTechs.includes(techName)) {
      const filtered = currentTechs.filter(t => t !== techName);
      setEditForm({
        ...editForm,
        'Tech 1': filtered[0] || '',
        'Tech 2': filtered[1] || '',
        'Tech 3': filtered[2] || ''
      });
    } else {
      if (currentTechs.length < 3) {
        const newList = [...currentTechs, techName];
        setEditForm({
          ...editForm,
          'Tech 1': newList[0] || '',
          'Tech 2': newList[1] || '',
          'Tech 3': newList[2] || ''
        });
      }
    }
  };

  const startAddEvent = (day: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[currentMonth.getMonth()];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = daysOfWeek[new Date(2026, currentMonth.getMonth(), day).getDay()];

    setEditForm({
      id: `new-${Date.now()}`,
      Asset: 'SLD',
      'Live Date': `${dayName}-${day}-${monthStr}`,
      'Live Time': '12:00',
      'End Time': '14:00',
      'KOL name': '',
      'Studio': 'Studio 1',
      'Tech 1': selectedTech !== 'All' ? selectedTech : '',
      'Tech 2': '',
      'Tech 3': '',
      'Note': '',
      day: day,
      month: currentMonth.getMonth(),
      year: 2026
    });
    setIsAdding(true);
    setIsEditing(true);
    setSelectedEvent({ id: 'dummy' });
  };

  const startEdit = (event: any) => {
    setEditForm({ ...event });
    setIsAdding(false);
    setIsEditing(true);
  };

  const saveForm = () => {
    if (isAdding) {
      addEvent(editForm);
    } else {
      updateEvent(editForm.id, editForm);
    }
    setSelectedEvent(editForm);
    setIsEditing(false);
    setIsAdding(false);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setIsAdding(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <CalendarIcon size={28} />
              </div>
              Tech Manpower
            </h1>
            <p className="text-slate-500 mt-2 ml-1 font-bold italic flex items-center gap-2">
                {viewMode === 'event' ? (
                    <><LayoutGrid size={16} className="text-indigo-400" /> มุมมองผังงานรวม</>
                ) : (
                    <><Users size={16} className="text-indigo-400" /> คิวงานรายบุคคล: <span className="text-indigo-600 not-italic">{selectedTech === 'All' ? 'ทุกคน' : selectedTech}</span></>
                )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
              <button
                onClick={() => setViewMode('event')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'event' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={14} /> ผังรวม
              </button>
              <button
                onClick={() => setViewMode('tech')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'tech' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Users size={14} /> รายบุคคล
              </button>
            </div>

            <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
              <div className="pl-3 pr-2 text-slate-400"><Filter size={16} strokeWidth={3} /></div>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-black text-slate-700 pr-4 py-2 cursor-pointer"
              >
                {techList.map(tech => (
                  <option key={tech} value={tech}>{tech === 'All' ? 'กรองทุกคน' : `กรอง: ${tech}`}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
              <div className="px-4 py-1 font-black text-sm min-w-[140px] text-center text-slate-700 uppercase">
                {currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-200">
            {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map((day) => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = day ? getFilteredEventsForDay(day) : [];
              const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();

              return (
                <div key={idx} className={`group min-h-[250px] border-b border-r border-slate-100 p-2 transition-all hover:bg-indigo-50/20 ${!day ? 'bg-slate-50/30' : ''} relative`}>
                  {day && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-300 group-hover:text-slate-500'}`}>{day}</span>
                        <button
                          onClick={() => startAddEvent(day)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>

                      {viewMode === 'tech' ? (
                        <div className="grid grid-cols-2 gap-2 pr-1">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              onClick={() => { setSelectedEvent(event); setIsEditing(false); setIsAdding(false); }}
                              className={`aspect-square rounded-xl border-2 cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-between text-center p-2 relative overflow-hidden group/card shadow-sm ${assetColor(event.Asset)}`}
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 ${assetDotColor(event.Asset)}`}></div>
                                <div className="mt-1">
                                    <span className="text-[12px] font-black leading-tight block text-slate-900">{event['Live Time']}</span>
                                </div>
                                <div className="w-full">
                                    <div className="flex flex-col gap-0.5 items-center">
                                        {[event['Tech 1'], event['Tech 2'], event['Tech 3']].filter(Boolean).map((t, i) => (
                                            <span key={i} className="text-[9px] font-black bg-white/60 px-1.5 rounded text-indigo-700 truncate w-full max-w-[55px] border border-indigo-100/30">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-0.5">
                                    <span className="text-[7px] font-bold opacity-60 line-clamp-1 italic">{event['KOL name'] || '-'}</span>
                                </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2 overflow-y-auto max-h-[190px] pr-1 scroll-thin pb-4">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              onClick={() => { setSelectedEvent(event); setIsEditing(false); setIsAdding(false); }}
                              className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${assetColor(event.Asset)}`}
                            >
                              <div className="flex justify-between items-start gap-1 mb-1.5">
                                  <span className="text-[9px] font-black opacity-60 bg-white/40 px-1 rounded tracking-tighter">{event['Live Time']}</span>
                                  <span className="text-[10px] font-black truncate max-w-[70%]">{event['KOL name'] || 'Event'}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-black/5">
                                  {[event['Tech 1'], event['Tech 2'], event['Tech 3']].filter(Boolean).map((tech, i) => (
                                      <span key={i} className="bg-white/70 text-slate-600 border border-black/5 px-1.5 py-0.5 rounded text-[8px] font-black">
                                          {tech}
                                      </span>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-3 text-[11px] font-black text-slate-500">
            <span className="text-slate-300 mr-2 uppercase tracking-widest">สถานะ:</span>
            {['SLD', 'SBD HP#1', 'SBD HP#2', 'Payday', 'D-Day', 'Mid-Month', 'MC x Celeb', 'Barter Tier 1'].map(type => (
              <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-50 bg-slate-50/50">
                <div className={`w-2.5 h-2.5 rounded-full ${assetDotColor(type)}`}></div>
                <span className="text-[10px]">{type}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-bold text-slate-400">
             {viewMode === 'tech' ? '💡 เน้นเวลาและรายชื่อทีมที่ทำงานร่วมกัน' : '💡 คลิกที่คิวงานเพื่อดูรายละเอียดหรือแก้ไข'}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className={`p-8 ${assetColor(isEditing ? editForm.Asset : selectedEvent.Asset).split(' ')[0]} border-b border-black/5 relative`}>
              <button onClick={closeModal} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"><X size={20} /></button>
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  {isEditing ? (
                    <select
                      value={editForm.Asset}
                      onChange={(e) => setEditForm({...editForm, Asset: e.target.value})}
                      className="bg-white/50 border-none rounded-xl px-3 py-1.5 text-[10px] font-black outline-none shadow-sm"
                    >
                        {['SLD', 'SBD HP#1', 'SBD HP#2', 'SBD HP#2 (Upsize)', 'Payday', 'D-Day', 'Mid-Month', 'MC x Celeb', 'Barter Tier 1'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    ) : (
                    <span className="px-4 py-1.5 bg-white/40 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{selectedEvent.Asset}</span>
                    )}
                    {isAdding && <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">New Assignment</span>}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    placeholder="ใส่ชื่อ KOL หรือชื่องาน..."
                    value={editForm['KOL name']}
                    onChange={(e) => setEditForm({...editForm, 'KOL name': e.target.value})}
                    className="text-3xl font-black mt-3 bg-white/40 border-none rounded-2xl w-full outline-none px-4 py-2 placeholder-black/20 shadow-inner"
                  />
                ) : (
                  <h2 className="text-3xl font-black mt-4 leading-tight text-slate-800">{selectedEvent['KOL name'] || 'Untitled Event'}</h2>
                )}
              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto scroll-thin">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-500 mb-2 font-black text-[10px] uppercase tracking-widest"><Clock size={16} strokeWidth={3} /> START</div>
                  {isEditing ? (
                    <input type="text" value={editForm['Live Time']} onChange={(e) => setEditForm({...editForm, 'Live Time': e.target.value})} className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-black w-full" />
                  ) : (
                    <div className="text-lg font-black text-slate-700">{selectedEvent['Live Time']}</div>
                  )}
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 text-rose-500 mb-2 font-black text-[10px] uppercase tracking-widest"><Clock size={16} strokeWidth={3} /> END</div>
                  {isEditing ? (
                    <input type="text" value={editForm['End Time']} onChange={(e) => setEditForm({...editForm, 'End Time': e.target.value})} className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-black w-full" />
                  ) : (
                    <div className="text-lg font-black text-slate-700">{selectedEvent['End Time']}</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 text-amber-500 mb-3 font-black text-[10px] uppercase tracking-widest"><Video size={18} strokeWidth={3} /> STUDIO</div>
                {isEditing ? (
                  <input type="text" value={editForm['Studio']} onChange={(e) => setEditForm({...editForm, 'Studio': e.target.value})} className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-black w-full" />
                ) : (
                  <div className="text-lg font-black text-slate-700">{selectedEvent['Studio'] || '-'}</div>
                )}
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-slate-400 mb-5 uppercase tracking-widest text-[10px] font-black flex items-center gap-2"><User size={16} strokeWidth={3} /> TECHNICAL TEAM</div>

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    {TECH_OPTIONS.map(tech => {
                      const isSelected = [editForm['Tech 1'], editForm['Tech 2'], editForm['Tech 3']].includes(tech);
                      const currentCount = [editForm['Tech 1'], editForm['Tech 2'], editForm['Tech 3']].filter(Boolean).length;
                      const isDisabled = !isSelected && currentCount >= 3;

                      return (
                        <button
                          key={tech}
                          disabled={isDisabled}
                          onClick={() => toggleTechInForm(tech)}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                              : isDisabled
                                ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {tech}
                          {isSelected && <CheckCircle2 size={14} />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[selectedEvent['Tech 1'], selectedEvent['Tech 2'], selectedEvent['Tech 3']].filter(Boolean).length > 0 ? (
                        [selectedEvent['Tech 1'], selectedEvent['Tech 2'], selectedEvent['Tech 3']].filter(Boolean).map((t, i) => (
                          <div key={i} className="px-4 py-2.5 bg-white text-indigo-600 border border-indigo-100 rounded-2xl text-xs font-black shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {t}
                          </div>
                        ))
                    ) : (
                        <div className="text-slate-300 italic text-xs font-bold px-1">ยังไม่มีการระบุทีม</div>
                    )}
                  </div>
                )}
                {isEditing && <p className="text-[9px] text-slate-400 mt-4 font-bold text-center italic">* เลือกทีมได้สูงสุด 3 ท่าน</p>}
              </div>
            </div>

            <div className="p-8 pt-2 flex gap-4 bg-white">
              {isEditing ? (
                <>
                  <button onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-sm font-black transition-all hover:bg-slate-200">CANCEL</button>
                  <button onClick={saveForm} className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all transform active:scale-95">
                    <Check size={20} strokeWidth={3} /> CONFIRM
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(selectedEvent)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:bg-slate-200">
                    <Edit2 size={18} strokeWidth={3} /> EDIT
                  </button>
                  <button onClick={closeModal} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all active:scale-95 shadow-xl">CLOSE</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scroll-thin::-webkit-scrollbar { width: 4px; }
        .scroll-thin::-webkit-scrollbar-track { background: transparent; }
        .scroll-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .scroll-thin::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.95); } to { transform: scale(1); } }
        .animate-in { animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};
