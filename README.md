# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

1. 了解專案結構
在用 create-react-app 建立的專案中，關鍵的預設檔案結構大致如下：

csharp
複製程式碼
community-front-app/
├─ node_modules/        # npm 安裝的套件
├─ public/              # 靜態檔案 (favicon, index.html等)
├─ src/
│   ├─ App.js           # 主要的 React Component 起始檔案
│   ├─ index.js         # ReactDOM.render or createRoot 的地方
│   └─ ...
├─ package.json         # npm 套件配置
└─ ...
src/App.js：主要的應用程式邏輯進入口。你可以把畫面或功能拆分成元件(Component)再匯入。
public/index.html：單頁應用(SPA)最底層的 HTML 容器。
你可以嘗試修改 src/App.js 裡的內容，並觀察瀏覽器自動重整（hot reload）。

2. 規劃功能與畫面結構
你提到要做「社區開會 APP 前端」，主要會有以下功能：

管理員登入 / 登出（若需要權限）
掃描 QR code / 條碼 以辨識戶別
手動輸入戶別（以免有人忘記帶通知單）
顯示出席總覽（戶數、坪數、是否達到門檻…）
可能還要有多場會議、歷史查詢、委託書上傳…等更進階功能（視需求而定）
建議將這些功能拆成獨立的 React 元件或頁面，並考慮是否採用 React Router 來管理多頁式路由（像 /login, /scan, /summary 之類的）。

3. 與後端串接 API
確定後端 API 的 URL 與規格

例如：
POST /api/attendance/scan → 用於報到
GET /api/attendance/summary → 用於取得當前出席統計
在前端，你可以用 fetch 或 axios 來呼叫這些 API。
在前端撰寫服務函式

可以在 src/services/ (你自行建立) 放一個 api.js 或類似檔案，集中管理 API 請求：
js
複製程式碼
// src/services/api.js (範例)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // 依你後端實際位置調整
  // 也可在這裡設置 headers, timeout...
});

export function scanAttendance(unit) {
  return apiClient.post('/api/attendance/scan', { unit });
}

export function getAttendanceSummary() {
  return apiClient.get('/api/attendance/summary');
}

// ... 其他 API
在你需要的畫面（比如掃描頁面、統計頁面）呼叫這些函式。
CORS / 權限

若後端與前端是不同網域（譬如前端 3000 port，後端 8000 port），需要後端啟用 CORS。
如果需要登入驗證，也要在前端儲存 Token / Session，並帶著 Authorization Header 呼叫 API。
4. 加入「掃描 QR code」的功能
4.1 使用網頁掃描套件 (html5-qrcode)
安裝：
bash
複製程式碼
npm install html5-qrcode
建立掃描元件（例如 src/components/QrScanner.jsx）：
jsx
複製程式碼
import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScanner({ onScanSuccess }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // 成功掃到 QR code
        onScanSuccess(decodedText);
      },
      (error) => {
        // 掃描過程中錯誤或辨識失敗
        console.error(error);
      }
    );

    return () => {
      // Unmount 時清理資源
      scanner.clear();
    };
  }, [onScanSuccess]);

  return <div id="qr-reader" />;
}

export default QrScanner;
在某個頁面使用它：
jsx
複製程式碼
// src/App.js (簡化示例)
import React, { useState } from 'react';
import QrScanner from './components/QrScanner';
import { scanAttendance } from './services/api'; // 你自己寫的 API 呼叫

function App() {
  const [lastScan, setLastScan] = useState('');

  const handleScanSuccess = (codeText) => {
    setLastScan(codeText);
    // 呼叫後端 API 報到
    scanAttendance(codeText)
      .then((res) => {
        console.log('報到成功:', res.data);
      })
      .catch((error) => {
        console.error('報到失敗:', error);
      });
  };

  return (
    <div>
      <h1>QRcode 掃描範例</h1>
      <QrScanner onScanSuccess={handleScanSuccess} />
      <p>掃到的結果：{lastScan}</p>
    </div>
  );
}

export default App;
注意：
在行動裝置瀏覽器上使用相機掃描，需要 HTTPS 或 localhost；且 Safari/iOS 版本要支援 getUserMedia。
若需要多頁式架構，可以用 React Router 的方式把掃描頁獨立出來。
4.2 或者選擇 React Native / Flutter 寫手機 App
若你想做成原生 App，在 iOS / Android 上體驗更好，可以用 React Native / Flutter。
這就需要另外的開發環境與打包流程，跟現在的 web 版 create-react-app 是不同路線。
5. 手動輸入戶別 + 送出 API
除了掃描頁面，也可以在某個頁面（或同一頁）加個輸入框讓管理員手動輸入戶別：

jsx
複製程式碼
import React, { useState } from 'react';
import { scanAttendance } from '../services/api';

function ManualCheckIn() {
  const [unit, setUnit] = useState('');

  const handleCheckIn = () => {
    scanAttendance(unit)
      .then((res) => {
        console.log('報到成功:', res.data);
        setUnit(''); // 清空輸入框
      })
      .catch(err => console.error('報到失敗:', err));
  };

  return (
    <div>
      <input
        type="text"
        placeholder="戶別 (Ex: A1-8)"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />
      <button onClick={handleCheckIn}>送出</button>
    </div>
  );
}

export default ManualCheckIn;
你可以將它整合在同一個頁面 (App.js) 或用 React Router 做成 /manual 路徑。

6. 顯示「出席統計」
在後端已經準備好的 API： GET /api/attendance/summary。

前端撰寫函式：

js
複製程式碼
// src/services/api.js
export function getAttendanceSummary() {
  return apiClient.get('/api/attendance/summary');
}
例如建立 src/components/Summary.jsx 來呈現：

jsx
複製程式碼
import React, { useEffect, useState } from 'react';
import { getAttendanceSummary } from '../services/api';

function Summary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getAttendanceSummary()
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => {
        console.error('取得統計失敗:', err);
      });
  }, []);

  if (!summary) {
    return <p>載入中...</p>;
  }

  return (
    <div>
      <h2>出席統計</h2>
      <p>已出席戶數: {summary.attendedUnits}</p>
      <p>總戶數: {summary.totalUnits}</p>
      <p>已出席坪數: {summary.attendedArea}</p>
      <p>總坪數: {summary.totalArea}</p>
      <p>是否達到門檻: {summary.isThresholdReached ? '達到' : '未達到'}</p>
    </div>
  );
}

export default Summary;
你可以把這個 Summary 元件加到 App.js 或用 React Router 做成 /summary 頁面。

7. 引入 React Router (多頁式架構)
如果功能比較多、畫面要分頁，可以使用 React Router：

安裝：
bash
複製程式碼
npm install react-router-dom
在 src/index.js 或 src/App.js 中設定路由：
jsx
複製程式碼
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QrScannerPage from './pages/QrScannerPage';
import ManualCheckInPage from './pages/ManualCheckInPage';
import SummaryPage from './pages/SummaryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<QrScannerPage />} />
        <Route path="/manual" element={<ManualCheckInPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
這樣就可以在瀏覽器上訪問 /scan, /manual, /summary 等不同路徑，各自顯示對應的畫面。
8. 整理 UI / UX
如果想快速做個簡單美觀的介面，可以用 Bootstrap、Material UI、Ant Design 或 Tailwind CSS 等 UI 框架：
bash
複製程式碼
npm install bootstrap
然後在 src/index.js 或 App.js 引入：
jsx
複製程式碼
import 'bootstrap/dist/css/bootstrap.min.css';
用一些現成的樣式類別，就可以套用排版、按鈕樣式，不必從頭手刻 CSS。
9. 最後：測試 & 部署
測試：確保掃描功能在行動裝置能正常呼叫相機、呼叫後端 API 都無誤；若有需要單元測試、整合測試，可以深入學習 Jest、React Testing Library。
部署：
執行 npm run build，會在 build/ 產生打包後的靜態檔。
將其上傳到你使用的主機 (AWS S3, Netlify, Vercel, 或自架 Nginx / Apache)。
綁定後端：若前端與後端放在同一台機器，可能要配置一點 Nginx 代理或後端的設定，讓 /api/... 導向你的後端程式，而 / 其他路徑則回傳 React 的 index.html (SPA)。
總結
已成功初始化 React 專案 → 接下來重點是把「前端介面」與「後端 API」結合起來。
規劃功能結構 → 掃描/手動報到/出席統計/登入等都可以拆成不同元件或路由頁面。
實作掃描功能 → html5-qrcode (Web) 或 React Native (App)；別忘了 HTTPS / 瀏覽器相容性。
串接後端 API → 透過 fetch / axios，確保 CORS、權限、錯誤處理都正確。
打造好的 UI/UX → 若有必要可使用 UI 框架或客製 CSS。
完成後，就能在「前端 APP」上實際掃描戶別、更新後端資料庫，並立刻看到出席比例是否達成開會門檻。接著再配合社區需求，擴充出更多管理員或住戶功能即可。

若你想做更多進階功能，例如動態顯示目前到場/未到場清單、線上委託投票、議案投票等，也都能在現有的 React 架構下繼續發展。

祝你開發順利！如果有更多問題或想要深入某個細節，歡迎再提問。





