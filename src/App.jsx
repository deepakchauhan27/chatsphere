import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import CallPage from "./pages/CallPage";
import ProfilePage from "./pages/ProfilePage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { CallProvider } from "./context/CallContext";
import CallScreen from "./components/call/CallScreen";

// ── Protected Route ──────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
};

// ── Public Route (redirect if logged in) ─────────────
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return !user ? children : <Navigate to="/" replace />;
};

function App() {
  const { activeCall, incomingCall, callStatus } = useSelector(
    (state) => state.call,
  );

  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fef3c7",
                color: "#78350f",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#d97706",
                  secondary: "#fef3c7",
                },
              },
              error: {
                style: {
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                },
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fee2e2",
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calls"
              element={
                <ProtectedRoute>
                  <CallPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {(activeCall || incomingCall) && callStatus !== "idle" && (
            <CallScreen />
          )}
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
