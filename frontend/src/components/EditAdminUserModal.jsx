import React, { useState, useEffect } from 'react';
import { updateAdminUser as apiUpdateAdminUser } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/modal-enhanced.css';

const ROLES = [
  { value: 'admin', label: '管理員 (admin)' },
  { value: 'manager', label: '社區經理 (manager)' },
  { value: 'meeting_assistant', label: '秘書 (meeting_assistant)' },
];

export default function EditAdminUserModal({ isOpen, user, onClose, onSuccess, onError }) {
  const [form, setForm] = useState({ displayName: '', role: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) setForm({ displayName: user.displayName, role: user.role });
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.displayName) { onError?.('顯示名稱不可空'); return; }
    try {
      setSubmitting(true);
      await apiUpdateAdminUser(user.id, { displayName: form.displayName, role: form.role });
      onSuccess?.();
    } catch (err) {
      onError?.(getErrorMessage(err.response?.data?.code) || err.response?.data?.message || '更新失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !submitting && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">編輯帳號 — {user.username}</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
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
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '儲存中…' : '儲存'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
