import axios from 'axios';

const api = axios.create({
  // Ensure this matches your Django server address
  baseURL: 'http://localhost:8000/api/',
});

// This interceptor grabs the token from storage and injects it into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
