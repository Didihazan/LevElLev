// services/apiService.js
// שירות API מרכזי לכל הבקשות

import { API } from '../api/config';

class ApiService {
    constructor() {
        this.baseConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
    }

    // פונקציה כללית לביצוע בקשות
    async request(apiCall, options = {}) {
        try {
            const config = {
                method: apiCall.method,
                headers: {
                    ...this.baseConfig.headers,
                    ...apiCall.headers,
                    ...options.headers
                },
                ...options
            };

            // אם יש data, הוסף אותו לבקשה
            if (apiCall.data) {
                if (apiCall.headers?.['Content-Type'] === 'multipart/form-data') {
                    // עבור העלאת קבצים
                    config.body = apiCall.data;
                    delete config.headers['Content-Type']; // יוגדר אוטומטית
                } else {
                    // עבור JSON
                    config.body = JSON.stringify(apiCall.data);
                }
            }

            console.log('API Request:', apiCall.url, config);

            const response = await fetch(apiCall.url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
                status: response.status
            };

        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    }

    // שליחת טופס היכרויות
    async submitForm(formData) {
        return await this.request(API.submitForm(formData));
    }

    // קבלת רשימת רווקים
    async getMales() {
        return await this.request(API.getMales());
    }

    // קבלת רשימת רווקות
    async getFemales() {
        return await this.request(API.getFemales());
    }

    // קבלת פרטי משתמש ספציפי
    async getUser(userId) {
        return await this.request(API.getUser(userId));
    }

    // העלאת תמונה
    async uploadImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        return await this.request(API.uploadImage(formData));
    }

    // פונקציות עזר למטרות פיתוח

    // סימולציה של שליחת טופס (זמני)
    async simulateSubmitForm(formData) {
        console.log('Simulating form submission:', formData);

        // סימולציה של השהיה ברשת
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            success: true,
            data: {
                id: Date.now(),
                message: 'טופס נשלח בהצלחה',
                list: formData.gender === 'male' ? 'רווקים' : 'רווקות'
            },
            status: 200
        };
    }

    // סימולציה של קבלת רשימות (זמני)
    async simulateGetUsers() {
        console.log('Simulating get users request');

        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            data: {
                males: [], // רשימה ריקה כרגע
                females: [] // רשימה ריקה כרגע
            },
            status: 200
        };
    }
}

// יצירת instance יחיד לשימוש באפליקציה
const apiService = new ApiService();

export default apiService;

// Export של פונקציות ספציפיות לשימוש נוח
export const {
    submitForm,
    getMales,
    getFemales,
    getUser,
    uploadImage,
    simulateSubmitForm,
    simulateGetUsers
} = apiService;