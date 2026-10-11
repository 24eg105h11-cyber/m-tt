import axiosClient from './axiosClient';

export const classroomApi = {
  getAll: (params) => axiosClient.get('/classrooms', { params }),
  getById: (id) => axiosClient.get(`/classrooms/${id}`),
  getBuildings: () => axiosClient.get('/classrooms/buildings'),
  create: (data) => axiosClient.post('/classrooms', data),
  update: (id, data) => axiosClient.put(`/classrooms/${id}`, data),
  updateStatus: (id, status) => axiosClient.patch(`/classrooms/${id}/status`, { status }),
  delete: (id) => axiosClient.delete(`/classrooms/${id}`),
  search: (params) => axiosClient.get('/classrooms/search', { params }),
};
