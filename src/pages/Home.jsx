import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMyChats } from "../store/chatSlice";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import SearchUser from "../components/search/SearchUser";
import IncomingCall from "../components/call/IncomingCall";
import { useSelector } from "react-redux";
import { MdVideoCall, MdMic, MdAttachFile, MdGroup } from "react-icons/md";

function Home() {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((state) => state.chat);
  const { incomingCall } = useSelector((state) => state.call);

  useEffect(() => {
    dispatch(fetchMyChats());
  }, [dispatch]);

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex overflow-hidden">
      {/* Incoming Call Modal */}
      {incomingCall && <IncomingCall />}

      {/* Left Sidebar */}
      <div
        className={`
          w-full md:w-[350px] lg:w-[400px] flex-shrink-0
          bg-white border-r border-yellow-200
          flex flex-col
          ${activeChat ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Header */}
        <div className="bg-yellow-300 px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-yellow-900">
            ChatSphere
          </h1>
          <div className="flex items-center gap-3">
            <SearchUser />
            <ProfileMenu />
          </div>
        </div>

        {/* Chat List */}
        <ChatList />
      </div>

      {/* Right: Chat Window */}
      <div
        className={`
        flex-1 flex flex-col
        ${activeChat ? "flex" : "hidden md:flex"}
      `}
      >
        {activeChat ? <ChatWindow /> : <WelcomeScreen />}
      </div>
    </div>
  );
}

// ── Welcome Screen ──────────────────────────────────
const WelcomeScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-bold text-yellow-800">
        Welcome to ChatSphere
      </h2>
      <p className="text-yellow-600 text-lg max-w-sm">
        Select a chat to start messaging or search for a user to begin a new
        conversation.
      </p>
      <div className="flex items-center justify-center gap-6 mt-6 text-yellow-700">
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">
            <MdVideoCall />
          </span>
          <span className="text-sm font-medium">Video Calls</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">
            <MdMic />
          </span>
          <span className="text-sm font-medium">Audio Calls</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">
            <MdAttachFile />
          </span>
          <span className="text-sm font-medium">File Sharing</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">
            <MdGroup />
          </span>
          <span className="text-sm font-medium">Group Chats</span>
        </div>
      </div>
    </div>
  </div>
);

// ── Profile Menu ────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { MdPerson, MdPhone, MdExitToApp } from "react-icons/md";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, handleLogout } = useAuthContext();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-yellow-500 focus:outline-none"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-11 z-20 bg-white rounded-xl shadow-xl border border-yellow-100 w-48 py-2 overflow-hidden">
            <div className="px-4 py-2 border-b border-yellow-100">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-yellow-50 transition flex "
            >
              <MdPerson className="mt-1 mr-2" /> Edit Profile
            </button>
            <button
              onClick={() => {
                navigate("/calls");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition flex"
            >
              <MdPhone className="mt-1 mr-2" /> Call History
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex"
            >
              <MdExitToApp className="mt-1 mr-2" /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
