// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import configurations
import { connectDatabase, getDatabaseStatus } from './config/database.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
        success: false,
        error: 'יותר מדי בקשות, נסה שוב בעוד 15 דקות'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Submit form rate limiting (מגביל יותר)
const submitLimiter = rateLimit({
    windowMs: 60 * 1000, // דקה אחת
    max: 3, // מקסימום 3 שליחות בדקה
    message: {
        success: false,
        error: 'יותר מדי שליחות טופס, נסה שוב בעוד דקה'
    }
});

app.use(limiter);

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware לתיעוד בקשות (בפיתוח)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
        next();
    });
}

// Connect to MongoDB Atlas
await connectDatabase();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// API status endpoint
app.get('/api/status', (req, res) => {
    const dbStatus = getDatabaseStatus();

    res.json({
        success: true,
        status: 'active',
        message: 'Wedding Match API is running with MongoDB Atlas',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Submit form endpoint עם rate limiting מיוחד
app.use('/api/submit', submitLimiter);

// Health check מפורט
app.get('/health', async (req, res) => {
    try {
        const dbStatus = getDatabaseStatus();

        res.status(200).json({
            success: true,
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: {
                status: dbStatus.state,
                host: dbStatus.host,
                name: dbStatus.name,
                collections: dbStatus.collections.length
            },
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'Service Unavailable',
            error: 'Database connection issue',
            timestamp: new Date().toISOString()
        });
    }
});

// Route לסטטיסטיקות מהירות
app.get('/api/quick-stats', async (req, res) => {
    try {
        const User = (await import('./models/User.js')).default;
        const stats = await User.getStats();

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'שגיאה בקבלת סטטיסטיקות'
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'נתיב לא נמצא',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        availableEndpoints: {
            users: '/api/users/*',
            upload: '/api/upload/*',
            status: '/api/status',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Server Error:', error);

    // MongoDB specific errors
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'שגיאת ולידציה',
            details: errors
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'מזהה לא תקין'
        });
    }

    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'רשומה עם הנתונים האלו כבר קיימת'
        });
    }

    res.status(error.status || 500).json({
        success: false,
        error: error.message || 'שגיאת שרת פנימית',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            details: error
        })
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
🚀 Wedding Match Server is running with MongoDB Atlas!
📍 Local:            http://localhost:${PORT}
📊 Health Check:     http://localhost:${PORT}/health
📋 API Status:       http://localhost:${PORT}/api/status
📈 Quick Stats:      http://localhost:${PORT}/api/quick-stats
🗃️  Database:        MongoDB Atlas
🌍 Environment:      ${process.env.NODE_ENV || 'development'}
⏰ Started at:       ${new Date().toLocaleString('he-IL')}
    `);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);

    // סגירת השרת
    server.close(async () => {
        console.log('✅ HTTP server closed');

        // סגירת חיבור למסד הנתונים
        const { closeDatabase } = await import('./config/database.js');
        await closeDatabase();

        console.log('👋 Goodbye!');
        process.exit(0);
    });

    // כפית שגירה אחרי 10 שניות
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Promise Rejection:', err);
    gracefulShutdown('unhandledRejection');
});

export default app;