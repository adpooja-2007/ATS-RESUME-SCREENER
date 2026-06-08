// Centralized API configuration for environment swappability during deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_ROUTES = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    me: `${API_BASE_URL}/api/auth/me`
  },
  resumes: {
    upload: `${API_BASE_URL}/api/resumes/upload`,
    list: `${API_BASE_URL}/api/resumes`,
    detail: (id) => `${API_BASE_URL}/api/resumes/${id}`
  },
  ats: {
    analyze: `${API_BASE_URL}/api/ats/analyze`,
    reports: `${API_BASE_URL}/api/ats/reports`,
    detail: (id) => `${API_BASE_URL}/api/ats/reports/${id}`,
    history: (jobId) => `${API_BASE_URL}/api/ats/history/${jobId}`,
    screen: `${API_BASE_URL}/api/ats/screen`,
    screenings: `${API_BASE_URL}/api/ats/screenings`,
    screeningDetail: (id) => `${API_BASE_URL}/api/ats/screenings/${id}`
  },
  reports: {
    pdf: (id) => `${API_BASE_URL}/api/reports/${id}/pdf`,
    docx: (id) => `${API_BASE_URL}/api/reports/${id}/docx`
  },
  ai: {
    rewrite: `${API_BASE_URL}/api/ai/rewrite`
  }
};
