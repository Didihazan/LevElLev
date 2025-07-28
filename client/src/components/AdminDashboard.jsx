import React, {useEffect, useState} from 'react';
import {Briefcase, Calendar, ChevronDown, Heart, MapPin, Phone, Star, User, Users} from 'lucide-react';
import {API, apiCall} from '../api/config.js';

const AdminDashboard = () => {
    const [males, setMales] = useState([]);
    const [females, setFemales] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // טעינת נתונים מהשרת
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            // קבלת נתונים בפועל מהשרת
            const [malesResponse, femalesResponse] = await Promise.all([
                apiCall(API.getMales()),
                apiCall(API.getFemales())
            ]);

            setMales(malesResponse.participants || []);
            setFemales(femalesResponse.participants || []);

            console.log(`📋 נטענו ${malesResponse.participants?.length || 0} רווקים ו-${femalesResponse.participants?.length || 0} רווקות`);

        } catch (err) {
            console.error('❌ שגיאה בטעינת נתונים:', err);
            setError(`שגיאה בטעינת הנתונים: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // פתיחה/סגירה של אקורדיון - רק אחד בכל פעם
    const toggleUser = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    // רכיב משתמש בודד
    const UserCard = ({user, gender}) => {
        // השתמש ב-_id של מונגו או ב-submittedAt כמזהה ייחודי
        const uniqueId = user._id || user.id || `${user.name}-${user.submittedAt}`;
        const isExpanded = expandedUser === uniqueId;
        const bgColor = gender === 'male' ? 'from-blue-50 to-indigo-50' : 'from-pink-50 to-purple-50';
        const accentColor = gender === 'male' ? 'blue' : 'pink';

        return (
            <div
                className={`bg-gradient-to-r ${bgColor} rounded-2xl shadow-lg mb-4 overflow-hidden transition-all duration-300`}>
                {/* כותרת משתמש - תמיד גלויה */}
                <div
                    className="p-6 cursor-pointer hover:bg-white/50 transition-all duration-200"
                    onClick={() => toggleUser(uniqueId)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* תמונת פרופיל */}
                            <div className="relative">
                                {user.photo?.cloudinaryUrl ? (
                                    <img
                                        src={user.photo.cloudinaryUrl}
                                        alt={user.name}
                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className={`w-16 h-16 rounded-full bg-${accentColor}-500 flex items-center justify-center border-4 border-white shadow-lg ${user.photo?.filename ? 'hidden' : 'flex'}`}
                                    style={{display: user.photo?.cloudinaryUrl ? 'none' : 'flex'}}
                                >
                                    <User className="text-white" size={28}/>
                                </div>
                                <div
                                    className={`absolute -bottom-1 -right-1 w-6 h-6 bg-${accentColor}-500 rounded-full flex items-center justify-center`}>
                                    <span className="text-white text-xs font-bold">
                                        {gender === 'male' ? '👨' : '👩'}
                                    </span>
                                </div>
                            </div>

                            {/* פרטים בסיסיים */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                                <div className="flex items-center gap-4 text-gray-600 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={16}/>
                                        {user.age} שנים
                                    </span>
                                    {user.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={16}/>
                                            {user.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* כפתור פתיחה/סגירה */}
                        <div
                            className={`p-2 rounded-full bg-${accentColor}-100 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className={`text-${accentColor}-600`} size={24}/>
                        </div>
                    </div>
                </div>

                {/* פרטים מלאים - נפתח באקורדיון */}
                {isExpanded && (
                    <div className="px-6 pb-6 border-t border-white/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* פרטים אישיים */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <User size={20}/>
                                    פרטים אישיים
                                </h4>

                                <div className="space-y-3 text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="font-medium">סטטוס:</span>
                                        <span>{user.status || 'לא צוין'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">גובה:</span>
                                        <span>{user.height ? `${user.height} ס"מ` : 'לא צוין'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">עדה:</span>
                                        <span>{user.community || 'לא צוין'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">רמה דתית:</span>
                                        <span>{user.religiosity || 'לא צוין'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* פרטים מקצועיים */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Briefcase size={20}/>
                                    רקע מקצועי
                                </h4>

                                <div className="space-y-3 text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="font-medium">עיסוק:</span>
                                        <span>{user.occupation || 'לא צוין'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">השכלה:</span>
                                        <span>{user.education || 'לא צוין'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">שירות:</span>
                                        <span>{user.service || 'לא צוין'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* תכונות אופי */}
                        {user.personality && (
                            <div className="mt-6">
                                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-3">
                                    <Star size={20}/>
                                    תכונות אופי
                                </h4>
                                <p className="text-gray-700 bg-white/70 p-4 rounded-xl leading-relaxed">
                                    {user.personality}
                                </p>
                            </div>
                        )}

                        {/* מחפש/ת */}
                        {user.lookingFor && (
                            <div className="mt-6">
                                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-3">
                                    <Heart size={20}/>
                                    מחפש/ת
                                </h4>
                                <p className="text-gray-700 bg-white/70 p-4 rounded-xl leading-relaxed">
                                    {user.lookingFor}
                                </p>
                            </div>
                        )}

                        {/* יצירת קשר */}
                        <div className="mt-6 pt-4 border-t border-white/50">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Phone size={20}/>
                                    יצירת קשר
                                </h4>
                                <div className="text-left">
                                    {user.contactName && (
                                        <p className="text-sm text-gray-600 mb-1">
                                            {user.contactName}
                                        </p>
                                    )}
                                    <a
                                        href={`tel:${user.phone}`}
                                        className={`bg-${accentColor}-500 hover:bg-${accentColor}-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2`}
                                    >
                                        <Phone size={18}/>
                                        {user.phone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // רכיב רשימה
    const UsersList = ({users, title, gender, icon: Icon, emptyMessage}) => {
        const bgGradient = gender === 'male' ? 'from-blue-500 to-indigo-600' : 'from-pink-500 to-purple-600';

        return (
            <div className="bg-white rounded-3xl shadow-xl p-6">
                {/* כותרת רשימה */}
                <div className={`bg-gradient-to-r ${bgGradient} text-white p-6 rounded-2xl mb-6`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Icon size={32}/>
                            <div>
                                <h2 className="text-2xl font-bold">{title}</h2>
                                <p className="text-white/90">
                                    {users.length} {users.length === 1 ? 'משתתף' : 'משתתפים'}
                                </p>
                            </div>
                        </div>
                        <div className="text-4xl opacity-50">
                            {gender === 'male' ? '👨‍💼' : '👩‍💼'}
                        </div>
                    </div>
                </div>

                {/* רשימת משתמשים */}
                <div className="space-y-4">
                    {users.length > 0 ? (
                        users.map(user => {
                            const uniqueKey = user._id || user.id || `${user.name}-${user.submittedAt}`;
                            return (
                                <UserCard
                                    key={uniqueKey}
                                    user={user}
                                    gender={gender}
                                />
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-xl font-medium">{emptyMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">טוען נתונים...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">שגיאה</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                    >
                        נסה שוב
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50" dir="rtl">
            <div className="container mx-auto px-4 py-8">
                {/* כותרת ראשית */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-6 rounded-full shadow-xl">
                            <Heart className="text-red-500" size={48}/>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">רשימת המשתתפים</h1>
                    <p className="text-xl text-gray-600">
                        סה"כ {males.length + females.length} משתתפים רשומים למציאת זיווג
                    </p>
                </div>

                {/* רשימות */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* רשימת רווקים */}
                    <UsersList
                        users={males}
                        title="רווקים"
                        gender="male"
                        icon={Users}
                        emptyMessage="עדיין לא נרשמו רווקים"
                    />

                    {/* רשימת רווקות */}
                    <UsersList
                        users={females}
                        title="רווקות"
                        gender="female"
                        icon={Users}
                        emptyMessage="עדיין לא נרשמו רווקות"
                    />
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;