import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAccount } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../constants/errorCodes';
import '../../styles/LoginPage.css';
import '../../styles/RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    displayName: '', communityName: '', communityDescription: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (isLoggedIn) {
    navigate('/', { replace: true });
    return null;
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!form.username || !form.email || !form.password || !form.displayName || !form.communityName) {
      return '請填寫所有必填欄位';
    }
    if (form.password.length < 8) return '密碼長度至少 8 字';
    if (form.password !== form.confirmPassword) return '兩次輸入的密碼不一致';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setSubmitting(true);
      const res = await registerAccount({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        communityName: form.communityName,
        communityDescription: form.communityDescription,
        logoUrl: ''
      });
      login(res.data);
      navigate('/', { replace: true });
    } catch (err) {
      const code = err.response?.data?.code;
      setError(getErrorMessage(code) || err.response?.data?.message || '註冊失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-background">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
        </div>

        <div className="login-card register-card">
          <div className="login-header">
            <div className="login-logo">
              <h1>建立你的社區</h1>
            </div>
            <p className="login-subtitle">註冊管理員帳號並開設你的社區管理空間</p>
          </div>

          <form onSubmit={onSubmit} className="login-form register-form">
            <div className="register-section-title">帳號資訊</div>

            <div className="form-group">
              <label className="form-label">使用者名稱 *</label>
              <input
                className="form-input"
                value={form.username}
                onChange={set('username')}
                placeholder="登入用名稱，建立後不可更改"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={set('email')}
                placeholder="你的電子郵件"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">顯示名稱 *</label>
              <input
                className="form-input"
                value={form.displayName}
                onChange={set('displayName')}
                placeholder="會顯示在介面上的稱呼"
                disabled={submitting}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">密碼 *</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="至少 8 字"
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label className="form-label">確認密碼 *</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="再輸入一次"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="register-section-title">社區資訊</div>

            <div className="form-group">
              <label className="form-label">社區名稱 *</label>
              <input
                className="form-input"
                value={form.communityName}
                onChange={set('communityName')}
                placeholder="例如：陽光花園 A 棟"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">社區描述</label>
              <textarea
                className="form-input"
                rows={3}
                value={form.communityDescription}
                onChange={set('communityDescription')}
                placeholder="簡單介紹這個社區（選填）"
                disabled={submitting}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="login-spinner"></span>
                  建立中…
                </>
              ) : '建立帳號 + 社區'}
            </button>
          </form>

          <div className="auth-alt">
            <span className="auth-alt-text">已經有帳號了？</span>
            <Link to="/login" className="auth-alt-link">立即登入</Link>
          </div>

          <div className="login-footer">
            <p className="help-text">建立後你會成為這個社區的管理員，可以再開更多帳號。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
