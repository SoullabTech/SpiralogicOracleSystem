import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oracle-backend-1.onrender.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// API endpoints
export const endpoints = {
  // Auth
  login: '/api/auth/login',
  signup: '/api/auth/signup',
  logout: '/api/auth/logout',
  
  // Profile
  createProfile: '/api/profile/create',
  getProfile: '/api/profile',
  updateProfile: '/api/profile/update',
  
  // Oracle
  personalOracle: '/api/oracle/personal',
  oracleSession: '/api/oracle/session',
  extractSymbols: '/api/oracle/extract-symbols',
  
  // Astrology
  birthChart: '/api/astrology/birth-chart',
  currentTransits: '/api/astrology/transits',
  sacredTiming: '/api/astrology/sacred-timing',
  
  // Elemental
  elementalAssessment: '/api/elemental/assessment',
  elementalBalance: '/api/elemental/balance',
  
  // Journal
  createJournal: '/api/journal/create',
  getJournals: '/api/journal/list',
  analyzeJournal: '/api/journal/analyze',
  
  // Memory
  memoryItems: '/api/memory/items',
  createMemory: '/api/memory/create',
  searchMemory: '/api/memory/search',
}