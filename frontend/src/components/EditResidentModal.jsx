import React, { useState, useEffect } from 'react';
import { updateResident } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/EditResidentModal.css';
import '../styles/modal-enhanced.css';

function EditResidentModal({ isOpen, onClose, onSuccess, resident }) {
    const [formData, setFormData] = useState({
        code: '',
        residentSqm: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (resident) {
            setFormData({
                code: resident.code || '',
                residentSqm: resident.residentSqm || '',
                email: resident.email || ''
            });
            setErrors({});
        }
    }, [resident]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = '請輸入住戶編號';
        }

        if (!formData.residentSqm || formData.residentSqm <= 0) {
            newErrors.residentSqm = '請輸入有效的坪數';
        } else {
            const sqmValue = parseFloat(formData.residentSqm);
            if (isNaN(sqmValue) || sqmValue <= 0) {
                newErrors.residentSqm = '請輸入有效的坪數';
            } else if (formData.residentSqm.toString().includes('.')) {
                const decimalPart = formData.residentSqm.toString().split('.')[1];
                if (decimalPart && decimalPart.length > 2) {
                    newErrors.residentSqm = '坪數最多只能輸入到小數點後兩位';
                }
            }
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '請輸入有效的電子信箱格式';
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
                code: formData.code.trim(),
                residentSqm: parseFloat(Number(formData.residentSqm).toFixed(2)),
                email: formData.email.trim() || null
            };

            await updateResident(resident.id, updateData);
            onSuccess();
            onClose();
            setErrors({});
        } catch (error) {
            console.error('Edit resident failed:', error);

            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '編輯失敗，請稍後再試';

            if (errorCode === 'CODE_ALREADY_EXISTS' || errorCode === 'RESIDENT_CODE_ALREADY_EXISTS') {
                setErrors({ code: errorMessage });
            } else {
                setErrors({ general: errorMessage });
            }
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

    // 點擊外部時的提示效果
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            // 添加彈跳動畫提示用戶需要點關閉按鈕
            const modal = e.currentTarget.querySelector('.modal-content');
            if (modal) {
                modal.style.animation = 'none';
                modal.offsetHeight; // 觸發重繪
                modal.style.animation = 'modalBounce 0.3s ease-out';
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        編輯住戶資料
                    </h2>
                    <button
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        title="關閉對話框"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {errors.general && (
                        <div className="error-message">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="code" className="form-label">
                                住戶編號 <span className="required">*</span>
                            </label>
                            <input
                                id="code"
                                type="text"
                                value={formData.code}
                                onChange={(e) => {
                                    setFormData({ ...formData, code: e.target.value });
                                    if (errors.code) {
                                        setErrors({ ...errors, code: null });
                                    }
                                }}
                                className={`form-input form-input-uppercase ${errors.code ? 'error' : ''}`}
                                placeholder="請輸入住戶戶號（例如：A101）"
                                disabled={isSubmitting}
                            />
                            {errors.code && <span className="error-message">{errors.code}</span>}
                            <div className="form-hint">系統會自動將戶號轉為大寫</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="residentSqm" className="form-label">
                                坪數 <span className="required">*</span>
                            </label>
                            <input
                                id="residentSqm"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.residentSqm}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (value.includes('.')) {
                                        const parts = value.split('.');
                                        if (parts[1] && parts[1].length > 2) {
                                            value = parts[0] + '.' + parts[1].substring(0, 2);
                                        }
                                    }
                                    setFormData({ ...formData, residentSqm: value });
                                    if (errors.residentSqm) {
                                        setErrors({ ...errors, residentSqm: null });
                                    }
                                }}
                                className={`form-input ${errors.residentSqm ? 'error' : ''}`}
                                placeholder="例如：30.25"
                                disabled={isSubmitting}
                            />
                            {errors.residentSqm && <span className="error-message">{errors.residentSqm}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                電子信箱
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) {
                                        setErrors({ ...errors, email: null });
                                    }
                                }}
                                className={`form-input form-input-email ${errors.email ? 'error' : ''}`}
                                placeholder="例如：Resident@Example.com"
                                disabled={isSubmitting}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                            <div className="form-hint">信箱將保持您輸入的大小寫格式</div>
                        </div>
                    </form>
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <span className="loading-spinner"></span>}
                        {isSubmitting ? '儲存中...' : '儲存變更'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditResidentModal; 