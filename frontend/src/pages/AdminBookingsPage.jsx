import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  Filter,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { bookingApi } from '../api/bookingApi';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');

  // Reject modal
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getAll();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (booking) => {
    setActionLoading(true);
    try {
      await bookingApi.approve(booking.id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingBooking) return;
    setActionLoading(true);
    try {
      await bookingApi.reject(rejectingBooking.id, rejectionReason);
      setRejectingBooking(null);
      setRejectionReason('');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" /> Approval Workflow
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">Booking Requests & Allocations</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review pending faculty reservation requests, enforce overlap prevention, and approve room assignments.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-slate-800">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st} ({bookings.filter((b) => (st === 'ALL' ? true : b.status === st)).length})
          </button>
        ))}
      </div>

      {/* Bookings Queue */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Requests in {filterStatus} Queue</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            All reservation requests for this category have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-black text-white">{b.subjectOrCourse}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold ${
                      b.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : b.status === 'PENDING'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                    {b.purpose?.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Faculty: <strong className="text-white">{b.faculty?.name}</strong> (
                    {b.faculty?.department || 'Department'})
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Room: <strong className="text-white">{b.classroom?.roomNumber}</strong> (
                    {b.classroom?.building}, Floor {b.classroom?.floor})
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {b.bookingDate} ({b.startTime} - {b.endTime})
                  </span>

                  <span>Seats: {b.requiredCapacity}</span>
                </div>

                {b.requiredFacilities && b.requiredFacilities.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Required Facilities:
                    </span>
                    {b.requiredFacilities.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {b.notes && (
                  <p className="text-xs text-slate-400 italic">Faculty Notes: "{b.notes}"</p>
                )}

                {b.rejectionReason && (
                  <p className="text-xs text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <strong>Rejection Reason:</strong> {b.rejectionReason}
                  </p>
                )}
              </div>

              {/* Actions */}
              {b.status === 'PENDING' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(b)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectingBooking(b)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-white">Reject Booking Request</h3>
            <p className="text-xs text-slate-400">
              Provide a clear reason for rejecting the booking for{' '}
              <strong className="text-white">{rejectingBooking.subjectOrCourse}</strong>. This
              explanation will be delivered to the faculty member.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows="3"
                placeholder="e.g. Scheduled institution exam period or maintenance underway..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
