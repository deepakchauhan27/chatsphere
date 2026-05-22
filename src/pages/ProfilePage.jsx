import { useState, useRef }       from "react";
import { useDispatch }            from "react-redux";
import { useNavigate }            from "react-router-dom";
import { updateProfile }          from "../store/authSlice";
import { useAuthContext }         from "../context/AuthContext";
import toast                      from "react-hot-toast";
import Loader                     from "../components/ui/Loader";
import { MdEdit, MdLock, MdPerson,MdLogout } from "react-icons/md";

function ProfilePage() {
  const dispatch         = useDispatch();
  const navigate         = useNavigate();
  const { user, handleLogout } = useAuthContext();

  const [name,        setName]        = useState(user?.name     || "");
  const [bio,         setBio]         = useState(user?.bio      || "");
  const [password,    setPassword]    = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [preview,     setPreview]     = useState(user?.avatar   || "");
  const [avatarFile,  setAvatarFile]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [activeTab,   setActiveTab]   = useState("profile");

  const fileRef = useRef(null);

  // ── Handle avatar preview ──────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── Handle profile update ──────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPass) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio",  bio);
      if (avatarFile) formData.append("avatar",   avatarFile);
      if (password)   formData.append("password", password);

      const result = await dispatch(updateProfile(formData));

      if (updateProfile.fulfilled.match(result)) {
        toast.success("Profile updated successfully!");
        setPassword("");
        setConfirmPass("");
      } else {
        toast.error(result.payload || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">

      {/* Header */}
      <div className="bg-yellow-300 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-yellow-900 hover:text-yellow-700 font-bold text-xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-extrabold text-yellow-900">
          Edit Profile
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-6">

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg">
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-yellow-300 flex items-center justify-center text-yellow-900 text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition text-lg"
            >
              <MdEdit />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="mt-3 text-gray-500 text-sm">{user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-yellow-100 mb-6 overflow-hidden">
          {["profile", "security"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-md font-semibold capitalize   flex item-center justify-center gap-1 transition ${
                activeTab === tab
                  ? "bg-yellow-300 text-yellow-900"
                  : "text-gray-500 hover:bg-yellow-50"
              }`}
            >
              {tab === "profile" ? <MdPerson className="mt-1 text-lg" /> : <MdLock className="mt-1 text-lg"/>}
              {tab === "profile" ? " Profile" : "Security"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-6 space-y-5"
        >
          {activeTab === "profile" && (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none transition"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell something about yourself..."
                  rows={3}
                  maxLength={150}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none transition resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {bio.length}/150
                </p>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none transition"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none transition"
                />
              </div>

              {password && confirmPass && (
                <p className={`text-sm font-medium ${
                  password === confirmPass ? "text-green-500" : "text-red-500"
                }`}>
                  {password === confirmPass ? "✅ Passwords match" : "❌ Passwords do not match"}
                </p>
              )}
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold py-3 rounded-lg shadow transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader size="sm" /> : "Save Changes"}
          </button>
        </form>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-white hover:bg-red-50 text-red-500 font-bold py-3 rounded-lg shadow border border-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
           <MdLogout /> Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;