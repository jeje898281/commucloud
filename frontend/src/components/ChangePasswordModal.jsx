import React, { useState } from 'react';
import { changePassword } from '../services/api';
import Toast from './Toast';
import '../styles/modal-enhanced.css';
import '../styles/ChangePasswordModal.css';
import { getErrorMessage } from '../constants/errorCodes';

export default function ChangePasswordModal({ isOpen, onClose, onSuccess, onError }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePassword = (password) => {
        const errors = [];

        if (password.length < 6) {
            errors.push('至少6個字元');
        }

        if (!/[a-zA-Z]/.test(password)) {
            errors.push('包含英文字母');
        }

        if (!/\d/.test(password)) {
            errors.push('包含數字');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 基本驗證
        if (!formData.currentPassword) {
            showToast('請輸入目前密碼', 'error');
            return;
        }

        if (!formData.newPassword) {
            showToast('請輸入新密碼', 'error');
            return;
        }

        if (!formData.confirmPassword) {
            showToast('請確認新密碼', 'error');
            return;
        }

        // 新密碼強度驗證
        const passwordErrors = validatePassword(formData.newPassword);
        if (passwordErrors.length > 0) {
            showToast(`新密碼必須${passwordErrors.join('、')}`, 'error');
            return;
        }

        // 確認密碼一致性
        if (formData.newPassword !== formData.confirmPassword) {
            showToast('新密碼與確認密碼不一致', 'error');
            return;
        }

        // 檢查新密碼是否與當前密碼相同
        if (formData.currentPassword === formData.newPassword) {
            showToast('新密碼不能與目前密碼相同', 'error');
            return;
        }

        try {
            setUpdating(true);
            const response = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.status >= 200 && response.status < 300) {
                const successMessage = response.data.message || '密碼修改成功！';

                // 總是先在模態框內顯示成功訊息
                showToast(successMessage, 'success');

                // 延遲關閉模態框，讓使用者能看到成功訊息
                setTimeout(() => {
                    handleClose();

                    // 如果有成功回調，在關閉後通知父組件
                    if (onSuccess) {
                        onSuccess(successMessage);
                    }
                }, 1250);
            } else {
                const errorMessage = response.data.message || '修改密碼失敗';

                // 總是在模態框內顯示錯誤訊息
                showToast(errorMessage, 'error');

                // 如果有錯誤回調，也通知父組件
                if (onError) {
                    onError(errorMessage);
                }
            }
        } catch (error) {
            console.error('修改密碼失敗:', error);

            // 使用統一的錯誤處理函數
            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '修改密碼失敗，請稍後再試';

            // 如果是目前密碼錯誤，清空目前密碼欄位
            if (errorCode === 'INVALID_CURRENT_PASSWORD') {
                setFormData(prev => ({
                    ...prev,
                    currentPassword: ''
                }));
            }

            // 總是在模態框內顯示錯誤訊息
            showToast(errorMessage, 'error');

            // 如果有錯誤回調，也通知父組件
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleClose = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswords({
            current: false,
            new: false,
            confirm: false
        });
        onClose();
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast({ show: false, message: '', type: '' });
    };

    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: '' };

        let score = 0;
        const checks = [
            password.length >= 6,
            /[a-zA-Z]/.test(password),
            /\d/.test(password),
            password.length >= 10
        ];

        score = checks.filter(Boolean).length;

        if (score <= 1) return { level: 1, text: '弱', color: 'var(--error-500)' };
        if (score <= 2) return { level: 2, text: '中', color: 'var(--warning-500)' };
        return { level: 3, text: '強', color: 'var(--success-500)' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>修改密碼</h2>
                    <button className="close-btn" onClick={handleClose} disabled={updating}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="password-form">
                    <div className="form-group">
                        <label>目前密碼 *</label>
                        <div className="password-input-group">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="請輸入目前密碼"
                                disabled={updating}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('current')}
                                disabled={updating}
                            >
                                {showPasswords.current ? '隱藏' : '顯示'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>新密碼 *</label>
                        <div className="password-input-group">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="請輸入新密碼"
                                disabled={updating}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('new')}
                                disabled={updating}
                            >
                                {showPasswords.new ? '隱藏' : '顯示'}
                            </button>
                        </div>
                        {formData.newPassword && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${(passwordStrength.level / 3) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    />
                                </div>
                                <span style={{ color: passwordStrength.color }}>
                                    密碼強度：{passwordStrength.text}
                                </span>
                            </div>
                        )}
                        <div className="password-requirements">
                            <p>密碼要求：</p>
                            <ul>
                                <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                                    至少6個字元
                                </li>
                                <li className={/[a-zA-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                                    包含英文字母
                                </li>
                                <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                                    包含數字
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>確認新密碼 *</label>
                        <div className="password-input-group">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="請再次輸入新密碼"
                                disabled={updating}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('confirm')}
                                disabled={updating}
                            >
                                {showPasswords.confirm ? '隱藏' : '顯示'}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="error-text">密碼不一致</p>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={updating}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={updating}
                        >
                            {updating ? '修改中...' : '確認修改'}
                        </button>
                    </div>
                </form>

                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        isVisible={toast.show}
                        onClose={hideToast}
                        duration={toast.type === 'success' ? 1250 : 2500}
                    />
                )}
            </div>
        </div>
    );
} 