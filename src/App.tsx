import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import Login from '../components/auth/Login';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserDashboard from '../components/user/UserDashboard';
import FormCreator from '../components/admin/FormCreator';
import SubmissionsView from '../components/admin/SubmissionsView';
import CheckIn from '../components/admin/CheckIn';
import EventForm from '../components/user/EventForm';
import ConfirmationPage from '../components/user/ConfirmationPage';
import Header from '../components/layout/Header';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Main />
      </Router>
    </AppProvider>
  );
};

const Main = () => {
  const { user } = useApp();

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark">
      {user && <Header />}
      <main>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" />
                ) : (
                  <Navigate to="/user/dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/create"
            element={
              user?.role === 'admin' ? (
                <FormCreator />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/edit/:formId"
            element={
              user?.role === 'admin' ? (
                <FormCreator />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/form/:formId"
            element={
              user?.role === 'admin' ? (
                <SubmissionsView />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/form/:formId/checkin"
            element={
              user?.role === 'admin' ? <CheckIn /> : <Navigate to="/login" />
            }
          />
          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              user?.role === 'user' ? (
                <UserDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/user/form/:formId"
            element={
              user?.role === 'user' ? <EventForm /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/user/confirmation/:submissionId"
            element={
              user?.role === 'user' ? (
                <ConfirmationPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
