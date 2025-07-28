import { Routes, Route } from 'react-router-dom'
import WeddingDatingForm from './components/WeddingDatingForm'
import AdminDashboard from './components/AdminDashboard'

function App() {
    return (
        <Routes>
            {/* דף הטופס הראשי */}
            <Route path="/" element={<WeddingDatingForm />} />

            {/* דף התצוגה עם שם לא ברור */}
            <Route path="/wedding-admin-view-participants" element={<AdminDashboard />} />

            {/* דף 404 */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl">דף לא נמצא</div>} />
        </Routes>
    )
}

export default App