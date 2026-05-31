import React, { useState, useEffect } from 'react';
import { updateMeeting } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/EditMeetingModal.css';
import '../styles/modal-enhanced.css';

function EditMeetingModal({ isOpen, onClose, onSuccess, meeting }) {
    const [formData, setFormData] = useState({
        name: '',
        status: '',
        date: '',
        sqmThreshold: '',
        residentThreshold: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (meeting) {
            // 格式化日期為datetime-local格式
            const formattedDate = meeting.date ? new Date(meeting.date).toISOString().slice(0, 16) : '';

            setFormData({
                name: meeting.name || '',
                status: meeting.status || '',
                date: formattedDate,
                sqmThreshold: meeting.sqmThreshold || '',
                residentThreshold: meeting.residentThreshold || ''
            });
            setErrors({});
        }
    }, [meeting]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '請輸入會議名稱';
        }

        if (!formData.status) {
            newErrors.status = '請選擇會議狀態';
        }

        if (!formData.date) {
            newErrors.date = '請選擇會議時間';
        }

        if (!formData.sqmThreshold || formData.sqmThreshold < 0) {
            newErrors.sqmThreshold = '請輸入有效的坪數門檻';
        } else if (formData.sqmThreshold.toString().includes('.')) {
            const decimalPart = formData.sqmThreshold.toString().split('.')[1];
            if (decimalPart && decimalPart.length > 2) {
                newErrors.sqmThreshold = '坪數門檻最多只能輸入到小數點後兩位';
            }
        }

        if (!formData.residentThreshold || formData.residentThreshold < 0) {
            newErrors.residentThreshold = '請輸入有效的戶數門檻';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData = {
                id: meeting.id,
                name: formData.name.trim(),
                status: formData.status,
                date: new Date(formData.date).toISOString(),
                sqmThreshold: parseFloat(Number(formData.sqmThreshold).toFixed(2)),
                residentThreshold: parseFloat(formData.residentThreshold)
            };

            console.log('提交更新會議數據:', updateData);

            await updateMeeting(updateData);

            onSuccess();
            onClose();
            setErrors({});
        } catch (error) {
            console.error('Edit meeting failed:', error);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '更新失敗，請稍後再試';
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

    const statusOptions = [
        { value: 'pending', label: '待開始' },
        { value: 'ongoing', label: '進行中' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' }
    ];

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        編輯會議資料
                    </h2>
                    <button
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            會議名稱 <span className="required">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) {
                                    setErrors({ ...errors, name: null });
                                }
                            }}
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="例如：第一屆社區大會"
                            disabled={isSubmitting}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="status" className="form-label">
                            會議狀態 <span className="required">*</span>
                        </label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => {
                                setFormData({ ...formData, status: e.target.value });
                                if (errors.status) {
                                    setErrors({ ...errors, status: null });
                                }
                            }}
                            className={`form-select ${errors.status ? 'error' : ''}`}
                            disabled={isSubmitting}
                        >
                            <option value="">請選擇狀態</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.status && <span className="error-message">{errors.status}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="date" className="form-label">
                            會議時間 <span className="required">*</span>
                        </label>
                        <input
                            id="date"
                            type="datetime-local"
                            value={formData.date}
                            onChange={(e) => {
                                setFormData({ ...formData, date: e.target.value });
                                if (errors.date) {
                                    setErrors({ ...errors, date: null });
                                }
                            }}
                            className={`form-input ${errors.date ? 'error' : ''}`}
                            disabled={isSubmitting}
                        />
                        {errors.date && <span className="error-message">{errors.date}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="sqmThreshold" className="form-label">
                            坪數門檻 <span className="required">*</span>
                        </label>
                        <input
                            id="sqmThreshold"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.sqmThreshold}
                            onChange={(e) => {
                                let value = e.target.value;
                                // 限制小數點後最多兩位
                                if (value.includes('.')) {
                                    const parts = value.split('.');
                                    if (parts[1] && parts[1].length > 2) {
                                        value = parts[0] + '.' + parts[1].substring(0, 2);
                                    }
                                }
                                setFormData({ ...formData, sqmThreshold: value });
                                if (errors.sqmThreshold) {
                                    setErrors({ ...errors, sqmThreshold: null });
                                }
                            }}
                            className={`form-input ${errors.sqmThreshold ? 'error' : ''}`}
                            placeholder="例如：100.50"
                            disabled={isSubmitting}
                        />
                        {errors.sqmThreshold && <span className="error-message">{errors.sqmThreshold}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="residentThreshold" className="form-label">
                            戶數門檻 <span className="required">*</span>
                        </label>
                        <input
                            id="residentThreshold"
                            type="number"
                            min="0"
                            value={formData.residentThreshold}
                            onChange={(e) => {
                                setFormData({ ...formData, residentThreshold: e.target.value });
                                if (errors.residentThreshold) {
                                    setErrors({ ...errors, residentThreshold: null });
                                }
                            }}
                            className={`form-input ${errors.residentThreshold ? 'error' : ''}`}
                            placeholder="例如：50"
                            disabled={isSubmitting}
                        />
                        {errors.residentThreshold && <span className="error-message">{errors.residentThreshold}</span>}
                    </div>

                    {errors.general && (
                        <div className="error-alert">
                            {errors.general}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    更新中...
                                </>
                            ) : (
                                '確認更新'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditMeetingModal; 