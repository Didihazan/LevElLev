// זיהוי אוטומטי של סביבת הפעלה
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

// כתובות מתוקנות
const API_BASE_URL = isDevelopment
    ? 'http://localhost:5000/api'  // פיתוח - השרת המקומי
    : 'https://levellev-server.onrender.com/api';  // פרודקשן - Render

console.log(`🌐 API Base URL: ${API_BASE_URL} (${isDevelopment ? 'Development' : 'Production'})`);

export const API = {
    // בדיקת תקינות השרת
    health: () => ({
        url: `${API_BASE_URL.replace('/api', '')}/api/health`,
        method: 'GET'
    }),

    // הוספת משתתף חדש
    addParticipant: (formData) => ({
        url: `${API_BASE_URL}/participants`,
        method: 'POST',
        body: formData // FormData object
    }),

    // קבלת רשימת רווקים
    getMales: () => ({
        url: `${API_BASE_URL}/participants/males`,
        method: 'GET'
    }),

    // קבלת רשימת רווקות
    getFemales: () => ({
        url: `${API_BASE_URL}/participants/females`,
        method: 'GET'
    }),

    // סטטיסטיקות
    getStats: () => ({
        url: `${API_BASE_URL}/participants/stats`,
        method: 'GET'
    }),

    // מחיקת משתתף
    deleteParticipant: (participantId) => ({
        url: `${API_BASE_URL}/participants/${participantId}`,
        method: 'DELETE'
    }),

    // URL לתמונות מ-Cloudinary
    getPhotoUrl: (photo) => {
        if (photo?.cloudinaryUrl) {
            return photo.cloudinaryUrl;
        }
        return null; // אין תמונה
    }
};

// פונקציית עזר לביצוע קריאות API
export const apiCall = async (apiConfig) => {
    try {
        const options = {
            method: apiConfig.method,
            ...(apiConfig.body && { body: apiConfig.body })
        };

        // אם זה לא FormData, הוסף Content-Type
        if (apiConfig.body && !(apiConfig.body instanceof FormData)) {
            options.headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            options.body = JSON.stringify(apiConfig.body);
        }

        console.log(`📡 API Call: ${apiConfig.method} ${apiConfig.url}`);
        const response = await fetch(apiConfig.url, options);
        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ API Error ${response.status}:`, data);

            // הצגת שגיאות מפורטות מהשרת
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(`${data.message}\n\n${data.errors.join('\n')}`);
            } else if (data.message) {
                throw new Error(data.message);
            } else {
                throw new Error(`שגיאת HTTP: ${response.status}`);
            }
        }

        console.log(`✅ API Success:`, data);
        return data;

    } catch (error) {
        console.error('❌ API Error:', error);

        // טיפול בשגיאות רשת
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('שגיאת חיבור לשרת. נא לבדוק שהשרת פועל ולנסות שוב.');
        }

        throw error;
    }
};

export default API;