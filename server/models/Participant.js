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
        min: 18,
        max: 99
    },

    status: {
        type: String,
        required: true,
        enum: ['רווק/ה', 'גרוש/ה','גרוש עם ילדים' ,'אלמן/ה']
    },

    height: {
        type: Number,
        min: 140,
        max: 220
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
        enum: ['חילוני', 'מסורתי', 'דתי', 'חרדי','אחר ', '']
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

    // תמונה
    photo: {
        filename: String,
        originalName: String,
        size: Number,
        mimetype: String
    },

    // זמני יצירה ועדכון
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// אינדקסים לביצועים
participantSchema.index({ gender: 1 });
participantSchema.index({ list: 1 });
participantSchema.index({ submittedAt: -1 });

// מתודה סטטית לקבלת משתתפים לפי מין
participantSchema.statics.findByGender = function(gender) {
    return this.find({ gender }).sort({ submittedAt: -1 });
};

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;