import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health & System status
export const fetchHealth = async () => (await api.get('/health')).data;
export const triggerSeedDb = async () => (await api.post('/seed')).data;

// Passes
export const fetchAllPasses = async () => (await api.get('/passes')).data;
export const fetchPassByNumber = async (passNumber) => (await api.get(`/passes/${passNumber}`)).data;
export const createPass = async (payload) => (await api.post('/passes', payload)).data;
export const updatePassStatus = async (passId, status) => (await api.patch(`/passes/${passId}/status`, { status })).data;
export const deletePass = async (passId) => (await api.delete(`/passes/${passId}`)).data;

// Trails & Navigation
export const fetchTrails = async () => (await api.get('/trails')).data;
export const fetchCheckpoints = async () => (await api.get('/trails/checkpoints')).data;
export const findMultiHopPath = async (startId, endId) => 
  (await api.post('/trails/pathfind', { start_checkpoint_id: startId, end_checkpoint_id: endId })).data;
export const findEmergencyEvacuation = async (currentCheckpointId) => 
  (await api.post('/trails/emergency-evacuation', { current_checkpoint_id: currentCheckpointId })).data;
export const toggleHazard = async (fromId, toId, isPassable) => 
  (await api.post('/trails/toggle-hazard', { from_checkpoint_id: fromId, to_checkpoint_id: toId, is_passable: isPassable })).data;

// Trekkers & Safety
export const fetchTrekkers = async () => (await api.get('/trekkers')).data;
export const registerTrekker = async (payload) => (await api.post('/trekkers', payload)).data;
export const deleteTrekker = async (trekkerId) => (await api.delete(`/trekkers/${trekkerId}`)).data;
export const checkinTrekker = async (trekkerId, checkpointId, status = 'CHECKED_IN') => 
  (await api.post('/trekkers/checkin', { trekker_id: trekkerId, checkpoint_id: checkpointId, status })).data;
export const fetchTrekkerSafetyNetwork = async (trekkerId) => 
  (await api.get(`/trekkers/${trekkerId}/safety-network`)).data;

// Analytics & Topology
export const fetchDashboardStats = async () => (await api.get('/stats/dashboard')).data;
export const fetchTrailCapacity = async () => (await api.get('/stats/trail-capacity')).data;
export const fetchGraphData = async () => (await api.get('/graph/visualize')).data;

export default api;
