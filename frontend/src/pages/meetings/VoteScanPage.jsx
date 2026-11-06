// frontend/src/pages/meetings/VoteScanPage.jsx
import React, { useState } from 'react';
import QrScanner from '../../components/QrScanner';
import { voteByQRCode } from '../../services/api';
import { extractJWTFromQR } from '../../utils/jwtUtils';
import { useMeeting } from '../../contexts/MeetingContext';
import { getErrorMessage } from '../../constants/errorCodes';
import '../../styles/ScanPage.css';

const RESULT_LABELS = { agree: '同意', disagree: '不同意', void: '廢票' };

function VoteScanPage() {
    const { meeting } = useMeeting();
    const [scanResult, setScanResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [voteCount, setVoteCount] = useState(0);

    const handleScanSuccess = async (qrContent) => {
        setIsProcessing(true);
        setScanResult(null);
        try {
            const token = extractJWTFromQR(qrContent);
            if (!token) {
                setScanResult({ type: 'error', message: '無效的 QR 碼', details: '此 QR 碼不是有效的投票票券' });
                return;
            }

            const res = await voteByQRCode(token);
            const data = res.data.data;

            setScanResult({
                type: 'success',
                message: '計票成功',
                details: `${data.residentCode}　投下「${RESULT_LABELS[data.result] || data.result}」`,
                proposalTitle: data.proposalTitle,
                residentCode: data.residentCode,
            });
            setVoteCount((n) => n + 1);
        } catch (error) {
            const code = error.response?.data?.code;
            const msg = getErrorMessage(code) || error.response?.data?.message || '計票失敗，請稍後再試';
            setScanResult({ type: 'error', message: code === 'ALREADY_VOTED' ? '重複投票' : '計票失敗', details: msg });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleScanError = (errorMessage) => {
        console.error('掃描錯誤:', errorMessage);
    };

    return (
        <div className="scan-page">
            <div className="scan-content">
                <div className="scanner-wrapper">
                    <div className="scanner-frame">
                        <div className="corner corner-tl"></div>
                        <div className="corner corner-tr"></div>
                        <div className="corner corner-bl"></div>
                        <div className="corner corner-br"></div>

                        <QrScanner onScanSuccess={handleScanSuccess} onError={handleScanError} />

                        {isProcessing && (
                            <div className="processing-overlay">
                                <div className="processing-spinner"></div>
                                <p>計票中...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="result-section">
                    <div className="vote-scan-meta">
                        <span>會議：{meeting?.name}</span>
                        <span>本次已計票：{voteCount} 張</span>
                    </div>

                    {scanResult ? (
                        <div className={`result-card ${scanResult.type === 'success' ? 'success-card' : 'error-card'}`}>
                            <h3>{scanResult.message}</h3>
                            {scanResult.proposalTitle && (
                                <div className="resident-info">
                                    <span className="resident-label">提案：</span>
                                    <span className="resident-code">{scanResult.proposalTitle}</span>
                                </div>
                            )}
                            <p className="result-details">{scanResult.details}</p>
                            <div className="result-actions">
                                <button
                                    className={`btn btn-sm ${scanResult.type === 'success' ? 'btn-success' : 'btn-secondary'}`}
                                    onClick={() => setScanResult(null)}
                                >
                                    繼續掃描
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="result-card waiting-card">
                            <h3>等待掃描</h3>
                            <p>掃描投票單上「同意 / 不同意」旁的 QR 碼即可直接記票</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VoteScanPage;
