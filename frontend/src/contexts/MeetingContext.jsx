//src/contexts/MeetingContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeetingById } from '../services/api';
import { getErrorMessage } from '../constants/errorCodes';

const MeetingContext = createContext(null);

export function MeetingProvider({ meetingId, children }) {
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!meetingId) return;

        setLoading(true);
        setError(null);

        getMeetingById(meetingId)
            .then(res => {
                setMeeting(res.data.data);
                setError(null);
            })
            .catch(err => {
                console.error('載入會議資料失敗:', err);

                // 使用錯誤代碼常數來獲取準確的錯誤訊息
                const errorCode = err.response?.data?.code;
                const errorMessage = getErrorMessage(errorCode) || err.response?.data?.message || '載入會議資料失敗';
                setError(errorMessage);
                setMeeting(null);
            })
            .finally(() => setLoading(false));
    }, [meetingId]);

    return (
        <MeetingContext.Provider value={{ meeting, loading, error }}>
            {children}
        </MeetingContext.Provider>
    );
}

export const useMeeting = () => useContext(MeetingContext);
