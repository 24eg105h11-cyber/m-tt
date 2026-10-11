import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  BookOpen,
  Filter,
} from 'lucide-react';
import { bookingApi } from '../api/bookingApi';

export default function FacultyBookingsListPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(cancelModalBooking.id);
      setCancelModalBooking(null);
      fetchMyBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            PENDING APPROVAL
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-700/40 text-slate-400 border border-slate-700">
            CANCELLED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            COMPLETED
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Layers className="w-4 h-4" /> Personal Activity
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">My Booking History</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track status, review notes, and manage your room allocations.
          </p>
        </div>

        <Link
          to="/faculty/book"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" /> Book New Classroom
        </Link>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-800">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === st
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No booking records match the selected status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{b.subjectOrCourse}</h3>
                  {getStatusBadge(b.status)}
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                    {b.purpose?.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Room{' '}
                    <strong className="text-white">{b.classroom?.roomNumber}</strong> (
                    {b.classroom?.building}, Fl {b.classroom?.floor})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {b.bookingDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {b.startTime} - {b.endTime}
                  </span>
                  <span>Required Seats: {b.requiredCapacity}</span>
                </div>

                {b.rejectionReason && (
                  <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg mt-1">
                    <strong>Rejection Reason:</strong> {b.rejectionReason}
                  </p>
                )}

                {b.notes && (
                  <p className="text-[11px] text-slate-400 italic">Notes: "{b.notes}"</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="shrink-0 flex items-center gap-2">
                {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                  <button
                    onClick={() => setCancelModalBooking(b)}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Cancellation</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to cancel the booking for{' '}
              <strong className="text-white">{cancelModalBooking.subjectOrCourse}</strong> in{' '}
              <strong className="text-white">Room {cancelModalBooking.classroom?.roomNumber}</strong> on{' '}
              {cancelModalBooking.bookingDate}? This space will immediately become open for other faculty.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
