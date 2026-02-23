const express = require('express');
const router = express.Router();
const { getLogs, toggleLog } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getLogs);
router.post('/toggle', toggleLog);

module.exports = router;
