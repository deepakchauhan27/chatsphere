import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../store/authSlice";
import AuthForm from "./AuthForm";

function Login() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (formData) => {
    const { email, password } = formData;
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      isLoading={loading}
      error={error}
    />
  );
}

export default Login;