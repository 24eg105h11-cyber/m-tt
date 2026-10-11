import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Building,
  Users,
  Layers,
  Cpu,
} from 'lucide-react';
import { classroomApi } from '../api/classroomApi';
import PredictionBadge from '../components/PredictionBadge';
import AvailabilityTag from '../components/AvailabilityTag';

export default function HomePage() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await classroomApi.search({ minCapacity: 20 });
        setFeaturedRooms(res.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 text-center max-w-5xl mx-auto">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation AI Classroom Availability Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Predict Classroom Demand <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Before It Happens.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Discover optimal lecture halls, labs, and seminar rooms backed by machine-learning
          forecasting. Distinguish confirmed schedules from statistical likelihood with zero-conflict booking guarantees.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/classrooms/search"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-sm shadow-xl shadow-indigo-600/25 transition hover:scale-105"
          >
            <Search className="w-4 h-4" />
            Explore Smart Room Search
          </Link>
          <Link
            to="/timetable"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 font-semibold text-slate-200 text-sm transition hover:scale-105"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            View Public Timetables
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Overlap Prevention</div>
          </div>
          <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
            <div className="text-2xl font-black text-indigo-400">88.5%</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Model Accuracy</div>
          </div>
          <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
            <div className="text-2xl font-black text-white">&lt; 10ms</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Inference Speed</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-2xl font-black text-emerald-400">Real-Time</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">WebSocket Sync</div>
          </div>
        </div>
      </section>

      {/* Featured Room Live Predictions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Cpu className="w-4 h-4" /> Live AI Availability Stream
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Campus Spaces at a Glance</h2>
            <p className="text-xs text-slate-400 mt-1">
              Current slot status with statistical prediction and utilization metrics.
            </p>
          </div>
          <Link
            to="/classrooms/search"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            View all classrooms <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRooms.map((room) => (
              <div
                key={room.id}
                className="group relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                        {room.roomType?.replace('_', ' ')}
                      </span>
                      <h3 className="text-xl font-extrabold text-white group-hover:text-indigo-300 transition">
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {room.building} • Floor {room.floor}
                      </p>
                    </div>
                    <AvailabilityTag
                      actualAvailable={room.actualAvailable}
                      statusMessage={room.actualStatusMessage}
                      roomStatus={room.status}
                    />
                  </div>

                  {/* AI Prediction Badge */}
                  <div className="my-4">
                    <PredictionBadge
                      predictedAvailability={room.predictedAvailability}
                      confidence={room.predictionConfidence}
                      explanation={room.predictionExplanation}
                      insufficientData={room.insufficientData}
                    />
                  </div>

                  {/* Facilities list */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.facilities?.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {f}
                      </span>
                    ))}
                    {(room.facilities?.length || 0) > 3 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        +{room.facilities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Cap: <strong className="text-white">{room.capacity}</strong> seats
                  </div>
                  <Link
                    to={`/faculty/book?classroomId=${room.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-white transition flex items-center gap-1"
                  >
                    Book Room
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Architected for Complete Academic Operations
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A unified ecosystem bridging faculty bookings, student schedules, and administrator oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Predictive Availability Model</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes historical day-of-week trends, peak hour contention multipliers, and room-type weights to estimate likelihood while keeping actual confirmed state distinct.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero-Conflict Concurrency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Database locking and validation strictly guard against overlapping approved bookings, instantly detecting conflicts before a request can be confirmed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Tailored Workflows</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students easily search faculty schedules by name/department; Faculty discover & reserve spaces; Administrators manage capacity and track model accuracy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
