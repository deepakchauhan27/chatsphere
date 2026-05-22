import { useSelector, useDispatch } from "react-redux";
import { useNavigate }              from "react-router-dom";
import { logoutUser, clearError }   from "../store/authSlice";
import { disconnectSocket }         from "../socket/socket";

const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, loading, error, success } = useSelector((state) => state.auth);

  // ── Logout ────────────────────────────────────────
  const logout = async () => {
    await dispatch(logoutUser());
    disconnectSocket();
    navigate("/login");
  };

  // ── Clear Error ───────────────────────────────────
  const resetError = () => {
    dispatch(clearError());
  };

  // ── Check if user owns resource ───────────────────
  const isOwner = (ownerId) => {
    return user?._id === ownerId;
  };

  // ── Get Auth Header ───────────────────────────────
  const getAuthHeader = () => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  return {
    user,
    loading,
    error,
    success,
    logout,
    resetError,
    isOwner,
    getAuthHeader,
    isAuthenticated: !!user,
  };
};

export default useAuth;