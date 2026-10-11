import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Building,
  Check,
  Sparkles,
  Layers,
  ArrowUpDown,
  BookOpen,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { classroomApi } from '../api/classroomApi';
import PredictionBadge from '../components/PredictionBadge';
import AvailabilityTag from '../components/AvailabilityTag';

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
  { value: '', label: 'All Room Types' },
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'SEMINAR_HALL', label: 'Seminar Hall' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
];

const getSmartInitialDateTime = (paramDate, paramStart, paramEnd) => {
  const now = new Date();
  const currentHour = now.getHours();
  let defaultDate = now.toISOString().split('T')[0];
  let defaultStart = '10:00';
  let defaultEnd = '11:00';

  if (currentHour >= 16) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    defaultDate = tomorrow.toISOString().split('T')[0];
    defaultStart = '10:00';
    defaultEnd = '11:00';
  } else {
    const nextHour = currentHour + 1;
    defaultStart = `${String(nextHour).padStart(2, '0')}:00`;
    defaultEnd = `${String(nextHour + 1).padStart(2, '0')}:00`;
  }

  return {
    date: paramDate || defaultDate,
    startTime: paramStart ? paramStart.substring(0, 5) : defaultStart,
    endTime: paramEnd ? paramEnd.substring(0, 5) : defaultEnd,
  };
};

export default function SmartSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const smartDefaults = getSmartInitialDateTime(
    searchParams.get('date'),
    searchParams.get('startTime'),
    searchParams.get('endTime')
  );

  // Search filter states
  const [date, setDate] = useState(smartDefaults.date);
  const [startTime, setStartTime] = useState(smartDefaults.startTime);
  const [endTime, setEndTime] = useState(smartDefaults.endTime);
  const [minCapacity, setMinCapacity] = useState(searchParams.get('minCapacity') || '');
  const [building, setBuilding] = useState(searchParams.get('building') || '');
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || '');
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // Building options from backend
  const [buildings, setBuildings] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('suitability'); // suitability | capacity | predicted

  useEffect(() => {
    async function fetchBuildings() {
      try {
        const res = await classroomApi.getBuildings();
        setBuildings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load buildings:', err);
        setBuildings([]);
      }
    }
    fetchBuildings();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const params = {
      date,
      startTime: startTime ? `${startTime}:00` : undefined,
      endTime: endTime ? `${endTime}:00` : undefined,
      minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
      building: building || undefined,
      roomType: roomType || undefined,
      requiredFacilities: selectedFacilities.length > 0 ? selectedFacilities.join(',') : undefined,
    };

    try {
      const res = await classroomApi.search(params);
      let data = Array.isArray(res.data) ? [...res.data] : [];

      // Apply client-side sorting if changed
      if (sortBy === 'capacity') {
        data.sort((a, b) => a.capacity - b.capacity);
      } else if (sortBy === 'predicted') {
        data.sort((a, b) => (b.predictedAvailability || 0) - (a.predictedAvailability || 0));
      }
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [sortBy]);

  const toggleFacility = (facility) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4" /> Smart Discovery Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">Smart Classroom Search</h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore classrooms with actual availability status and machine-predicted contention rates.
        </p>
      </div>

      {/* Search Filter Form Panel */}
      <form
        onSubmit={handleSearch}
        className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-indigo-400" /> Booking Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Time Slot (Start & End) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-indigo-400" /> Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          {/* Min Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5 inline mr-1 text-indigo-400" /> Min Seating Capacity
            </label>
            <input
              type="number"
              min="1"
              max="500"
              placeholder="e.g. 40 seats"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Building */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Building className="w-3.5 h-3.5 inline mr-1 text-indigo-400" /> Building
            </label>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">All Buildings</option>
              {(Array.isArray(buildings) ? buildings : []).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Type & Facility Pills */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Room Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Room Type:
            </span>
            {ROOM_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setRoomType(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  roomType === t.value
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Analyzing Availability...' : 'Search Classrooms'}
          </button>
        </div>

        {/* Required Facilities Checkbox Pills */}
        <div className="pt-4 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Required Facilities:
          </span>
          <div className="flex flex-wrap gap-2">
            {ALL_FACILITIES.map((facility) => {
              const selected = selectedFacilities.includes(facility);
              return (
                <button
                  type="button"
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    selected
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  {facility}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {/* Sorting bar & Result Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-800">
        <div className="text-sm text-slate-400">
          Found <strong className="text-white">{results.length}</strong> matching classroom
          {results.length === 1 ? '' : 's'} for{' '}
          <span className="text-indigo-400 font-medium">
            {date} ({startTime} - {endTime})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
          >
            <option value="suitability">Recommended Suitability</option>
            <option value="capacity">Optimal Seating Capacity</option>
            <option value="predicted">Highest Predicted Availability</option>
          </select>
        </div>
      </div>

      {/* Results Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Classrooms Match Your Criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try lowering minimum seating capacity, selecting fewer required facilities, or checking a different time slot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(results) ? results : []).map((room) => (
            <div
              key={room.id}
              className={`p-6 rounded-2xl bg-slate-900/90 border transition-all duration-200 flex flex-col justify-between ${
                room.actualAvailable
                  ? 'border-slate-800 hover:border-indigo-500/50 shadow-lg'
                  : 'border-slate-800/60 opacity-80'
              }`}
            >
              <div>
                {/* Top Badge header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                      {room.roomType?.replace('_', ' ')}
                    </span>
                    <h3 className="text-2xl font-black text-white">Room {room.roomNumber}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {room.building} • Floor {room.floor}
                    </p>
                  </div>
                  <AvailabilityTag
                    actualAvailable={room.actualAvailable}
                    statusMessage={room.actualStatusMessage}
                    roomStatus={room.status}
                  />
                </div>

                {/* Actual status message banner if occupied */}
                {!room.actualAvailable && room.actualStatusMessage && (
                  <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                    {room.actualStatusMessage}
                  </div>
                )}

                {/* AI Predicted Availability Section */}
                <div className="my-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Predicted Availability
                    </span>
                    <PredictionBadge
                      predictedAvailability={room.predictedAvailability}
                      confidence={room.predictionConfidence}
                      explanation={room.predictionExplanation}
                      insufficientData={room.insufficientData}
                      compact={true}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {room.predictionExplanation}
                  </p>
                </div>

                {/* Facilities Pills */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block mb-1.5">
                    Equipped Facilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.facilities?.map((f) => (
                      <span
                        key={f}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Utilization & Book Now Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <div>
                    Capacity: <strong className="text-white">{room.capacity} seats</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Historical Util: {room.utilizationRate || 0}%
                  </div>
                </div>

                {room.actualAvailable ? (
                  <button
                    onClick={() =>
                      navigate(
                        `/faculty/book?classroomId=${room.id}&date=${date}&startTime=${startTime}&endTime=${endTime}&capacity=${room.capacity}`
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Book Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs cursor-not-allowed"
                  >
                    Slot Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
