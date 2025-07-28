import React, { useState } from 'react';
import { Heart, User, Phone, Camera, Send, CheckCircle } from 'lucide-react';
import { API, apiCall } from '../api/config.js';
import ConfirmationModal from './ConfirmationModal.jsx'; // ✅ Import הקומפוננטה

const WeddingDatingForm = () => {
    const [selectedGender, setSelectedGender] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        status: '',
        height: '',
        location: '',
        community: '',
        religiosity: '',
        service: '',
        occupation: '',
        education: '',
        personality: '',
        lookingFor: '',
        contactName: '',
        phone: '',
        photo: null
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // בחירת צבעים לפי מין
    const getColorScheme = () => {
        if (selectedGender === 'male') {
            return {
                gradient: 'from-blue-50 to-indigo-100',
                primary: 'blue',
                button: 'from-blue-500 to-indigo-600',
                buttonHover: 'hover:from-blue-600 hover:to-indigo-700',
                ring: 'focus:ring-2 focus:ring-blue-500',
                heartColor: 'text-blue-500',
                successBg: 'bg-blue-50',
                successText: 'text-blue-800'
            };
        } else if (selectedGender === 'female') {
            return {
                gradient: 'from-pink-50 to-purple-100',
                primary: 'pink',
                button: 'from-pink-500 to-purple-600',
                buttonHover: 'hover:from-pink-600 hover:to-purple-700',
                ring: 'focus:ring-2 focus:ring-pink-500',
                heartColor: 'text-pink-500',
                successBg: 'bg-pink-50',
                successText: 'text-pink-800'
            };
        } else {
            return {
                gradient: 'from-gray-50 to-gray-100',
                primary: 'gray',
                button: 'from-gray-400 to-gray-500',
                buttonHover: 'hover:from-gray-500 hover:to-gray-600',
                ring: 'focus:ring-2 focus:ring-gray-400',
                heartColor: 'text-gray-400',
                successBg: 'bg-gray-50',
                successText: 'text-gray-700'
            };
        }
    };

    const colors = getColorScheme();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file
            }));
        }
    };

    // ✅ פונקציה לבדיקת הטופס ופתיחת חלון האישור
    const handleInitialSubmit = async () => {
        if (!selectedGender) {
            alert('❌ נא לבחור מין (גבר או אישה) כדי להמשיך');
            return;
        }

        // בדיקות צד לקוח מפורטות
        const errors = [];

        // בדיקת שדות חובה
        if (!formData.name || !formData.name.trim()) {
            errors.push('• שם מלא הוא שדה חובה');
        }

        if (!formData.age) {
            errors.push('• גיל הוא שדה חובה');
        } else {
            const ageNumber = parseInt(formData.age);
            if (isNaN(ageNumber)) {
                errors.push('• גיל חייב להיות מספר');
            } else if (ageNumber < 18) {
                errors.push('• גיל מינימלי הוא 18 שנים');
            } else if (ageNumber > 99) {
                errors.push('• גיל מקסימלי הוא 99 שנים');
            }
        }

        if (!formData.status) {
            errors.push('• נא לבחור סטטוס משפחתי');
        }

        if (!formData.phone || !formData.phone.trim()) {
            errors.push('• מספר טלפון הוא שדה חובה');
        } else {
            // בדיקה בסיסית של פורמט טלפון
            const phonePattern = /^[\d\-\s\+\(\)]+$/;
            if (!phonePattern.test(formData.phone.trim())) {
                errors.push('• מספר טלפון חייב להכיל רק ספרות, מקפים, רווחים או סוגריים');
            }
        }

        // בדיקת גובה (אם הוזן)
        if (formData.height && formData.height.trim()) {
            const heightNumber = parseInt(formData.height);
            if (isNaN(heightNumber)) {
                errors.push('• גובה חייב להיות מספר');
            } else if (heightNumber < 140) {
                errors.push('• גובה מינימלי הוא 140 ס"מ');
            } else if (heightNumber > 220) {
                errors.push('• גובה מקסימלי הוא 220 ס"מ');
            }
        }

        // אם יש שגיאות, הצג אותן למשתמש
        if (errors.length > 0) {
            alert(`❌ נמצאו שגיאות בטופס:\n\n${errors.join('\n')}\n\nנא לתקן ולנסות שוב.`);
            return;
        }

        // אם הכל תקין - פתח חלון אישור
        setShowConfirmation(true);
    };

    // ✅ פונקציה לשליחה בפועל (אחרי אישור)
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);

        try {
            // יצירת FormData לשליחת הטופס עם התמונה
            const formDataToSend = new FormData();

            // הוספת כל השדות
            formDataToSend.append('gender', selectedGender);
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('age', formData.age);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('phone', formData.phone.trim());

            // שדות אופציונליים - רק אם לא ריקים
            if (formData.height && formData.height.trim()) {
                formDataToSend.append('height', formData.height.trim());
            }
            if (formData.location && formData.location.trim()) {
                formDataToSend.append('location', formData.location.trim());
            }
            if (formData.community && formData.community.trim()) {
                formDataToSend.append('community', formData.community.trim());
            }
            if (formData.religiosity) {
                formDataToSend.append('religiosity', formData.religiosity);
            }
            if (formData.service && formData.service.trim()) {
                formDataToSend.append('service', formData.service.trim());
            }
            if (formData.occupation && formData.occupation.trim()) {
                formDataToSend.append('occupation', formData.occupation.trim());
            }
            if (formData.education && formData.education.trim()) {
                formDataToSend.append('education', formData.education.trim());
            }
            if (formData.personality && formData.personality.trim()) {
                formDataToSend.append('personality', formData.personality.trim());
            }
            if (formData.lookingFor && formData.lookingFor.trim()) {
                formDataToSend.append('lookingFor', formData.lookingFor.trim());
            }
            if (formData.contactName && formData.contactName.trim()) {
                formDataToSend.append('contactName', formData.contactName.trim());
            }

            // הוספת התמונה אם קיימת
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }

            // שליחה לשרת
            const response = await apiCall(API.addParticipant(formDataToSend));

            console.log('✅ נשלח בהצלחה:', response);
            setShowConfirmation(false);
            setIsSubmitted(true);

        } catch (error) {
            console.error('❌ שגיאה בשליחה:', error);

            // הצגת שגיאות מפורטות מהשרת
            let errorMessage = 'שגיאה בשליחת הטופס';

            if (error.message.includes('errors') && error.response) {
                // אם יש שגיאות מפורטות מהשרת
                errorMessage = `❌ ${error.message}`;
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = '❌ שגיאת חיבור לשרת. נא לבדוק שהשרת פועל ולנסות שוב.';
            } else if (error.message.includes('NetworkError')) {
                errorMessage = '❌ שגיאת רשת. נא לבדוק את החיבור לאינטרנט ולנסות שוב.';
            } else {
                errorMessage = `❌ שגיאה: ${error.message}`;
            }

            alert(errorMessage);
            setShowConfirmation(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ פונקציה לביטול האישור
    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    if (isSubmitted) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} flex items-center justify-center p-6`} dir="rtl">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-6" size={80} />
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">תודה רבה!</h2>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        הפרטים שלך נשלחו בהצלחה!
                        החתן והכלה יקבלו את המידע ויוכלו ליצור איתך קשר.
                    </p>
                    <div className={`${colors.successBg} p-6 rounded-2xl`}>
                        <p className={`text-base ${colors.successText} font-medium`}>
                            בהצלחה במציאת הזיווג! 💕
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} py-6 px-4`} dir="rtl">
                <div className="max-w-sm mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-6 rounded-full shadow-xl">
                                <Heart className={colors.heartColor} size={40} />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">היכרויות בחתונה</h1>
                        <p className="text-lg text-gray-600 leading-relaxed">מלא/י את הפרטים למציאת הזיווג המושלם</p>
                    </div>

                    {/* בחירת מין */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedGender('male')}
                                className={`min-h-[60px] py-5 px-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                                    selectedGender === 'male'
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                }`}
                            >
                                <div className="text-2xl mb-1">👨</div>
                                <div>גבר</div>
                            </button>
                            <button
                                onClick={() => setSelectedGender('female')}
                                className={`min-h-[60px] py-5 px-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                                    selectedGender === 'female'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                }`}
                            >
                                <div className="text-2xl mb-1">👩</div>
                                <div>אישה</div>
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    {selectedGender && (
                        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-8">
                            {/* שם */}
                            <div className="space-y-3">
                                <label htmlFor="name" className="block text-base font-bold text-gray-700">
                                    שם מלא *
                                </label>
                                <div className="relative">
                                    <User className="absolute right-4 top-4 text-gray-400" size={24} />
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                        placeholder="הכנס את שמך המלא"
                                    />
                                </div>
                            </div>

                            {/* גיל וגובה */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label htmlFor="age" className="block text-base font-bold text-gray-700">
                                        גיל *
                                    </label>
                                    <input
                                        id="age"
                                        type="number"
                                        required
                                        min="18"
                                        max="99"
                                        value={formData.age}
                                        onChange={(e) => handleInputChange('age', e.target.value)}
                                        className={`w-full px-4 py-4 text-lg text-center border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="height" className="block text-base font-bold text-gray-700">
                                        גובה (ס"מ)
                                    </label>
                                    <input
                                        id="height"
                                        type="number"
                                        min="140"
                                        max="220"
                                        value={formData.height}
                                        onChange={(e) => handleInputChange('height', e.target.value)}
                                        className={`w-full px-4 py-4 text-lg text-center border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                        placeholder="לדוגמא 170"
                                    />
                                </div>
                            </div>

                            {/* סטטוס */}
                            <div className="space-y-3">
                                <label htmlFor="status" className="block text-base font-bold text-gray-700">
                                    סטטוס משפחתי *
                                </label>
                                <select
                                    id="status"
                                    required
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200 bg-white`}
                                >
                                    <option value="">בחר סטטוס</option>
                                    <option value="רווק/ה">רווק/ה</option>
                                    <option value="גרוש/ה">גרוש/ה</option>
                                    <option value="אלמן/ה">אלמן/ה</option>
                                    <option value="גרוש/ה עם ילדים">גרוש/ה עם ילדים</option>
                                    <option value="אחר">אחר</option>
                                </select>
                            </div>

                            {/* מגורים */}
                            <div className="space-y-3">
                                <label htmlFor="location" className="block text-base font-bold text-gray-700">
                                    מגורים
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                />
                            </div>

                            {/* עדה */}
                            <div className="space-y-3">
                                <label htmlFor="community" className="block text-base font-bold text-gray-700">
                                    עדה
                                </label>
                                <input
                                    id="community"
                                    type="text"
                                    value={formData.community}
                                    onChange={(e) => handleInputChange('community', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                />
                            </div>

                            {/* מגזר ורמה דתית */}
                            <div className="space-y-3">
                                <label htmlFor="religiosity" className="block text-base font-bold text-gray-700">
                                    מגזר ורמה דתית
                                </label>
                                <select
                                    id="religiosity"
                                    value={formData.religiosity}
                                    onChange={(e) => handleInputChange('religiosity', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200 bg-white`}
                                >
                                    <option value="">בחר רמה דתית</option>
                                    <option value="חילוני">חילוני</option>
                                    <option value="מסורתי">מסורתי</option>
                                    <option value="דתי">דתי</option>
                                    <option value="דתי">דתי לאומי</option>
                                    <option value="חרדי">חרדי</option>
                                    <option value="אחר">אחר</option>
                                </select>
                            </div>

                            {/* שירות */}
                            <div className="space-y-3">
                                <label htmlFor="service" className="block text-base font-bold text-gray-700">
                                    שירות לאומי/צבאי
                                </label>
                                <input
                                    id="service"
                                    type="text"
                                    value={formData.service}
                                    onChange={(e) => handleInputChange('service', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                    placeholder="צה״ל, שירות לאומי..."
                                />
                            </div>

                            {/* השכלה */}
                            <div className="space-y-3">
                                <label htmlFor="education" className="block text-base font-bold text-gray-700">
                                    השכלה
                                </label>
                                <input
                                    id="education"
                                    type="text"
                                    value={formData.education}
                                    onChange={(e) => handleInputChange('education', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                    placeholder="תואר ראשון, תיכון..."
                                />
                            </div>

                            {/* עיסוק */}
                            <div className="space-y-3">
                                <label htmlFor="occupation" className="block text-base font-bold text-gray-700">
                                    עיסוק
                                </label>
                                <input
                                    id="occupation"
                                    type="text"
                                    value={formData.occupation}
                                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                    placeholder="מה המקצוע שלך?"
                                />
                            </div>

                            {/* תכונות אופי */}
                            <div className="space-y-3">
                                <label htmlFor="personality" className="block text-base font-bold text-gray-700">
                                    תכונות אופי
                                </label>
                                <textarea
                                    id="personality"
                                    rows={4}
                                    value={formData.personality}
                                    onChange={(e) => handleInputChange('personality', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent resize-none transition-all duration-200`}
                                    placeholder="תאר/י את עצמך בכמה מילים..."
                                />
                            </div>

                            {/* אני מחפש */}
                            <div className="space-y-3">
                                <label htmlFor="lookingFor" className="block text-base font-bold text-gray-700">
                                    מחפש/ת
                                </label>
                                <textarea
                                    id="lookingFor"
                                    rows={4}
                                    value={formData.lookingFor}
                                    onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                                    className={`w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent resize-none transition-all duration-200`}
                                    placeholder="מה חשוב לך בבן/בת הזוג?"
                                />
                            </div>

                            {/* איש קשר לבירורים */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">איש קשר לבירורים</h3>

                                {/* שם איש הקשר */}
                                <div className="space-y-3">
                                    <label htmlFor="contactName" className="block text-base font-bold text-gray-700">
                                        שם איש הקשר
                                    </label>
                                    <div className="relative">
                                        <User className="absolute right-4 top-4 text-gray-400" size={24} />
                                        <input
                                            id="contactName"
                                            type="text"
                                            value={formData.contactName}
                                            onChange={(e) => handleInputChange('contactName', e.target.value)}
                                            className={`w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                            placeholder="שם האדם ליצירת קשר (אופציונלי)"
                                        />
                                    </div>
                                </div>

                                {/* מספר טלפון */}
                                <div className="space-y-3">
                                    <label htmlFor="phone" className="block text-base font-bold text-gray-700">
                                        מספר טלפון *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute right-4 top-4 text-gray-400" size={24} />
                                        <input
                                            id="phone"
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className={`w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200`}
                                            placeholder="הזנ/י מספר טלפון"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* תמונה */}
                            <div className="space-y-3">
                                <label htmlFor="photo" className="block text-base font-bold text-gray-700">
                                    תמונה (אופציונלי)
                                </label>
                                <div className="relative">
                                    <Camera className="absolute right-4 top-4 text-gray-400" size={24} />
                                    <input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className={`w-full pr-12 pl-4 py-4 text-base border-2 border-gray-300 rounded-xl ${colors.ring} focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200`}
                                    />
                                </div>
                                {formData.photo && (
                                    <p className="text-base text-green-600 font-medium">✓ תמונה נבחרה: {formData.photo.name}</p>
                                )}
                            </div>

                            {/* כפתור שליחה */}
                            <button
                                onClick={handleInitialSubmit}
                                disabled={isSubmitting}
                                className={`w-full min-h-[60px] bg-gradient-to-r ${colors.button} text-white py-5 px-6 rounded-2xl font-bold text-xl shadow-xl ${colors.buttonHover} transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4`}
                            >
                                <Send size={24} />
                                <span>המשך לאישור פרטים</span>
                            </button>
                        </div>
                    )}

                    {!selectedGender && (
                        <div className="text-center text-gray-600 mt-10">
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <p className="text-lg font-medium">👆 בחר/י מין כדי להמשיך למילוי הטופס</p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-10 text-gray-600">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4">
                            <p className="text-base font-medium mb-2">🔒 המידע ישמר בצורה מאובטחת ויועבר רק לחתן ולכלה</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ חלון האישור */}
            <ConfirmationModal
                isOpen={showConfirmation}
                onConfirm={handleFinalSubmit}
                onCancel={handleCancelConfirmation}
                isSubmitting={isSubmitting}
                colors={colors}
                selectedGender={selectedGender}
            />
        </>
    );
};

export default WeddingDatingForm;