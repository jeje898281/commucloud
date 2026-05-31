// frontend/src/pages/meetings/QRCodePage.jsx
import React, { useState, useEffect } from 'react';
import { generateQRCodes, listResidents } from '../../services/api';
import { useMeeting } from '../../contexts/MeetingContext';
import { getErrorMessage } from '../../constants/errorCodes';
import JSZip from 'jszip';
import '../../styles/QRCodePage.css';

function QRCodePage() {
    const { meeting, loading: meetingLoading } = useMeeting();
    const [residents, setResidents] = useState([]);
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // 載入住戶清單
    useEffect(() => {
        const fetchResidents = async () => {
            try {
                const response = await listResidents();
                setResidents(response.data.data || []);
            } catch (err) {
                console.error('載入住戶清單失敗:', err);

                // 使用錯誤代碼常數來獲取準確的錯誤訊息
                const errorCode = err.response?.data?.code;
                const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '無法載入住戶清單';
                setError(errorMessage);
            }
        };

        fetchResidents();
    }, []);

    // 建立住戶ID對應表（用於取得戶號）
    const getResidentCodeById = (residentId) => {
        const resident = residents.find(r => r.id === residentId);
        return resident ? resident.code : `住戶${residentId}`;
    };

    // 生成QR碼
    const handleGenerateQRCodes = async () => {
        if (!meeting?.id) {
            setError('無法取得會議資訊');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await generateQRCodes(meeting.id);
            setQrCodes(response.data.data || []);
        } catch (err) {
            console.error('生成QR碼失敗:', err);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = err.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '生成QR碼失敗，請稍後再試';
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    // 轉換Base64為Blob
    const base64ToBlob = (base64, mimeType) => {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    };

    // 下載所有QR碼為ZIP檔案
    const handleDownloadAll = async () => {
        if (qrCodes.length === 0) {
            setError('沒有可下載的QR碼');
            return;
        }

        setLoading(true);
        setDownloadProgress(0);

        try {
            const zip = new JSZip();
            const total = qrCodes.length;

            // 將每個QR碼添加到ZIP檔案
            qrCodes.forEach((qrCode, index) => {
                const residentCode = getResidentCodeById(qrCode.residentId);
                const fileName = `${residentCode}_QRCode.png`;
                const blob = base64ToBlob(qrCode.qrDataURL, 'image/png');

                zip.file(fileName, blob);

                // 更新進度
                setDownloadProgress(Math.round(((index + 1) / total) * 50));
            });

            // 生成ZIP檔案
            const zipBlob = await zip.generateAsync(
                { type: 'blob' },
                (metadata) => {
                    // 更新ZIP生成進度
                    const progress = 50 + Math.round(metadata.percent / 2);
                    setDownloadProgress(progress);
                }
            );

            // 創建下載鏈接
            const downloadUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${meeting.name || '會議'}_住戶QRCode.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 清理記憶體
            URL.revokeObjectURL(downloadUrl);

            setDownloadProgress(100);

            // 3秒後重置進度
            setTimeout(() => {
                setDownloadProgress(0);
            }, 3000);

        } catch (err) {
            console.error('下載ZIP檔案失敗:', err);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = err.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '下載失敗，請稍後再試';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // 下載單個QR碼
    const handleDownloadSingle = (qrCode) => {
        const residentCode = getResidentCodeById(qrCode.residentId);
        const fileName = `${residentCode}_QRCode.png`;

        const link = document.createElement('a');
        link.href = qrCode.qrDataURL;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (meetingLoading) {
        return (
            <div className="qrcode-page">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>載入會議資訊中...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="qrcode-page">
            <div className="qrcode-container">
                {/* 頁面標題 */}
                <div className="page-header">
                    <h1 className="page-title">住戶QR碼下載</h1>
                    <p className="page-subtitle">
                        為 <strong>{meeting?.name}</strong> 會議生成住戶簽到QR碼
                    </p>
                </div>

                {/* 錯誤提示 */}
                {error && (
                    <div className="error-alert">
                        <p>{error}</p>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setError(null)}
                        >
                            關閉
                        </button>
                    </div>
                )}

                {/* 操作區域 */}
                <div className="action-section">
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={handleGenerateQRCodes}
                            disabled={isGenerating || !meeting?.id}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    生成中...
                                </>
                            ) : (
                                <>
                                    生成 QR 碼
                                </>
                            )}
                        </button>

                        {qrCodes.length > 0 && (
                            <button
                                className="btn btn-success"
                                onClick={handleDownloadAll}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        打包中... {downloadProgress}%
                                    </>
                                ) : (
                                    <>
                                        下載全部 ({qrCodes.length} 個)
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* 下載進度條 */}
                    {loading && downloadProgress > 0 && (
                        <div className="progress-section">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${downloadProgress}%` }}
                                ></div>
                            </div>
                            <p className="progress-text">正在打包下載檔案... {downloadProgress}%</p>
                        </div>
                    )}
                </div>

                {/* QR碼列表 */}
                {qrCodes.length > 0 && (
                    <div className="qrcode-grid">
                        <div className="grid-header">
                            <h2>已生成的QR碼 ({qrCodes.length} 個)</h2>
                        </div>

                        <div className="qrcode-list">
                            {qrCodes.map((qrCode) => {
                                const residentCode = getResidentCodeById(qrCode.residentId);

                                return (
                                    <div key={qrCode.residentId} className="qrcode-item">
                                        <div className="qrcode-preview">
                                            <img
                                                src={qrCode.qrDataURL}
                                                alt={`${residentCode} QR碼`}
                                                className="qr-image"
                                            />
                                        </div>

                                        <div className="qrcode-info">
                                            <h3 className="resident-code">{residentCode}</h3>
                                            <p className="resident-id">住戶ID: {qrCode.residentId}</p>

                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleDownloadSingle(qrCode)}
                                            >
                                                下載
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 空狀態 */}
                {qrCodes.length === 0 && !isGenerating && (
                    <div className="empty-state">
                        <h3>尚未生成QR碼</h3>
                        <p>點擊「生成QR碼」按鈕為所有住戶創建簽到用的QR碼</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QRCodePage; 