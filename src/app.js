const express = require('express');
const cors = require('cors');
const publicRoutes = require('./routes/public.routes.js');
const authRoutes = require('./routes/auth.routes.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Online Shop API');
});

module.exports = app;