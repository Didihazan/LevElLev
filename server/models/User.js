// models/User.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// סכמת משתמש
const userSchema = new mongoose.Schema({
    // מזהה ייחודי (לא ה-_id של MongoDB)
    uuid: {
        type: String,
        unique: true,
        default: () => uuidv4(),
        required: true
    },

    // פרטים בסיסיים
    name: {
        type: String,
        required: [true, 'שם הוא שדה חובה'],
        trim: true,
        maxlength: [100, 'שם לא יכול להיות יותר מ-100 תווים']
    },

    age: {
        type: Number,
        required: [true, 'גיל הוא שדה חובה'],
        min: [18, 'גיל מינימלי הוא 18'],
        max: [99, 'גיל מקסימלי הוא 99']
    },

    gender: {
        type: String,
        required: [true, 'מין הוא שדה חובה'],
        enum: {
            values: ['male', 'female'],
            message: 'מין חייב להיות male או female'
        }
    },

    // פרטים אישיים
    status: {
        type: String,
        enum: ['רווק/ה', 'גרוש/ה', 'אלמן/ה'],
        default: 'רווק/ה'
    },

    height: {
        type: Number,
        min: [140, 'גובה מינימלי הוא 140 ס"מ'],
        max: [220, 'גובה מקסימלי הוא 220 ס"מ']
    },

    location: {
        type: String,
        trim: true,
        maxlength: [100, 'מיקום לא יכול להיות יותר מ-100 תווים']
    },

    community: {
        type: String,
        trim: true,
        maxlength: [50, 'עדה לא יכול להיות יותר מ-50 תווים']
    },

    religiosity: {
        type: String,
        enum: ['חילוני', 'מסורתי', 'דתי', 'חרדי']
    },

    // רקע מקצועי ואישי
    service: {
        type: String,
        trim: true,
        maxlength: [100, 'שירות לא יכול להיות יותר מ-100 תווים']
    },

    occupation: {
        type: String,
        trim: true,
        maxlength: [100, 'עיסוק לא יכול להיות יותר מ-100 תווים']
    },

    education: {
        type: String,
        trim: true,
        maxlength: [100, 'השכלה לא יכול להיות יותר מ-100 תווים']
    },

    personality: {
        type: String,
        trim: true,
        maxlength: [500, 'תכונות אופי לא יכולות להיות יותר מ-500 תווים']
    },

    lookingFor: {
        type: String,
        trim: true,
        maxlength: [500, 'מחפש/ת לא יכול להיות יותר מ-500 תווים']
    },

    // יצירת קשר
    phone: {
        type: String,
        required: [true, 'טלפון הוא שדה חובה'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[\d\-\+\(\)\s]+$/.test(v);
            },
            message: 'טלפון לא תקין'
        }
    },

    // תמונה
    photo: {
        url: String,
        publicId: String, // לCloudinary
        filename: String
    },

    // מטא-דטה
    submittedFrom: {
        ip: String,
        userAgent: String
    },

    // סטטוס
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    // הוספת timestamps אוטומטיים
    timestamps: true,

    // הגדרות JSON
    toJSON: {
        transform: function(doc, ret) {
            // הסתרת מידע רגיש
            delete ret._id;
            delete ret.__v;
            delete ret.submittedFrom;

            // שימוש ב-uuid כמזהה
            ret.id = ret.uuid;
            delete ret.uuid;

            return ret;
        }
    }
});

// אינדקסים לחיפוש מהיר
userSchema.index({ gender: 1, createdAt: -1 });
userSchema.index({ phone: 1 });

// Middleware לפני שמירה
userSchema.pre('save', function(next) {
    // ניקוי שדות טקסט
    if (this.name) this.name = this.name.trim();
    if (this.location) this.location = this.location.trim();
    if (this.phone) this.phone = this.phone.trim();

    next();
});

// מתודות סטטיות
userSchema.statics.findByGender = function(gender) {
    return this.find({ gender, isActive: true }).sort({ createdAt: -1 });
};

userSchema.statics.findByUuid = function(uuid) {
    return this.findOne({ uuid, isActive: true });
};

userSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                maleCount: {
                    $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] }
                },
                femaleCount: {
                    $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] }
                },
                usersWithPhotos: {
                    $sum: { $cond: [{ $ne: ['$photo.url', null] }, 1, 0] }
                },
                avgAge: { $avg: '$age' }
            }
        }
    ]);

    return stats[0] || {
        totalUsers: 0,
        maleCount: 0,
        femaleCount: 0,
        usersWithPhotos: 0,
        avgAge: 0
    };
};

// מתודות instance
userSchema.methods.updatePhoto = function(photoData) {
    this.photo = photoData;
    return this.save();
};

userSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

// יצירת המודל
const User = mongoose.model('User', userSchema);

export default User;