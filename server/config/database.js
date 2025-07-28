import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB מחובר: ${conn.connection.host}`);

        // הגדרת listeners לאירועים
        mongoose.connection.on('error', (err) => {
            console.error('❌ שגיאת MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🔌 MongoDB התנתק');
        });

        // סגירה נקייה בסיום התהליך
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🛑 חיבור MongoDB נסגר');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ שגיאה בחיבור ל-MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;