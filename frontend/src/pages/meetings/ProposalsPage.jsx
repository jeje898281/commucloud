// frontend/src/pages/meetings/ProposalsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { listProposals, deleteProposal } from '../../services/api';
import { useMeeting } from '../../contexts/MeetingContext';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../utils/permissions';
import { getErrorMessage } from '../../constants/errorCodes';
import CreateProposalModal from '../../components/CreateProposalModal';
import '../../styles/ProposalsPage.css';

function ProposalsPage() {
    const { id } = useParams();
    const { meeting } = useMeeting();
    const { role } = useAuth();
    const canWrite = can(role, 'meeting.write');

    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const fetchProposals = useCallback(() => {
        if (!meeting?.id) return;
        setLoading(true);
        listProposals(meeting.id)
            .then((res) => {
                setProposals(res.data.data || []);
                setError(null);
            })
            .catch((err) => {
                const code = err.response?.data?.code;
                setError(getErrorMessage(code) || err.response?.data?.message || '無法載入提案');
            })
            .finally(() => setLoading(false));
    }, [meeting]);

    useEffect(() => { fetchProposals(); }, [fetchProposals]);

    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (p) => { setEditing(p); setModalOpen(true); };

    const handleDelete = async (p) => {
        if (!window.confirm(`確定要刪除提案「${p.title}」嗎？相關投票紀錄也會一併刪除。`)) return;
        try {
            await deleteProposal(p.id);
            fetchProposals();
        } catch (err) {
            const code = err.response?.data?.code;
            alert(getErrorMessage(code) || '刪除失敗');
        }
    };

    const openBallots = () => {
        window.open(`/meetings/${id}/ballots`, '_blank', 'noopener');
    };

    if (loading) {
        return <div className="proposals-page"><div className="proposals-state">載入提案中...</div></div>;
    }

    return (
        <div className="proposals-page">
            <div className="proposals-container">
                <div className="proposals-header">
                    <div>
                        <h1 className="proposals-title">提案投票</h1>
                        <p className="proposals-subtitle">{meeting?.name}</p>
                    </div>
                    <div className="proposals-actions">
                        {proposals.length > 0 && (
                            <button className="btn btn-secondary" onClick={openBallots}>
                                產生投票單（批量列印）
                            </button>
                        )}
                        {canWrite && (
                            <button className="btn btn-primary" onClick={openCreate}>新增提案</button>
                        )}
                    </div>
                </div>

                {error && <div className="error-alert">{error}</div>}

                {proposals.length === 0 ? (
                    <div className="proposals-empty">
                        <h3>尚無提案</h3>
                        <p>{canWrite ? '點擊「新增提案」建立本場會議的第一個提案。' : '本場會議尚未建立提案。'}</p>
                    </div>
                ) : (
                    <div className="proposal-list">
                        {proposals.map((p) => (
                            <ProposalCard
                                key={p.id}
                                proposal={p}
                                canWrite={canWrite}
                                onEdit={() => openEdit(p)}
                                onDelete={() => handleDelete(p)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateProposalModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchProposals}
                meeting={meeting}
                proposal={editing}
            />
        </div>
    );
}

function ProposalCard({ proposal, canWrite, onEdit, onDelete }) {
    const {
        title, content, sqmThreshold, residentThreshold,
        agreeCount, disagreeCount, voidCount, totalCount,
        agreeSqmPercent, reachedResidentThreshold, reachedSqmThreshold, passed
    } = proposal;

    return (
        <div className="proposal-card">
            <div className="proposal-card-header">
                <h3 className="proposal-card-title">{title}</h3>
                <span className={`proposal-badge ${passed ? 'passed' : 'pending'}`}>
                    {passed ? '已達通過門檻' : '未達門檻'}
                </span>
            </div>
            <p className="proposal-card-content">{content}</p>

            <div className="proposal-stats">
                <div className="stat-pill agree">同意 {agreeCount} 戶</div>
                <div className="stat-pill disagree">不同意 {disagreeCount} 戶</div>
                <div className="stat-pill void">廢票 {voidCount}</div>
                <div className="stat-pill total">已計票 {totalCount}</div>
            </div>

            <div className="proposal-thresholds">
                <div className={`threshold-line ${reachedResidentThreshold ? 'ok' : ''}`}>
                    同意戶數：{agreeCount} / 門檻 {residentThreshold} 戶 {reachedResidentThreshold ? '✓' : ''}
                </div>
                <div className={`threshold-line ${reachedSqmThreshold ? 'ok' : ''}`}>
                    同意坪數：{agreeSqmPercent.toFixed(1)}% / 門檻 {sqmThreshold}% {reachedSqmThreshold ? '✓' : ''}
                </div>
            </div>

            {canWrite && (
                <div className="proposal-card-actions">
                    <button className="btn btn-sm btn-outline" onClick={onEdit}>編輯</button>
                    <button className="btn btn-sm btn-secondary" onClick={onDelete}>刪除</button>
                </div>
            )}
        </div>
    );
}

export default ProposalsPage;
