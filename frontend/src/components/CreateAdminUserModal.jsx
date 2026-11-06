import React, { useState, useEffect } from 'react';
import { createAdminUser } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/modal-enhanced.css';

const ROLES = [
  { value: 'manager', label: '社區經理 (manager)' },
  { value: 'meeting_assistant', label: '秘書 (meeting_assistant)' },
];

export default function CreateAdminUserModal({ isOpen, onClose, onSuccess, onError }) {
  const [form, setForm] = useState({ username: '', displayName: '', role: 'meeting_assistant', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ username: '', displayName: '', role: 'meeting_assistant', password: '', confirmPassword: '' });
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.displayName || !form.password) {
      onError?.('請填寫所有必填欄位');
      return;
    }
    if (form.password.length < 8) { onError?.('密碼長度至少 8 字'); return; }
    if (form.password !== form.confirmPassword) { onError?.('兩次輸入的密碼不一致'); return; }
    try {
      setSubmitting(true);
      await createAdminUser({
        username: form.username,
        displayName: form.displayName,
        role: form.role,
        password: form.password,
      });
      onSuccess?.();
    } catch (err) {
      onError?.(getErrorMessage(err.response?.data?.code) || err.response?.data?.message || '建立失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !submitting && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">新增帳號</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">使用者名稱 *</label>
            <input className="form-input" value={form.username} onChange={set('username')} disabled={submitting} />
          </div>
          <div className="form-group">
            <label className="form-label">顯示名稱 *</label>
            <input className="form-input" value={form.displayName} onChange={set('displayName')} disabled={submitting} />
          </div>
          <div className="form-group">
            <label className="form-label">角色 *</label>
            <select className="form-input" value={form.role} onChange={set('role')} disabled={submitting}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">初始密碼 * (至少 8 字)</label>
            <input type="password" className="form-input" value={form.password} onChange={set('password')} disabled={submitting} />
          </div>
          <div className="form-group">
            <label className="form-label">確認密碼 *</label>
            <input type="password" className="form-input" value={form.confirmPassword} onChange={set('confirmPassword')} disabled={submitting} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '建立中…' : '建立'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
