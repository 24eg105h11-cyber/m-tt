import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  User,
  MapPin,
  Clock,
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  Building,
} from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import { timetableApi } from '../api/timetableApi';
import TimetableCalendar from '../components/TimetableCalendar';

export default function StudentSchedulePage() {
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | master
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [allocations, setAllocations] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch approved allocations for students
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getPublicAllocations({
        date: selectedDate,
        query: searchQuery || undefined,
      });
      setAllocations(res.data);
    } catch (err) {
      console.error('Failed to load allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch master timetable
  const fetchTimetable = async () => {
    try {
      const res = await timetableApi.getPublic(searchQuery);
      setTimetableSlots(res.data);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchAllocations();
    } else {
      fetchTimetable();
    }
  }, [activeTab, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'bookings') {
      fetchAllocations();
    } else {
      fetchTimetable();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <GraduationCap className="w-4 h-4" /> Student & Public Schedule Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Classroom Schedules & Faculty Allocations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse confirmed classroom assignments, faculty bookings, and lecture timings.
          </p>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Confirmed Room Allocations
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'master'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Master Timetable
          </button>
        </div>
      </div>

      {/* Search Bar for Faculty name, Department, or Course */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-3 shadow-lg"
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name (e.g. Dr. Alan Turing), department, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {activeTab === 'bookings' && (
          <div className="w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition shadow-md shadow-indigo-600/20"
        >
          Search Schedules
        </button>
      </form>

      {/* Content based on tab */}
      {activeTab === 'bookings' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Approved Faculty Allocations from {selectedDate}
            </h2>
            <span className="text-xs text-slate-400">
              Showing {allocations.length} allocation{allocations.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : allocations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-white text-base">No Room Allocations Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No faculty members have confirmed bookings matching this date or query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allocations.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/30 transition shadow-lg space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        {item.purpose?.replace('_', ' ')}
                      </span>
                      <h3 className="font-extrabold text-white text-lg">
                        {item.subjectOrCourse}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Confirmed
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <strong className="text-white">{item.faculty?.name}</strong>
                        {item.faculty?.department && (
                          <span className="text-slate-400 block text-[11px]">
                            {item.faculty.department}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Room <strong className="text-white">{item.classroom?.roomNumber}</strong> (
                        {item.classroom?.building}, Floor {item.classroom?.floor})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {item.bookingDate} • {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                      "{item.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <TimetableCalendar timetableSlots={timetableSlots} />
      )}
    </div>
  );
}
