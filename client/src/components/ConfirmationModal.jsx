import React from 'react';
import { CheckCircle, Edit3, AlertCircle } from 'lucide-react';

const ConfirmationModal = ({
                               isOpen,
                               onConfirm,
                               onCancel,
                               isSubmitting,
                               colors,
                           }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir="rtl">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                {/* אייקון */}
                <div className="flex justify-center mb-6">
                    <div className={`bg-gradient-to-r ${colors.gradient} p-4 rounded-full`}>
                        <AlertCircle className={colors.heartColor} size={48} />
                    </div>
                </div>

                {/* כותרת */}
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                    בדוק את הפרטים לפני שליחה
                </h2>

                {/* הודעה */}
                <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed">
                    האם אתה בטוח שברצונך לשלוח את הפרטים?
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">
                        לאחר השליחה לא ניתן לערוך את הפרטים
                    </span>
                </p>

                {/* כפתורים */}
                <div className="grid grid-cols-2 gap-4">
                    {/* כפתור חזור לעריכה */}
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="min-h-[60px] bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Edit3 size={20} />
                        <span>חזור לעריכה</span>
                    </button>

                    {/* כפתור אישור */}
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className={`min-h-[60px] bg-gradient-to-r ${colors.button} text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg ${colors.buttonHover} transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>שולח...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                <span>אשר פרטים</span>
                            </>
                        )}
                    </button>
                </div>

                {/* הודעת אזהרה */}
                <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <p className="text-sm text-orange-700 text-center">
                        💡 <strong>טיפ:</strong> וודא שכל הפרטים נכונים, במיוחד מספר הטלפון
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;