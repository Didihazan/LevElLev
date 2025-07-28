import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// הגדרת Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// הגדרת אחסון ב-Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wedding-photos', // תיקיה ב-Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            {
                width: 500,
                height: 500,
                crop: 'fill',
                quality: 'auto:good',
                fetch_format: 'auto'
            }
        ],
        public_id: (req, file) => `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
});

// יצירת multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB מקסימום
        files: 1 // קובץ אחד בלבד
    }
});

// middleware לטיפול בשגיאות העלאה
const handleUploadErrors = (error, req, res, next) => {
    console.error('שגיאה בהעלאת תמונה:', error);

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

    // שגיאות Cloudinary
    if (error.name === 'Error' && error.message.includes('cloudinary')) {
        return res.status(500).json({
            success: false,
            message: 'שגיאה בשירות התמונות. נסה שוב מאוחר יותר.',
            errorType: 'CLOUDINARY_ERROR'
        });
    }

    next(error);
};

export { upload, handleUploadErrors };