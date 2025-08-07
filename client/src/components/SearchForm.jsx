import React, { useState } from 'react';
import {Search, User, Phone, CheckCircle, ChevronRight} from 'lucide-react';
import { API, apiCall } from '../api/config.js';

const SearchForm = ({ onBack }) => {
    const [formData, setFormData] = useState({
        targetGender: '',
        height: '',
        hairColor: '',
        clothing: '',
        specialFeatures: '',
        connectionToEvent: '',
        searcherName: '',
        searcherPhone: '',
        aboutMe: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.targetGender || !formData.searcherName || !formData.searcherPhone) {
            alert('❌ נא למלא את השדות החובה');
            return;
        }

        setIsSubmitting(true);

        try {
            await apiCall({
                url: `${API.getPhotoUrl() || 'http://localhost:5000'}/api/search-requests`,
                method: 'POST',
                body: formData
            });

            setIsSubmitted(true);
        } catch (error) {
            alert(`❌ שגיאה: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-6" dir="rtl">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-6" size={80} />
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">הבקשה נשלחה!</h2>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        החתן והכלה קיבלו את הבקשה שלך וינסו לעזור למצוא את מי שחיפשת.
                    </p>
                    <div className="bg-purple-50 p-6 rounded-2xl">
                        <p className="text-base text-purple-800 font-medium">
                            בהצלחה! 💜
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-6 px-4" dir="rtl">
            <div className="max-w-sm mx-auto">
                {/* כפתור חזרה */}
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ChevronRight size={20} />
                    <span>חזרה</span>
                </button>

                {/* כותרת */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-6 rounded-full shadow-xl">
                            <Search className="text-purple-500" size={40} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">ראיתי מישהו/י שמעניין/ת אותי</h1>
                    <p className="text-lg text-gray-600">תאר/י את מי שראית ואנחנו ננסה לעזור</p>
                </div>

                {/* טופס */}
                <div className="bg-white rounded-3xl shadow-xl p-6 space-y-8">
                    {/* מין האדם המבוקש */}
                    <div className="space-y-3">
                        <label className="block text-base font-bold text-gray-700">
                            מי ראית? *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleInputChange('targetGender', 'male')}
                                className={`py-4 px-4 rounded-2xl font-bold transition-all ${
                                    formData.targetGender === 'male'
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                👨 גבר
                            </button>
                            <button
                                onClick={() => handleInputChange('targetGender', 'female')}
                                className={`py-4 px-4 rounded-2xl font-bold transition-all ${
                                    formData.targetGender === 'female'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                👩 אישה
                            </button>
                        </div>
                    </div>

                    {/* תיאור חיצוני */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">תיאור חיצוני</h3>

                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-700">גובה משוער</label>
                            <select
                                value={formData.height}
                                onChange={(e) => handleInputChange('height', e.target.value)}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl bg-white"
                            >
                                <option value="">בחר גובה</option>
                                <option value="נמוך">נמוך</option>
                                <option value="בינוני">בינוני</option>
                                <option value="גבוה">גבוה</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-700">צבע שיער</label>
                            <input
                                type="text"
                                value={formData.hairColor}
                                onChange={(e) => handleInputChange('hairColor', e.target.value)}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl"
                                placeholder="שחור, חום, בלונד..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-700">תלבושת</label>
                            <textarea
                                rows={3}
                                value={formData.clothing}
                                onChange={(e) => handleInputChange('clothing', e.target.value)}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl resize-none"
                                placeholder="חליפה כחולה, שמלה אדומה..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-700">סימנים מיוחדים</label>
                            <input
                                type="text"
                                value={formData.specialFeatures}
                                onChange={(e) => handleInputChange('specialFeatures', e.target.value)}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl"
                                placeholder="משקפיים, זקן, קעקוע..."
                            />
                        </div>
                    </div>

                    {/* קשר לאירוע */}
                    <div className="space-y-3">
                        <label className="block text-base font-bold text-gray-700">הקשר שלו/ה לאירוע</label>
                        <select
                            value={formData.connectionToEvent}
                            onChange={(e) => handleInputChange('connectionToEvent', e.target.value)}
                            className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl bg-white"
                        >
                            <option value="">לא יודע/ת</option>
                            <option value="צד החתן">צד החתן</option>
                            <option value="צד הכלה">צד הכלה</option>
                            <option value="חבר/ת של החתן">חבר/ת של החתן</option>
                            <option value="חבר/ת של הכלה">חבר/ת של הכלה</option>
                            <option value="משפחה">משפחה</option>
                        </select>
                    </div>

                    {/* פרטי המחפש */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">הפרטים שלך</h3>

                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-700">שם מלא *</label>
                            <div className="relative">
                                <User className="absolute right-4 top-4 text-gray-400" size={24} />
                                <input
                                    type="text"
                                    required
                                    value={formData.searcherName}
                                    onChange={(e) => handleInputChange('searcherName', e.target.value)}
                                    className="w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-300 rounded-xl"
                                    placeholder="השם שלך"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-700">טלפון *</label>
                            <div className="relative">
                                <Phone className="absolute right-4 top-4 text-gray-400" size={24} />
                                <input
                                    type="tel"
                                    required
                                    value={formData.searcherPhone}
                                    onChange={(e) => handleInputChange('searcherPhone', e.target.value)}
                                    className="w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-300 rounded-xl"
                                    placeholder="הטלפון שלך"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-700">קצת עליך (אופציונלי)</label>
                            <textarea
                                rows={3}
                                value={formData.aboutMe}
                                onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl resize-none"
                                placeholder="ספר/י קצת על עצמך..."
                                maxLength={500}
                            />
                        </div>
                    </div>

                    {/* כפתור שליחה */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full min-h-[60px] bg-gradient-to-r from-purple-500 to-pink-600 text-white py-5 px-6 rounded-2xl font-bold text-xl shadow-xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>שולח...</span>
                            </>
                        ) : (
                            <>
                                <Search size={24} />
                                <span>שלח בקשת חיפוש</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchForm;