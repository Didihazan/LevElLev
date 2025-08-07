import express from 'express';
import SearchRequest from '../models/SearchRequest.js';

const router = express.Router();

// POST /api/search-requests - הוספת בקשת חיפוש
router.post('/', async (req, res) => {
    try {
        const searchData = {
            targetGender: req.body.targetGender,
            description: {
                height: req.body.height || '',
                hairColor: req.body.hairColor || '',
                clothing: req.body.clothing || '',
                specialFeatures: req.body.specialFeatures || ''
            },
            connectionToEvent: req.body.connectionToEvent || '',
            searcher: {
                name: req.body.searcherName,
                phone: req.body.searcherPhone,
                aboutMe: req.body.aboutMe || ''
            }
        };

        const searchRequest = new SearchRequest(searchData);
        await searchRequest.save();

        console.log(`🔍 בקשת חיפוש חדשה: ${searchRequest.searcher.name} מחפש/ת ${searchRequest.targetGender === 'male' ? 'גבר' : 'אישה'}`);

        res.status(201).json({
            success: true,
            message: 'בקשת החיפוש נשלחה בהצלחה',
            searchRequest: {
                id: searchRequest._id,
                searcherName: searchRequest.searcher.name,
                submittedAt: searchRequest.submittedAt
            }
        });

    } catch (error) {
        console.error('❌ שגיאה בהוספת בקשת חיפוש:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'נא למלא את כל השדות הנדרשים'
            });
        }

        res.status(500).json({
            success: false,
            message: 'שגיאה בשליחת הבקשה'
        });
    }
});

// GET /api/search-requests - קבלת כל בקשות החיפוש
router.get('/', async (req, res) => {
    try {
        const searchRequests = await SearchRequest.find().sort({ submittedAt: -1 });

        console.log(`📋 נשלחו ${searchRequests.length} בקשות חיפוש`);

        res.json({
            success: true,
            count: searchRequests.length,
            searchRequests
        });

    } catch (error) {
        console.error('❌ שגיאה בקבלת בקשות חיפוש:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה בטעינת בקשות החיפוש'
        });
    }
});

// DELETE /api/search-requests/:id - מחיקת בקשת חיפוש
router.delete('/:id', async (req, res) => {
    try {
        const searchRequest = await SearchRequest.findByIdAndDelete(req.params.id);

        if (!searchRequest) {
            return res.status(404).json({
                success: false,
                message: 'בקשת חיפוש לא נמצאה'
            });
        }

        console.log(`🗑️ בקשת חיפוש נמחקה: ${searchRequest.searcher.name}`);

        res.json({
            success: true,
            message: 'בקשת החיפוש נמחקה בהצלחה'
        });

    } catch (error) {
        console.error('❌ שגיאה במחיקת בקשת חיפוש:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה במחיקת הבקשה'
        });
    }
});

export default router;