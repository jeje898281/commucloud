import React, { useState, useEffect } from 'react';
import { updateAdminUser } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/modal-enhanced.css';

export default function ResetPasswordModal({ isOpen, user, onClose, onSuccess, onError }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) { setPw(''); setPw2(''); } }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) { onError?.('密碼長度至少 8 字'); return; }
    if (pw !== pw2) { onError?.('兩次輸入的密碼不一致'); return; }
    try {
      setSubmitting(true);
      await updateAdminUser(user.id, { password: pw });
      onSuccess?.();
    } catch (err) {
      onError?.(getErrorMessage(err.response?.data?.code) || err.response?.data?.message || '重設失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !submitting && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">重設密碼 — {user.username}</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">新密碼 * (至少 8 字)</label>
            <input type="password" className="form-input" value={pw} onChange={(e) => setPw(e.target.value)} disabled={submitting} />
          </div>
          <div className="form-group">
            <label className="form-label">確認新密碼 *</label>
            <input type="password" className="form-input" value={pw2} onChange={(e) => setPw2(e.target.value)} disabled={submitting} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '送出中…' : '重設'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
