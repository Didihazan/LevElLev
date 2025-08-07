import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, ChevronDown, Heart, MapPin, Phone, Star, User, Users, Trash2, Search } from 'lucide-react';
import { API, apiCall } from '../api/config.js';
import ImageModal from './ImageModal.jsx';

const AdminDashboard = () => {
    const [males, setMales] = useState([]);
    const [females, setFemales] = useState([]);
    const [searchRequests, setSearchRequests] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);

    const [imageModal, setImageModal] = useState({
        isOpen: false,
        imageUrl: '',
        userName: '',
        gender: ''
    });

    // טעינת נתונים מהשרת
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const [malesResponse, femalesResponse, searchRequestsResponse] = await Promise.all([
                apiCall(API.getMales()),
                apiCall(API.getFemales()),
                apiCall(API.getSearchRequests())
            ]);

            setMales(malesResponse.participants || []);
            setFemales(femalesResponse.participants || []);
            setSearchRequests(searchRequestsResponse.searchRequests || []);

            console.log(`📋 נטענו ${malesResponse.participants?.length || 0} רווקים, ${femalesResponse.participants?.length || 0} רווקות, ${searchRequestsResponse.searchRequests?.length || 0} בקשות חיפוש`);

        } catch (err) {
            console.error('❌ שגיאה בטעינת נתונים:', err);
            setError(`שגיאה בטעינת הנתונים: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // פתיחה/סגירה של אקורדיון
    const toggleUser = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    // פתיחת תמונה במסך מלא
    const openImageModal = (imageUrl, userName, gender) => {
        setImageModal({
            isOpen: true,
            imageUrl,
            userName,
            gender
        });
    };

    // סגירת מודל התמונה
    const closeImageModal = () => {
        setImageModal({
            isOpen: false,
            imageUrl: '',
            userName: '',
            gender: ''
        });
    };

    // מחיקת משתתף
    const handleDeleteParticipant = async (user) => {
        const confirmDelete = window.confirm(
            `האם אתה בטוח שברצונך למחוק את ${user.name} מהרשימה?\n\nפעולה זו אינה ניתנת לביטול.`
        );

        if (!confirmDelete) {
            return;
        }

        setDeleting(user._id);

        try {
            const response = await apiCall(API.deleteParticipant(user._id));

            console.log('✅ משתתף נמחק:', response);

            if (user.gender === 'male') {
                setMales(prev => prev.filter(m => m._id !== user._id));
            } else {
                setFemales(prev => prev.filter(f => f._id !== user._id));
            }

            if (expandedUser === user._id) {
                setExpandedUser(null);
            }

            alert(`✅ ${user.name} נמחק בהצלחה מהרשימה`);

        } catch (error) {
            console.error('❌ שגיאה במחיקה:', error);
            alert(`❌ שגיאה במחיקת ${user.name}: ${error.message}`);
        } finally {
            setDeleting(null);
        }
    };

    // מחיקת בקשת חיפוש
    const handleDeleteSearchRequest = async (searchRequest) => {
        const confirmDelete = window.confirm(
            `האם אתה בטוח שברצונך למחוק את בקשת החיפוש של ${searchRequest.searcher.name}?\n\nפעולה זו אינה ניתנת לביטול.`
        );

        if (!confirmDelete) {
            return;
        }

        setDeleting(searchRequest._id);

        try {
            const response = await apiCall({
                url: `${API.getMales().url.replace('/participants/males', '')}/search-requests/${searchRequest._id}`,
                method: 'DELETE'
            });

            console.log('✅ בקשת חיפוש נמחקה:', response);

            setSearchRequests(prev => prev.filter(s => s._id !== searchRequest._id));

            if (expandedUser === searchRequest._id) {
                setExpandedUser(null);
            }

            alert(`✅ בקשת החיפוש של ${searchRequest.searcher.name} נמחקה בהצלחה`);

        } catch (error) {
            console.error('❌ שגיאה במחיקת בקשת חיפוש:', error);
            alert(`❌ שגיאה במחיקת בקשת החיפוש של ${searchRequest.searcher.name}: ${error.message}`);
        } finally {
            setDeleting(null);
        }
    };

    // רכיב בקשת חיפוש
    const SearchRequestCard = ({ searchRequest }) => {
        const uniqueId = searchRequest._id;
        const isExpanded = expandedUser === uniqueId;
        const isDeleting = deleting === searchRequest._id;

        return (
            <div
                className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg mb-4 overflow-hidden transition-all duration-300 ${isDeleting ? 'opacity-50' : ''}`}
            >
                <div
                    className="p-6 cursor-pointer hover:bg-white/50 transition-all duration-200"
                    onClick={() => !isDeleting && toggleUser(uniqueId)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                                <Search className="text-purple-500" size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {searchRequest.searcher.name} מחפש/ת {searchRequest.targetGender === 'male' ? 'גבר' : 'אישה'}
                                </h3>
                                <p className="text-gray-600">
                                    נשלח ב: {new Date(searchRequest.submittedAt).toLocaleString('he-IL')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSearchRequest(searchRequest);
                                }}
                                disabled={isDeleting}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                <Trash2 size={24} />
                            </button>
                            <ChevronDown
                                className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                size={24}
                            />
                        </div>
                    </div>
                </div>
                {isExpanded && (
                    <div className="p-6 bg-white/50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-3">תיאור האדם המבוקש</h4>
                                <p><strong>מין:</strong> {searchRequest.targetGender === 'male' ? 'גבר' : 'אישה'}</p>
                                <p><strong>גובה:</strong> {searchRequest.description.height || 'לא צוין'}</p>
                                <p><strong>צבע שיער:</strong> {searchRequest.description.hairColor || 'לא צוין'}</p>
                                <p><strong>תלבושת:</strong> {searchRequest.description.clothing || 'לא צוין'}</p>
                                <p><strong>סימנים מיוחדים:</strong> {searchRequest.description.specialFeatures || 'לא צוין'}</p>
                                <p><strong>קשר לאירוע:</strong> {searchRequest.connectionToEvent || 'לא צוין'}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-3">פרטי המחפש</h4>
                                <p><strong>שם:</strong> {searchRequest.searcher.name}</p>
                                <p><strong>טלפון:</strong> {searchRequest.searcher.phone}</p>
                                <p><strong>על עצמי:</strong> {searchRequest.searcher.aboutMe || 'לא צוין'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // רכיב משתתף (ללא שינוי)
    const UserCard = ({ user, gender }) => {
        const uniqueId = user._id || user.id || `${user.name}-${user.submittedAt}`;
        const isExpanded = expandedUser === uniqueId;
        const bgColor = gender === 'male' ? 'from-blue-50 to-indigo-50' : 'from-pink-50 to-purple-50';
        const accentColor = gender === 'male' ? 'blue' : 'pink';
        const isDeleting = deleting === user._id;

        return (
            <div
                className={`bg-gradient-to-r ${bgColor} rounded-2xl shadow-lg mb-4 overflow-hidden transition-all duration-300 ${isDeleting ? 'opacity-50' : ''}`}
            >
                <div
                    className="p-6 cursor-pointer hover:bg-white/50 transition-all duration-200"
                    onClick={() => !isDeleting && toggleUser(uniqueId)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {user.photo?.cloudinaryUrl ? (
                                    <img
                                        src={user.photo.cloudinaryUrl}
                                        alt={user.name}
                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openImageModal(user.photo.cloudinaryUrl, user.name, gender);
                                        }}
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="text-gray-500" size={32} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                                <p className="text-gray-600">
                                    {user.age} שנים, {user.location || 'לא צוין'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteParticipant(user);
                                }}
                                disabled={isDeleting}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                <Trash2 size={24} />
                            </button>
                            <ChevronDown
                                className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                size={24}
                            />
                        </div>
                    </div>
                </div>
                {isExpanded && (
                    <div className="p-6 bg-white/50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-3">פרטים אישיים</h4>
                                <p><strong>גיל:</strong> {user.age || 'לא צוין'}</p>
                                <p><strong>סטטוס:</strong> {user.status || 'לא צוין'}</p>
                                <p><strong>גובה:</strong> {user.height || 'לא צוין'}</p>
                                <p><strong>מיקום:</strong> {user.location || 'לא צוין'}</p>
                                <p><strong>קהילה:</strong> {user.community || 'לא צוין'}</p>
                                <p><strong>דתיות:</strong> {user.religiosity || 'לא צוין'}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-3">פרטים נוספים</h4>
                                <p><strong>שירות:</strong> {user.service || 'לא צוין'}</p>
                                <p><strong>עיסוק:</strong> {user.occupation || 'לא צוין'}</p>
                                <p><strong>השכלה:</strong> {user.education || 'לא צוין'}</p>
                                <p><strong>אישיות:</strong> {user.personality || 'לא צוין'}</p>
                                <p><strong>מחפש/ת:</strong> {user.lookingFor || 'לא צוין'}</p>
                                <p><strong>מידע נוסף:</strong> {user.additionalInfo || 'לא צוין'}</p>
                                <p><strong>איש קשר:</strong> {user.contactName || 'לא צוין'}</p>
                                <p><strong>טלפון:</strong> {user.phone || 'לא צוין'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // רכיב רשימה כללית
    const UsersList = ({ users, title, gender, icon: Icon, emptyMessage }) => {
        return (
            <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Icon size={32} />
                        <div>
                            <h2 className="text-2xl font-bold">{title}</h2>
                            <p className="text-gray-600">
                                {users.length} {users.length === 1 ? 'משתתף' : gender === 'search' ? 'בקשות' : 'משתתפים'}
                            </p>
                        </div>
                    </div>
                    <div className="text-4xl opacity-50">
                        {gender === 'male' ? '👨‍💼' : gender === 'female' ? '👩‍💼' : '🔍'}
                    </div>
                </div>
                <div className="space-y-4 mt-6">
                    {users.length > 0 ? (
                        users.map(user => {
                            const uniqueKey = user._id || user.id || `${user.searcher?.name || user.name}-${user.submittedAt}`;
                            return gender === 'search' ? (
                                <SearchRequestCard
                                    key={uniqueKey}
                                    searchRequest={user}
                                />
                            ) : (
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
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50" dir="rtl">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-6 rounded-full shadow-xl">
                                <Heart className="text-red-500" size={48} />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-gray-800 mb-4">ניהול משתתפים ובקשות חיפוש</h1>
                        <p className="text-xl text-gray-600">
                            סה"כ {males.length + females.length} משתתפים ו-{searchRequests.length} בקשות חיפוש
                        </p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <UsersList
                            users={males}
                            title="רווקים"
                            gender="male"
                            icon={Users}
                            emptyMessage="עדיין לא נרשמו רווקים"
                        />
                        <UsersList
                            users={females}
                            title="רווקות"
                            gender="female"
                            icon={Users}
                            emptyMessage="עדיין לא נרשמו רווקות"
                        />
                        <UsersList
                            users={searchRequests}
                            title="מחפשים מישהו מהאירוע"
                            gender="search"
                            icon={Search}
                            emptyMessage="עדיין אין בקשות חיפוש"
                        />
                    </div>
                </div>
            </div>
            <ImageModal
                isOpen={imageModal.isOpen}
                onClose={closeImageModal}
                imageUrl={imageModal.imageUrl}
                userName={imageModal.userName}
                gender={imageModal.gender}
            />
        </>
    );
};

export default AdminDashboard;