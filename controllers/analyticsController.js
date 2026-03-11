const Product = require('../models/product');
const Order = require('../models/order');

// @desc    Get recommended products based on RapidMiner analytics (Mocked)
// @route   GET /api/analytics/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
    try {
        // Mocking a predictive analytics RapidMiner integration. 
        // In a real scenario, this would involve sending user data and order history 
        // to a RapidMiner Server endpoint and receiving recommendations back.

        // As a mock, we will find products from categories the user has previously bought from,
        // or just return the most highly rated/popular items.

        const userOrders = await Order.find({ user: req.user.id }).populate('orderItems.product');

        let categoriesBought = [];
        userOrders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product && item.product.category) {
                    categoriesBought.push(item.product.category);
                }
            });
        });

        // Unique categories
        categoriesBought = [...new Set(categoriesBought)];

        let recommendedProducts = [];

        if (categoriesBought.length > 0) {
            // Find highly rated products in those categories
            recommendedProducts = await Product.find({
                category: { $in: categoriesBought },
                averageRating: { $gte: 4.0 }
            }).limit(5);
        }

        // If no purchase history or not enough recommended products, fallback to top rated overall
        if (recommendedProducts.length < 5) {
            const topProducts = await Product.find()
                .sort({ averageRating: -1 })
                .limit(5);

            // Combine and unique by ID
            const combined = [...recommendedProducts, ...topProducts];
            const uniqueMap = new Map();
            combined.forEach(p => uniqueMap.set(p._id.toString(), p));
            recommendedProducts = Array.from(uniqueMap.values()).slice(0, 5);
        }

        res.status(200).json({
            success: true,
            info: 'Recommendations powered by simulated RapidMiner Predictive Analytics',
            data: recommendedProducts
        });

    } catch (err) {
        next(err);
    }
};
