import { useState, useEffect }    from "react";
import { useSelector }            from "react-redux";
import authService                from "../../services/authService";
import Avatar                     from "../ui/Avatar";
import Modal                      from "../ui/Modal";
import Loader                     from "../ui/Loader";
import moment                     from "moment";

function UserProfile({ userId, isOpen, onClose, onStartChat }) {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { onlineUsers }       = useSelector((state) => state.chat);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !isOpen) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await authService.getUserProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, isOpen]);

  const isOnline  = profile && onlineUsers.includes(profile._id);
  const isSelf    = profile?._id === currentUser?._id;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile" size="sm">
      {loading ? (
        <div className="py-10 flex justify-center">
          <Loader />
        </div>
      ) : !profile ? (
        <div className="py-10 text-center text-gray-400">
          Profile not found
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar
              src={profile.avatar}
              name={profile.name}
              size="xl"
              online={isOnline}
            />
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>

          {/* Online Status */}
          <div className="flex items-center gap-1.5 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-400" : "bg-gray-300"
              }`}
            />
            <span className="text-sm text-gray-500">
              {isOnline
                ? "Online"
                : `Last seen ${moment(profile.lastSeen).fromNow()}`}
            </span>
          </div>

          {/* Email */}
          <p className="text-sm text-gray-400 mt-2">{profile.email}</p>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 w-full">
              <p className="text-sm text-gray-600 italic">
                "{profile.bio}"
              </p>
            </div>
          )}

          {/* Member Since */}
          <p className="text-xs text-gray-400 mt-4">
            Member since {moment(profile.createdAt).format("MMMM YYYY")}
          </p>

          {/* Action Button */}
          {!isSelf && (
            <button
              onClick={() => { onStartChat(profile._id); onClose(); }}
              className="mt-5 w-full bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold py-2.5 rounded-lg transition active:scale-95"
            >
              💬 Send Message
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

export default UserProfile;