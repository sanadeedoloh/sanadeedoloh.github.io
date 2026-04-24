import React, { useState } from 'react';
import { useEvents, Event } from '../context/EventContext';
import { Plus, Trash2, Save, X, Download, Upload } from 'lucide-react';

const TECH_OPTIONS = ["Dee", "Geng", "Jay", "K", "Oat", "PK", "Freelance"];
const ASSET_OPTIONS = ['SLD', 'SBD HP#1', 'SBD HP#2', 'SBD HP#2 (Upsize)', 'Payday', 'D-Day', 'Mid-Month', 'MC x Celeb', 'Barter Tier 1'];
const STUDIO_OPTIONS = ['Studio 1', 'Studio 2', 'Studio 3', 'Studio 4', 'Studio 5'];

const COLUMNS = [
  { key: 'Asset', label: 'Asset', width: '150px' },
  { key: 'Live Date', label: 'Live Date', width: '150px' },
  { key: 'Live Time', label: 'Live Time', width: '100px' },
  { key: 'End Time', label: 'End Time', width: '100px' },
  { key: 'KOL name', label: 'KOL name', width: '200px' },
  { key: 'Studio', label: 'Studio', width: '120px' },
  { key: 'Tech 1', label: 'Tech 1', width: '120px' },
  { key: 'Tech 2', label: 'Tech 2', width: '120px' },
  { key: 'Tech 3', label: 'Tech 3', width: '120px' },
  { key: 'Note', label: 'Note', width: '200px' }
];

export const AdminPage: React.FC = () => {
  const { events, setEvents, addEvent, updateEvent, deleteEvent } = useEvents();
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (eventId: string, field: string, currentValue: string) => {
    setEditingCell({ id: eventId, field });
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const event = events.find(e => e.id === editingCell.id);
    if (event) {
      const updatedEvent = { ...event, [editingCell.field]: editValue };

      // Update date parsing if Live Date changed
      if (editingCell.field === 'Live Date') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateParts = editValue.split('-');
        if (dateParts.length >= 3) {
          updatedEvent.day = parseInt(dateParts[1]);
          updatedEvent.month = months.indexOf(dateParts[2]);
          updatedEvent.year = 2026;
        }
      }

      updateEvent(editingCell.id, updatedEvent);
    }
    setEditingCell(null);
  };

  // แปลงวันที่จาก format "Fri-1-May" เป็น "2026-05-01" สำหรับ date input
  const convertToDateInput = (liveDate: string): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = liveDate.split('-');
    if (parts.length >= 3) {
      const day = parseInt(parts[1]);
      const monthIndex = months.indexOf(parts[2]);
      if (monthIndex !== -1) {
        return `2026-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    return '2026-05-01';
  };

  // แปลงจาก date input "2026-05-01" กลับเป็น "Fri-1-May"
  const convertFromDateInput = (dateStr: string): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr);
    const dayName = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    return `${dayName}-${day}-${monthName}`;
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleAddRow = () => {
    const newEvent: Event = {
      id: `new-${Date.now()}`,
      Asset: 'SLD',
      'Live Date': 'Mon-1-May',
      'Live Time': '12:00',
      'End Time': '14:00',
      'KOL name': '',
      Studio: 'Studio 1',
      'Tech 1': '',
      'Tech 2': '',
      'Tech 3': '',
      Note: '',
      day: 1,
      month: 4,
      year: 2026
    };
    addEvent(newEvent);
  };

  const handleDeleteRow = (id: string) => {
    if (confirm('ต้องการลบแถวนี้หรือไม่?')) {
      deleteEvent(id);
    }
  };

  const exportToCSV = () => {
    const headers = COLUMNS.map(col => col.key).join(',');
    const rows = events.map(event =>
      COLUMNS.map(col => {
        const value = event[col.key as keyof Event]?.toString() || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech-manpower-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ยืนยันก่อน import
    if (!confirm(`⚠️ การ import ไฟล์ CSV จะแทนที่ข้อมูลเก่าทั้งหมด (${events.length} รายการ)\n\nต้องการดำเนินการต่อหรือไม่?`)) {
      e.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const newEvents: Event[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.replace(/^"(.*)"$/, '$1'));
        const eventObj: any = {
          id: `import-${Date.now()}-${i}`
        };

        headers.forEach((header, idx) => {
          eventObj[header.trim()] = values[idx]?.trim() || '';
        });

        const dateParts = eventObj['Live Date']?.split('-');
        if (dateParts && dateParts.length >= 3) {
          eventObj.day = parseInt(dateParts[1]);
          eventObj.month = months.indexOf(dateParts[2]);
          eventObj.year = 2026;
        }

        newEvents.push(eventObj as Event);
      }

      // แทนที่ข้อมูลเก่าทั้งหมด
      setEvents(newEvents);

      // แจ้งเตือนว่า import สำเร็จ
      alert(`✅ Import สำเร็จ!\n\nนำเข้าข้อมูลใหม่ ${newEvents.length} รายการ\nข้อมูลเก่าทั้งหมดถูกแทนที่แล้ว`);

      // Reset file input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Data Management</h1>
            <p className="text-slate-500 mt-1 text-sm font-bold">จัดการข้อมูลแบบตาราง - คลิกที่ cell เพื่อแก้ไข</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              เพิ่มแถว
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
            >
              <Download size={18} strokeWidth={3} />
              Export CSV
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-black shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all cursor-pointer">
              <Upload size={18} strokeWidth={3} />
              Import CSV
              <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Events</div>
            <div className="text-4xl font-black text-indigo-600">{events.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Asset Types</div>
            <div className="text-4xl font-black text-purple-600">{new Set(events.map(e => e.Asset)).size}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Active Tech</div>
            <div className="text-4xl font-black text-emerald-600">
              {new Set([...events.map(e => e['Tech 1']), ...events.map(e => e['Tech 2']), ...events.map(e => e['Tech 3'])].filter(Boolean)).size}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="sticky left-0 bg-slate-50 z-10 px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">
                    #
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.width }}
                      className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 last:border-r-0"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="sticky right-0 bg-slate-50 z-10 px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event, idx) => (
                  <tr key={event.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="sticky left-0 bg-white group-hover:bg-indigo-50/30 z-10 px-4 py-3 text-sm font-black text-slate-400 border-r border-slate-100">
                      {idx + 1}
                    </td>
                    {COLUMNS.map((col) => {
                      const isEditing = editingCell?.id === event.id && editingCell?.field === col.key;
                      const value = event[col.key as keyof Event]?.toString() || '';

                      return (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-sm font-bold text-slate-700 border-r border-slate-100 last:border-r-0 cursor-pointer hover:bg-indigo-100/50 transition-colors"
                          onClick={() => !isEditing && startEdit(event.id, col.key, value)}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              {col.key === 'Asset' ? (
                                <select
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded text-sm font-bold outline-none"
                                  autoFocus
                                >
                                  {ASSET_OPTIONS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              ) : col.key === 'Tech 1' || col.key === 'Tech 2' || col.key === 'Tech 3' ? (
                                <select
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded text-sm font-bold outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                >
                                  <option value="">- ไม่ระบุ -</option>
                                  {TECH_OPTIONS.map(tech => (
                                    <option key={tech} value={tech}>{tech}</option>
                                  ))}
                                </select>
                              ) : col.key === 'Studio' ? (
                                <select
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded text-sm font-bold outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                >
                                  {STUDIO_OPTIONS.map(studio => (
                                    <option key={studio} value={studio}>{studio}</option>
                                  ))}
                                </select>
                              ) : col.key === 'Live Date' ? (
                                <input
                                  type="date"
                                  value={convertToDateInput(editValue)}
                                  onChange={(e) => setEditValue(convertFromDateInput(e.target.value))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded text-sm font-bold outline-none"
                                  autoFocus
                                />
                              ) : col.key === 'Live Time' || col.key === 'End Time' ? (
                                <input
                                  type="time"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded text-sm font-bold outline-none"
                                  autoFocus
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded text-sm font-bold outline-none"
                                  autoFocus
                                />
                              )}
                              <button
                                onClick={saveEdit}
                                className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                              >
                                <Save size={14} strokeWidth={3} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                              >
                                <X size={14} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <span className={value ? '' : 'text-slate-300 italic'}>
                              {value || '-'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="sticky right-0 bg-white group-hover:bg-indigo-50/30 z-10 px-4 py-3 text-center border-l border-slate-100">
                      <button
                        onClick={() => handleDeleteRow(event.id)}
                        className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-6">
            <div className="text-slate-300 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-black text-slate-400 mb-2">ยังไม่มีข้อมูล</h3>
            <p className="text-slate-400 text-sm mb-6">เริ่มต้นโดยการเพิ่มแถวใหม่หรือ import CSV</p>
            <button
              onClick={handleAddRow}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              เพิ่มแถวแรก
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
