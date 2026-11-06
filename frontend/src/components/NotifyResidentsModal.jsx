import React, { useState, useEffect } from 'react';
import { getMeetingNotifyPreview, notifyMeeting } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/modal-enhanced.css';

function NotifyResidentsModal({ isOpen, onClose, meeting, onSuccess, onError }) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [subject, setSubject] = useState('');
    const [text, setText] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        if (!isOpen || !meeting) return;

        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setLoadError(null);
                const res = await getMeetingNotifyPreview(meeting.id);
                if (cancelled) return;
                const data = res.data.data;
                setSubject(data.subject);
                setText(data.text);
                setRecipients(data.recipients);
                setSelectedIds(new Set(data.recipients.map(r => r.id)));
            } catch (error) {
                if (cancelled) return;
                console.error('Failed to load notify preview:', error);
                const errorCode = error.response?.data?.code;
                const errorMessage = getErrorMessage(errorCode) || error.response?.data?.error || '載入預覽失敗';
                setLoadError(errorMessage);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [isOpen, meeting]);

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const toggleOne = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const allSelected = recipients.length > 0 && selectedIds.size === recipients.length;
    const toggleAll = () => {
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(recipients.map(r => r.id)));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const res = await notifyMeeting(meeting.id, {
                subject,
                text,
                recipientIds: Array.from(selectedIds),
            });
            const queued = res.data.queued ?? 0;
            onSuccess?.(`已將 ${queued} 筆通知加入佇列`);
            onClose();
        } catch (error) {
            console.error('Failed to notify residents:', error);
            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.error || '通知住戶失敗';
            onError?.(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
                <div className="modal-header">
                    <h2 className="modal-title">通知住戶 — {meeting?.name}</h2>
                    <button className="modal-close-btn" onClick={handleClose} disabled={submitting}>×</button>
                </div>

                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center' }}>載入預覽中…</div>
                ) : loadError ? (
                    <div style={{ padding: 16 }}>
                        <div className="error-alert">{loadError}</div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={handleClose}>關閉</button>
                        </div>
                    </div>
                ) : (
                    <div className="modal-form">
                        <div className="form-group">
                            <label className="form-label">主旨</label>
                            <input
                                type="text"
                                className="form-input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">內容</label>
                            <textarea
                                className="form-input"
                                rows={5}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <label className="form-label" style={{ margin: 0 }}>
                                    收件人（已選 {selectedIds.size} / {recipients.length}）
                                </label>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={toggleAll}
                                    disabled={submitting || recipients.length === 0}
                                >
                                    {allSelected ? '全不選' : '全選'}
                                </button>
                            </div>
                            {recipients.length === 0 ? (
                                <div style={{ padding: 12, color: '#888' }}>此社區沒有住戶設定 email</div>
                            ) : (
                                <div style={{
                                    maxHeight: 240,
                                    overflowY: 'auto',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    padding: 8,
                                }}>
                                    {recipients.map(r => (
                                        <label
                                            key={r.id}
                                            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', cursor: 'pointer' }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(r.id)}
                                                onChange={() => toggleOne(r.id)}
                                                disabled={submitting}
                                                style={{ marginRight: 8 }}
                                            />
                                            <span style={{ flex: 1 }}>{r.code}</span>
                                            <span style={{ color: '#666' }}>{r.email}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={submitting || selectedIds.size === 0 || !subject.trim() || !text.trim()}
                            >
                                {submitting ? '發送中…' : `確認發送（${selectedIds.size}）`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotifyResidentsModal;
