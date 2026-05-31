import React, { useState } from 'react';
import { deleteResident } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import '../styles/modal-enhanced.css';
import '../styles/DeleteConfirmModal.css';

function DeleteConfirmModal({ isOpen, onClose, onSuccess, resident }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!resident) return;

        setIsDeleting(true);
        setError('');

        try {
            await deleteResident(resident.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Delete resident failed:', error);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '刪除失敗，請稍後再試';
            setError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
            onClose();
            setError('');
        }
    };

    if (!isOpen || !resident) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="delete-modal-header">
                    <div className="delete-warning-icon" aria-hidden="true"></div>
                    <h2 className="delete-modal-title">確認刪除住戶</h2>
                </div>

                <div className="delete-modal-body">
                    <p className="delete-warning-text">
                        您確定要刪除以下住戶嗎？此操作無法撤銷。
                    </p>

                    <div className="resident-info-card">
                        <div className="resident-info-row">
                            <span className="info-label">住戶編號：</span>
                            <span className="info-value">{resident.code}</span>
                        </div>
                        <div className="resident-info-row">
                            <span className="info-label">坪數：</span>
                            <span className="info-value">{resident.residentSqm} 坪</span>
                        </div>
                        {resident.email && (
                            <div className="resident-info-row">
                                <span className="info-label">電子信箱：</span>
                                <span className="info-value">{resident.email}</span>
                            </div>
                        )}
                        <div className="resident-info-row">
                            <span className="info-label">社區：</span>
                            <span className="info-value">{resident.community?.name || '-'}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="delete-error-alert">
                            {error}
                        </div>
                    )}
                </div>

                <div className="delete-modal-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="loading-spinner"></span>
                                刪除中...
                            </>
                        ) : (
                            '確認刪除'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal; 