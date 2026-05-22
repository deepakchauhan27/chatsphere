import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../store/authSlice";
import { useAuthContext } from "../../context/AuthContext";
import Modal from "../ui/Modal";
import Loader from "../ui/Loader";
import toast from "react-hot-toast";
import { MdEdit, MdLock, MdPerson } from "react-icons/md";

function EditProfile({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useAuthContext();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [preview, setPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const fileRef = useRef(null);

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

  const handleSubmit = async () => {
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
      formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);
      if (password) formData.append("password", password);

      const result = await dispatch(updateProfile(formData));
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Profile updated!");
        setPassword("");
        setConfirmPass("");
        onClose();
      } else {
        toast.error(result.payload || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="md">
      {/* Avatar */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-300">
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-yellow-200 flex items-center justify-center text-yellow-900 text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 bg-yellow-400 hover:bg-yellow-500 rounded-full w-7 h-7 flex items-center justify-center text-sm transition"
          >
            <MdEdit />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl overflow-hidden mb-5">
        {["profile", "security"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-yellow-300 text-yellow-900"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab === "profile" ? <MdPerson /> : <MdLock />}
            {tab === "profile" ? " Profile" : "🔒 Security"}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name123
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none transition"
            />
          </div>
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
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none resize-none transition"
            />
            <p className="text-xs text-gray-400 text-right">{bio.length}/150</p>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
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
            <p
              className={`text-sm font-medium ${
                password === confirmPass ? "text-green-500" : "text-red-500"
              }`}
            >
              {password === confirmPass
                ? "✅ Passwords match"
                : "❌ Passwords do not match"}
            </p>
          )}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-5 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold py-3 rounded-lg transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <Loader size="sm" /> : "Save Changes"}
      </button>
    </Modal>
  );
}

export default EditProfile;
