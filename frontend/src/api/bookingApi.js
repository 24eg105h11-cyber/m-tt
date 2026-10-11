import axiosClient from './axiosClient';

export const bookingApi = {
  create: (data) => axiosClient.post('/bookings', data),
  getAll: () => axiosClient.get('/bookings'),
  getMyBookings: () => axiosClient.get('/bookings/my'),
  getPublicAllocations: (params) => axiosClient.get('/bookings/public/allocations', { params }),
  getById: (id) => axiosClient.get(`/bookings/${id}`),
  approve: (id) => axiosClient.put(`/bookings/${id}/approve`),
  reject: (id, reason) => axiosClient.put(`/bookings/${id}/reject`, { rejectionReason: reason }),
  cancel: (id) => axiosClient.post(`/bookings/${id}/cancel`),
};
