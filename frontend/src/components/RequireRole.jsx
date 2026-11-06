import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { can } from '../utils/permissions';

export default function RequireRole({ permission, children, redirectTo = '/please-login' }) {
  const { isLoggedIn, role } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  if (!can(role, permission)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>權限不足</h2>
        <p>你的角色沒有存取這個頁面的權限。</p>
      </div>
    );
  }
  return children;
}
