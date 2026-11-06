// frontend/src/pages/meetings/VoteBallotsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMeetingBallots } from '../../services/api';
import { getErrorMessage } from '../../constants/errorCodes';
import '../../styles/VoteBallots.css';

function VoteBallotsPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getMeetingBallots(id)
            .then((res) => { setData(res.data.data); setError(null); })
            .catch((err) => {
                const code = err.response?.data?.code;
                setError(getErrorMessage(code) || err.response?.data?.message || '無法產生投票單');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="ballots-state">產生投票單中...</div>;
    if (error) return <div className="ballots-state">{error}</div>;
    if (!data) return null;

    const { meeting, ballots, proposalCount } = data;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    if (proposalCount === 0) {
        return <div className="ballots-state">本場會議尚無提案，請先建立提案再產生投票單。</div>;
    }

    return (
        <div className="ballots-root">
            <div className="ballots-toolbar no-print">
                <div>
                    <strong>{meeting.name}</strong>　共 {ballots.length} 戶 × {proposalCount} 提案
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>列印 / 另存 PDF</button>
            </div>

            {ballots.map((b) => (
                <div className="ballot-sheet" key={b.residentId}>
                    <div className="ballot-header">
                        <h1 className="ballot-meeting-name">{meeting.name}</h1>
                        <p className="ballot-meeting-date">{formatDate(meeting.date)}　住戶投票單</p>
                        <div className="ballot-resident">
                            <span>戶號：<strong>{b.code}</strong></span>
                            <span>持有坪數：{Number(b.residentSqm).toFixed(2)} 坪</span>
                        </div>
                    </div>

                    {b.proposals.map((p, idx) => (
                        <div className="ballot-proposal" key={p.proposalId}>
                            <h2 className="ballot-proposal-title">第 {idx + 1} 案：{p.title}</h2>
                            <p className="ballot-proposal-content">{p.content}</p>
                            <div className="ballot-options">
                                <div className="ballot-option">
                                    <div className="ballot-option-label">
                                        <span className="ballot-checkbox" />
                                        <span className="ballot-option-text agree">同意</span>
                                    </div>
                                    <div className="ballot-option-qr">
                                        <img className="ballot-qr" src={p.agreeQrDataURL} alt="同意 QR" />
                                        <div className="ballot-qr-hint">掃碼＝同意</div>
                                    </div>
                                </div>
                                <div className="ballot-option">
                                    <div className="ballot-option-label">
                                        <span className="ballot-checkbox" />
                                        <span className="ballot-option-text disagree">不同意</span>
                                    </div>
                                    <div className="ballot-option-qr">
                                        <img className="ballot-qr" src={p.disagreeQrDataURL} alt="不同意 QR" />
                                        <div className="ballot-qr-hint">掃碼＝不同意</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="ballot-footer">本投票單僅供本戶使用，請於各提案勾選後交回，或由秘書掃描對應 QR 碼計票。</div>
                </div>
            ))}
        </div>
    );
}

export default VoteBallotsPage;
