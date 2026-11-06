// src/pages/auth/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCommunityInfo, updateCommunityInfo } from '../../services/api';
import { getErrorMessage } from '../../constants/errorCodes';
import Toast from '../../components/Toast';
import '../../styles/CommunityPage.css';

export default function CommunityPage() {
  const { communityName, communityDescription, role, login } = useAuth();
  const [community, setCommunity] = useState({
    id: '',
    name: '',
    description: '',
    logoUrl: '',
    createdAt: '',
    updatedAt: '',
    stats: {
      totalResidents: 0,
      activeMeetings: 0
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // 載入社區資訊
  useEffect(() => {
    loadCommunityInfo();
  }, []);

  const loadCommunityInfo = async () => {
    try {
      setLoading(true);
      const response = await getCommunityInfo();
      if (response.status >= 200 && response.status < 300) {
        const communityData = response.data.data;
        setCommunity(communityData);
        setFormData({
          name: communityData.name || '',
          description: communityData.description || '',
          logoUrl: communityData.logoUrl || ''
        });
      } else {
        showToast('載入社區資訊失敗', 'error');
      }
    } catch (error) {
      console.error('載入社區資訊失敗:', error);

      // 使用錯誤代碼常數來獲取準確的錯誤訊息
      const errorCode = error.response?.data?.code;
      const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '載入社區資訊失敗';
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

  const handleSave = async () => {
    // 基本驗證
    if (!formData.name.trim()) {
      showToast('社區名稱不能為空', 'error');
      return;
    }

    if (formData.name.trim().length > 100) {
      showToast('社區名稱長度不能超過100個字元', 'error');
      return;
    }

    if (formData.description.trim().length > 500) {
      showToast('社區描述長度不能超過500個字元', 'error');
      return;
    }

    if (formData.logoUrl.trim().length > 255) {
      showToast('Logo URL長度不能超過255個字元', 'error');
      return;
    }

    try {
      setUpdating(true);
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logoUrl: formData.logoUrl.trim()
      };

      const response = await updateCommunityInfo(updateData);

      if (response.status >= 200 && response.status < 300) {
        const updatedCommunity = response.data.data;
        setCommunity(updatedCommunity);
        setIsEditing(false);
        showToast(response.data.message || '社區資訊更新成功', 'success');

        // 更新Context中的社區資訊
        const currentUserData = {
          token: localStorage.getItem('token'),
          username: localStorage.getItem('username'),
          displayName: localStorage.getItem('displayName'),
          community: {
            name: updatedCommunity.name,
            description: updatedCommunity.description
          },
          role: localStorage.getItem('role')
        };
        login(currentUserData);
      } else {
        showToast(response.data.message || '更新失敗', 'error');
      }
    } catch (error) {
      console.error('更新社區資訊失敗:', error);

      // 使用錯誤代碼常數來獲取準確的錯誤訊息
      const errorCode = error.response?.data?.code;
      const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '更新失敗，請稍後再試';
      showToast(errorMessage, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: community.name || '',
      description: community.description || '',
      logoUrl: community.logoUrl || ''
    });
    setIsEditing(false);
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  if (loading) {
    return (
      <div className="community-page">
        <div className="community-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>載入社區資訊中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <div className="community-container">
        <div className="community-header">
          <div className="header-content">
            <h1 className="page-title community-title">社區管理</h1>
          </div>
        </div>

        <div className="community-content">
          {/* 社區資訊卡片 */}
          <div className="community-info-card">
            <div className="card-header">
              <h2 className="card-title community-card-title">社區基本資訊</h2>
              {role === 'admin' && (
                <button
                  className="btn btn-sm btn-secondary community-edit-button"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={updating}
                >
                  {isEditing ? '取消' : '編輯'}
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="community-details">
                <div className="detail-item">
                  <label className="detail-label">社區名稱</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="請輸入社區名稱"
                      maxLength={100}
                      disabled={updating}
                    />
                  ) : (
                    <div className="detail-value">{community.name || '未設定'}</div>
                  )}
                </div>

                <div className="detail-item">
                  <label className="detail-label">社區描述</label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-input textarea"
                      rows="4"
                      placeholder="請輸入社區描述"
                      maxLength={500}
                      disabled={updating}
                    />
                  ) : (
                    <div className="detail-value description">
                      {community.description || '未設定社區描述'}
                    </div>
                  )}
                </div>

                <div className="detail-item">
                  <label className="detail-label">Logo URL</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="請輸入Logo URL"
                      maxLength={255}
                      disabled={updating}
                    />
                  ) : (
                    <div className="detail-value">{community.logoUrl || '未設定'}</div>
                  )}
                </div>

                <div className="detail-item">
                  <label className="detail-label">總住戶數</label>
                  <div className="detail-value">{community.stats.totalResidents} 戶</div>
                </div>

                <div className="detail-item">
                  <label className="detail-label">進行中會議</label>
                  <div className="detail-value">{community.stats.activeMeetings} 場</div>
                </div>
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={updating}
                  >
                    {updating ? '儲存中...' : '儲存變更'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={updating}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 快速操作 */}
          {role === 'admin' && (
            <div className="quick-actions-section">
              <div className="card-header">
                <h2 className="card-title community-card-title">快速操作</h2>
              </div>
              <div className="quick-actions-grid">
                <button className="action-card" disabled>
                  <span className="action-title">發佈開會通知</span>
                  <span className="action-subtitle">發送會議通知給住戶</span>
                </button>
                <button className="action-card" disabled>
                  <span className="action-title">住戶管理</span>
                  <span className="action-subtitle">管理住戶清單與資料</span>
                </button>
                <button className="action-card" disabled>
                  <span className="action-title">會議記錄</span>
                  <span className="action-subtitle">查看歷史會議記錄</span>
                </button>
                <button className="action-card" disabled>
                  <span className="action-title">系統設定</span>
                  <span className="action-subtitle">配置系統參數</span>
                </button>
              </div>
              <p className="actions-note">
                以上功能正在開發中，敬請期待
              </p>
            </div>
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
