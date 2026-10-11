import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  User,
  BookOpen,
  X,
  Layers,
} from 'lucide-react';
import { timetableApi } from '../api/timetableApi';
import { classroomApi } from '../api/classroomApi';
import TimetableCalendar from '../components/TimetableCalendar';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function AdminTimetablePage() {
  const [slots, setSlots] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    classroomId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:30',
    courseName: '',
    facultyName: '',
    semester: 'Fall 2026',
    academicYear: '2026-2027',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await timetableApi.getAll();
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
    async function loadRooms() {
      try {
        const res = await classroomApi.getAll();
        setClassrooms(res.data);
      } catch (err) {
        console.error('Failed to load classrooms:', err);
      }
    }
    loadRooms();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const payload = {
      classroomId: parseInt(formData.classroomId, 10),
      dayOfWeek: formData.dayOfWeek,
      startTime: `${formData.startTime}:00`,
      endTime: `${formData.endTime}:00`,
      courseName: formData.courseName,
      facultyName: formData.facultyName,
      semester: formData.semester,
      academicYear: formData.academicYear,
      isActive: true,
    };

    try {
      await timetableApi.create(payload);
      setModalOpen(false);
      fetchTimetable();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add timetable slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable slot?')) return;
    try {
      await timetableApi.delete(id);
      fetchTimetable();
    } catch (err) {
      alert('Failed to delete slot');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Calendar className="w-4 h-4" /> Curriculum Schedule Manager
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Master Timetable Slots</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure recurring semester course schedules to prevent booking conflicts automatically.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Timetable Slot
        </button>
      </div>

      {/* Visual Weekly Grid */}
      <TimetableCalendar timetableSlots={slots} />

      {/* Table of all active slots */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Configured Schedule Inventory ({slots.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Day & Time</th>
                <th className="px-5 py-3.5 font-semibold">Course Name</th>
                <th className="px-5 py-3.5 font-semibold">Instructor</th>
                <th className="px-5 py-3.5 font-semibold">Classroom</th>
                <th className="px-5 py-3.5 font-semibold">Semester</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-800/30 transition text-xs">
                  <td className="px-5 py-3.5 font-bold text-white">
                    <span className="text-indigo-400">{slot.dayOfWeek}</span> •{' '}
                    {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-200 font-semibold">{slot.courseName}</td>
                  <td className="px-5 py-3.5 text-slate-300">{slot.facultyName}</td>
                  <td className="px-5 py-3.5">
                    Room <strong className="text-white">{slot.roomNumber}</strong> ({slot.building})
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{slot.semester}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add Recurring Master Schedule Slot</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Classroom *
                  </label>
                  <select
                    required
                    value={formData.classroomId}
                    onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Room --</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        Room {c.roomNumber} ({c.building})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Course Title / Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-301: Advanced Operating Systems"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alan Turing"
                  value={formData.facultyName}
                  onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                >
                  {saving ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
