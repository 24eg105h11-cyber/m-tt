import axiosClient from './axiosClient';

export const predictionApi = {
  getPrediction: (params) => axiosClient.get('/prediction', { params }),
  evaluateOutcomes: () => axiosClient.post('/prediction/evaluate'),
};

export const analyticsApi = {
  getSummary: () => axiosClient.get('/analytics/summary'),
};
