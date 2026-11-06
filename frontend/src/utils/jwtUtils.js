/**
 * 解析JWT token 獲取payload
 * @param {string} token - JWT token
 * @returns {object|null} - 解析後的payload，失敗返回null
 */
export function parseJWT(token) {
    try {
        // JWT格式: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        // 解析payload (第二部分)
        const payload = parts[1];

        // Base64URL解碼
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

        // 轉換為JSON物件
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('JWT解析失敗:', error);
        return null;
    }
}

/**
 * 驗證JWT是否有效(基本格式檢查)
 * @param {string} token - JWT token
 * @returns {boolean} - 是否為有效格式
 */
export function isValidJWT(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }

    const parts = token.split('.');
    return parts.length === 3;
}

/**
 * 從QR碼內容中提取JWT token
 * @param {string} qrContent - QR碼掃描內容
 * @returns {string|null} - 提取的JWT token，失敗返回null
 */
export function extractJWTFromQR(qrContent) {
    try {
        // 如果直接是JWT格式
        if (isValidJWT(qrContent)) {
            return qrContent;
        }

        // 如果是URL格式，嘗試從參數中提取
        if (qrContent.includes('token=')) {
            const urlParams = new URLSearchParams(qrContent.split('?')[1]);
            const token = urlParams.get('token');
            if (token && isValidJWT(token)) {
                return token;
            }
        }

        return null;
    } catch (error) {
        console.error('提取JWT失敗:', error);
        return null;
    }
} 