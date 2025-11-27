const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger.js')
const publicRoutes = require('./routes/public.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const addressRoutes = require('./routes/address.routes.js');
const categoryRoutes = require('./routes/category.routes.js');
const productRoutes = require('./routes/product.routes.js');
const orderRoutes = require('./routes/order.routes.js');
const cartRoutes = require('./routes/cart.routes.js');
const paymentRoutes = require('./routes/payment.routes.js')
const shipmentRoutes = require('./routes/shipment.routes.js')
const reviewRoutes = require('../src/routes/review.routes.js')
const wishlistRoutes = require('../src/routes/wishlist.routes.js')
const couponRoutes = require('../src/routes/coupon.routes.js')
const eventRoutes = require('../src/routes/event.routes.js')
const eventProductRoutes = require('../src/routes/eventProduct.routes.js')

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(logger);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/events-products', eventProductRoutes)

// app.use('/api/public', publicRoutes);

const errorHandler = require('./middlewares/errorHandler.js')
app.use(errorHandler
    
)
app.get('/', (req, res) => {
    res.send('🛍️ Welcome to the Online Shop API');
});

module.exports = app;