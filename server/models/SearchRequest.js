import mongoose from 'mongoose';

const searchRequest = new mongoose.Schema({
    // מין האדם המבוקש
    targetGender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },

    // תיאור חיצוני
    description: {
        height: {
            type: String,
            enum: ['נמוך', 'בינוני', 'גבוה', '']
        },
        hairColor: String,
        clothing: String,
        specialFeatures: String
    },

    // הקשר לאירוע
    connectionToEvent: {
        type: String,
        enum: ['צד החתן', 'צד הכלה', 'חבר/ת של החתן', 'חבר/ת של הכלה', 'משפחה', 'לא יודע/ת', '']
    },

    // פרטי המחפש
    searcher: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        aboutMe: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },

    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

searchRequest.index({ targetGender: 1 });
searchRequest.index({ submittedAt: -1 });

const SearchRequest = mongoose.model('SearchRequest', searchRequest);

export default SearchRequest;