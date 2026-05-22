import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../store/authSlice";
import AuthForm from "./AuthForm";
import toast from "react-hot-toast";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleRegister = async (formData) => {
    const { name, email, password, confirm } = formData;

    if (password !== confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      navigate("/");
    }
  };

  return (
    <AuthForm
      type="register"
      onSubmit={handleRegister}
      isLoading={loading}
      error={error}
    />
  );
}

export default Register;