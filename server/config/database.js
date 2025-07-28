// config/database.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// חיבור ל-MongoDB Atlas
export const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Atlas מחובר בהצלחה: ${conn.connection.host}`);
        console.log(`📊 מסד נתונים: ${conn.connection.name}`);

        // האזנה לאירועי החיבור
        mongoose.connection.on('error', (err) => {
            console.error('❌ שגיאת MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB התנתק');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB התחבר מחדש');
        });

        return conn;

    } catch (error) {
        console.error('💥 שגיאה בחיבור ל-MongoDB Atlas:', error.message);

        // הצגת עצות לפתרון בעיות נפוצות
        if (error.message.includes('authentication failed')) {
            console.log('💡 בדוק שם משתמש וסיסמה ב-.env');
        }
        if (error.message.includes('network')) {
            console.log('💡 בדוק חיבור לאינטרנט ו-IP Whitelist ב-MongoDB Atlas');
        }
        if (error.message.includes('ENOTFOUND')) {
            console.log('💡 בדוק את ה-connection string ב-.env');
        }

        process.exit(1);
    }
};

// סגירה מסודרת של החיבור
export const closeDatabase = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ חיבור MongoDB נסגר בהצלחה');
    } catch (error) {
        console.error('❌ שגיאה בסגירת חיבור MongoDB:', error);
    }
};

// מידע על מצב החיבור
export const getDatabaseStatus = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'מנותק',
        1: 'מחובר',
        2: 'מתחבר',
        3: 'מתנתק'
    };

    return {
        state: states[state] || 'לא ידוע',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: Object.keys(mongoose.connection.collections)
    };
};

export default mongoose;