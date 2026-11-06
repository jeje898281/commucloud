# CommuCloud — Frontend

**English** · [中文](#中文)

Admin console for **CommuCloud**, a web app that runs condominium owners' meetings (區分所有權人會議): resident check-in, proposal voting, and live quorum tracking by both headcount and floor area.

Committee staff use it on a laptop or phone during the meeting: scan a resident's QR code at the door, scan paper ballots as votes are cast, and watch the attendance summary update against the legal thresholds.

Part of the [CommuCloud](../README.md) monorepo: [`backend/`](../backend) · [`frontend/`](../frontend) · [`infra/`](../infra).

## What staff can do

| Page | Purpose |
| --- | --- |
| Meetings | Create meetings and set the headcount and floor-area thresholds |
| Residents | Manage units, floor area and email; bulk import from a spreadsheet |
| QR codes | Generate check-in QR codes for every resident and download them as a ZIP |
| Scan / Manual check-in | Check residents in with the camera, or by hand when a code is missing |
| Summary | Attendance count and floor-area percentage against the meeting thresholds |
| Proposals / Ballots | Create proposals and print one QR ballot per resident and option |
| Vote scan | Scan ballots to record votes with the supervising staff member |
| Notify | Preview and send meeting notices to residents by email |
| Admin users | Create sub-accounts with `admin`, `manager` or `meeting_assistant` roles |

Pages and actions are hidden or disabled according to the signed-in user's role, and the API enforces the same rules.

## Tech stack

React 18 · React Router 6 · Vite 5 · Axios · html5-qrcode · JSZip · Nginx (production image)

## Project structure

```
src/
  pages/        route-level screens (auth, meetings, admin)
  components/   modals, scanner, layout, route guards
  contexts/     auth and current-meeting state
  services/     Axios client with JWT interceptor
  utils/        role permissions, toasts, JWT helpers
  styles/       design tokens and page styles
```

## Getting started

Start the API first (see [`backend/`](../backend)), or bring up the whole stack with [`infra/`](../infra).

```bash
pnpm install
pnpm dev          # http://localhost:5173, proxies /api to VITE_API_TARGET (default http://localhost:3000)
```

Production build:

```bash
pnpm build        # outputs dist/
```

`Dockerfile.prod` builds the app and serves `dist/` with Nginx. [`nginx.conf`](nginx.conf) disables caching for `index.html`, caches hashed assets for a year, and proxies `/api/` to the backend service inside the Docker network.

---

## 中文

**CommuCloud** 的管理後台。CommuCloud 是社區區分所有權人會議的管理系統，涵蓋住戶報到、提案表決，以及依出席戶數與坪數比例即時計算的法定門檻。

管委會人員於會議現場以筆電或手機操作：入口掃描住戶 QR Code 報到、投票時掃描紙本選票，並即時查看出席統計是否達到法定門檻。

本目錄屬於 [CommuCloud](../README.md) monorepo：[`backend/`](../backend) · [`frontend/`](../frontend) · [`infra/`](../infra)。

### 頁面功能

| 頁面 | 用途 |
| --- | --- |
| 會議 | 建立會議，設定出席戶數與坪數門檻 |
| 住戶 | 管理戶號、坪數與 Email，支援試算表批次匯入 |
| QR Code | 為所有住戶產生報到 QR Code，打包為 ZIP 下載 |
| 掃描／手動報到 | 以相機掃描報到，或於無 QR Code 時手動登記 |
| 統計 | 出席戶數與坪數比例對照會議門檻 |
| 提案／選票 | 建立提案，為每戶列印各選項的 QR 選票 |
| 投票掃描 | 掃描選票記錄投票結果與監票人員 |
| 通知 | 預覽並以 Email 寄送會議通知 |
| 管理員帳號 | 建立 `admin`、`manager`、`meeting_assistant` 角色的子帳號 |

頁面與操作依登入者角色隱藏或停用，API 端亦執行相同的權限規則。

### 技術

React 18 · React Router 6 · Vite 5 · Axios · html5-qrcode · JSZip · Nginx（正式環境映像檔）

### 本機啟動

請先啟動 API（見 [`backend/`](../backend)），或以 [`infra/`](../infra) 啟動完整環境。

```bash
pnpm install
pnpm dev          # http://localhost:5173，/api 轉發至 VITE_API_TARGET（預設 http://localhost:3000）
pnpm build        # 輸出至 dist/
```

`Dockerfile.prod` 建置後以 Nginx 提供 `dist/`。[`nginx.conf`](nginx.conf) 設定 `index.html` 不快取、hashed assets 快取一年，並將 `/api/` 轉發至 Docker 網路內的後端服務。
