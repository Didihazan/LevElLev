import express from 'express';
import Participant from '../models/Participant.js';
import { upload, handleUploadErrors } from '../middleware/upload.js'; // ✅ נתיב נכון

const router = express.Router();

// POST /api/participants - הוספת משתתף חדש
router.post('/', upload.single('photo'), handleUploadErrors, async (req, res) => {
    try {
        console.log('📝 נתקבל טופס חדש:', {
            gender: req.body.gender,
            name: req.body.name,
            hasPhoto: !!req.file
        });

        const participantData = {
            gender: req.body.gender,
            list: req.body.gender === 'male' ? 'רווקים' : 'רווקות',
            name: req.body.name,
            age: req.body.age ? parseInt(req.body.age) : undefined,
            status: req.body.status,
            height: req.body.height && req.body.height !== '' ? parseInt(req.body.height) : undefined,
            location: req.body.location || undefined,
            community: req.body.community || undefined,
            religiosity: req.body.religiosity || undefined,
            service: req.body.service || undefined,
            occupation: req.body.occupation || undefined,
            education: req.body.education || undefined,
            personality: req.body.personality || undefined,
            lookingFor: req.body.lookingFor || undefined,
            additionalInfo: req.body.additionalInfo || undefined,
            contactName: req.body.contactName || undefined,
            phone: req.body.phone,
            submittedAt: new Date()
        };

        // אם הועלתה תמונה ל-Cloudinary
        if (req.file) {
            participantData.photo = {
                cloudinaryUrl: req.file.path,        // URL מלא מ-Cloudinary
                publicId: req.file.filename,         // מזהה ב-Cloudinary למחיקה עתידית
                originalName: req.file.originalname, // שם המקורי
                size: req.file.bytes,               // גודל בבתים
                format: req.file.format             // פורמט התמונה
            };
            console.log('📸 תמונה הועלתה:', req.file.path);
        }

        // יצירת משתתף חדש
        const participant = new Participant(participantData);
        await participant.save();

        console.log(`✅ משתתף חדש נוסף: ${participant.name} (${participant.list})`);

        res.status(201).json({
            success: true,
            message: `המשתתף נוסף בהצלחה לרשימת ה${participant.list}`,
            participant: {
                id: participant._id,
                name: participant.name,
                list: participant.list,
                submittedAt: participant.submittedAt
            }
        });

    } catch (error) {
        console.error('❌ שגיאה בהוספת משתתף:', error);

        // טיפול בשגיאות וולידציה
        if (error.name === 'ValidationError') {
            const errorMessages = {};
            const friendlyMessages = [];

            Object.keys(error.errors).forEach(field => {
                const err = error.errors[field];
                let friendlyMessage = '';

                switch (field) {
                    case 'name':
                        friendlyMessage = 'שם מלא הוא שדה חובה';
                        break;
                    case 'age':
                        if (err.kind === 'required') {
                            friendlyMessage = 'גיל הוא שדה חובה';
                        } else if (err.kind === 'min') {
                            friendlyMessage = 'גיל מינימלי הוא 18 שנים';
                        } else if (err.kind === 'max') {
                            friendlyMessage = 'גיל מקסימלי הוא 99 שנים';
                        } else {
                            friendlyMessage = 'גיל חייב להיות מספר תקין בין 18-99';
                        }
                        break;
                    case 'height':
                        if (err.kind === 'min') {
                            friendlyMessage = 'גובה מינימלי הוא 140 ס"מ';
                        } else if (err.kind === 'max') {
                            friendlyMessage = 'גובה מקסימלי הוא 220 ס"מ';
                        } else {
                            friendlyMessage = 'גובה חייב להיות מספר תקין בין 140-220 ס"מ (או השאר ריק)';
                        }
                        break;
                    case 'status':
                        friendlyMessage = 'נא לבחור סטטוס משפחתי תקין';
                        break;
                    case 'phone':
                        friendlyMessage = 'מספר טלפון הוא שדה חובה';
                        break;
                    case 'gender':
                        friendlyMessage = 'נא לבחור מין (גבר/אישה)';
                        break;
                    case 'religiosity':
                        friendlyMessage = 'נא לבחור רמה דתית תקינה מהרשימה';
                        break;
                    default:
                        friendlyMessage = `שגיאה בשדה ${field}: ${err.message}`;
                }

                errorMessages[field] = friendlyMessage;
                friendlyMessages.push(`• ${friendlyMessage}`);
            });

            return res.status(400).json({
                success: false,
                message: 'נמצאו שגיאות בטופס. נא לתקן ולנסות שוב:',
                errors: friendlyMessages,
                fieldErrors: errorMessages
            });
        }

        res.status(500).json({
            success: false,
            message: 'שגיאה בשרת. נסה שוב מאוחר יותר'
        });
    }
});

// GET /api/participants/males - קבלת רשימת רווקים
router.get('/males', async (req, res) => {
    try {
        const males = await Participant.findByGender('male');

        res.json({
            success: true,
            count: males.length,
            participants: males
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת רשימת רווקים:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה בטעינת רשימת הרווקים'
        });
    }
});

// GET /api/participants/females - קבלת רשימת רווקות
router.get('/females', async (req, res) => {
    try {
        const females = await Participant.findByGender('female');

        res.json({
            success: true,
            count: females.length,
            participants: females
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת רשימת רווקות:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה בטעינת רשימת הרווקות'
        });
    }
});

// GET /api/participants/stats - סטטיסטיקות כלליות (אופציונלי)
router.get('/stats', async (req, res) => {
    try {
        const maleCount = await Participant.countDocuments({ gender: 'male' });
        const femaleCount = await Participant.countDocuments({ gender: 'female' });
        const totalCount = maleCount + femaleCount;

        console.log(`📊 סטטיסטיקות: ${totalCount} משתתפים (${maleCount} רווקים, ${femaleCount} רווקות)`);

        res.json({
            success: true,
            stats: {
                totalParticipants: totalCount,
                males: maleCount,
                females: femaleCount
            }
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת סטטיסטיקות:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה בטעינת הסטטיסטיקות'
        });
    }
});

// DELETE /api/participants/:id - מחיקת משתתף
router.delete('/:id', async (req, res) => {
    try {
        const participantId = req.params.id;

        // וולידציה של MongoDB ObjectId
        if (!participantId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'מזהה משתתף לא תקין'
            });
        }

        // חיפוש המשתתף
        const participant = await Participant.findById(participantId);

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'משתתף לא נמצא'
            });
        }

        // מחיקת המשתתף
        await Participant.findByIdAndDelete(participantId);

        console.log(`🗑️ משתתף נמחק: ${participant.name} (${participant.list})`);

        res.json({
            success: true,
            message: `המשתתף ${participant.name} נמחק בהצלחה`,
            deletedParticipant: {
                id: participant._id,
                name: participant.name,
                list: participant.list
            }
        });

    } catch (error) {
        console.error('❌ שגיאה במחיקת משתתף:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה במחיקת המשתתף. נסה שוב מאוחר יותר'
        });
    }
});

export default router;