# UI/UX 全面重構 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將整個前端視覺從深色毛玻璃主題重構為冷灰藍淺色主題（Gemini/Workspace 風格），純 CSS 修改，不動任何 JSX 邏輯。

**Architecture:** 更新 `src/styles/design-system.css` 的 CSS Custom Properties（改變變數值而非變數名稱），讓深色主題值變成淺色主題值，再逐一重寫 22 個元件 CSS 檔案。

**Tech Stack:** Plain CSS, CSS Custom Properties, Vite dev server (`npm run dev`)

**Spec:** `docs/superpowers/specs/2026-05-29-ui-redesign-design.md`

---

## Task 1: Design System Foundation

**Files:**
- Modify: `src/styles/design-system.css`
- Modify: `src/index.css`

- [ ] **Step 1: 啟動 dev server，記錄改前狀態**

```bash
npm run dev
```

在瀏覽器開啟 `http://localhost:5173`，確認目前是深色毛玻璃主題，截圖備存對比用。

- [ ] **Step 2: 重寫 design-system.css**

完整取代 `src/styles/design-system.css` 內容：

```css
/* Design System - Community Management Platform */

:root {
  /* ── 底色層次 ── */
  --bg-primary:    #eaedf2;   /* 頁面底色 */
  --bg-secondary:  #f4f6f9;   /* 卡片、NavBar */
  --bg-tertiary:   #f0f3f8;   /* Input、懸停 */
  --bg-quaternary: #e8ecf4;   /* 深一層懸停 */
  --bg-light:      #ffffff;   /* Modal 底色 */

  /* ── 主色調 ── */
  --primary-25:  #f0f4fa;
  --primary-50:  #e3eaf5;
  --primary-100: #dbe4f0;
  --primary-200: #c4d4e8;
  --primary-300: #a0bcda;
  --primary-400: #7c9dc4;
  --primary-500: #7c6fa8;   /* accent / alt */
  --primary-600: #5b7fa6;   /* main primary */
  --primary-700: #3a5a8c;   /* dark primary */
  --primary-800: #2a4470;
  --primary-900: #1a2e54;

  /* 漸層主色（按鈕、Logo 用）*/
  --primary-grad: linear-gradient(135deg, #5b7fa6, #7c6fa8);

  /* ── 灰階 ── */
  --gray-50:  #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  --gray-950: #020617;

  /* ── 語意色 ── */
  --success-50:  #f0faf4;
  --success-100: #d8ead2;
  --success-500: #4a9e6e;
  --success-600: #4a9e6e;
  --success-700: #2d6a4f;
  --success-800: #1a4a37;

  --warning-50:  #fdf8ec;
  --warning-100: #f5e8c8;
  --warning-500: #d4a017;
  --warning-600: #d4a017;
  --warning-700: #8a5c00;
  --warning-800: #5c3d00;

  --error-50:  #fdf3f3;
  --error-100: #f5d8d8;
  --error-200: #f0c0c0;
  --error-400: #dc6060;
  --error-500: #dc6060;
  --error-600: #dc6060;
  --error-700: #8a1c1c;
  --error-800: #5c1010;

  /* ── 文字色階 ── */
  --text-primary:   #1e293b;
  --text-secondary: #475569;
  --text-tertiary:  #64748b;
  --text-muted:     #94a3b8;
  --text-inverse:   #ffffff;

  /* ── 邊框 ── */
  --border-light:   #d1d9e6;
  --border-medium:  #e2e8f0;
  --border-dark:    #c8d3e0;
  --border-primary: #5b7fa6;

  /* ── 陰影 ── */
  --shadow-sm:   0 1px 3px rgba(0,0,0,.07);
  --shadow-base: 0 1px 4px rgba(0,0,0,.08);
  --shadow-md:   0 2px 8px rgba(91,127,166,.12);
  --shadow-lg:   0 8px 24px rgba(91,127,166,.16);
  --shadow-xl:   0 16px 40px rgba(91,127,166,.18);

  /* ── 圓角 ── */
  --radius-none: 0;
  --radius-sm:   0.5rem;   /* 8px */
  --radius-base: 0.75rem;  /* 12px */
  --radius-md:   0.875rem; /* 14px */
  --radius-lg:   1rem;     /* 16px */
  --radius-xl:   1.25rem;  /* 20px */
  --radius-2xl:  1.5rem;   /* 24px */
  --radius-full: 9999px;

  /* ── 間距 ── */
  --space-0:  0;
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-5:  1.25rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;

  /* ── 字體 ── */
  --font-family-sans: 'Inter', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;
  --text-6xl:  3.75rem;

  --font-thin:      100;
  --font-light:     300;
  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;
  --font-extrabold: 800;

  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   2;

  /* ── 動畫 ── */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ── Z-index ── */
  --z-dropdown:      1000;
  --z-sticky:        1020;
  --z-fixed:         1030;
  --z-modal-backdrop:1040;
  --z-modal:         1050;
  --z-popover:       1060;
  --z-tooltip:       1070;
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  height: 100%;
}

body {
  font-family: var(--font-family-sans);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Container ── */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
.container-sm {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  line-height: 1;
  text-decoration: none;
  border: 1.5px solid transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:focus-visible { outline: 2px solid var(--primary-600); outline-offset: 2px; }

.btn-primary {
  background: var(--primary-grad);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(124,111,168,.2);
}
.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 14px rgba(124,111,168,.3);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  background: transparent;
  color: var(--primary-700);
  border-color: var(--border-light);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-dark);
}

.btn-success {
  background: var(--success-600);
  color: #ffffff;
  border-color: transparent;
}
.btn-success:hover:not(:disabled) {
  background: var(--success-700);
  transform: translateY(-1px);
}

.btn-danger {
  background: var(--error-100);
  color: var(--error-600);
  border-color: #f0c0c0;
}
.btn-danger:hover:not(:disabled) {
  background: var(--error-600);
  color: #ffffff;
  border-color: transparent;
  transform: translateY(-1px);
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
}
.btn-lg {
  padding: var(--space-3) var(--space-8);
  font-size: var(--text-lg);
}

/* ── Card ── */
.card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}
.card:hover { box-shadow: var(--shadow-md); }
.card-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-medium);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-body { padding: var(--space-5); }
.card-footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-medium);
}

/* ── Form ── */
.form-group { margin-bottom: var(--space-4); }
.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-base);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  font-family: inherit;
}
.form-input:focus {
  outline: none;
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(91,127,166,.15);
  background: #ffffff;
}
.form-input::placeholder { color: var(--text-muted); }
.form-input:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Table ── */
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  padding: var(--space-3) var(--space-5);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-medium);
  background: var(--bg-secondary);
}
.table td {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-medium);
}
.table tbody tr:hover td { background: rgba(91,127,166,.04); }
.table tbody tr:last-child td { border-bottom: none; }

/* ── Badge ── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
}
.badge-primary { background: var(--primary-100); color: var(--primary-700); }
.badge-success { background: var(--success-100); color: var(--success-700); }
.badge-warning { background: var(--warning-100); color: var(--warning-700); }
.badge-error   { background: var(--error-100);   color: var(--error-700); }

/* ── Utility ── */
.text-center { text-align: center; }
.text-left   { text-align: left; }
.text-right  { text-align: right; }
.font-bold     { font-weight: var(--font-bold); }
.font-semibold { font-weight: var(--font-semibold); }
.font-medium   { font-weight: var(--font-medium); }
.text-primary-color { color: var(--text-primary); }
.text-secondary-color { color: var(--text-secondary); }
.text-muted-color { color: var(--text-muted); }
.bg-primary-color { background-color: var(--bg-primary); }
.bg-secondary-color { background-color: var(--bg-secondary); }
.rounded    { border-radius: var(--radius-base); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-xl { border-radius: var(--radius-xl); }
.rounded-full { border-radius: var(--radius-full); }
.shadow-sm   { box-shadow: var(--shadow-sm); }
.shadow-base { box-shadow: var(--shadow-base); }
.shadow-lg   { box-shadow: var(--shadow-lg); }
.border-t { border-top: 1px solid var(--border-light); }
.border-b { border-bottom: 1px solid var(--border-light); }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-secondary); }
::-webkit-scrollbar-thumb { background: var(--border-dark); border-radius: var(--radius-full); }
::-webkit-scrollbar-thumb:hover { background: var(--border-primary); }

/* ── Selection ── */
::selection { background-color: var(--primary-100); color: var(--primary-800); }

/* ── Focus ── */
*:focus-visible { outline: 2px solid var(--primary-600); outline-offset: 2px; }

/* ── Loading Spinner ── */
.loading-spinner .spinner,
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ── Animations ── */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .container { padding: 0 var(--space-4); }
}
@media (max-width: 768px) {
  .container { padding: 0 var(--space-3); }
  .btn { padding: var(--space-2) var(--space-4); }
  .card-header, .card-body, .card-footer { padding: var(--space-4); }
  .table th, .table td { padding: var(--space-3); font-size: var(--text-xs); }
}
@media (max-width: 480px) {
  .container { padding: 0 var(--space-2); }
  .btn { padding: var(--space-2) var(--space-3); font-size: var(--text-xs); }
}
```

- [ ] **Step 3: 更新 index.css**

取代 `src/index.css` 內容（保留 Google Fonts import，清除 body 重複定義）：

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;600;700&display=swap');

@import './styles/design-system.css';
```

- [ ] **Step 4: 驗證基礎樣式**

在瀏覽器確認：背景色已變為 `#eaedf2`（冷灰藍淺色），文字為深色。若頁面文字變深色且背景變淺色即代表 Token 生效。

- [ ] **Step 5: Commit**

```bash
git add src/styles/design-system.css src/index.css
git commit -m "style: replace dark glassmorphism tokens with light gray-blue theme

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: NavBar

**Files:**
- Modify: `src/styles/NavBar.css`

- [ ] **Step 1: 重寫 NavBar.css**

```css
/* NavBar - Light Theme */
.navbar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  transition: box-shadow var(--transition-base);
}

.navbar.scrolled {
  box-shadow: var(--shadow-md);
}

.navbar-container {
  display: flex;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 56px;
  gap: var(--space-2);
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  flex-shrink: 0;
  margin-right: var(--space-2);
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: var(--primary-grad);
  border-radius: 8px;
  flex-shrink: 0;
}

.logo-text {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  white-space: nowrap;
}

.logo:hover .logo-text { color: var(--primary-700); }

/* Nav Divider */
.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--border-light);
  margin: 0 var(--space-2);
  flex-shrink: 0;
}

/* Nav Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li { position: relative; }

.nav-links a {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  color: var(--text-tertiary);
  text-decoration: none;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.nav-links a:hover {
  color: var(--primary-700);
  background: var(--primary-100);
}

.nav-links .active a {
  color: var(--primary-700);
  background: var(--primary-100);
  font-weight: var(--font-semibold);
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}

.community-badge {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: var(--bg-primary);
  border-radius: var(--radius-full);
  padding: 4px 12px;
  border: 1px solid var(--border-light);
  white-space: nowrap;
}

/* Login Button */
.btn-login {
  padding: var(--space-2) var(--space-4);
  background: var(--primary-grad);
  color: #ffffff;
  text-decoration: none;
  border: none;
  border-radius: var(--radius-full);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn-login:hover {
  box-shadow: 0 4px 12px rgba(124,111,168,.25);
  transform: translateY(-1px);
}

/* User Dropdown */
.user-dropdown { position: relative; }

.user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px;
  background: transparent;
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary-grad);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  flex-shrink: 0;
}

.user-btn::after {
  content: '▾';
  font-size: 10px;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.user-dropdown:hover .user-btn::after { transform: rotate(180deg); }

.user-btn:hover .user-avatar,
.user-dropdown:hover .user-avatar {
  box-shadow: 0 0 0 2px var(--primary-100);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  list-style: none;
  margin: 0;
  padding: var(--space-2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px) scale(0.97);
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown-menu a,
.dropdown-menu button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  color: var(--text-secondary);
  text-decoration: none;
  border: none;
  background: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
  text-align: left;
}

.dropdown-menu a:hover,
.dropdown-menu button:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dropdown-menu .active a {
  background: var(--primary-100);
  color: var(--primary-700);
}

.logout-btn { color: var(--error-600) !important; }
.logout-btn:hover {
  background: var(--error-100) !important;
  color: var(--error-700) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container { padding: 0 var(--space-4); }
  .logo-text { display: none; }
  .community-badge { display: none; }
  .nav-divider { display: none; }
  .nav-links a { padding: var(--space-2); }
}

@media (max-width: 480px) {
  .navbar-container { height: 48px; padding: 0 var(--space-3); }
}
```

- [ ] **Step 2: 驗證 NavBar**

瀏覽器確認：NavBar 背景為淺灰白、Logo 位置有漸層方塊、導覽連結選中態為淺藍膠囊、使用者頭像為漸層圓形。

- [ ] **Step 3: Commit**

```bash
git add src/styles/NavBar.css
git commit -m "style: redesign NavBar with light theme and pill nav

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Auth Pages

**Files:**
- Modify: `src/styles/LoginPage.css`
- Modify: `src/styles/PleaseLoginPage.css`

- [ ] **Step 1: 重寫 LoginPage.css**

```css
/* Login Page */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dde3ef 0%, #e8e4f3 100%);
  padding: var(--space-4);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: #ffffff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: slideInUp 0.4s ease-out;
}

.login-header {
  text-align: center;
  padding: var(--space-8) var(--space-6) var(--space-6);
}

.login-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-2);
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: var(--primary-grad);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
}

.login-header h1 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.login-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.login-form {
  padding: var(--space-6);
}

.form-group { margin-bottom: var(--space-4); }

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(91,127,166,.15);
  background: #ffffff;
}

.form-input::placeholder { color: var(--text-muted); }
.form-input:disabled { opacity: 0.6; cursor: not-allowed; }

.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--error-100);
  color: var(--error-700);
  border: 1px solid #f0c0c0;
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-4);
  animation: shake 0.4s ease-in-out;
}

.login-btn {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-4);
}

.login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.login-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s linear infinite;
  margin-right: var(--space-2);
}

.login-footer {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-medium);
  text-align: center;
}

.help-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 0;
}

/* 背景裝飾（保留但改為淺色）*/
.login-background { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(91,127,166,.06);
}
.shape-1 { width: 240px; height: 240px; top: 5%; left: 5%; }
.shape-2 { width: 160px; height: 160px; top: 55%; right: 10%; }
.shape-3 { width: 120px; height: 120px; bottom: 15%; left: 18%; }

@media (max-width: 480px) {
  .login-page { padding: var(--space-3); }
  .login-header { padding: var(--space-6) var(--space-4) var(--space-4); }
  .login-form { padding: var(--space-4); }
  .login-footer { padding: var(--space-3) var(--space-4); }
  .bg-shape { display: none; }
}
```

- [ ] **Step 2: 重寫 PleaseLoginPage.css**

```css
/* Please Login Page */
.please-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: var(--space-4);
}

.please-login-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-12) var(--space-10);
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: fadeInUp 0.4s ease-out;
}

.please-login-icon {
  width: 64px;
  height: 64px;
  background: var(--primary-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-6);
  font-size: var(--text-2xl);
}

.please-login-card h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.please-login-card p {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

.please-login-card .btn-primary {
  padding: var(--space-3) var(--space-8);
}

@media (max-width: 480px) {
  .please-login-card { padding: var(--space-8) var(--space-6); }
}
```

- [ ] **Step 3: 驗證**

開啟 `/login`，確認：白色居中卡片、漸層藍紫背景（很淡）、Logo 漸層方塊。開啟 `/please-login`，確認居中卡片顯示正常。

- [ ] **Step 4: Commit**

```bash
git add src/styles/LoginPage.css src/styles/PleaseLoginPage.css
git commit -m "style: redesign auth pages with light card layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: HomePage

**Files:**
- Modify: `src/styles/HomePage.css`

- [ ] **Step 1: 重寫 HomePage.css**

```css
/* Home Page */
.homepage {
  min-height: calc(100vh - 56px);
  background: var(--bg-primary);
  padding: var(--space-6);
}

/* Hero / Welcome Section */
.hero-section {
  max-width: 1200px;
  margin: 0 auto var(--space-8);
}

.hero-content h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  animation: fadeInUp 0.4s ease-out;
}

.hero-content p {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-6);
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  max-width: 1200px;
  margin: 0 auto var(--space-6);
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.stat-card:hover { box-shadow: var(--shadow-md); }

.stat-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-sub {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

/* Main Content Card */
.homepage-card {
  max-width: 1200px;
  margin: 0 auto var(--space-6);
}

/* 舊版 hero 圖片（SVG）相容保留 */
.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image img {
  max-width: 100%;
  opacity: 0.7;
}

/* 狀態列（載入/錯誤）*/
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.loading-container p,
.error-container p {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .homepage { padding: var(--space-4); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
  .hero-content h1 { font-size: var(--text-2xl); }
}

@media (max-width: 480px) {
  .homepage { padding: var(--space-3); }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: var(--space-2); }
  .stat-value { font-size: var(--text-3xl); }
}
```

- [ ] **Step 2: 驗證**

開啟首頁，確認：頁面底色 `#eaedf2`、卡片顯示正確、文字可讀。

- [ ] **Step 3: Commit**

```bash
git add src/styles/HomePage.css
git commit -m "style: redesign HomePage with stat cards and light layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Meeting List Page

**Files:**
- Modify: `src/styles/MeetingList.css`

- [ ] **Step 1: 重寫 MeetingList.css**

```css
/* Meeting List Page */
.meeting-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 56px);
  background: var(--bg-primary);
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-5);
}

.header-left { flex: 1; }

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.page-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
  margin-left: var(--space-4);
}

/* Search Bar */
.search-container {
  margin-bottom: var(--space-4);
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(91,127,166,.12);
  background: #ffffff;
}

.search-input::placeholder { color: var(--text-muted); }

/* Meeting Table Card */
.meetings-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.meetings-table {
  width: 100%;
  border-collapse: collapse;
}

.meetings-table th {
  padding: var(--space-3) var(--space-5);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-medium);
  background: var(--bg-secondary);
}

.meetings-table td {
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-medium);
  vertical-align: middle;
}

.meetings-table tbody tr:hover td { background: rgba(91,127,166,.04); }
.meetings-table tbody tr:last-child td { border-bottom: none; }

.meeting-name {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.meeting-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-16) var(--space-4);
}

.empty-state p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

/* 狀態提示 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.loading-container p,
.error-container p {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

@media (max-width: 768px) {
  .meeting-list-container { padding: var(--space-4); }
  .page-header { flex-direction: column; gap: var(--space-3); }
  .header-actions { margin-left: 0; }
  .meetings-table th:nth-child(3),
  .meetings-table td:nth-child(3) { display: none; }
}

@media (max-width: 480px) {
  .meeting-list-container { padding: var(--space-3); }
  .meetings-table th:nth-child(2),
  .meetings-table td:nth-child(2) { display: none; }
  .search-input { max-width: 100%; }
}
```

- [ ] **Step 2: 驗證**

開啟 `/meetings`，確認：頁面標題顯示正常、表格列有正確間距、「新增會議」按鈕為漸層膠囊形。

- [ ] **Step 3: Commit**

```bash
git add src/styles/MeetingList.css
git commit -m "style: redesign meeting list with clean table card layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Meeting Sub-Navigation Tabs

**Files:**
- Modify: `src/styles/MeetingNav.css`

- [ ] **Step 1: 重寫 MeetingNav.css**

```css
/* Meeting Sub-Navigation */
.meeting-nav {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 56px;
  z-index: calc(var(--z-sticky) - 1);
}

.meeting-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  gap: 0;
}

.meeting-nav-tabs {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.meeting-nav-tab {
  display: flex;
  align-items: center;
}

.meeting-nav-tab a,
.meeting-nav-tab button {
  display: block;
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-tertiary);
  text-decoration: none;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  font-family: inherit;
}

.meeting-nav-tab a:hover,
.meeting-nav-tab button:hover {
  color: var(--text-primary);
}

.meeting-nav-tab.active a,
.meeting-nav-tab.active button {
  color: var(--primary-700);
  border-bottom-color: var(--primary-600);
  font-weight: var(--font-semibold);
}

/* Meeting Info Header */
.meeting-info-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-medium);
  background: var(--bg-secondary);
}

.meeting-info-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.meeting-info-sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .meeting-nav-container { padding: 0 var(--space-3); overflow-x: auto; }
  .meeting-nav-tab a, .meeting-nav-tab button { padding: var(--space-3) var(--space-3); font-size: var(--text-xs); }
}
```

- [ ] **Step 2: 驗證**

開啟任意會議（`/meetings/:id/scan`），確認：分頁列顯示 4 個 Tab、選中的 Tab 有底部藍線。

- [ ] **Step 3: Commit**

```bash
git add src/styles/MeetingNav.css
git commit -m "style: redesign meeting sub-navigation with underline tabs

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Meeting Detail Pages

**Files:**
- Modify: `src/styles/ScanPage.css`
- Modify: `src/styles/ManualCheckIn.css`
- Modify: `src/styles/Summary.css`
- Modify: `src/styles/QRCodePage.css`
- Modify: `src/styles/QrScanner.css`

- [ ] **Step 1: 重寫 ScanPage.css**

```css
/* Scan Page */
.scan-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 112px);
  background: var(--bg-primary);
}

.scan-page-header {
  margin-bottom: var(--space-6);
}

.scan-page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.scan-page-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.scan-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

/* Scanner Box */
.scanner-box {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.scanner-box-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.qr-camera-area {
  background: var(--bg-primary);
  border-radius: var(--radius-base);
  border: 2px dashed var(--border-light);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  min-height: 200px;
  overflow: hidden;
}

.qr-camera-placeholder {
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-align: center;
}

/* Check-in List Box */
.checkin-list-box {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.checkin-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.checkin-list-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.checkin-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.checkin-item {
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkin-item-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.checkin-item-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Scan Result */
.scan-result {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-top: var(--space-3);
  text-align: center;
}

.scan-result-success {
  background: var(--success-100);
  color: var(--success-700);
  border: 1px solid rgba(74,158,110,.2);
}

.scan-result-error {
  background: var(--error-100);
  color: var(--error-700);
  border: 1px solid rgba(220,96,96,.2);
}

@media (max-width: 768px) {
  .scan-page { padding: var(--space-4); }
  .scan-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .scan-page { padding: var(--space-3); }
}
```

- [ ] **Step 2: 重寫 QrScanner.css**

```css
/* QR Scanner Component */
.qr-scanner-container {
  width: 100%;
}

#qr-reader {
  border: none !important;
  border-radius: var(--radius-base);
  overflow: hidden;
  background: var(--bg-primary);
}

#qr-reader video {
  border-radius: var(--radius-base);
}

#qr-reader img { display: none; }

#qr-reader__scan_region {
  background: transparent !important;
}

#qr-reader__dashboard {
  padding: var(--space-3) 0 0 !important;
  background: transparent !important;
}

#qr-reader__dashboard_section_csr span {
  font-size: var(--text-xs) !important;
  color: var(--text-tertiary) !important;
}

#qr-reader__dashboard button {
  background: var(--primary-grad) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: var(--radius-full) !important;
  padding: var(--space-2) var(--space-4) !important;
  font-size: var(--text-xs) !important;
  font-weight: var(--font-semibold) !important;
  cursor: pointer;
}

#qr-reader select {
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-base);
  color: var(--text-primary);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
}
```

- [ ] **Step 3: 重寫 ManualCheckIn.css**

```css
/* Manual Check-In Page */
.manual-checkin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 112px);
  background: var(--bg-primary);
}

.manual-checkin-header {
  margin-bottom: var(--space-6);
}

.manual-checkin-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.manual-checkin-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.checkin-form-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  max-width: 520px;
}

.resident-result {
  background: var(--bg-primary);
  border-radius: var(--radius-base);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-medium);
}

.resident-result-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.resident-result-phone {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.checkin-btn-wrap {
  display: flex;
  gap: var(--space-3);
}

.checkin-btn-wrap .btn-primary {
  flex: 1;
  justify-content: center;
  padding: var(--space-3) var(--space-4);
}

@media (max-width: 768px) {
  .manual-checkin-page { padding: var(--space-4); }
  .checkin-form-card { max-width: 100%; }
}

@media (max-width: 480px) {
  .manual-checkin-page { padding: var(--space-3); }
  .checkin-btn-wrap { flex-direction: column; }
}
```

- [ ] **Step 4: 重寫 Summary.css**

```css
/* Summary / Attendance Statistics Page */
.summary-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 112px);
  background: var(--bg-primary);
}

.summary-header {
  margin-bottom: var(--space-6);
}

.summary-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.summary-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Stats Grid */
.summary-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.summary-stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.summary-stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--space-1);
}

.summary-stat-value.present { color: var(--success-600); }
.summary-stat-value.absent  { color: var(--error-600); }

.summary-stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

/* Threshold Card */
.threshold-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-5);
  overflow: hidden;
}

.threshold-body {
  padding: var(--space-5);
}

.threshold-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
}

.progress-track {
  background: var(--bg-primary);
  border-radius: var(--radius-full);
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--primary-grad);
  transition: width 0.6s ease-out;
}

/* Attendance Table */
.attendance-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th {
  padding: var(--space-3) var(--space-5);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-medium);
}

.attendance-table td {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-medium);
}

.attendance-table tbody tr:hover td { background: rgba(91,127,166,.04); }
.attendance-table tbody tr:last-child td { border-bottom: none; }

/* Loading / Error */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.loading-container p, .error-container p {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

@media (max-width: 768px) {
  .summary-page { padding: var(--space-4); }
  .summary-stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .summary-page { padding: var(--space-3); }
  .summary-stats-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
  .summary-stat-value { font-size: var(--text-2xl); }
}
```

- [ ] **Step 5: 重寫 QRCodePage.css**

```css
/* QR Code Page */
.qrcode-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 112px);
  background: var(--bg-primary);
}

.qrcode-header {
  margin-bottom: var(--space-6);
}

.qrcode-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.qrcode-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.qrcode-actions {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}

.qrcode-action-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  flex: 1;
  min-width: 200px;
}

/* QR Code Grid */
.qrcode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-5);
}

.qrcode-item {
  background: var(--bg-secondary);
  border-radius: var(--radius-base);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.qrcode-item-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin-top: var(--space-2);
}

.qrcode-item img {
  max-width: 100%;
  border-radius: var(--radius-sm);
}

/* Loading / Error / Empty */
.loading-container, .error-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.loading-container p, .error-container p, .empty-state p {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

@media (max-width: 768px) { .qrcode-page { padding: var(--space-4); } }
@media (max-width: 480px) { .qrcode-page { padding: var(--space-3); } }
```

- [ ] **Step 6: 驗證**

依序開啟 `scan`、`manual`、`summary`、`qrcodes` 子頁，確認每個頁面背景與元件視覺正確。

- [ ] **Step 7: Commit**

```bash
git add src/styles/ScanPage.css src/styles/ManualCheckIn.css src/styles/Summary.css src/styles/QRCodePage.css src/styles/QrScanner.css
git commit -m "style: redesign meeting detail pages with consistent light layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Residents List

**Files:**
- Modify: `src/styles/ResidentsList.css`

- [ ] **Step 1: 重寫 ResidentsList.css**

```css
/* Residents List Page */
.residents-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 56px);
  background: var(--bg-primary);
}

.residents-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-5);
}

.residents-header-left { flex: 1; }

.residents-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.residents-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.residents-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
  margin-left: var(--space-4);
}

/* Search */
.residents-search {
  margin-bottom: var(--space-4);
}

.residents-search-input {
  width: 100%;
  max-width: 400px;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.residents-search-input:focus {
  outline: none;
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(91,127,166,.12);
  background: #ffffff;
}

.residents-search-input::placeholder { color: var(--text-muted); }

/* Table */
.residents-table-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.residents-table {
  width: 100%;
  border-collapse: collapse;
}

.residents-table th {
  padding: var(--space-3) var(--space-5);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-medium);
}

.residents-table td {
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-medium);
  vertical-align: middle;
}

.residents-table tbody tr:hover td { background: rgba(91,127,166,.04); }
.residents-table tbody tr:last-child td { border-bottom: none; }

.resident-unit { font-weight: var(--font-semibold); color: var(--text-primary); }

.resident-row-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

/* Empty / Loading */
.loading-container, .error-container, .empty-residents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.loading-container p, .error-container p, .empty-residents p {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

@media (max-width: 768px) {
  .residents-list-container { padding: var(--space-4); }
  .residents-header { flex-direction: column; gap: var(--space-3); }
  .residents-actions { margin-left: 0; }
  .residents-table th:nth-child(3), .residents-table td:nth-child(3) { display: none; }
}

@media (max-width: 480px) {
  .residents-list-container { padding: var(--space-3); }
  .residents-search-input { max-width: 100%; }
  .residents-table th:nth-child(4), .residents-table td:nth-child(4) { display: none; }
}
```

- [ ] **Step 2: 驗證**

開啟 `/residents`，確認：頁面標題、搜尋框、住戶表格視覺正確，「新增住戶」和「批次匯入」按鈕樣式正確。

- [ ] **Step 3: Commit**

```bash
git add src/styles/ResidentsList.css
git commit -m "style: redesign residents list with search and table card

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Profile & Community Pages

**Files:**
- Modify: `src/styles/ProfilePage.css`
- Modify: `src/styles/CommunityPage.css`

- [ ] **Step 1: 重寫 ProfilePage.css**

```css
/* Profile Page */
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 56px);
  background: var(--bg-primary);
}

.profile-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.profile-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-6);
}

.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-5);
}

/* Sidebar */
.profile-sidebar {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
  height: fit-content;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  background: var(--primary-grad);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-md);
}

.profile-display-name {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.profile-community {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Content Area */
.profile-content { display: flex; flex-direction: column; gap: var(--space-4); }

.profile-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.profile-card-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-medium);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-card-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.profile-card-body {
  padding: var(--space-5);
}

.profile-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-4);
}

/* Success / Error messages */
.profile-success {
  padding: var(--space-3) var(--space-4);
  background: var(--success-100);
  color: var(--success-700);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
  border: 1px solid rgba(74,158,110,.2);
}

.profile-error {
  padding: var(--space-3) var(--space-4);
  background: var(--error-100);
  color: var(--error-700);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
  border: 1px solid rgba(220,96,96,.2);
}

@media (max-width: 768px) {
  .profile-page { padding: var(--space-4); }
  .profile-layout { grid-template-columns: 1fr; }
  .profile-sidebar { flex-direction: row; text-align: left; gap: var(--space-4); }
  .profile-avatar { flex-shrink: 0; }
}

@media (max-width: 480px) {
  .profile-page { padding: var(--space-3); }
  .profile-sidebar { flex-direction: column; text-align: center; }
}
```

- [ ] **Step 2: 重寫 CommunityPage.css**

```css
/* Community Settings Page */
.community-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 56px);
  background: var(--bg-primary);
}

.community-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.community-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-6);
}

.community-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: var(--space-5);
}

.community-card-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-medium);
}

.community-card-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.community-card-body {
  padding: var(--space-5);
}

.community-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.community-success {
  padding: var(--space-3) var(--space-4);
  background: var(--success-100);
  color: var(--success-700);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

.community-error {
  padding: var(--space-3) var(--space-4);
  background: var(--error-100);
  color: var(--error-700);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

/* Loading / Not found */
.loading-container, .not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.loading-container p, .not-found-container p {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

@media (max-width: 768px) { .community-page { padding: var(--space-4); } }
@media (max-width: 480px) { .community-page { padding: var(--space-3); } }
```

- [ ] **Step 3: 驗證**

開啟 `/profile`，確認兩欄佈局（大螢幕）、頭像側欄、表單卡片視覺正確。開啟 `/communities`，確認表單卡片正常。

- [ ] **Step 4: Commit**

```bash
git add src/styles/ProfilePage.css src/styles/CommunityPage.css
git commit -m "style: redesign profile and community pages with card layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Modal Foundation

**Files:**
- Modify: `src/styles/modal-enhanced.css`

- [ ] **Step 1: 重寫 modal-enhanced.css**

```css
/* Modal Foundation - Light Theme */

:root {
  --modal-bg: #ffffff;
  --modal-border: var(--border-light);
  --modal-text-primary: var(--text-primary);
  --modal-text-secondary: var(--text-secondary);
  --modal-input-bg: var(--bg-tertiary);
  --modal-input-border: var(--border-light);
  --modal-input-focus: var(--primary-600);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
  animation: modalOverlayIn 0.2s ease-out;
}

.modal-content {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-medium);
  flex-shrink: 0;
}

.modal-title {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.modal-icon { font-size: var(--text-lg); }

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-primary);
  color: var(--text-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.modal-close-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-close-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-form,
.modal-body {
  padding: var(--space-5) var(--space-6);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.form-group { margin-bottom: var(--space-4); }
.form-group:last-of-type { margin-bottom: var(--space-2); }

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.required { color: var(--error-600); margin-left: 2px; }
.optional  { color: var(--text-muted); font-weight: var(--font-normal); font-size: var(--text-xs); }

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-base);
  color: var(--text-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  transition: all var(--transition-base);
  box-sizing: border-box;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  max-height: 160px;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(91,127,166,.15);
  background: #ffffff;
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-secondary);
}

.form-input::placeholder,
.form-textarea::placeholder { color: var(--text-muted); }

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: var(--error-500);
  box-shadow: 0 0 0 3px rgba(220,96,96,.12);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-1);
}

.error-message,
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--error-700);
  font-size: var(--text-sm);
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--error-100);
  border: 1px solid rgba(220,96,96,.2);
  border-radius: var(--radius-base);
  line-height: var(--leading-normal);
}

.error-icon { flex-shrink: 0; }

.modal-actions {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-medium);
  flex-shrink: 0;
  justify-content: flex-end;
}

/* Button overrides for modals */
.modal-actions .btn {
  min-height: 36px;
  flex: none;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

.datetime-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.datetime-group .form-group { margin-bottom: 0; }

/* Scrollbar */
.modal-form::-webkit-scrollbar,
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-form::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track { background: transparent; }
.modal-form::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb { background: var(--border-dark); border-radius: var(--radius-full); }

/* Animations */
@keyframes modalOverlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: scale(0.92) translateY(-12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

@media (max-width: 480px) {
  .modal-content { max-width: 95vw; }
  .modal-header, .modal-form, .modal-body, .modal-actions { padding-left: var(--space-4); padding-right: var(--space-4); }
  .datetime-group { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: 驗證**

觸發任意 Modal（例如新增會議），確認：白色底色、圓角 20px、backdrop 模糊、header 正確、input 為淺灰底。

- [ ] **Step 3: Commit**

```bash
git add src/styles/modal-enhanced.css
git commit -m "style: redesign modal foundation with white card and light form inputs

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Meeting Modals

**Files:**
- Modify: `src/styles/EditMeetingModal.css`

> `CreateMeetingModal.jsx` 引用的是 `EditMeetingModal.css`，所以只需修改一個檔案。

- [ ] **Step 1: 重寫 EditMeetingModal.css**

```css
/* Edit / Create Meeting Modal */

.edit-meeting-modal .modal-content,
.create-meeting-modal .modal-content {
  max-width: 480px;
}

/* 數字輸入（出席門檻）*/
.threshold-input-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.threshold-input-wrap .form-input {
  max-width: 120px;
}

.threshold-unit {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* Modal title icon override */
.edit-meeting-modal .modal-icon,
.create-meeting-modal .modal-icon {
  color: var(--primary-600);
}
```

- [ ] **Step 2: 驗證**

觸發「新增會議」和「編輯會議」Modal，確認白色底色 + 表單正確顯示。

- [ ] **Step 3: Commit**

```bash
git add src/styles/EditMeetingModal.css
git commit -m "style: redesign meeting modal with light form

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Resident Modals

**Files:**
- Modify: `src/styles/CreateResidentModal.css`
- Modify: `src/styles/EditResidentModal.css`

- [ ] **Step 1: 重寫 CreateResidentModal.css**

```css
/* Create Resident Modal */
.create-resident-modal .modal-content {
  max-width: 480px;
}

.create-resident-modal .modal-icon { color: var(--success-600); }

/* Unit code field hint */
.unit-code-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-1);
}
```

- [ ] **Step 2: 重寫 EditResidentModal.css**

```css
/* Edit Resident Modal */
.edit-resident-modal .modal-content {
  max-width: 480px;
}

.edit-resident-modal .modal-icon { color: var(--primary-600); }
```

- [ ] **Step 3: 驗證**

在住戶列表觸發「新增住戶」和「編輯住戶」，確認 Modal 外觀正確。

- [ ] **Step 4: Commit**

```bash
git add src/styles/CreateResidentModal.css src/styles/EditResidentModal.css
git commit -m "style: redesign resident modals with light theme

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Utility Modals

**Files:**
- Modify: `src/styles/ChangePasswordModal.css`
- Modify: `src/styles/DeleteConfirmModal.css`
- Modify: `src/styles/BulkImportModal.css`

- [ ] **Step 1: 重寫 ChangePasswordModal.css**

```css
/* Change Password Modal */
.change-password-modal .modal-content {
  max-width: 440px;
}

.change-password-modal .modal-icon { color: var(--warning-600); }

.password-strength {
  margin-top: var(--space-2);
}

.password-strength-bar {
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--border-medium);
  overflow: hidden;
}

.password-strength-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-weak   { width: 33%; background: var(--error-500); }
.strength-medium { width: 66%; background: var(--warning-500); }
.strength-strong { width: 100%; background: var(--success-500); }

.password-strength-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-1);
}
```

- [ ] **Step 2: 重寫 DeleteConfirmModal.css**

```css
/* Delete Confirm Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
  animation: modalOverlayIn 0.2s ease-out;
}

.modal-content {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 380px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-medium);
}

.modal-title {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--error-600);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Remove old emoji pseudo-element */
.modal-title::before { content: none; }

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-primary);
  color: var(--text-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-sm);
}

.modal-close-btn:hover {
  background: var(--error-100);
  color: var(--error-700);
}

.modal-body {
  padding: var(--space-6);
  text-align: center;
}

.warning-icon {
  width: 52px;
  height: 52px;
  background: var(--error-100);
  border: 2px solid rgba(220,96,96,.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  font-size: var(--text-xl);
  color: var(--error-600);
}

.warning-message {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.warning-detail {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-4);
}

.resident-info {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-base);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: var(--space-3) 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-medium);
}

.btn { /* delete confirm only needs cancel + danger */
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  padding: var(--space-2) var(--space-5);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1.5px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-width: 80px;
}

.btn-cancel {
  background: transparent;
  border-color: var(--border-light);
  color: var(--text-secondary);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-dark);
}

.btn-danger {
  background: var(--error-600);
  color: #ffffff;
  border-color: transparent;
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-700);
  box-shadow: 0 4px 12px rgba(220,96,96,.3);
  transform: translateY(-1px);
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes modalOverlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: scale(0.92) translateY(-12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .modal-content { max-width: 95vw; }
  .modal-actions { flex-direction: column-reverse; }
  .btn { width: 100%; }
}
```

- [ ] **Step 3: 重寫 BulkImportModal.css**

```css
/* Bulk Import Modal */
.bulk-import-modal .modal-content {
  max-width: 500px;
}

.bulk-import-modal .modal-icon { color: var(--primary-600); }

/* File drop zone */
.file-drop-zone {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-base);
  padding: var(--space-8) var(--space-4);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-tertiary);
}

.file-drop-zone:hover {
  border-color: var(--primary-600);
  background: var(--primary-25);
}

.file-drop-zone.dragging {
  border-color: var(--primary-600);
  background: var(--primary-50);
}

.file-drop-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
}

.file-drop-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Selected file */
.selected-file {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--primary-25);
  border: 1px solid var(--primary-100);
  border-radius: var(--radius-base);
  margin-top: var(--space-3);
}

.selected-file-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--primary-700);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Import result */
.import-result {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  margin-top: var(--space-3);
}

.import-result-success {
  background: var(--success-100);
  color: var(--success-700);
  border: 1px solid rgba(74,158,110,.2);
}

.import-result-error {
  background: var(--error-100);
  color: var(--error-700);
  border: 1px solid rgba(220,96,96,.2);
}
```

- [ ] **Step 4: 驗證**

觸發「修改密碼」、「刪除住戶確認」、「批次匯入」Modal，依序確認視覺正確：
- 刪除確認：紅色警告圖示居中、兩個按鈕靠右
- 修改密碼：表單欄位正常
- 批次匯入：檔案拖曳區正常

- [ ] **Step 5: Commit**

```bash
git add src/styles/ChangePasswordModal.css src/styles/DeleteConfirmModal.css src/styles/BulkImportModal.css
git commit -m "style: redesign utility modals with consistent light design

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 14: Toast Notifications

**Files:**
- Modify: `src/styles/Toast.css`

- [ ] **Step 1: 重寫 Toast.css**

```css
/* Toast Notifications - Light Theme */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  min-width: 300px;
  max-width: 480px;
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-lg);
  background: #ffffff;
  border: 1px solid var(--border-light);
  animation: toastSlideIn 0.25s ease-out;
  overflow: hidden;
}

.toast-success { border-left: 4px solid var(--success-500); }
.toast-error   { border-left: 4px solid var(--error-500); }
.toast-warning { border-left: 4px solid var(--warning-500); }
.toast-info    { border-left: 4px solid var(--primary-600); }

.toast-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.toast-success .toast-dot { background: var(--success-500); }
.toast-error   .toast-dot { background: var(--error-500); }
.toast-warning .toast-dot { background: var(--warning-500); }
.toast-info    .toast-dot { background: var(--primary-600); }

/* 舊版 icon class 相容 */
.toast-icon { flex-shrink: 0; font-size: var(--text-sm); }
.toast-success .toast-icon { color: var(--success-600); }
.toast-error   .toast-icon { color: var(--error-600); }
.toast-warning .toast-icon { color: var(--warning-600); }
.toast-info    .toast-icon { color: var(--primary-600); }

.toast-message {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  flex: 1;
  line-height: var(--leading-normal);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.93);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (max-width: 480px) {
  .toast {
    min-width: 260px;
    max-width: calc(100vw - var(--space-8));
  }
}
```

- [ ] **Step 2: 驗證**

觸發任意操作（例如報到、儲存），確認 Toast 顯示為白色底色 + 左側彩色條，不再是純色 Toast。

- [ ] **Step 3: 最終全頁驗證**

依序確認以下路徑視覺無問題：
- `/login` — 淡漸層背景 + 白色卡片
- `/` — 統計卡片 + 表格
- `/meetings` — 搜尋框 + 表格
- `/meetings/:id/scan` — 兩欄掃描器
- `/meetings/:id/summary` — 4 格統計 + 進度條
- `/residents` — 住戶表格
- `/profile` — 兩欄個人資料
- 所有 Modal — 白底圓角、輸入框淺灰底
- Toast — 白底左側色條

在 768px 和 480px 寬度下確認 RWD 無版面崩潰。

- [ ] **Step 4: Commit**

```bash
git add src/styles/Toast.css
git commit -m "style: redesign toast with white card and colored left border

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] 底色系統（#eaedf2 頁面底色，#f4f6f9 表面）→ Task 1
- [x] 主色漸層（5b7fa6 → 7c6fa8）→ Task 1
- [x] 語意色（success/warning/danger）→ Task 1
- [x] 圓角尺度（8px~999px）→ Task 1
- [x] 陰影（sm/md/lg）→ Task 1
- [x] NavBar 56px + 膠囊選中態 → Task 2
- [x] Login 居中白卡 + 漸層背景 → Task 3
- [x] HomePage 統計卡片 → Task 4
- [x] 會議列表搜尋 + 表格 → Task 5
- [x] 分頁底線選中態 → Task 6
- [x] QR 掃描 兩欄佈局 → Task 7
- [x] 人工報到 表單卡片 → Task 7
- [x] 出席統計 4 格數字 + 進度條 → Task 7
- [x] 住戶列表 搜尋 + 表格 → Task 8
- [x] 個人資料 兩欄側欄 → Task 9
- [x] 社區設定 表單卡片 → Task 9
- [x] Modal 白底 backdrop-blur → Task 10
- [x] 所有 Modal 元件 → Task 11-13
- [x] Toast 白底左側色條 → Task 14
- [x] RWD (1024/768/480) → 各 Task 的 @media
- [x] 不動任何 JSX 邏輯 → 所有 Task 僅改 .css 檔
