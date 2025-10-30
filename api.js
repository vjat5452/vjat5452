import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with better error handling
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Add request interceptor for better logging
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response from ${response.config.url}:`, response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.data || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Backend server is not running. Please start the backend server on port 5000.');
        }
        return Promise.reject(error);
    }
);

export const employeeAPI = {
    // Basic CRUD operations
    getAll: () => api.get('/employees'),
    getById: (id) => api.get(`/employees/${id}`),
    create: (employeeData) => api.post('/employees', employeeData),
    update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
    delete: (id) => api.delete(`/employees/${id}`),
    
    // Fallback endpoints
    getAllFallback: () => api.get('/employees-fallback'),
    createFallback: (employeeData) => api.post('/employees-fallback', employeeData),
    
    // Health check
    health: () => api.get('/health'),
    testEmployees: () => api.get('/test-employees')
};

// Test connection on app start
export const testConnection = async () => {
    try {
        const response = await employeeAPI.health();
        console.log('✅ Backend connection successful:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        return false;
    }
};

// Test employees endpoint specifically
export const testEmployeesEndpoint = async () => {
    try {
        const response = await employeeAPI.getAll();
        console.log('✅ Employees endpoint working:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Employees endpoint failed:', error.message);
        return false;
    }
};

export default api;