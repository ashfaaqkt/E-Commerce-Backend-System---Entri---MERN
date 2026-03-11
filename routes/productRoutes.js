const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin', 'user'), createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin', 'user'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
