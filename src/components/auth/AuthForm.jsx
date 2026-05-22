import { useState } from "react";
import { Link } from "react-router-dom";
import { MdMessage, MdVideoCall,MdGroup, MdAttachFile} from "react-icons/md";

function AuthForm({ type, onSubmit, isLoading, error }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const isLogin = type === "login";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      style={{ minHeight: "100vh" }}
      className="bg-gradient-to-br from-yellow-50 to-yellow-300 flex items-center justify-center p-6"
    >
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-yellow-300 p-12 flex-col justify-center text-yellow-900">
          <h2 className="text-4xl font-bold mb-4">
            {isLogin ? "Welcome Back!" : "Join ChatSphere!"}
          </h2>
          <p className="text-lg opacity-90 mb-8">
            {isLogin
              ? "Continue your chats with ChatSphere."
              : "Create an account and start chatting today."}
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl">
                <MdMessage />
              </div>
              <span className="font-medium text-lg">Real-time messaging</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl">
                <MdVideoCall />
              </div>
              <span className="font-medium text-lg">Audio & Video calls</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl">
                <MdGroup />
              </div>
              <span className="font-medium text-lg">Group chats</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl">
                <MdAttachFile />
              </div>
              <span className="font-medium text-lg">Media sharing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-3xl font-extrabold text-yellow-500">
              ChatSphere
            </h1>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center md:text-left">
            {isLogin ? "Log in to Your Account" : "Create Your Account"}
          </h1>
          <p className="text-gray-400 text-sm mb-8 text-center md:text-left">
            {isLogin
              ? "Welcome back! Please enter your details."
              : "Fill in the details below to get started."}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name - Register only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-yellow-300 focus:ring-0 outline-none transition bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-yellow-300 focus:ring-0 outline-none transition bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-yellow-300 focus:ring-0 outline-none transition bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-yellow-600 font-semibold hover:text-yellow-800 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password - Register only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={formData.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-yellow-300 focus:ring-0 outline-none transition bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                />
                {/* Password match indicator */}
                {formData.confirm && (
                  <p
                    className={`text-xs mt-1.5 font-medium ${
                      formData.password === formData.confirm
                        ? "text-green-500"
                        : "text-red-400"
                    }`}
                  >
                    {formData.password === formData.confirm
                      ? "✅ Passwords match"
                      : "❌ Passwords do not match"}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3.5 rounded-xl shadow-md shadow-yellow-200 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-base mt-2"
            >
              {isLoading
                ? "Please wait..."
                : isLogin
                  ? "Log in →"
                  : "Create Account →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              to={isLogin ? "/register" : "/login"}
              className="text-yellow-500 font-bold hover:text-yellow-600 hover:underline transition"
            >
              {isLogin ? "Register" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
// make it good