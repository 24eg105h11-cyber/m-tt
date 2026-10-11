import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SmartSearchPage from './pages/SmartSearchPage';
import StudentSchedulePage from './pages/StudentSchedulePage';
import FacultyBookingPage from './pages/FacultyBookingPage';
import FacultyBookingsListPage from './pages/FacultyBookingsListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminClassroomsPage from './pages/AdminClassroomsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminTimetablePage from './pages/AdminTimetablePage';

import { useNotificationStore } from './store/notificationStore';

export default function App() {
  const { initWebSocket } = useNotificationStore();

  useEffect(() => {
    // Initialize STOMP WebSocket connection on startup
    initWebSocket();
  }, [initWebSocket]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/classrooms/search" element={<SmartSearchPage />} />
            <Route path="/timetable" element={<StudentSchedulePage />} />

            {/* Faculty Routes */}
            <Route path="/faculty/book" element={<FacultyBookingPage />} />
            <Route
              path="/faculty/bookings"
              element={
                <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                  <FacultyBookingsListPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classrooms"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminClassroomsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/timetable"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminTimetablePage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
