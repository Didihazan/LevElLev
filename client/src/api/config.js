const API_BASE_URL = 'http://localhost:5000/api';

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

    // URL לתמונות
    getPhotoUrl: (filename) => `http://localhost:5000/uploads/photos/${filename}`
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

        const response = await fetch(apiConfig.url, options);
        const data = await response.json();

        if (!response.ok) {
            // הצגת שגיאות מפורטות מהשרת
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(`${data.message}\n\n${data.errors.join('\n')}`);
            } else if (data.message) {
                throw new Error(data.message);
            } else {
                throw new Error(`שגיאת HTTP: ${response.status}`);
            }
        }

        return data;

    } catch (error) {
        console.error('API Error:', error);

        // טיפול בשגיאות רשת
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('שגיאת חיבור לשרת. נא לבדוק שהשרת פועל ולנסות שוב.');
        }

        throw error;
    }
};

export default API;