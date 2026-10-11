import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
};

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function TimetableCalendar({
  timetableSlots = [],
  bookings = [],
  selectedDay = 'MONDAY',
  onSelectDay,
}) {
  const [activeDay, setActiveDay] = useState(selectedDay || 'MONDAY');

  const handleDayChange = (d) => {
    setActiveDay(d);
    if (onSelectDay) onSelectDay(d);
  };

  // Filter slots for the active day
  const dayTimetable = timetableSlots.filter((s) => s.dayOfWeek === activeDay);

  // Group items by approximate hour
  const itemsByHour = {};
  TIME_SLOTS.forEach((h) => {
    itemsByHour[h] = [];
  });

  dayTimetable.forEach((slot) => {
    const hourPrefix = slot.startTime ? slot.startTime.substring(0, 2) + ':00' : '09:00';
    if (itemsByHour[hourPrefix]) {
      itemsByHour[hourPrefix].push({
        type: 'CURRICULUM',
        title: slot.courseName,
        subtitle: slot.facultyName,
        room: slot.roomNumber,
        building: slot.building,
        time: `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`,
      });
    }
  });

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Day Selector Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white text-base">Weekly Timetable Matrix</h3>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => handleDayChange(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeDay === day
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {DAY_LABELS[day].substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Agenda Time Grid */}
      <div className="mt-6 space-y-3">
        {TIME_SLOTS.map((hour) => {
          const events = itemsByHour[hour] || [];
          return (
            <div
              key={hour}
              className="flex items-start gap-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/40 hover:border-slate-700/60 transition"
            >
              <div className="w-16 shrink-0 text-xs font-semibold text-slate-400 flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {hour}
              </div>

              <div className="flex-1">
                {events.length === 0 ? (
                  <span className="text-xs text-slate-600 italic">No scheduled class — available slot</span>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {events.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20 shadow-md text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-200 truncate">{ev.title}</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[10px]">
                            {ev.room}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.subtitle}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" /> {ev.building || 'Campus'}
                          </span>
                          <span className="text-indigo-300 font-mono">{ev.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
