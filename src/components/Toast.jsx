import React, { useEffect } from 'react';
import '../styles/Toast.css';

function Toast({ message, type = 'success', isVisible, onClose, duration = 1500 }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-content">
                <span className="toast-dot"></span>
                <span className="toast-message">{message}</span>
            </div>
        </div>
    );
}

export default Toast; 