// routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// יצירת תיקיית uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 תיקיית uploads נוצרה');
}

// הגדרת multer לאחסון מקומי פשוט
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // יצירת שם קובץ ייחודי
        const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// פילטר לסוגי קבצים מותרים
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('רק קבצי תמונה מותרים (JPEG, JPG, PNG, GIF, WebP)'));
    }
};

// הגדרת multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: fileFilter
});

// הגשת קבצים סטטיים
router.use('/files', express.static(uploadsDir));

// העלאת תמונה
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'לא נבחר קובץ להעלאה'
            });
        }

        const { userUuid } = req.body;

        if (!userUuid) {
            // מחיקת הקובץ שהועלה אם אין UUID
            fs.unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                error: 'מזהה משתמש חסר'
            });
        }

        // חיפוש המשתמש במסד הנתונים
        const user = await User.findByUuid(userUuid);

        if (!user) {
            // מחיקת הקובץ אם המשתמש לא נמצא
            fs.unlinkSync(req.file.path);

            return res.status(404).json({
                success: false,
                error: 'משתמש לא נמצא'
            });
        }

        // יצירת URL לתמונה
        const imageUrl = `/api/upload/files/${req.file.filename}`;

        // עדכון המשתמש עם פרטי התמונה
        const photoData = {
            url: imageUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        };

        await user.updatePhoto(photoData);

        console.log(`📸 תמונה הועלתה בהצלחה: ${req.file.filename} עבור משתמש ${user.name}`);

        res.status(200).json({
            success: true,
            message: 'תמונה הועלתה בהצלחה',
            data: {
                filename: req.file.filename,
                url: imageUrl,
                size: req.file.size,
                uploadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ שגיאה בהעלאת תמונה:', error);

        // מחיקת הקובץ במקרה של שגיאה
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('❌ שגיאה במחיקת קובץ זמני:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            error: 'שגיאה בהעלאת התמונה'
        });
    }
});

// מחיקת תמונה
router.delete('/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { userUuid } = req.body;

        if (!userUuid) {
            return res.status(400).json({
                success: false,
                error: 'מזהה משתמש חסר'
            });
        }

        // חיפוש המשתמש
        const user = await User.findByUuid(userUuid);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'משתמש לא נמצא'
            });
        }

        const filePath = path.join(uploadsDir, filename);

        // בדיקה אם הקובץ קיים ומחיקתו
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ קובץ נמחק: ${filename}`);
        }

        // עדכון המשתמש (הסרת פרטי התמונה)
        await user.updatePhoto(null);

        console.log(`🗑️ תמונה נמחקה עבור משתמש: ${user.name}`);

        res.json({
            success: true,
            message: 'תמונה נמחקה בהצלחה'
        });

    } catch (error) {
        console.error('❌ שגיאה במחיקת תמונה:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה במחיקת התמונה'
        });
    }
});

// קבלת מידע על תמונה
router.get('/info/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'קובץ לא נמצא'
            });
        }

        const stats = fs.statSync(filePath);

        res.json({
            success: true,
            data: {
                filename: filename,
                size: stats.size,
                sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                url: `/api/upload/files/${filename}`
            }
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת מידע על תמונה:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בקבלת מידע על התמונה'
        });
    }
});

// רשימת כל התמונות (למטרות debug)
router.get('/list', async (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const fileList = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename,
                size: stats.size,
                createdAt: stats.birthtime,
                url: `/api/upload/files/${filename}`
            };
        });

        res.json({
            success: true,
            data: fileList,
            count: fileList.length
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת רשימת קבצים:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בקבלת רשימת קבצים'
        });
    }
});

// ניקוי קבצים יתומים (קבצים ללא משתמש)
router.delete('/cleanup/orphaned', async (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        let deletedCount = 0;

        for (const filename of files) {
            // חיפוש משתמש עם התמונה הזו
            const user = await User.findOne({ 'photo.filename': filename });

            if (!user) {
                // קובץ יתום - מחק אותו
                const filePath = path.join(uploadsDir, filename);
                fs.unlinkSync(filePath);
                deletedCount++;
                console.log(`🧹 נמחק קובץ יתום: ${filename}`);
            }
        }

        res.json({
            success: true,
            message: `נמחקו ${deletedCount} קבצים יתומים`,
            deletedCount
        });

    } catch (error) {
        console.error('❌ שגיאה בניקוי קבצים:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בניקוי קבצים'
        });
    }
});

// Middleware לטיפול בשגיאות multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'קובץ גדול מדי - מקסימום 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'יותר מדי קבצים - מותר קובץ אחד בלבד'
            });
        }
    }

    if (error.message.includes('רק קבצי תמונה מותרים')) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }

    next(error);
});

export default router;