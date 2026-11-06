import React, { useEffect, useState } from 'react';
import {
  listAdminUsers, updateAdminUser, deactivateAdminUser
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/permissions';
import { getErrorMessage } from '../../constants/errorCodes';
import Toast from '../../components/Toast';
import CreateAdminUserModal from '../../components/CreateAdminUserModal';
import EditAdminUserModal from '../../components/EditAdminUserModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';
import '../../styles/AdminUsersPage.css';

export default function AdminUsersPage() {
  const { username: currentUsername } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [pwTarget, setPwTarget] = useState(null);

  const show = (msg, type = 'success') => setToast({ isVisible: true, message: msg, type });
  const hide = () => setToast(t => ({ ...t, isVisible: false }));

  const reload = async () => {
    try {
      setLoading(true);
      const res = await listAdminUsers();
      const list = [...res.data.data].sort((a, b) => {
        if (a.username === currentUsername) return -1;
        if (b.username === currentUsername) return 1;
        return 0;
      });
      setUsers(list);
    } catch (err) {
      show(getErrorMessage(err.response?.data?.code) || '載入失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleToggleActive = async (u) => {
    try {
      if (u.isActive) {
        await deactivateAdminUser(u.id);
        show(`已停用 ${u.displayName}`, 'success');
      } else {
        await updateAdminUser(u.id, { isActive: true });
        show(`已啟用 ${u.displayName}`, 'success');
      }
      reload();
    } catch (err) {
      show(getErrorMessage(err.response?.data?.code) || '操作失敗', 'error');
    }
  };

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">帳號管理</h1>
          <div className="page-subtitle">管理同社區的帳號、角色與啟用狀態</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          + 新增帳號
        </button>
      </div>

      {loading ? (
        <div className="admin-users-loading">
          <div className="spinner" />
          <p>載入帳號中…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-users-empty">
          <h3>目前沒有任何帳號</h3>
          <p>點右上「新增帳號」開始建立。</p>
        </div>
      ) : (
        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>使用者名稱</th>
                <th>顯示名稱</th>
                <th>角色</th>
                <th>狀態</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isSelf = u.username === currentUsername;
                return (
                  <tr key={u.id} className={isSelf ? 'is-self' : ''}>
                    <td>
                      <span className="username">{u.username}</span>
                      {isSelf && <span className="self-tag">你自己</span>}
                    </td>
                    <td className="display-name">{u.displayName}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? '啟用' : '已停用'}
                      </span>
                    </td>
                    <td className="col-actions">
                      {isSelf ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                          無法操作自己
                        </span>
                      ) : (
                        <div className="user-actions">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setEditTarget(u)}
                          >
                            編輯
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setPwTarget(u)}
                          >
                            重設密碼
                          </button>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.isActive ? '停用' : '啟用'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateAdminUserModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); reload(); show('帳號已建立', 'success'); }}
        onError={(msg) => show(msg, 'error')}
      />
      <EditAdminUserModal
        isOpen={!!editTarget}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => { setEditTarget(null); reload(); show('已更新', 'success'); }}
        onError={(msg) => show(msg, 'error')}
      />
      <ResetPasswordModal
        isOpen={!!pwTarget}
        user={pwTarget}
        onClose={() => setPwTarget(null)}
        onSuccess={() => { setPwTarget(null); show('密碼已重設', 'success'); }}
        onError={(msg) => show(msg, 'error')}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hide}
        duration={3000}
      />
    </div>
  );
}
