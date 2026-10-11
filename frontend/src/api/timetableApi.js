import axiosClient from './axiosClient';

export const timetableApi = {
  getAll: () => axiosClient.get('/timetable'),
  getPublic: (query) => axiosClient.get('/timetable/public', { params: { query } }),
  getByClassroom: (classroomId) => axiosClient.get(`/timetable/classroom/${classroomId}`),
  create: (data) => axiosClient.post('/timetable', data),
  delete: (id) => axiosClient.delete(`/timetable/${id}`),
};
