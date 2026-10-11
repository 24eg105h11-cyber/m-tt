import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { classroomApi } from '../api/classroomApi';

const ALL_FACILITIES = [
  'Projector',
  'Smart board',
  'Whiteboard',
  'Computers',
  'Air conditioning',
  'Audio system',
  'Accessible seating',
  'High-speed LAN',
];

const ROOM_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'SEMINAR_HALL', label: 'Seminar Hall' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
];

export default function AdminClassroomsPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    building: '',
    floor: 1,
    capacity: 40,
    roomType: 'LECTURE_HALL',
    status: 'ACTIVE',
    facilities: [],
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await classroomApi.getAll();
      setClassrooms(res.data);
    } catch (err) {
      console.error('Failed to fetch classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      building: '',
      floor: 1,
      capacity: 40,
      roomType: 'LECTURE_HALL',
      status: 'ACTIVE',
      facilities: ['Projector', 'Whiteboard'],
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      roomType: room.roomType,
      status: room.status,
      facilities: room.facilities ? Array.from(room.facilities) : [],
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleFacilityToggle = (facility) => {
    const list = formData.facilities || [];
    if (list.includes(facility)) {
      setFormData({ ...formData, facilities: list.filter((f) => f !== facility) });
    } else {
      setFormData({ ...formData, facilities: [...list, facility] });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingRoom) {
        await classroomApi.update(editingRoom.id, formData);
      } else {
        await classroomApi.create(formData);
      }
      setModalOpen(false);
      fetchClassrooms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save classroom.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (room, newStatus) => {
    try {
      await classroomApi.updateStatus(room.id, newStatus);
      fetchClassrooms();
    } catch (err) {
      alert('Failed to update room status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) return;
    try {
      await classroomApi.delete(id);
      fetchClassrooms();
    } catch (err) {
      alert('Failed to delete classroom');
    }
  };

  const filtered = classrooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || r.roomType === filterType;
    const matchesStatus = !filterStatus || r.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Building className="w-4 h-4" /> Administration
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Classroom Inventory Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure rooms, seating capacity, facilities, and lifecycle statuses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Classroom
        </button>
      </div>

      {/* Filters bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by room number (e.g. A-101) or building name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Types</option>
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Table of Classrooms */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Room & Building</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Capacity</th>
                <th className="px-5 py-3.5 font-semibold">Facilities</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                    Loading classroom records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                    No classrooms found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-white text-base">
                        Room {room.roomNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        {room.building} • Floor {room.floor}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                        {room.roomType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      {room.capacity} <span className="text-slate-400 font-normal text-xs">seats</span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {room.facilities?.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {f}
                          </span>
                        ))}
                        {(room.facilities?.length || 0) > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            +{room.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusChange(room, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          room.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : room.status === 'MAINTENANCE'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <option value="ACTIVE" className="bg-slate-900 text-emerald-400">
                          ACTIVE
                        </option>
                        <option value="MAINTENANCE" className="bg-slate-900 text-amber-400">
                          MAINTENANCE
                        </option>
                        <option value="INACTIVE" className="bg-slate-900 text-slate-400">
                          INACTIVE
                        </option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Classroom"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Classroom"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Classroom Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingRoom ? `Edit Classroom ${editingRoom.roomNumber}` : 'Add New Classroom'}
              </h3>
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
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-101"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Building *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Block A"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Floor *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="20"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Seating Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Room Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Facilities pills */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 mb-2">
                  Facilities Available:
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALL_FACILITIES.map((facility) => {
                    const checked = formData.facilities.includes(facility);
                    return (
                      <button
                        type="button"
                        key={facility}
                        onClick={() => handleFacilityToggle(facility)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          checked
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {facility}
                      </button>
                    );
                  })}
                </div>
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
                  {saving ? 'Saving...' : 'Save Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
