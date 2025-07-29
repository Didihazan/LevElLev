import React from 'react';
import { X, User } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, imageUrl, userName, gender }) => {
    if (!isOpen || !imageUrl) return null;

    const accentColor = gender === 'male' ? 'blue' : 'pink';

    // סגירה בלחיצה על רקע
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // סגירה ב-ESC
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // מניעת גלילה ברקע
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
            dir="rtl"
        >
            {/* כפתור סגירה */}
            <button
                onClick={onClose}
                className="absolute top-4 cursor-pointer right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all duration-200 z-10"
                aria-label="סגור תמונה"
            >
                <X className="text-black" size={28} />
            </button>

            {/* הצגת שם */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-xl">
                <span className="font-bold text-lg">{userName}</span>
            </div>

            {/* התמונה */}
            <div className="max-w-4xl max-h-[90vh] flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={userName}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />

                {/* פול-בק אם התמונה לא נטענת */}
                <div
                    className={`hidden w-64 h-64 bg-${accentColor}-500 rounded-xl flex-col items-center justify-center shadow-2xl`}
                    style={{display: 'none'}}
                >
                    <User className="text-white mb-4" size={80} />
                    <span className="text-white text-xl font-bold">{userName}</span>
                    <span className="text-white text-sm opacity-80 mt-2">תמונה לא זמינה</span>
                </div>
            </div>

        </div>
    );
};

export default ImageModal;