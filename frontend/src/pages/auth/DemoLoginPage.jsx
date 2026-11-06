// src/pages/auth/DemoLoginPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoLogin as apiDemoLogin } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function DemoLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiDemoLogin();
        if (cancelled) return;
        const { token, displayName, community, role, username } = res.data;
        login({ token, username, displayName, community, role });
        navigate('/', { replace: true });
      } catch (err) {
        if (cancelled) return;
        const msg = err.response?.data?.message || 'Demo 登入失敗';
        setError(msg);
      }
    })();
    return () => { cancelled = true; };
  }, [login, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      {error ? (
        <>
          <h2>無法自動登入</h2>
          <p>{error}</p>
        </>
      ) : (
        <>
          <h2>正在為您登入 Demo 帳號…</h2>
          <p>請稍候</p>
        </>
      )}
    </div>
  );
}
