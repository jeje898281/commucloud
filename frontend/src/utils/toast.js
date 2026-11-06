// 提示工具 - 純 JavaScript 實現
let toastContainer = null;
let toastId = 0;

// 創建提示容器
const createToastContainer = () => {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
};

// 獲取圖標
const getIcon = (type) => {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '✅';
    }
};

// 顯示提示
const showToast = (type, message, duration = 2000) => {
    const container = createToastContainer();
    const id = ++toastId;

    // 創建提示元素
    const toastElement = document.createElement('div');
    toastElement.className = `toast-item toast-${type}`;
    toastElement.setAttribute('data-toast-id', id);

    toastElement.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getIcon(type)}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

    container.appendChild(toastElement);

    // 顯示動畫
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 50);

    // 自動移除
    setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toastElement)) {
                container.removeChild(toastElement);
            }

            // 如果沒有其他提示了，移除容器
            if (container.children.length === 0) {
                document.body.removeChild(container);
                toastContainer = null;
            }
        }, 300);
    }, duration);

    return id;
};

// 導出提示函數
export const toast = {
    success: (message, duration = 2000) => {
        return showToast('success', message, duration);
    },

    error: (message, duration = 3000) => {
        return showToast('error', message, duration);
    },

    warning: (message, duration = 2500) => {
        return showToast('warning', message, duration);
    },

    info: (message, duration = 2000) => {
        return showToast('info', message, duration);
    }
};

export default toast; 