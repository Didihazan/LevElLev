import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    // בחירת מין
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },

    list: {
        type: String,
        required: true,
        enum: ['רווקים', 'רווקות']
    },

    // פרטים בסיסיים
    name: {
        type: String,
        required: true,
        trim: true
    },

    age: {
        type: Number,
        required: true,
        min: [18, 'גיל מינימלי הוא 18'],
        max: [99, 'גיל מקסימלי הוא 99']
    },

    status: {
        type: String,
        required: true,
        enum: ['רווק/ה', 'גרוש/ה', 'אלמן/ה']
    },

    height: {
        type: Number,
        min: [140, 'גובה מינימלי הוא 140 ס"מ'],
        max: [220, 'גובה מקסימלי הוא 220 ס"מ'],
        validate: {
            validator: function(v) {
                // אם הגובה לא הוזן, זה תקין
                return v === undefined || v === null || (v >= 140 && v <= 220);
            },
            message: 'גובה חייב להיות בין 140-220 ס"מ או ריק'
        }
    },

    location: {
        type: String,
        trim: true
    },

    // רקע דתי-תרבותי
    community: {
        type: String,
        trim: true
    },

    religiosity: {
        type: String,
        enum: ['חילוני', 'מסורתי', 'דתי', 'חרדי', '']
    },

    // רקע מקצועי
    service: {
        type: String,
        trim: true
    },

    occupation: {
        type: String,
        trim: true
    },

    education: {
        type: String,
        trim: true
    },

    // תיאורים אישיים
    personality: {
        type: String,
        trim: true
    },

    lookingFor: {
        type: String,
        trim: true
    },

    // יצירת קשר
    phone: {
        type: String,
        required: true,
        trim: true
    },

    // תמונה מ-Cloudinary
    photo: {
        cloudinaryUrl: String,   // URL מלא לתמונה
        publicId: String,        // מזהה ב-Cloudinary
        originalName: String,    // שם מקורי
        size: Number,           // גודל בבתים
        format: String          // פורמט (jpg, png, etc.)
    },

    // זמני יצירה ועדכון
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // יוסיף createdAt ו-updatedAt אוטומטית
});

// אינדקסים לביצועים
participantSchema.index({ gender: 1 });
participantSchema.index({ list: 1 });
participantSchema.index({ submittedAt: -1 });

// מתודה להחזרת נתונים ללא פרטים רגישים
participantSchema.methods.toSafeObject = function() {
    const participant = this.toObject();
    return participant;
};

// מתודה סטטית לקבלת משתתפים לפי מין
participantSchema.statics.findByGender = function(gender) {
    return this.find({ gender }).sort({ submittedAt: -1 });
};

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;