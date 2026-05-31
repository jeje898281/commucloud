// src/services/api.js
import axios from 'axios';

// 創建 Axios 實例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 從 localStorage 讀取 JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function listResidents() {
  return apiClient.get('/resident');
}

export function scanAttendance(qrCode) {
  return apiClient.post('/meeting/checkin', { qrCode });
}

export function login({ username, password }) {
  return apiClient.post('/auth/login', { username, password });
}

export function demoLogin() {
  return apiClient.get('/auth/demo-login');
}

export function manualCheckIn({ meetingId, residentCode }) {
  return apiClient.post('/meeting/checkin', {
    meetingId,
    residentCode,
    isManual: true
  });
}
export function getAttendanceSummary(meetingId) {
  return apiClient.get(`/meeting/summary/${meetingId}`);
}
export function getAttendanceRecords(meetingId) {
  return apiClient.get(`/meeting/records/${meetingId}`);
}

export function listMeetings() {
  return apiClient.get('/meeting');
}

export function getMeetingById(meetingId) {
  return apiClient.get(`/meeting/${meetingId}`);
}

// 生成住戶QR碼
export function generateQRCodes(meetingId) {
  return apiClient.post('/meeting/generate-qr-codes', { meetingId });
}

export function notifyMeeting(meetingId, payload = {}) {
  return apiClient.post(`/meetings/${meetingId}/notify`, payload);
}

export function getMeetingNotifyPreview(meetingId) {
  return apiClient.get(`/meetings/${meetingId}/notify/preview`);
}

// === 提案投票相關 API ===
// 依會議列出提案（含票數統計）
export function listProposals(meetingId) {
  return apiClient.get(`/proposal/meeting/${meetingId}`);
}

// 提案詳情
export function getProposal(proposalId) {
  return apiClient.get(`/proposal/${proposalId}`);
}

// 新增提案
export function createProposal(data) {
  return apiClient.post('/proposal', data);
}

// 更新提案
export function updateProposal(proposalId, data) {
  return apiClient.patch(`/proposal/${proposalId}`, data);
}

// 刪除提案
export function deleteProposal(proposalId) {
  return apiClient.delete(`/proposal/${proposalId}`);
}

// 取得整場會議的投票單列印資料
export function getMeetingBallots(meetingId) {
  return apiClient.get(`/proposal/meeting/${meetingId}/ballots`);
}

// 掃碼記票
export function voteByQRCode(qrCode) {
  return apiClient.post('/proposal/vote', { qrCode });
}

// 新增住戶
export function createResident(data) {
  return apiClient.post('/resident', data);
}

// 批量匯入住戶
export function bulkImportResidents(data) {
  return apiClient.post('/resident/bulk', data);
}

// 編輯住戶
export function updateResident(id, data) {
  return apiClient.patch('/resident', { id, ...data });
}

// 刪除住戶
export function deleteResident(id) {
  return apiClient.delete('/resident', { data: { id } });
}

// 更新會議
export function updateMeeting(data) {
  return apiClient.patch('/meeting', data);
}

// 新增會議
export function createMeeting(data) {
  return apiClient.post('/meeting', data);
}

// === 個人資料相關API ===
// 獲取個人資料
export function getProfile() {
  return apiClient.get('/profile');
}

// 更新個人資料
export function updateProfile(data) {
  return apiClient.put('/profile', data);
}

// 修改密碼
export function changePassword(data) {
  return apiClient.put('/profile/password', data);
}

// === 社區資訊相關API ===
// 獲取社區資訊
export function getCommunityInfo() {
  return apiClient.get('/community');
}

// 更新社區資訊
export function updateCommunityInfo(data) {
  return apiClient.put('/community', data);
}

// --- Account / Auth ---
export function registerAccount(payload) {
  return apiClient.post('/auth/register', payload);
}

// --- Admin user management ---
export function listAdminUsers() {
  return apiClient.get('/admin/users');
}

export function createAdminUser(payload) {
  return apiClient.post('/admin/users', payload);
}

export function updateAdminUser(id, patch) {
  return apiClient.patch(`/admin/users/${id}`, patch);
}

export function deactivateAdminUser(id) {
  return apiClient.delete(`/admin/users/${id}`);
}

