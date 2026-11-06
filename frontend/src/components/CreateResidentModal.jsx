import React, { useState } from 'react';
import { createResident } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import Toast from './Toast';
import '../styles/CreateResidentModal.css';
import '../styles/modal-enhanced.css';

function CreateResidentModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        code: '',
        residentSqm: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // 處理不同欄位的輸入限制
        if (name === 'code') {
            // 戶號自動轉大寫
            processedValue = value.toUpperCase();
        } else if (name === 'residentSqm') {
            // 坪數限制到小數點後兩位
            const regex = /^\d*\.?\d{0,2}$/;
            if (!regex.test(value) && value !== '') {
                return; // 不更新狀態，阻止輸入
            }
            processedValue = value;
        } else if (name === 'email') {
            // 信箱只允許英文、數字和信箱合法符號
            const emailRegex = /^[a-zA-Z0-9@._-]*$/;
            if (!emailRegex.test(value)) {
                return; // 不更新狀態，阻止輸入
            }
            processedValue = value; // 保持原始大小寫
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // 清除錯誤訊息
        if (error) setError('');
    };

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 驗證表單
        if (!formData.code.trim()) {
            setError('請輸入住戶戶號');
            return;
        }

        if (!formData.residentSqm || parseFloat(formData.residentSqm) <= 0) {
            setError('請輸入有效的坪數');
            return;
        }

        if (formData.email && !isValidEmail(formData.email)) {
            setError('請輸入有效的電子信箱');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = {
                code: formData.code.trim(),
                residentSqm: parseFloat(Number(formData.residentSqm).toFixed(2)),
                email: formData.email.trim() || undefined
            };

            await createResident(submitData);

            // 重置表單
            setFormData({
                code: '',
                residentSqm: '',
                email: ''
            });

            // 顯示成功提示
            showToast('住戶創建成功！', 'success');

            // 通知父組件成功
            onSuccess();
            onClose();
        } catch (err) {
            console.error('創建住戶失敗:', err);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = err.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '創建住戶失敗，請稍後再試';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                code: '',
                residentSqm: '',
                email: ''
            });
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">新增住戶</h2>
                        <button
                            className="modal-close-btn"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="code" className="form-label">
                                住戶戶號 <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                className="form-input form-input-uppercase"
                                placeholder="請輸入住戶戶號（例如：A101）"
                                disabled={loading}
                                required
                                autoCapitalize="characters"
                                style={{ textTransform: 'uppercase' }}
                            />
                            <div className="form-hint">系統會自動將戶號轉為大寫</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="residentSqm" className="form-label">
                                坪數 <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="residentSqm"
                                name="residentSqm"
                                value={formData.residentSqm}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    // 限制小數點後最多兩位
                                    if (value.includes('.')) {
                                        const parts = value.split('.');
                                        if (parts[1] && parts[1].length > 2) {
                                            value = parts[0] + '.' + parts[1].substring(0, 2);
                                        }
                                    }
                                    setFormData({ ...formData, residentSqm: value });
                                }}
                                className={`form-input ${error ? 'error' : ''}`}
                                placeholder="例如：30.25"
                                disabled={loading}
                                required
                                min="0"
                                step="0.01"
                            />
                            {error && <span className="error-message">{error}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                電子信箱 <span className="optional">(選填)</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="例如：resident@example.com"
                                disabled={loading}
                            />
                            <div className="form-hint">用於接收重要通知</div>
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        創建中...
                                    </>
                                ) : (
                                    '創建住戶'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast 提示 */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={1500}
            />
        </>
    );
}

export default CreateResidentModal; 