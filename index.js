const express = require('express');
require('dotenv').config();
const path = require('path');
const app = express();
const cors = require('cors');
const DataBase = require('./src/config/DataBase');
const userRouter = require('./src/routers/userRouter');
const productRouter = require('./src/routers/productRouter');
const variantRouter = require('./src/routers/variantsRouter')

const PORT = process.env.PORT || 4000;

// Middleware order matters! Configure CORS first
const allowedOrigins = [
    'https://app.printfuse.in',
    'http://localhost:3000', // Add frontend's origin explicitly
    'https://localhost:3000', // Add frontend's origin explicitly
    `http://${process.env.HOST}:3000`, // Example frontend URL
    `https://${process.env.HOST}:3000`, // Example frontend URL
    'https://emilus-e-commerce.onrender.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith(`http://${process.env.HOST}`) || origin.startsWith('http://localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Add common headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow methods
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Configure body parsers once
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', userRouter);
app.use('/api/ecommerce', productRouter);
app.use('/api/ecommerce', variantRouter);

app.get('/', (req, res) => {
    res.send('Server Running...');
});

app.listen(PORT, `${process.env.HOST}`, (err) => {
    if (err) throw new Error(err);
    DataBase();
    console.log(`Server running on http://${process.env.HOST}:${PORT}`);
});