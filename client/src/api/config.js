// api/config.js
// קובץ הגדרות API - כאן תשנה רק את ה-BASE_URL לפרודקשן

const API_CONFIG = {
    // URL בסיס לפיתוח (זמני)
    // BASE_URL: 'https://api-dev.wedding-match.temp',
    BASE_URL: 'http://localhost:5000',
    // URL לפרודקשן (תשנה בהמשך)
    // BASE_URL: 'https://your-production-api.com',

    // נתיבי API
    ENDPOINTS: {
        // שליחת טופס חדש
        SUBMIT_FORM: '/api/submit',

        // קבלת רשימת רווקים
        GET_MALES: '/api/users/males',

        // קבלת רשימת רווקות
        GET_FEMALES: '/api/users/females',

        // קבלת פרטי משתמש ספציפי
        GET_USER: '/api/users/:id',

        // העלאת תמונה
        UPLOAD_IMAGE: '/api/upload',

        // מחיקת משתמש (אופציונלי)
        DELETE_USER: '/api/users/:id'
    },

    // הגדרות בקשות
    REQUEST_CONFIG: {
        timeout: 10000, // 10 שניות
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
};

// פונקציה ליצירת URL מלא
export const buildUrl = (endpoint, params = {}) => {
    let url = API_CONFIG.BASE_URL + endpoint;

    // החלפת פרמטרים ב-URL (למשל :id)
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });

    return url;
};

// פונקציות API מוכנות לשימוש
export const API = {
    // שליחת טופס
    submitForm: (formData) => ({
        url: buildUrl(API_CONFIG.ENDPOINTS.SUBMIT_FORM),
        method: 'POST',
        data: formData
    }),

    // קבלת רשימת רווקים
    getMales: () => ({
        url: buildUrl(API_CONFIG.ENDPOINTS.GET_MALES),
        method: 'GET'
    }),

    // קבלת רשימת רווקות
    getFemales: () => ({
        url: buildUrl(API_CONFIG.ENDPOINTS.GET_FEMALES),
        method: 'GET'
    }),

    // קבלת פרטי משתמש
    getUser: (userId) => ({
        url: buildUrl(API_CONFIG.ENDPOINTS.GET_USER, { id: userId }),
        method: 'GET'
    }),

    // העלאת תמונה
    uploadImage: (imageFile) => ({
        url: buildUrl(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE),
        method: 'POST',
        data: imageFile,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

export default API_CONFIG;