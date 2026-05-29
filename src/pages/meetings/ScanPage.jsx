// frontend/src/pages/meetings/ScanPage.jsx
import React, { useState, useEffect } from 'react';
import QrScanner from '../../components/QrScanner';
import { scanAttendance, listResidents } from '../../services/api';
import { parseJWT, extractJWTFromQR } from '../../utils/jwtUtils';
import { useMeeting } from '../../contexts/MeetingContext';
import { getErrorMessage } from '../../constants/errorCodes';
import '../../styles/ScanPage.css';

function ScanPage() {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [residents, setResidents] = useState([]);
  const [scanCount, setScanCount] = useState(0);
  const { meeting } = useMeeting();

  // 載入住戶清單以便顯示戶號
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await listResidents();
        setResidents(response.data.data || []);
      } catch (err) {
        console.error('載入住戶清單失敗:', err);

        // 使用錯誤代碼常數來獲取準確的錯誤訊息
        const errorCode = err.response?.data?.code;
        const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '載入住戶清單失敗';
        console.error(errorMessage);
      }
    };
    fetchResidents();
  }, []);

  // 根據住戶ID獲取戶號
  const getResidentCodeById = (residentId) => {
    const resident = residents.find(r => r.id === residentId);
    return resident ? resident.code : `住戶${residentId}`;
  };

  // 處理掃描成功
  const handleScanSuccess = async (qrContent) => {
    console.log('收到掃描內容:', qrContent);

    setIsProcessing(true);
    setScanResult(null);

    try {
      const jwtToken = extractJWTFromQR(qrContent);
      if (!jwtToken) {
        setScanResult({
          type: 'error',
          code: 'INVALID_QR_CODE',
          message: '無效的QR碼',
          details: '此QR碼不包含有效的簽到資訊',
          residentCode: ''
        });
        return;
      }

      const payload = parseJWT(jwtToken);
      if (!payload || !payload.residentId || !payload.meetingId) {
        setScanResult({
          type: 'error',
          code: 'INVALID_QR_CODE',
          message: 'QR碼格式錯誤',
          details: 'QR碼不包含必要的會議或住戶資訊',
          residentCode: ''
        });
        return;
      }

      const residentCode = getResidentCodeById(payload.residentId);

      if (payload.meetingId !== meeting?.id) {
        setScanResult({
          type: 'error',
          code: 'MEETING_NOT_MATCH',
          message: '會議不匹配',
          details: `此QR碼屬於其他會議，無法在當前會議中使用`,
          residentCode: residentCode
        });
        return;
      }

      await scanAttendance(jwtToken);

      setScanResult({
        type: 'success',
        message: '報到成功',
        details: `${residentCode} 已成功完成報到`,
        residentCode: residentCode
      });

      setScanCount(prev => prev + 1);

    } catch (error) {
      console.error('簽到失敗:', error);

      const residentCode = (() => {
        try {
          const jwtToken = extractJWTFromQR(qrContent);
          if (jwtToken) {
            const payload = parseJWT(jwtToken);
            if (payload?.residentId) {
              return getResidentCodeById(payload.residentId);
            }
          }
        } catch (e) {
          // 忽略解析錯誤
        }
        return '';
      })();

      // 使用錯誤代碼常數來獲取準確的錯誤訊息
      const errorCode = error.response?.data?.code;
      let errorMessage = '報到失敗';
      let errorDetails = '系統發生錯誤，請稍後再試';

      if (errorCode) {
        const standardErrorMessage = getErrorMessage(errorCode);
        if (standardErrorMessage) {
          errorMessage = standardErrorMessage.includes('已經報到過') ? '重複報到' :
            standardErrorMessage.includes('其他會議') ? '會議不匹配' : '報到失敗';
          errorDetails = errorCode === 'ALREADY_CHECKED_IN' ?
            `${residentCode} 已經報到過，無需重複報到` :
            errorCode === 'MEETING_NOT_MATCH' ?
              `此QR碼屬於其他會議，無法在當前會議中使用` :
              standardErrorMessage;
        } else {
          errorDetails = `系統錯誤: ${errorCode}`;
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '網路錯誤';
        errorDetails = '無法連接到伺服器，請檢查網路連線';
      } else if (error.response?.data?.message) {
        errorDetails = error.response.data.message;
      }

      setScanResult({
        type: 'error',
        message: errorMessage,
        details: errorDetails,
        residentCode: residentCode
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 處理掃描錯誤
  const handleScanError = (errorMessage) => {
    console.error('掃描錯誤:', errorMessage);
    setScanResult({
      type: 'error',
      message: '掃描失敗',
      details: errorMessage || '無法辨識QR碼，請確保光線充足並對準掃描區域',
      residentCode: ''
    });
  };

  // 清除結果，準備下次掃描
  const clearResult = () => {
    setScanResult(null);
  };

  return (
    <div className="scan-page">
      {/* ======= 底下才是掃描 + 結果，已移除上方統計卡片 ======= */}
      <div className="scan-content">
        {/* 左側：掃描區塊 */}
        <div className="scanner-wrapper">
          <div className="scanner-frame">
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>

            <QrScanner
              onScanSuccess={handleScanSuccess}
              onError={handleScanError}
            />

            {isProcessing && (
              <div className="processing-overlay">
                <div className="processing-spinner"></div>
                <p>處理報到中...</p>
              </div>
            )}
          </div>
        </div>

        {/* 右側：掃描結果顯示區域 */}
        <div className="result-section">
          {scanResult ? (
            <div className={`result-card ${scanResult.type === 'success' ? 'success-card' : 'error-card'}`}>
              <h3>{scanResult.message}</h3>

              {scanResult.residentCode && (
                <div className="resident-info">
                  <span className="resident-label">住戶戶號:</span>
                  <span className="resident-code">{scanResult.residentCode}</span>
                </div>
              )}

              <p className="result-details">{scanResult.details}</p>

              <div className="result-actions">
                <button
                  className={`btn btn-sm ${scanResult.type === 'success' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={clearResult}
                >
                  繼續掃描
                </button>
              </div>
            </div>
          ) : (
            <div className="result-card waiting-card">
              <h3>等待掃描</h3>
              <p>請將QR碼對準掃描框進行簽到</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
