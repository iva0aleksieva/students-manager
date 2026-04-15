import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SlidoPage from './pages/SlidoPage';
import ChatbotPage from './pages/ChatbotPage';
import ChatbotResultsPage from './pages/ChatbotResultsPage';
import QuizPage from './pages/QuizPage';
import UserlessPage from './pages/UserlessPage';
import TimelinePage from './pages/TimelinePage';

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/slido' element={<SlidoPage />} />
        <Route path='/quiz' element={<QuizPage />} />
        <Route path='/userless' element={<UserlessPage />} />
        {isLoggedIn ? (
          <>
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/chatbot' element={<ChatbotPage />} />
            <Route path='/chatbot/results' element={<ChatbotResultsPage />} />
            <Route path='/timeline' element={<TimelinePage />} />
            <Route path='/login' element={<Navigate to='/' replace />} />
          </>
        ) : (
          <>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/timeline' element={<Navigate to='/login' replace />} />
            <Route path='/profile' element={<Navigate to='/login' replace />} />
            <Route path='/chatbot' element={<Navigate to='/login' replace />} />
            <Route path='/chatbot/results' element={<Navigate to='/login' replace />} />
          </>
        )}
      </Routes>
      
    </Layout>
  );
}

export default App;
