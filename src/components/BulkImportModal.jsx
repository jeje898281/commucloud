import React, { useState } from 'react';
import { bulkImportResidents } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';
import Toast from './Toast';
import '../styles/BulkImportModal.css';
import '../styles/modal-enhanced.css';

function BulkImportModal({ isOpen, onClose, onSuccess }) {
    const [csvFile, setCsvFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: 選擇檔案, 2: 預覽資料, 3: 匯入結果
    const [error, setError] = useState('');
    const [importResult, setImportResult] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // 下載CSV模板
    const downloadTemplate = () => {
        const csvContent = [
            ['戶號', '坪數', '電子信箱'],
            ['A101', '33.5', 'a101@example.com'],
            ['B202', '28.8', 'b202@example.com'],
            ['C303', '45.2', '']
        ];

        const csvString = csvContent.map(row =>
            row.map(field => `"${field}"`).join(',')
        ).join('\n');

        const blob = new Blob(['\uFEFF' + csvString], {
            type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', '住戶匯入模板.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 解析CSV內容
    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV檔案格式錯誤：至少需要標題行和一行數據');
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const expectedHeaders = ['戶號', '坪數', '電子信箱'];
        
        if (!expectedHeaders.every(header => headers.includes(header))) {
            throw new Error(`CSV檔案標題行格式錯誤，應包含：${expectedHeaders.join(', ')}`);
        }

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            if (values.length >= 2) {
                data.push({
                    code: values[0] || '',
                    residentSqm: parseFloat(values[1]) || 0,
                    email: values[2] || ''
                });
            }
        }

        return data;
    };

    // 處理檔案上傳
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setError('請選擇CSV格式的檔案');
            return;
        }

        setCsvFile(file);
        setError('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const data = parseCSV(text);
                
                setCsvData(data);
                setPreviewData(data.slice(0, 10)); // 只預覽前10筆
                setStep(2);
            } catch (err) {
                setError(err.message);
                setCsvFile(null);
            }
        };
        reader.readAsText(file, 'utf-8');
    };

    // 觸發文件選擇
    const triggerFileSelect = () => {
        document.getElementById('csv-file-input').click();
    };

    // 驗證資料
    const validateData = (data) => {
        const errors = [];
        
        data.forEach((item, index) => {
            if (!item.code || item.code.trim() === '') {
                errors.push(`第 ${index + 2} 行：戶號不能為空`);
            }
            if (!item.residentSqm || item.residentSqm <= 0) {
                errors.push(`第 ${index + 2} 行：坪數必須大於0`);
            }
            if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
                errors.push(`第 ${index + 2} 行：電子信箱格式錯誤`);
            }
        });

        return errors;
    };

    // 執行匯入
    const handleImport = async () => {
        const validationErrors = validateData(csvData);
        if (validationErrors.length > 0) {
            setError(validationErrors.join('\n'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await bulkImportResidents({ residents: csvData });
            setImportResult(response.data);
            setStep(3);

            if (response.status >= 200 && response.status < 300) {
                showToast(`成功匯入 ${response.data.importedCount} 筆住戶資料`, 'success');
                onSuccess();
            } else {
                showToast('匯入完成，但有部分資料未成功', 'warning');
            }
        } catch (err) {
            console.error('Import error:', err);

            // 使用錯誤代碼常數來獲取準確的錯誤訊息
            const errorCode = err.response?.data?.code;
            const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '匯入失敗，請稍後再試';
            setError(errorMessage);
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

    const handleClose = () => {
        if (!loading) {
            setCsvFile(null);
            setCsvData([]);
            setPreviewData([]);
            setStep(1);
            setError('');
            setImportResult(null);
            onClose();
        }
    };

    const resetToStep1 = () => {
        setCsvFile(null);
        setCsvData([]);
        setPreviewData([]);
        setStep(1);
        setError('');
        setImportResult(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-content bulk-import-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">批量匯入住戶</h2>
                        <button
                            className="modal-close-btn"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            ×
                        </button>
                    </div>

                    <div className="modal-body">
                        {step === 1 && (
                            <div className="step-content">
                                <div className="instruction-section">
                                    <h3>匯入說明</h3>
                                    <ul className="instruction-list">
                                        <li><strong>戶號</strong>：住戶的唯一識別碼（必填）</li>
                                        <li><strong>坪數</strong>：住戶的坪數，支援小數點（必填）</li>
                                        <li><strong>電子信箱</strong>：住戶的聯絡信箱（選填）</li>
                                    </ul>

                                    <div className="template-section">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={downloadTemplate}
                                        >
                                            下載CSV模板
                                        </button>
                                        <p className="template-hint">
                                            建議先下載模板，按照格式填寫資料後再上傳
                                        </p>
                                    </div>
                                </div>

                                <div className="upload-section">
                                    <h3>選擇檔案</h3>
                                    
                                    <div className="upload-area" onClick={triggerFileSelect}>
                                        <div className="upload-icon" aria-hidden="true"></div>
                                        <div className="upload-text">
                                            {csvFile ? csvFile.name : '點擊選擇CSV檔案'}
                                        </div>
                                        <div className="upload-hint">
                                            支援CSV格式，檔案大小不超過10MB
                                        </div>
                                    </div>

                                    <input
                                        id="csv-file-input"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="file-input"
                                        disabled={loading}
                                    />
                                    
                                    {error && (
                                        <div className="error-message">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content">
                                <div className="preview-header">
                                    <h3>資料預覽</h3>
                                    <p>共 {csvData.length} 筆資料，以下顯示前 {Math.min(csvData.length, 10)} 筆：</p>
                                </div>

                                <div className="preview-table-container">
                                    <table className="preview-table">
                                        <thead>
                                            <tr>
                                                <th>戶號</th>
                                                <th>坪數</th>
                                                <th>電子信箱</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.code}</td>
                                                    <td>{row.residentSqm}</td>
                                                    <td>{row.email || '（無）'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {csvData.length > 10 && (
                                    <p className="more-data-hint">
                                        ... 還有 {csvData.length - 10} 筆資料
                                    </p>
                                )}
                            </div>
                        )}

                        {step === 3 && importResult && (
                            <div className="step-content">
                                <div className="result-section">
                                    <h3>匯入結果</h3>

                                    {importResult.success ? (
                                        <div className="success-result">
                                            <div className="result-icon">✓</div>
                                            <p>成功匯入 <strong>{importResult.importedCount}</strong> 筆住戶資料</p>
                                        </div>
                                    ) : (
                                        <div className="partial-result">
                                            <div className="result-icon">!</div>
                                            <p>{importResult.message}</p>

                                            {importResult.conflictedCodes && (
                                                <div className="conflict-section">
                                                    <h4>重複的戶號：</h4>
                                                    <div className="conflict-codes">
                                                        {importResult.conflictedCodes.map((code, index) => (
                                                            <span key={index} className="conflict-code">{code}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {importResult.invalidRows && (
                                                <div className="invalid-section">
                                                    <h4>格式錯誤的資料：</h4>
                                                    <div className="invalid-rows">
                                                        {importResult.invalidRows.map((row, index) => (
                                                            <div key={index} className="invalid-row">
                                                                第 {row.index} 行：{row.errors.join('、')}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        {step === 1 && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                取消
                            </button>
                        )}

                        {step === 2 && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={resetToStep1}
                                    disabled={loading}
                                >
                                    重新選擇
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleImport}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            匯入中...
                                        </>
                                    ) : (
                                        `確認匯入 ${csvData.length} 筆資料`
                                    )}
                                </button>
                            </>
                        )}

                        {step === 3 && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleClose}
                            >
                                完成
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={1500}
            />
        </>
    );
}

export default BulkImportModal; 