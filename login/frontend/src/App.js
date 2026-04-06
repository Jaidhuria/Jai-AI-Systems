import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/forgot-password";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./pages/AppLayout";
import OverviewPage from "./pages/OverviewPage";
import LogPage from "./pages/LogPage";
import RiskPage from "./pages/RiskPage";
import ChatPage from "./pages/ChatPage";
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/app/overview" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/overview" />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="log" element={<LogPage />} />
          <Route path="risk" element={<RiskPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/app/overview" />} />
        <Route path="*" element={<Navigate to="/app/overview" />} />
      </Routes>
    </AuthProvider>
  );
}


export default App;