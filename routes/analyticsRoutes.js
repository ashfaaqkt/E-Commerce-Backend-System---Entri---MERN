const express = require('express');
const { getRecommendations } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/recommendations').get(protect, getRecommendations);

module.exports = router;
