//src/pages/meetings/SummaryPage.jsx
import React, { useEffect, useState } from 'react';
import { getAttendanceSummary, getAttendanceRecords } from '../../services/api';
import { getErrorMessage } from '../../constants/errorCodes';
import '../../styles/Summary.css';
import { useMeeting } from '../../contexts/MeetingContext';

function Summary() {
  const { meeting } = useMeeting();
  const meetingId = meeting.id;
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!meetingId) return;

    Promise.all([
      getAttendanceSummary(meetingId),
      getAttendanceRecords(meetingId),
    ])
      .then(([summaryRes, recordsRes]) => {
        setSummary(summaryRes.data.data);
        setRecords(recordsRes.data.data || []);
        setError(null);
      })
      .catch((err) => {
        console.error('取得統計失敗:', err);

        // 使用錯誤代碼常數來獲取準確的錯誤訊息
        const errorCode = err.response?.data?.code;
        const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '無法取得統計數據';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) {
    return (
      <div className="summary-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>載入統計資料中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-page">
        <div className="error-container">
          <div className="error-icon"></div>
          <h3>載入失敗</h3>
          <p className="error-message">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const {
    residentAttendanceCount,
    totalAttendanceSqm,
    totalCommunitySqm,
    sqmPercent,
    residentThreshold,
    sqmThreshold,
    reachedResidentThreshold,
    reachedSqmThreshold
  } = summary;

  const residentProgress = residentThreshold > 0 ? (residentAttendanceCount / residentThreshold) * 100 : 100;
  const sqmProgress = sqmThreshold > 0 ? (sqmPercent / sqmThreshold) * 100 : 100;
  const allThresholdReached = reachedResidentThreshold && reachedSqmThreshold;

  return (
    <div className="summary-page">
      <div className="summary-container">
        {/* 會議狀態總覽 */}
        <div className="meeting-status-card">
          <div className="status-header">
            <h1 className="meeting-title">出席統計</h1>
            <div className={`meeting-status-badge ${allThresholdReached ? 'success' : 'warning'}`}>
              {allThresholdReached ? '可順利開會' : '門檻未達成'}
            </div>
          </div>

          <div className="threshold-grid">
            {/* 戶數統計 */}
            <div className="threshold-item">
              <div className="threshold-header">
                <div className="threshold-icon"></div>
                <div className="threshold-info">
                  <h3>出席戶數</h3>
                  <div className="threshold-values">
                    <span className="current-value">{residentAttendanceCount}</span>
                    <span className="divider">/</span>
                    <span className="target-value">{residentThreshold}</span>
                    <span className="unit">戶</span>
                  </div>
                </div>

              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${reachedResidentThreshold ? 'reached' : ''}`}
                    style={{ width: `${Math.min(residentProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {residentProgress.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* 坪數統計 */}
            <div className="threshold-item">
              <div className="threshold-header">
                <div className="threshold-icon"></div>
                <div className="threshold-info">
                  <h3>出席坪數比例</h3>
                  <div className="threshold-values">
                    <span className="current-value">{sqmPercent.toFixed(1)}</span>
                    <span className="unit">%</span>
                    <span className="divider">/</span>
                    <span className="target-value">{sqmThreshold}</span>
                    <span className="unit">%</span>
                  </div>
                  <div className="threshold-subtext">
                    出席 {totalAttendanceSqm.toFixed(1)} 坪 / 全社區 {totalCommunitySqm.toFixed(1)} 坪
                  </div>
                </div>

              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${reachedSqmThreshold ? 'reached' : ''}`}
                    style={{ width: `${Math.min(sqmProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {sqmProgress.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* 整體狀態說明 */}
          <div className="status-summary">
            <div className="summary-content">
              {allThresholdReached ? (
                <div className="success-message">
                  <span className="message-icon"></span>
                  <span>達成全部門檻，會議可以順利進行！</span>
                </div>
              ) : (
                <div className="warning-message">
                  <span className="message-icon"></span>
                  <span>
                    {!reachedResidentThreshold && !reachedSqmThreshold ?
                      '戶數和坪數門檻都尚未達成' :
                      !reachedResidentThreshold ?
                        '戶數門檻尚未達成' :
                        '坪數門檻尚未達成'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 報到名單 */}
        <div className="attendance-records-card">
          <div className="records-header">
            <h2>報到名單</h2>
            <span className="records-count">共 {records.length} 筆</span>
          </div>
          {records.length === 0 ? (
            <div className="records-empty">尚無報到紀錄</div>
          ) : (
            <div className="records-table-wrap">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>戶號</th>
                    <th>坪數</th>
                    <th>報到時間</th>
                    <th>方式</th>
                    <th>經辦人</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{r.residentCode}</td>
                      <td>{r.residentSqm}</td>
                      <td>{new Date(r.checkedInAt).toLocaleString('zh-TW')}</td>
                      <td>
                        <span className={`method-badge ${r.isManual ? 'manual' : 'qr'}`}>
                          {r.isManual ? '手動' : '掃碼'}
                        </span>
                      </td>
                      <td>{r.handledBy || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Summary;
