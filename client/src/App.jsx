import { Routes, Route } from 'react-router-dom'
import WeddingDatingForm from './components/WeddingDatingForm'
import AdminDashboard from './components/AdminDashboard'
import WebediaFooterLogo from "./components/WebediaFooterLogo.jsx";

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* תוכן הדפים */}
            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<WeddingDatingForm />} />
                    <Route path="/wedding-admin-view-participants" element={<AdminDashboard />} />
                    <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl">דף לא נמצא</div>} />
                </Routes>
            </div>

            {/* הפוטר - תמיד בתחתית */}
            <WebediaFooterLogo />
        </div>
    )
}

export default App