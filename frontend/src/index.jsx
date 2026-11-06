// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Layouts
// MainLayout 在 src/components/MainLayout.jsx
import MainLayout from './components/MainLayout';
// MeetingLayout 在 src/components/layout/MeetingLayout.jsx
import MeetingLayout from './components/layout/MeetingLayout';

// Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PleaseLoginPage from './pages/auth/PleaseLoginPage';
import DemoLoginPage from './pages/auth/DemoLoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import CommunityPage from './pages/auth/CommunityPage';
import MeetingListPage from './pages/meetings/MeetingListPage';
import ScanPage from './pages/meetings/ScanPage';
import ManualCheckIn from './pages/meetings/ManualCheckIn';
import SummaryPage from './pages/meetings/SummaryPage';
import ResidentsList from './components/ResidentsList';
import QRCodePage from './pages/meetings/QRCodePage';
import ProposalsPage from './pages/meetings/ProposalsPage';
import VoteScanPage from './pages/meetings/VoteScanPage';
import VoteBallotsPage from './pages/meetings/VoteBallotsPage';

// Guards
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';

// Admin pages
import AdminUsersPage from './pages/admin/AdminUsersPage';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. 登入頁，不需驗證 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 2. 請先登入頁面 */}
          <Route path="/please-login" element={<PleaseLoginPage />} />

          {/* Demo 自動登入：URL 不帶 token，由後端用環境變數指定帳號簽發 */}
          <Route path="/demo" element={<DemoLoginPage />} />

          {/* 3. 主要布局 */}
          <Route element={<MainLayout />}>
            {/* 3.1 首頁 - 不需要登入 */}
            <Route index element={<HomePage />} />

            {/* 3.2 受保護路由：必須先登入 */}
            {/* 住戶清單 */}
            <Route path="residents" element={
              <RequireAuth redirectTo="/please-login">
                <ResidentsList />
              </RequireAuth>
            } />

            {/* 個人資料 */}
            <Route path="profile" element={
              <RequireAuth redirectTo="/please-login">
                <ProfilePage />
              </RequireAuth>
            } />

            {/* 社區管理 */}
            <Route path="communities" element={
              <RequireAuth redirectTo="/please-login">
                <CommunityPage />
              </RequireAuth>
            } />

            {/* 會議列表 */}
            <Route path="meetings" element={
              <RequireAuth redirectTo="/please-login">
                <MeetingListPage />
              </RequireAuth>
            } />

            {/* 帳號管理 */}
            <Route path="admin/users" element={
              <RequireRole permission="admin.manage" redirectTo="/please-login">
                <AdminUsersPage />
              </RequireRole>
            } />

            {/* 4. 單一會議上下文 - 也在 MainLayout 內 */}
            <Route path="meetings/:id" element={
              <RequireAuth redirectTo="/please-login">
                <MeetingLayout />
              </RequireAuth>
            }>
              <Route index element={<Navigate to="scan" replace />} />
              <Route path="scan" element={<ScanPage />} />
              <Route path="manual" element={<ManualCheckIn />} />
              <Route path="summary" element={<SummaryPage />} />
              <Route path="proposals" element={<ProposalsPage />} />
              <Route path="vote-scan" element={<VoteScanPage />} />
              <Route path="qrcodes" element={<QRCodePage />} />
            </Route>
          </Route>

          {/* 投票單批量列印頁（獨立全頁，無導覽列，方便列印） */}
          <Route path="/meetings/:id/ballots" element={
            <RequireAuth redirectTo="/please-login">
              <VoteBallotsPage />
            </RequireAuth>
          } />

          {/* 5. 其他不存在的路由導回首頁 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
