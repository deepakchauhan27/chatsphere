import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setUser } from "../store/authSlice";
import { initSocket, disconnectSocket, getSocket } from "../socket/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch        = useDispatch();
  const { user }        = useSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  // ── On Mount: Restore User from localStorage ──────
  useEffect(() => {
    const stored = localStorage.getItem("chatly_user");
    if (stored) {
      dispatch(setUser(JSON.parse(stored)));
    }
    setIsReady(true);
  }, [dispatch]);

  // ── Initialize Socket When User Logs In ───────────
  useEffect(() => {
    if (user) {
      const socket = initSocket();

      // Tell server this user is online
      socket.emit("user:online", user._id);
    } else {
      disconnectSocket();
    }

    return () => {
      const socket = getSocket();
      if (socket && !user) {
        disconnectSocket();
      }
    };
  }, [user]);

  // ── Logout Handler ────────────────────────────────
  const handleLogout = async () => {
    const socket = getSocket();
    if (socket) {
      socket.emit("user:offline", user?._id);
    }
    await dispatch(logoutUser());
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isReady,
        handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {isReady ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;