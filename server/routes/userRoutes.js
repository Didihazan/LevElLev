// routes/userRoutes.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Helper function לניקוי נתוני משתמש לתצוגה
const cleanUserForDisplay = (user) => {
    const userData = user.toJSON();
    return {
        ...userData,
        photo: userData.photo?.url || null
    };
};

// שליחת טופס חדש
router.post('/submit', async (req, res) => {
    try {
        const {
            gender,
            name,
            age,
            status,
            height,
            location,
            community,
            religiosity,
            service,
            occupation,
            education,
            personality,
            lookingFor,
            phone
        } = req.body;

        // וולידציה בסיסית
        if (!name || !age || !gender || !phone) {
            return res.status(400).json({
                success: false,
                error: 'שדות חובה חסרים: שם, גיל, מין וטלפון'
            });
        }

        // יצירת משתמש חדש
        const userData = {
            name: name.trim(),
            age: parseInt(age),
            gender,
            status,
            height: height ? parseInt(height) : undefined,
            location,
            community,
            religiosity,
            service,
            occupation,
            education,
            personality,
            lookingFor,
            phone: phone.trim(),
            submittedFrom: {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }
        };

        const newUser = new User(userData);
        const savedUser = await newUser.save();

        console.log(`✅ משתמש חדש נרשם: ${savedUser.name} (${savedUser.gender}) - ID: ${savedUser.uuid}`);

        res.status(201).json({
            success: true,
            message: 'המשתמש נרשם בהצלחה',
            data: {
                id: savedUser.uuid,
                list: savedUser.gender === 'male' ? 'רווקים' : 'רווקות'
            }
        });

    } catch (error) {
        console.error('❌ שגיאה ברישום משתמש:', error);

        // טיפול בשגיאות MongoDB ספציפיות
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                error: 'נתונים לא תקינים',
                details: errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'משתמש עם הפרטים האלו כבר קיים'
            });
        }

        res.status(500).json({
            success: false,
            error: 'שגיאה ברישום המשתמש'
        });
    }
});

// קבלת רשימת רווקים
router.get('/males', async (req, res) => {
    try {
        const users = await User.findByGender('male');
        const cleanedUsers = users.map(cleanUserForDisplay);

        console.log(`📋 נצפו ${users.length} רווקים`);

        res.json({
            success: true,
            data: cleanedUsers,
            count: cleanedUsers.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת רשימת רווקים:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בקבלת רשימת רווקים'
        });
    }
});

// קבלת רשימת רווקות
router.get('/females', async (req, res) => {
    try {
        const users = await User.findByGender('female');
        const cleanedUsers = users.map(cleanUserForDisplay);

        console.log(`📋 נצפו ${users.length} רווקות`);

        res.json({
            success: true,
            data: cleanedUsers,
            count: cleanedUsers.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת רשימת רווקות:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בקבלת רשימת רווקות'
        });
    }
});

// קבלת פרטי משתמש ספציפי
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByUuid(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'משתמש לא נמצא'
            });
        }

        const cleanedUser = cleanUserForDisplay(user);

        console.log(`👤 נצפו פרטי משתמש: ${user.name.substring(0, 3)}***`);

        res.json({
            success: true,
            data: cleanedUser
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת פרטי משתמש:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בקבלת פרטי משתמש'
        });
    }
});

// עדכון תמונה למשתמש
router.patch('/:id/photo', async (req, res) => {
    try {
        const { id } = req.params;
        const { photoData } = req.body;

        const user = await User.findByUuid(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'משתמש לא נמצא'
            });
        }

        await user.updatePhoto(photoData);

        console.log(`📸 תמונה עודכנה למשתמש: ${user.name.substring(0, 3)}***`);

        res.json({
            success: true,
            message: 'תמונה עודכנה בהצלחה',
            data: {
                photo: photoData
            }
        });

    } catch (error) {
        console.error('❌ שגיאה בעדכון תמונה:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בעדכון התמונה'
        });
    }
});

// מחיקת משתמש (אופציונלי - למקרי חירום)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByUuid(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'משתמש לא נמצא'
            });
        }

        await user.deactivate(); // רק מסמן כלא פעיל, לא מוחק לגמרי

        console.log(`🗑️ משתמש הושבת: ${user.name} - ID: ${id}`);

        res.json({
            success: true,
            message: 'המשתמש הושבת בהצלחה'
        });

    } catch (error) {
        console.error('❌ שגיאה בהשבתת משתמש:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בהשבתת משתמש'
        });
    }
});

// סטטיסטיקות מפורטות
router.get('/admin/stats', async (req, res) => {
    try {
        const stats = await User.getStats();

        console.log('📊 נצפו סטטיסטיקות מפורטות');

        res.json({
            success: true,
            data: {
                ...stats,
                avgAge: Math.round(stats.avgAge * 10) / 10, // עיגול לעשירית
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת סטטיסטיקות:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בקבלת סטטיסטיקות'
        });
    }
});

// חיפוש משתמשים (אופציונלי)
router.get('/search/:term', async (req, res) => {
    try {
        const { term } = req.params;

        const users = await User.find({
            isActive: true,
            $or: [
                { name: { $regex: term, $options: 'i' } },
                { location: { $regex: term, $options: 'i' } },
                { occupation: { $regex: term, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        const cleanedUsers = users.map(cleanUserForDisplay);

        res.json({
            success: true,
            data: cleanedUsers,
            count: cleanedUsers.length,
            searchTerm: term
        });

    } catch (error) {
        console.error('❌ שגיאה בחיפוש:', error);

        res.status(500).json({
            success: false,
            error: 'שגיאה בחיפוש'
        });
    }
});

export default router;