import client from '@/api/client';

export const auth = {
  register: (data: any) => client.post('/auth/register', data).then(res => res.data),
  login: (data: any) => client.post('/auth/login', data).then(res => res.data),
  me: () => client.get('/users/me').then(res => res.data),
  list: () => client.get('/users').then(res => res.data),
  remove: (id: string) => client.delete(`/users/${id}`).then(res => res.data),
  getStats: () => client.get('/users/admin/stats').then(res => res.data),
  updateProfile: (data: any) => client.put('/users/me', data).then(res => res.data),
};

export const events = {
  list: (params: any = {}) => client.get('/events', { params }).then(res => res.data),
  get: (id: string) => client.get(`/events/${id}`).then(res => res.data),
  create: (data: any) => client.post('/events', data).then(res => res.data),
  update: (id: string, data: any) => client.put(`/events/${id}`, data).then(res => res.data),
  remove: (id: string) => client.delete(`/events/${id}`).then(res => res.data)
};

export const bookings = {
  create: (data: any) => client.post('/bookings', data).then(res => res.data),
  listMine: () => client.get('/bookings/me').then(res => res.data),
  listAll: () => client.get('/bookings').then(res => res.data),
  get: (id: string) => client.get(`/bookings/${id}`).then(res => res.data),
  cancel: (id: string) => client.post(`/bookings/${id}/cancel`).then(res => res.data),
  remove: (id: string) => client.delete(`/bookings/${id}`).then(res => res.data)
};

export const categories = {
  list: () => client.get('/categories').then(res => res.data),
  create: (data: any) => client.post('/categories', data).then(res => res.data),
  update: (id: string, data: any) => client.put(`/categories/${id}`, data).then(res => res.data),
  remove: (id: string) => client.delete(`/categories/${id}`).then(res => res.data)
};

export const reviews = {
  listForEvent: (eventId: string) => client.get(`/reviews/${eventId}`).then(res => res.data),
  create: (data: any) => client.post('/reviews', data).then(res => res.data)
};

export const notifications = {
  listMine: () => client.get('/notifications/me').then(res => res.data),
  markRead: (id: string) => client.post(`/notifications/${id}/read`).then(res => res.data)
};

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

const api = {
  auth,
  events,
  bookings,
  categories,
  reviews,
  notifications,
  setAuthToken
};

export default api;
