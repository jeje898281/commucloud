import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../constants/errorCodes';
import Toast from '../components/Toast';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
    const { displayName: contextDisplayName, login } = useAuth();
    const [profile, setProfile] = useState({
        id: '',
        username: '',
        displayName: '',
        role: '',
        createdAt: '',
        updatedAt: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ displayName: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // 載入個人資料
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getProfile();
            if (response.status >= 200 && response.status < 300) {
                setProfile(response.data.data);
                setFormData({ displayName: response.data.data.displayName });
            } else {
                showToast('載入個人資料失敗', 'error');
            }
        } catch (error) {
            console.error('載入個人資料失敗:', error);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '載入個人資料失敗';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.displayName.trim()) {
            showToast('顯示名稱不能為空', 'error');
            return;
        }

        if (formData.displayName.trim().length > 50) {
            showToast('顯示名稱長度不能超過50個字元', 'error');
            return;
        }

        try {
            setUpdating(true);
            const response = await updateProfile(formData);
            console.log('response', response);
            console.log('formData', formData);
            if (response.status >= 200 && response.status < 300) {
                // 手動更新 profile state，保留原有完整數據
                setProfile(prevProfile => ({
                    ...prevProfile,
                    displayName: formData.displayName,
                    updatedAt: new Date().toISOString()
                }));

                setIsEditing(false);
                showToast('資料更新成功', 'success');

                // 更新Context中的displayName
                const currentUserData = {
                    token: localStorage.getItem('token'),
                    username: localStorage.getItem('username'),
                    displayName: formData.displayName,
                    community: {
                        name: localStorage.getItem('communityName'),
                        description: localStorage.getItem('communityDescription')
                    },
                    role: localStorage.getItem('role')
                };
                login(currentUserData);
            } else {
                showToast(response.data.message || '更新失敗', 'error');
            }
        } catch (error) {
            console.error('更新個人資料失敗:', error);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = error.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '更新失敗，請稍後再試';
            showToast(errorMessage, 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({ displayName: profile.displayName });
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast({ show: false, message: '', type: '' });
    };

    const getRoleText = (role) => {
        const roleMap = {
            admin: '系統管理員',
            manager: '管理員',
            meeting_assistant: '會議助理'
        };
        return roleMap[role] || role;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('zh-TW');
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="loading">載入中...</div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>個人資料</h1>
                    {!isEditing && (
                        <button
                            className="btn-edit"
                            onClick={() => setIsEditing(true)}
                        >
                            編輯資料
                        </button>
                    )}
                </div>

                <div className="profile-content">
                    {!isEditing ? (
                        // 顯示模式
                        <div className="profile-info">
                            <div className="info-group">
                                <label>用戶ID</label>
                                <span>{profile.id}</span>
                            </div>

                            <div className="info-group">
                                <label>用戶名</label>
                                <span>{profile.username}</span>
                            </div>

                            <div className="info-group">
                                <label>顯示名稱</label>
                                <span>{profile.displayName}</span>
                            </div>

                            <div className="info-group">
                                <label>角色</label>
                                <span>{getRoleText(profile.role)}</span>
                            </div>

                            <div className="info-group">
                                <label>註冊時間</label>
                                <span>{formatDateTime(profile.createdAt)}</span>
                            </div>

                            <div className="info-group">
                                <label>最後更新</label>
                                <span>{formatDateTime(profile.updatedAt)}</span>
                            </div>
                        </div>
                    ) : (
                        // 編輯模式
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label>用戶ID</label>
                                <input type="text" value={profile.id} disabled />
                            </div>

                            <div className="form-group">
                                <label>用戶名</label>
                                <input type="text" value={profile.username} disabled />
                            </div>

                            <div className="form-group">
                                <label>顯示名稱 *</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    maxLength={50}
                                    required
                                />
                                <small>最多50個字元</small>
                            </div>

                            <div className="form-group">
                                <label>角色</label>
                                <input type="text" value={getRoleText(profile.role)} disabled />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancelEdit}
                                    disabled={updating}
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                    disabled={updating}
                                >
                                    {updating ? '儲存中...' : '儲存'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                    duration={3000}
                />
            )}
        </div>
    );
} 