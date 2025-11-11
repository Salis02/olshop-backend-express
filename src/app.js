const express = require('express');
const cors = require('cors');
const publicRoutes = require('./routes/public.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const addressRoutes = require('./routes/address.routes.js');
const categoryRoutes = require('./routes/category.routes.js');
const productRoutes = require('./routes/product.routes.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
    res.send('🛍️ Welcome to the Online Shop API');
});

module.exports = app;