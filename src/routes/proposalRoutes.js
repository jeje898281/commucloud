// src/routes/proposalRoutes.js
const router = require('express').Router();
const {
    handleCreateProposal, handleListProposals, handleGetProposal,
    handleUpdateProposal, handleDeleteProposal, handleGenerateBallots, handleVote,
} = require('../controllers/proposalController');
const requireRole = require('../middleware/requireRole');

// 掃碼記票：管理員 / 社區經理 / 秘書（會議助理）皆可
router.post('/vote', requireRole('admin', 'manager', 'meeting_assistant'), handleVote);

// 投票單批量列印資料
router.get('/meeting/:meetingId/ballots', requireRole('admin', 'manager'), handleGenerateBallots);

// 依會議列出提案（含票數統計）
router.get('/meeting/:meetingId', handleListProposals);

// 建立提案：管理員 / 社區經理
router.post('/', requireRole('admin', 'manager'), handleCreateProposal);

router.get('/:id', handleGetProposal);
router.patch('/:id', requireRole('admin', 'manager'), handleUpdateProposal);
router.delete('/:id', requireRole('admin', 'manager'), handleDeleteProposal);

module.exports = router;
