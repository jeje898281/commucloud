//src/pages/meetings/ManualCheckIn.jsx
import React, { useState } from 'react';
import { manualCheckIn } from '../../services/api';
import { useMeeting } from '../../contexts/MeetingContext';
import '../../styles/ManualCheckIn.css';

function ManualCheckIn() {
  const [unitCode, setUnitCode] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success', 'error', 'warning'
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const { meeting } = useMeeting();
  const meetingId = meeting?.id;

  const handleCheckIn = async (e) => {
    e.preventDefault();

    if (!unitCode.trim()) {
      setMsg('請輸入戶號');
      setMsgType('warning');
      return;
    }

    const code = unitCode.trim().toUpperCase();
    setLoading(true);
    setMsg('');

    try {
      await manualCheckIn({ meetingId, residentCode: code });
      setMsg(`${code} 報到成功！`);
      setMsgType('success');
      setUnitCode('');
      setSuccessCount(prev => prev + 1);
    } catch (err) {
      if (err.response?.data?.code === 'ALREADY_CHECKED_IN') {
        setMsg(`${code} 已報到過`);
        setMsgType('warning');
      } else if (err.response?.data?.code === 'RESIDENT_NOT_FOUND') {
        setMsg(`查無此戶號：${code}`);
        setMsgType('error');
      } else {
        setMsg('報到失敗，請稍後再試');
        setMsgType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    setMsg('');
    setMsgType('');
  };

  return (
    <div className="manual-checkin-page">
      <div className="manual-checkin-container">
        <div className="checkin-content">
          <div className="checkin-form-card">
            <div className="card-header">
              <h2 className="card-title">
                輸入戶號
              </h2>
            </div>

            <div className="card-body">
              <form onSubmit={handleCheckIn} className="checkin-form">
                <div className="form-group">
                  <label htmlFor="unitCode" className="form-label">
                    戶號
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="unitCode"
                      type="text"
                      placeholder="請輸入戶號 (例：A101)"
                      value={unitCode}
                      onChange={(e) => setUnitCode(e.target.value)}
                      className="form-input"
                      disabled={loading}
                      autoComplete="off"
                    />
                    <div className="input-hint">
                      <span>格式範例：A101、B205、C301</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary checkin-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner-btn"></span>
                      處理中...
                    </>
                  ) : (
                    <>
                      確認報到
                    </>
                  )}
                </button>
              </form>

              {msg && (
                <div className={`result-message ${msgType}-message`}>
                  <div className="message-content">
                    <span className="message-text">{msg}</span>
                  </div>
                  <button
                    className="message-close"
                    onClick={clearMessage}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="instructions-card">
            <div className="card-header">
              <h3 className="card-title">
                使用說明
              </h3>
            </div>
            <div className="card-body">
              <div className="instructions-list">
                <div className="instruction-item">
                  <span className="instruction-icon">1</span>
                  <div className="instruction-content">
                    <h4>輸入戶號</h4>
                    <p>請輸入完整的戶號，如：A101、B205</p>
                  </div>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">2</span>
                  <div className="instruction-content">
                    <h4>確認報到</h4>
                    <p>檢查戶號無誤後，點擊確認報到按鈕</p>
                  </div>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">3</span>
                  <div className="instruction-content">
                    <h4>查看結果</h4>
                    <p>系統會顯示報到結果，成功則可繼續下一位</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualCheckIn;
