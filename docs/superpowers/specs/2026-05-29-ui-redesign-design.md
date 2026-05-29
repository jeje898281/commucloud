# UI/UX 全面重構設計規格

**日期：** 2026-05-29  
**專案：** 社區大會管理平台（Frontend）  
**範圍：** 純視覺重構，不影響任何 JSX 邏輯與功能  
**實作策略：** 方案一 — 更新現有 CSS 設計系統（修改 design-system.css 及 24 個元件 CSS 檔案）

---

## 1. 設計方向摘要

| 決策項目 | 選擇 |
|---|---|
| 主題色調 | 冷灰藍淺色主題（非純白，降低刺眼感）|
| 導覽結構 | 頂部導覽列（延續現有 NavBar 架構）|
| 資訊密度 | 平衡型（適中間距，接近 Google Workspace 節奏感）|
| 元件風格 | 藍紫漸層主色 + 大圓角膠囊形按鈕/Badge |
| 設計靈感 | Gemini Advanced / Google Workspace 的專業現代感 |

---

## 2. 設計 Token 系統

所有數值直接對應 `design-system.css` 的 CSS Custom Properties。

### 2.1 底色層次

```css
--bg-page:        #eaedf2   /* 頁面底色（冷灰藍，非純白）*/
--bg-surface:     #f4f6f9   /* 卡片、NavBar、表格底色 */
--bg-surface-2:   #ffffff   /* Modal 底色 */
--bg-input:       #f4f6f9   /* 輸入框底色 */
--border:         #d1d9e6   /* 主要邊框 */
--border-light:   #e2e8f0   /* 輕量邊框（表格分隔線）*/
```

### 2.2 主色調（互動元素）

```css
--primary:        #5b7fa6   /* 主藍色 */
--primary-alt:    #7c6fa8   /* 主紫色（漸層終點）*/
--primary-grad:   linear-gradient(135deg, #5b7fa6, #7c6fa8)  /* 主按鈕、Logo */
--primary-light:  #dbe4f0   /* 選中態、Badge 背景 */
--primary-dark:   #3a5a8c   /* 文字連結、active 文字 */
```

### 2.3 語意色（狀態）

```css
--success:        #4a9e6e   /* 成功、已出席 */
--warning:        #d4a017   /* 警告、待確認 */
--danger:         #dc6060   /* 錯誤、刪除 */

/* Badge 背景色（低飽和度）*/
--success-bg:     #d8ead2
--warning-bg:     #f5e8c8
--danger-bg:      #f5d8d8
```

### 2.4 文字色階

```css
--text-1:  #1e293b   /* 主標題、重要內容 */
--text-2:  #475569   /* 一般內文 */
--text-3:  #64748b   /* 次要說明、NavBar 未選中 */
--text-4:  #94a3b8   /* 輔助文字、表格 th、時間戳 */
```

### 2.5 圓角尺度

```css
--radius-xs:   4px    /* 表格 row hover 高亮 */
--radius-sm:   8px    /* 小元件、Badge（選項） */
--radius-md:   12px   /* Input、小卡片 */
--radius-lg:   14px   /* 主要卡片、Shell 框架 */
--radius-xl:   16px   /* 大卡片、Modal 內容區 */
--radius-2xl:  20px   /* Modal 外框、Login 卡片 */
--radius-pill: 999px  /* 按鈕、Badge、NavBar 選中態 */
```

### 2.6 陰影

```css
--shadow-sm:     0 1px 3px rgba(0,0,0,.07)              /* 卡片 */
--shadow-md:     0 2px 8px rgba(91,127,166,.12)         /* 懸浮卡片 */
--shadow-lg:     0 8px 24px rgba(91,127,166,.16)        /* Modal、Shell */
--shadow-accent: 0 2px 12px rgba(124,111,168,.2)        /* 主按鈕 hover */
```

### 2.7 字體

```css
/* 不變，沿用現有設定 */
font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif;
```

---

## 3. 全域元件規格

### 3.1 按鈕

| 類型 | 外觀 |
|---|---|
| Primary | `--primary-grad` 背景、白色文字、`border-radius: 999px`、`padding: 8px 20px` |
| Ghost | 透明背景、`--primary-dark` 文字、`1.5px solid --border`、膠囊圓角 |
| Danger | `#fdf0f0` 背景、`--danger` 文字、`1.5px solid #f5d0d0`、膠囊圓角 |
| Danger Solid | `--danger` 背景、白色文字（僅刪除確認 Modal 用）|
| Small | 同上，`font-size: 11px`、`padding: 5px 14px` |

### 3.2 Badge / 標籤

所有 Badge 使用 `border-radius: 999px`、`padding: 3px 10px`、`font-size: 11px`。

| 狀態 | 背景 | 文字色 |
|---|---|---|
| 進行中 / 資訊 | `--primary-light` | `--primary-dark` |
| 已完成 / 成功 | `#d8ead2` | `#2d6a4f` |
| 待確認 / 警告 | `#f5e8c8` | `#8a5c00` |
| 已取消 / 錯誤 | `#f5d8d8` | `#8a1c1c` |
| 已結束 / 中性 | `#e8edf4` | `--text-3` |

### 3.3 Input / 表單

```
background: --bg-input
border: 1.5px solid --border
border-radius: --radius-md (12px)
padding: 9px 14px
font-size: 13px
focus border-color: --primary
```

### 3.4 卡片

```
background: --bg-surface
border-radius: --radius-lg (14px)
box-shadow: --shadow-sm
card-header padding: 16px 20px，底部 1px solid --border-light
card-body padding: 視內容而定
```

### 3.5 表格

```
th: font-size 11px, uppercase, letter-spacing .05em, color --text-4
td: font-size 13px, color --text-2, padding 13px 20px
row hover: background rgba(91,127,166,.04)
分隔線: 1px solid --border-light
最後一行無底線
```

### 3.6 Modal

```
backdrop: rgba(15,23,42,.35) + backdrop-filter: blur(4px)
外框: background white, border-radius 20px, padding 28px, box-shadow --shadow-lg
header: 標題 16px 700 + 右側關閉按鈕（圓形 28px）
footer: justify-content flex-end, border-top 1px solid --border-light
最大寬度: 440px（一般）/ 360px（確認對話框）
```

### 3.7 Toast 通知

```
background: white
border-radius: 12px
左側 4px 色條（success/warning/danger/primary）
padding: 12px 16px
font-size: 13px, font-weight: 500
box-shadow: --shadow-md
左側 8px 圓點（對應狀態色）
```

---

## 4. 頁面規格

### 4.1 NavBar（所有頁面）

- 高度：56px
- 背景：`--bg-surface`，底部 `1px solid --border`
- 左：Logo（28px 漸層圓角方塊）+ 品牌名稱 + 垂直分隔線 + 導覽連結
- 導覽連結選中態：`--primary-light` 背景 + `--primary-dark` 文字 + `border-radius: 999px`
- 右：社區名稱（膠囊形標籤）+ 使用者頭像縮寫（32px 漸層圓形）

### 4.2 首頁（HomePage）

- 問候語標題 + 角色說明
- 3 格統計卡片（本月會議、住戶總數、平均出席率）
- 近期會議表格卡片

### 4.3 會議列表頁（MeetingListPage）

- 頁面標題 + 「新增會議」Primary 按鈕（右上角）
- 搜尋輸入框
- 表格卡片：會議名稱、建立日期、出席門檻、狀態 Badge、進入/編輯/刪除操作

### 4.4 會議詳情頁（MeetingLayout 子頁）

- NavBar 下方緊接分頁列（SubNav Tabs）
- Tab 選中態：底部 2px `--primary` 橫線 + `--primary-dark` 文字

**QR 掃描頁（ScanPage）**  
兩欄佈局：左側相機畫面 + 右側最近報到列表（含報到計數 Badge）

**人工報到頁（ManualCheckIn）**  
單欄居中：搜尋框 + 住戶資訊卡 + 確認報到按鈕

**出席統計頁（SummaryPage）**  
4 格數字卡（總數/已出席/未出席/出席率）+ 門檻進度條卡片 + 出席名單表格

**QR 代碼頁（QRCodePage）**  
維持現有功能佈局，更新視覺風格套用新 Token

### 4.5 住戶資料頁（ResidentsList）

- 標題 + 右側「批次匯入」Ghost 按鈕 + 「新增住戶」Primary 按鈕
- 搜尋框
- 表格：戶號、姓名、聯絡電話、出席次數、編輯/刪除操作

### 4.6 個人資料頁（ProfilePage）

- 兩欄：左側頭像側欄（72px 漸層圓形頭像 + 姓名 + 角色 Badge）
- 右側：基本資訊卡片 + 修改密碼卡片

### 4.7 社區設定頁（CommunityPage）

- 社區名稱、說明、Logo URL 表單卡片
- 儲存按鈕

### 4.8 登入頁（LoginPage）

- 全頁漸層背景：`linear-gradient(135deg, #dde3ef, #e8e4f3)`
- 居中白色卡片（border-radius 20px）
- Logo + 標題 + 帳號/密碼輸入 + 登入按鈕

### 4.9 請先登入頁（PleaseLoginPage）

- 居中說明文字 + 跳轉登入按鈕

---

## 5. 實作範圍與限制

### 修改範圍
- `src/styles/design-system.css` — 重寫所有 CSS Custom Properties 及共用元件樣式
- `src/styles/*.css`（24 個檔案）— 逐一更新元件樣式
- `src/index.css` — 全域 body background 調整

### 不修改範圍
- 所有 `.jsx` 元件檔案（className 若需新增可接受，但不改邏輯）
- `src/contexts/`、`src/services/`、`src/utils/`、`src/constants/`
- Routing 結構（`src/index.jsx`）
- 任何功能邏輯

### 注意事項
- 移除所有舊的 glassmorphism 深色主題變數（`--glass-*`、深色 `--bg-primary` 等）
- 保留動畫 keyframe（fadeInUp、slideInUp 等）但調整 timing 至符合新視覺節奏
- 響應式斷點維持不變（1024px / 768px / 480px）

---

## 6. 檔案對照表

| CSS 檔案 | 主要變更重點 |
|---|---|
| `design-system.css` | 全面替換 Token、按鈕/卡片/表格/Badge/Modal 共用樣式 |
| `NavBar.css` | 56px 高、surface 背景、膠囊選中態 |
| `LoginPage.css` | 漸層背景、居中白卡設計 |
| `HomePage.css` | 統計卡片格線、表格卡片 |
| `MeetingList.css` | 頁面標題列、搜尋框、表格操作按鈕 |
| `MeetingNav.css` | 分頁列底線選中態 |
| `ScanPage.css` | 兩欄佈局、相機框、報到列表 |
| `ManualCheckIn.css` | 居中單欄表單 |
| `Summary.css` | 4 格統計、進度條、出席表格 |
| `QRCodePage.css` | Token 更新 |
| `ProfilePage.css` | 兩欄佈局、頭像側欄 |
| `CommunityPage.css` | 表單卡片 |
| `ResidentsList.css` | 表格、搜尋框、操作按鈕 |
| `CreateMeetingModal.css` / `EditMeetingModal.css` | Modal 規格 |
| `CreateResidentModal.css` / `EditResidentModal.css` | Modal 規格 |
| `ChangePasswordModal.css` | Modal 規格 |
| `DeleteConfirmModal.css` | 警告圖示 + 居中佈局 |
| `BulkImportModal.css` | Modal 規格 |
| `modal-enhanced.css` | backdrop blur + 動畫 |
| `PleaseLoginPage.css` | 居中說明 |
| `QrScanner.css` | 相機框樣式 |
| `Toast.css` | 白底 + 左側色條 |
