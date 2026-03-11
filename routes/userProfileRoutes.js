const express = require('express');
const { getUsers, getUser, updateProfile, deleteUser } = require('../controllers/userProfile');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/profile', protect, updateProfile);

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUser)
    .delete(deleteUser);

module.exports = router;
