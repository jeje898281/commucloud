import React, { useState, useEffect } from 'react';
import { createProposal, updateProposal } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/EditMeetingModal.css';
import '../styles/modal-enhanced.css';

function CreateProposalModal({ isOpen, onClose, onSuccess, meeting, proposal }) {
    const isEdit = Boolean(proposal);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        sqmThreshold: '',
        residentThreshold: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        if (proposal) {
            setFormData({
                title: proposal.title || '',
                content: proposal.content || '',
                sqmThreshold: proposal.sqmThreshold ?? '',
                residentThreshold: proposal.residentThreshold ?? ''
            });
        } else {
            setFormData({
                title: '',
                content: '',
                sqmThreshold: meeting?.sqmThreshold ?? '',
                residentThreshold: meeting?.residentThreshold ?? ''
            });
        }
        setErrors({});
    }, [isOpen, proposal, meeting]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = '請輸入提案標題';
        if (!formData.content.trim()) newErrors.content = '請輸入提案內容';

        if (formData.sqmThreshold === '' || formData.sqmThreshold < 0 || formData.sqmThreshold > 100) {
            newErrors.sqmThreshold = '請輸入 0~100 之間的坪數門檻百分比';
        }
        if (formData.residentThreshold === '' || formData.residentThreshold < 0 || !Number.isInteger(Number(formData.residentThreshold))) {
            newErrors.residentThreshold = '請輸入有效的戶數門檻（整數戶數）';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                sqmThreshold: parseFloat(Number(formData.sqmThreshold).toFixed(2)),
                residentThreshold: parseInt(formData.residentThreshold, 10)
            };

            if (isEdit) {
                await updateProposal(proposal.id, payload);
            } else {
                await createProposal({ meetingId: meeting.id, ...payload });
            }

            onSuccess();
            onClose();
            setErrors({});
        } catch (error) {
            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '操作失敗，請稍後再試';
            setErrors({ general: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setErrors({});
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEdit ? '編輯提案' : '新增提案'}</h2>
                    <button className="modal-close-btn" onClick={handleClose} disabled={isSubmitting}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {errors.general && <div className="error-alert">{errors.general}</div>}

                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            提案標題 <span className="required">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                if (errors.title) setErrors({ ...errors, title: null });
                            }}
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            placeholder="例如：通過外牆拉皮修繕工程合約"
                            disabled={isSubmitting}
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="content" className="form-label">
                            提案內容 <span className="required">*</span>
                        </label>
                        <textarea
                            id="content"
                            rows={5}
                            value={formData.content}
                            onChange={(e) => {
                                setFormData({ ...formData, content: e.target.value });
                                if (errors.content) setErrors({ ...errors, content: null });
                            }}
                            className={`form-input ${errors.content ? 'error' : ''}`}
                            placeholder="說明提案的背景、預算與影響，將印在投票單上"
                            disabled={isSubmitting}
                        />
                        {errors.content && <span className="error-message">{errors.content}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="sqmThreshold" className="form-label">
                            通過坪數門檻（占社區總坪數 %）<span className="required">*</span>
                        </label>
                        <input
                            id="sqmThreshold"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.sqmThreshold}
                            onChange={(e) => {
                                setFormData({ ...formData, sqmThreshold: e.target.value });
                                if (errors.sqmThreshold) setErrors({ ...errors, sqmThreshold: null });
                            }}
                            className={`form-input ${errors.sqmThreshold ? 'error' : ''}`}
                            placeholder="例如：50 或 75"
                            disabled={isSubmitting}
                        />
                        {errors.sqmThreshold && <span className="error-message">{errors.sqmThreshold}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="residentThreshold" className="form-label">
                            通過戶數門檻（戶）<span className="required">*</span>
                        </label>
                        <input
                            id="residentThreshold"
                            type="number"
                            min="0"
                            step="1"
                            value={formData.residentThreshold}
                            onChange={(e) => {
                                setFormData({ ...formData, residentThreshold: e.target.value });
                                if (errors.residentThreshold) setErrors({ ...errors, residentThreshold: null });
                            }}
                            className={`form-input ${errors.residentThreshold ? 'error' : ''}`}
                            placeholder="例如：16 或 24"
                            disabled={isSubmitting}
                        />
                        {errors.residentThreshold && <span className="error-message">{errors.residentThreshold}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><span className="loading-spinner"></span>{isEdit ? '更新中...' : '新增中...'}</>
                            ) : (isEdit ? '確認更新' : '確認新增')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateProposalModal;
