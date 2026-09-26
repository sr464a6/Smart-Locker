import axios from 'axios';
const api = axios.create({ baseURL: '/api/lockers' });
export const getLockers = () => api.get('/').then(r => r.data);
export const getLocker = (id) => api.get(`/${id}`).then(r => r.data);
export const pinjamLocker = (id, body) => api.post(`/${id}/pinjam`, body).then(r => r.data);
export const verifyPin = (id, pin) => api.post(`/${id}/verify-pin`, { pin }).then(r => r.data);
export const doorClosed = (id) => api.post(`/${id}/door-closed`).then(r => r.data);
export default api;
