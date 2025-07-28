import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import participantsRouter from './routes/participants.js';

// הגדרת __dirname ב-ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// יצירת אפליקציית Express
const app = express();
const PORT = process.env.PORT || 5000;

// חיבור למסד הנתונים
connectDB();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',        // פיתוח מקומי
        'https://lev-el-lev.vercel.app' // פרודקשן
    ],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// הגשת קבצים סטטיים (תמונות)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// נתבי API
app.use('/api/participants', participantsRouter);

// נתב בדיקה
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'השרת פועל תקין',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// נתב ברירת מחדל
app.get('/', (req, res) => {
    res.json({
        message: '🎉 שרת אפליקציית היכרויות לחתונה',
        version: '1.0.0',
        endpoints: [
            'GET /api/health - בדיקת תקינות השרת',
            'POST /api/participants - הוספת משתתף חדש',
            'GET /api/participants/males - רשימת רווקים',
            'GET /api/participants/females - רשימת רווקות',
            'GET /api/participants/stats - סטטיסטיקות',
            'GET /uploads/photos/:filename - הצגת תמונות'
        ]
    });
});

// טיפול בשגיאות 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `נתב לא נמצא: ${req.originalUrl}`
    });
});

// טיפול בשגיאות כלליות
app.use((error, req, res, next) => {
    console.error('❌ שגיאה כללית:', error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'שגיאה פנימית בשרת',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// הפעלת השרת
app.listen(PORT, () => {
    console.log(`
    🚀 השרת פועל על פורט ${PORT}
    🌐 כתובת: http://localhost:${PORT}
    📊 MongoDB Atlas: מחובר
    📁 תמונות: /uploads/photos/
    🔗 API: /api/participants
    `);
});

// סגירה נקייה
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

export default app;