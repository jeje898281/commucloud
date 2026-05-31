// src/pages/meetings/MeetingListPage.jsx
import React, { useEffect, useState } from 'react';
import { listMeetings } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../constants/errorCodes';
import EditMeetingModal from '../../components/EditMeetingModal';
import Toast from '../../components/Toast';
import CreateMeetingModal from '../../components/CreateMeetingModal';
import NotifyResidentsModal from '../../components/NotifyResidentsModal';
import '../../styles/MeetingList.css';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../utils/permissions';

export default function MeetingListPage() {
  const { role } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [notifyMeetingTarget, setNotifyMeetingTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await listMeetings();
      setMeetings(res.data.data);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);

      // 使用錯誤代碼常數來獲取準確的錯誤訊息
      const errorCode = error.response?.data?.code;
      const errorMessage = getErrorMessage(errorCode) || error.response?.data?.message || '載入會議資料失敗';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchMeetings(); // 重新載入會議列表
    showToast('會議資料更新成功！', 'success');
  };

  const handleCreateMeeting = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenNotifyModal = (meeting) => {
    setNotifyMeetingTarget(meeting);
  };

  const handleCreateSuccess = () => {
    fetchMeetings(); // 重新載入會議列表
    showToast('會議新增成功！', 'success');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: '待開始', class: 'badge-warning' },
      'ongoing': { text: '進行中', class: 'badge-success' },
      'completed': { text: '已結束', class: 'badge-primary' },
      'cancelled': { text: '已取消', class: 'badge-error' }
    };

    const config = statusConfig[status] || { text: status, class: 'badge-primary' };
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  const filterMeetings = (meetings) => {
    if (activeFilter === 'all') return meetings;
    if (activeFilter === 'ongoing') return meetings.filter(m => m.status === 'ongoing');
    if (activeFilter === 'pending') return meetings.filter(m => m.status === 'pending');
    if (activeFilter === 'completed') return meetings.filter(m => m.status === 'completed');
    return meetings;
  };

  const filteredMeetings = filterMeetings(meetings);

  if (loading) {
    return (
      <div className="meeting-list-container">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">會議列表</h1>
          </div>
        </div>
        <div className="meetings-grid">
          {[0, 1, 2].map(i => (
            <div key={i} className="meeting-card-skeleton">
              <div className="skeleton sk-title"></div>
              <div className="skeleton sk-row"></div>
              <div className="skeleton sk-row sk-short"></div>
              <div className="sk-footer">
                <div className="skeleton sk-btn"></div>
                <div className="skeleton sk-btn"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-list-container">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            會議列表
          </h1>
        </div>
        <div className="header-actions">
          {can(role, 'meeting.write') && (
            <button className="btn btn-primary" onClick={handleCreateMeeting}>
              新增會議
            </button>
          )}
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          全部 ({meetings.length})
        </button>
        <button
          className={`filter-tab ${activeFilter === 'ongoing' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ongoing')}
        >
          進行中 ({meetings.filter(m => m.status === 'ongoing').length})
        </button>
        <button
          className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          待開始 ({meetings.filter(m => m.status === 'pending').length})
        </button>
        <button
          className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          已結束 ({meetings.filter(m => m.status === 'completed').length})
        </button>
      </div>

      {filteredMeetings.length === 0 ? (
        <div className="empty-state">
          <h3>目前沒有會議</h3>
          <p>
            {activeFilter === 'all'
              ? '尚未安排任何會議，請聯繫管理員'
              : `目前沒有${activeFilter === 'ongoing' ? '進行中' : activeFilter === 'pending' ? '待開始' : '已結束'}的會議`
            }
          </p>
          <button className="btn btn-secondary" onClick={fetchMeetings}>
            重新整理
          </button>
        </div>
      ) : (
        <div className="meetings-grid">
          {filteredMeetings.map(meeting => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-card-header">
                <h3 className="meeting-title">{meeting.name}</h3>
                {getStatusBadge(meeting.status)}
              </div>

              <div className="meeting-card-body">
                <div className="meeting-info">
                  <div className="info-item">
                    <span className="info-text">{formatDate(meeting.date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-text">
                      {new Date(meeting.date).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-text">坪數門檻: {meeting.sqmThreshold}%</span>
                  </div>
                  <div className="info-item">
                    <span className="info-text">戶數門檻: {meeting.residentThreshold} 戶</span>
                  </div>
                </div>
              </div>

              <div className="meeting-card-footer">
                <div className="button-group">
                  {can(role, 'meeting.write') && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEditMeeting(meeting)}
                      title="編輯會議"
                    >
                      編輯
                    </button>
                  )}
                  {can(role, 'meeting.notify') && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenNotifyModal(meeting)}
                      disabled={meeting.status === 'completed' || meeting.status === 'cancelled'}
                      title="通知住戶"
                    >
                      通知住戶
                    </button>
                  )}
                  {meeting.status === 'completed' || meeting.status === 'cancelled' ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/meetings/${meeting.id}/summary`)}
                    >
                      查看紀錄
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/meetings/${meeting.id}/scan`)}
                    >
                      進入會議
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 編輯會議彈窗 */}
      <EditMeetingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMeeting(null);
        }}
        onSuccess={handleEditSuccess}
        meeting={selectedMeeting}
      />

      {/* 新增會議彈窗 */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 通知住戶彈窗 */}
      <NotifyResidentsModal
        isOpen={!!notifyMeetingTarget}
        onClose={() => setNotifyMeetingTarget(null)}
        meeting={notifyMeetingTarget}
        onSuccess={(msg) => showToast(msg, 'success')}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* Toast 提示 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  );
}
