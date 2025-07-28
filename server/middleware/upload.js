import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// יצירת תיקיית uploads אם לא קיימת
const uploadDir = 'uploads/photos';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 תיקיית uploads נוצרה');
}

// הגדרת אחסון
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // יצירת שם קובץ ייחודי
        const uniqueId = uuidv4();
        const fileExtension = path.extname(file.originalname);
        const filename = `photo_${uniqueId}${fileExtension}`;
        cb(null, filename);
    }
});

// פילטר לסוגי קבצים מותרים
const fileFilter = (req, file, cb) => {
    // סוגי תמונות מותרים
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('סוג קובץ לא נתמך. רק תמונות מותרות (JPEG, PNG, GIF, WebP)'), false);
    }
};

// יצירת multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB מקסימום
        files: 1 // קובץ אחד בלבד
    }
});

// middleware לטיפול בשגיאות העלאה
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        let message = '';

        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'התמונה גדולה מדי. מקסימום 5MB מותר';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'ניתן להעלות תמונה אחת בלבד';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'שדה קובץ לא צפוי. נא לבחור תמונה בלבד';
                break;
            default:
                message = `שגיאה בהעלאת הקובץ: ${error.message}`;
        }

        return res.status(400).json({
            success: false,
            message: message,
            errorType: 'UPLOAD_ERROR'
        });
    }

    if (error.message.includes('סוג קובץ לא נתמך')) {
        return res.status(400).json({
            success: false,
            message: 'סוג קובץ לא נתמך. רק תמונות מותרות (JPEG, PNG, GIF, WebP)',
            errorType: 'FILE_TYPE_ERROR'
        });
    }

    next(error);
};

// export של middleware-ים
export { upload, handleUploadErrors };