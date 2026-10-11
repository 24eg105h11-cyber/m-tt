import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { classroomApi } from '../api/classroomApi';
import { bookingApi } from '../api/bookingApi';
import { authApi } from '../api/authApi';
import { predictionApi } from '../api/predictionApi';
import { useAuthStore } from '../store/authStore';
import PredictionBadge from '../components/PredictionBadge';

const PURPOSES = [
  { value: 'REGULAR_LECTURE', label: 'Regular Lecture' },
  { value: 'EXTRA_CLASS', label: 'Extra Class / Remedial' },
  { value: 'LABORATORY_SESSION', label: 'Laboratory Session' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'WORKSHOP', label: 'Workshop / Training' },
  { value: 'MEETING', label: 'Faculty / Department Meeting' },
];

const AVAILABLE_FACILITIES = [
  'Projector',
  'Smart board',
  'Whiteboard',
  'Computers',
  'Air conditioning',
  'Audio system',
  'Accessible seating',
  'High-speed LAN',
];

const formatToInputTime = (val, fallback) => {
  if (!val) return fallback;
  return val.substring(0, 5);
};

const normalizeTimeForApi = (val, defaultVal) => {
  if (!val) val = defaultVal;
  const parts = val.trim().split(':');
  if (parts.length === 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  if (parts.length >= 3) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  return val;
};

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
    startTime: formatToInputTime(paramStart, defaultStart),
    endTime: formatToInputTime(paramEnd, defaultEnd),
  };
};

export default function FacultyBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [livePrediction, setLivePrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [authLoggingIn, setAuthLoggingIn] = useState(false);

  const initialClassroomId = searchParams.get('classroomId') || '';
  const initialCapacity = searchParams.get('capacity') || '30';
  const smartDefaults = getSmartInitialDateTime(
    searchParams.get('date'),
    searchParams.get('startTime'),
    searchParams.get('endTime')
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      classroomId: initialClassroomId,
      bookingDate: smartDefaults.date,
      startTime: smartDefaults.startTime,
      endTime: smartDefaults.endTime,
      requiredCapacity: initialCapacity,
      purpose: 'REGULAR_LECTURE',
      subjectOrCourse: '',
      notes: '',
      requiredFacilities: [],
    },
  });

  const watchClassroomId = watch('classroomId');
  const watchDate = watch('bookingDate');
  const watchStartTime = watch('startTime');
  const watchEndTime = watch('endTime');
  const watchFacilities = watch('requiredFacilities') || [];

  const isFacultyOrAdmin = user && (user.role === 'FACULTY' || user.role === 'ADMIN');

  const handleAutoFacultyLogin = async () => {
    setAuthLoggingIn(true);
    try {
      const res = await authApi.login({
        email: 'dr.alan@campus.edu',
        password: 'Faculty@123',
      });
      setAuth(res.data.user, res.data.token);
      setSubmitError(null);
    } catch (err) {
      console.error('Faculty login failed:', err);
    } finally {
      setAuthLoggingIn(false);
    }
  };

  // Fetch active classrooms
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await classroomApi.getAll({ status: 'ACTIVE' });
        setClassrooms(res.data);
        if (initialClassroomId) {
          setValue('classroomId', initialClassroomId);
          const room = res.data.find((r) => r.id.toString() === initialClassroomId);
          if (room) setSelectedClassroom(room);
        }
      } catch (err) {
        console.error('Failed to load classrooms:', err);
      }
    }
    fetchRooms();
  }, [initialClassroomId, setValue]);

  // When classroom selector changes
  useEffect(() => {
    if (watchClassroomId) {
      const room = classrooms.find((r) => r.id.toString() === watchClassroomId.toString());
      setSelectedClassroom(room || null);
    }
  }, [watchClassroomId, classrooms]);

  // Fetch live AI prediction preview whenever classroom, date, or time changes
  useEffect(() => {
    if (!watchClassroomId || !watchDate || !watchStartTime || !watchEndTime) return;

    let isMounted = true;
    async function loadPrediction() {
      setPredicting(true);
      try {
        const res = await predictionApi.getPrediction({
          classroomId: watchClassroomId,
          date: watchDate,
          startTime: normalizeTimeForApi(watchStartTime, '10:00'),
          endTime: normalizeTimeForApi(watchEndTime, '11:00'),
        });
        if (isMounted) setLivePrediction(res.data);
      } catch (err) {
        console.warn('Prediction preview failed:', err);
      } finally {
        if (isMounted) setPredicting(false);
      }
    }

    loadPrediction();
    return () => {
      isMounted = false;
    };
  }, [watchClassroomId, watchDate, watchStartTime, watchEndTime]);

  const toggleFacility = (facility) => {
    const current = watchFacilities || [];
    if (current.includes(facility)) {
      setValue(
        'requiredFacilities',
        current.filter((f) => f !== facility)
      );
    } else {
      setValue('requiredFacilities', [...current, facility]);
    }
  };

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    // If not authenticated as faculty or admin, auto-authenticate seamlessly
    if (!isFacultyOrAdmin) {
      try {
        const authRes = await authApi.login({
          email: 'dr.alan@campus.edu',
          password: 'Faculty@123',
        });
        setAuth(authRes.data.user, authRes.data.token);
      } catch (authErr) {
        setSubmitError('Please sign in with a faculty account before booking.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Check if live AI prediction already detected an actual schedule conflict
    if (livePrediction && !livePrediction.actualAvailable) {
      setSubmitError(
        `Schedule Conflict: ${selectedClassroom?.roomNumber || 'Room'} cannot be booked because it is occupied (${livePrediction.actualStatusMessage || 'conflicting booking or class'}). Please choose an alternate slot or classroom.`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    const payload = {
      classroomId: parseInt(data.classroomId, 10),
      bookingDate: data.bookingDate,
      startTime: normalizeTimeForApi(data.startTime, '10:00'),
      endTime: normalizeTimeForApi(data.endTime, '11:00'),
      requiredCapacity: parseInt(data.requiredCapacity, 10),
      requiredFacilities: data.requiredFacilities || [],
      purpose: data.purpose,
      subjectOrCourse: data.subjectOrCourse,
      notes: data.notes,
    };

    try {
      const res = await bookingApi.create(payload);
      setSubmitSuccess(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to submit booking request.';
      setSubmitError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <BookOpen className="w-4 h-4" /> Faculty Reservation Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">Book a Classroom</h1>
        <p className="text-sm text-slate-400 mt-1">
          Reserve lecture halls, laboratories, and seminar spaces with instant concurrency validation.
        </p>
      </div>

      {/* Active User Indicator */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isFacultyOrAdmin ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-slate-400">
            Booking as:{' '}
            <strong className="text-white">
              {user ? user.name : 'Guest'}
            </strong>{' '}
            <span className="text-indigo-400 font-semibold">({user?.role || 'Unauthenticated'})</span>
          </span>
        </div>

        {!isFacultyOrAdmin && (
          <button
            type="button"
            onClick={handleAutoFacultyLogin}
            disabled={authLoggingIn}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs transition shadow-md shadow-indigo-600/20"
          >
            {authLoggingIn ? 'Authorizing...' : 'Switch to Faculty (Dr. Alan Turing)'}
          </button>
        )}
      </div>

      {/* Success banner */}
      {submitSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Booking Request Processed!</h3>
          </div>
          <p className="text-xs text-slate-300">
            Booking for{' '}
            <strong className="text-white">Room {submitSuccess.classroom?.roomNumber}</strong> on{' '}
            <strong className="text-white">{submitSuccess.bookingDate}</strong> (
            {submitSuccess.startTime} - {submitSuccess.endTime}) has been saved with status{' '}
            <span className="font-bold uppercase text-emerald-400">{submitSuccess.status}</span>.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/faculty/bookings')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
            >
              View My Bookings History
            </button>
            <button
              onClick={() => {
                setSubmitSuccess(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
            >
              Book Another Room
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <strong className="block font-semibold text-white mb-0.5">Booking Validation Blocked:</strong>
            {submitError}
          </div>
        </div>
      )}

      {/* Main Booking Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6"
      >
        {/* Live AI Prediction Banner Preview */}
        {selectedClassroom && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Pre-Booking Analysis for Room{' '}
                {selectedClassroom.roomNumber}
              </span>
              <p className="text-xs text-slate-300">
                {predicting ? (
                  <span className="animate-pulse">Computing historical contention metrics...</span>
                ) : livePrediction?.actualAvailable ? (
                  <span>
                    Currently <strong className="text-emerald-400">Available</strong> in actual
                    schedules with estimated{' '}
                    <strong className="text-white">
                      {Math.round(livePrediction.predictedAvailability)}%
                    </strong>{' '}
                    availability likelihood.
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold">
                    Warning: Occupied or conflicting schedule detected ({livePrediction?.actualStatusMessage})
                  </span>
                )}
              </p>
            </div>
            {livePrediction && (
              <PredictionBadge
                predictedAvailability={livePrediction.predictedAvailability}
                confidence={livePrediction.confidence}
                explanation={livePrediction.explanation}
                insufficientData={livePrediction.insufficientData}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Classroom Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Classroom <span className="text-rose-400">*</span>
            </label>
            <select
              {...register('classroomId', { required: 'Please select a classroom' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">-- Choose Classroom --</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  Room {c.roomNumber} ({c.building}, Cap: {c.capacity}) - {c.roomType}
                </option>
              ))}
            </select>
            {errors.classroomId && (
              <p className="text-xs text-rose-400 mt-1">{errors.classroomId.message}</p>
            )}
          </div>

          {/* Booking Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Booking Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('bookingDate', { required: 'Booking date is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            {errors.bookingDate && (
              <p className="text-xs text-rose-400 mt-1">{errors.bookingDate.message}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Start Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="time"
              {...register('startTime', { required: 'Start time is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            {errors.startTime && (
              <p className="text-xs text-rose-400 mt-1">{errors.startTime.message}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              End Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="time"
              {...register('endTime', { required: 'End time is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            {errors.endTime && (
              <p className="text-xs text-rose-400 mt-1">{errors.endTime.message}</p>
            )}
          </div>

          {/* Required Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Required Seating Capacity <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedClassroom ? selectedClassroom.capacity : 500}
              placeholder="e.g. 45"
              {...register('requiredCapacity', {
                required: 'Capacity is required',
                min: { value: 1, message: 'Minimum 1 seat' },
              })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            {selectedClassroom && (
              <p className="text-[11px] text-slate-500 mt-1">
                Room maximum capacity: {selectedClassroom.capacity} seats
              </p>
            )}
          </div>

          {/* Booking Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Booking Purpose <span className="text-rose-400">*</span>
            </label>
            <select
              {...register('purpose', { required: 'Purpose is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject or Course Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Subject, Course Code, or Event Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. CS-301: Advanced Data Structures & Algorithms"
            {...register('subjectOrCourse', { required: 'Course or title is required' })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
          {errors.subjectOrCourse && (
            <p className="text-xs text-rose-400 mt-1">{errors.subjectOrCourse.message}</p>
          )}
        </div>

        {/* Required Facilities Multi-select */}
        <div>
          <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Required Facilities
          </span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FACILITIES.map((facility) => {
              const checked = watchFacilities.includes(facility);
              return (
                <button
                  type="button"
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    checked
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Optional Notes / Equipment Specifications
          </label>
          <textarea
            rows="3"
            placeholder="Additional requirements or public description for students..."
            {...register('notes')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Bottom Status Feedback */}
        {livePrediction && !livePrediction.actualAvailable && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold mb-0.5">Room Unavailability Warning:</strong>
              Classroom is occupied ({livePrediction.actualStatusMessage}). Please pick a different time slot or classroom to submit.
            </div>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold mb-0.5">Booking Submission Blocked:</strong>
              {submitError}
            </div>
          </div>
        )}

        {/* Submit action */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {isFacultyOrAdmin ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated as {user.name} ({user.role})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" /> Will auto-authenticate as Faculty on submission
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/classrooms/search')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold text-xs text-white transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {submitting ? 'Submitting Reservation...' : 'Confirm Booking Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
