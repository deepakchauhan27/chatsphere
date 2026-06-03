import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyChats } from "../store/chatSlice";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import SearchUser from "../components/search/SearchUser";
import IncomingCall from "../components/call/IncomingCall";
import CreateGroup from "../components/group/CreateGroup";
import { useAuthContext } from "../context/AuthContext";

// ── MD Icons ─────────────────────────────────────────
import {
  MdMessage,
  MdGroup,
  MdCall,
  MdPerson,
  MdLogout,
  MdAttachFile,
  MdVideoCall,
  MdAddComment,
  MdGroupAdd,
  MdPhone,
  MdEdit,
} from "react-icons/md";

function Home() {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((state) => state.chat);
  const { incomingCall } = useSelector((state) => state.call);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    dispatch(fetchMyChats());
  }, [dispatch]);

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex overflow-hidden">
      {/* Incoming Call Modal */}
      {incomingCall && <IncomingCall />}

      {/* Create Group Modal */}
      <CreateGroup
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />

      {/* Left Sidebar */}
      <div
        className={`
          w-full md:w-[350px] lg:w-[400px] flex-shrink-0
          bg-white border-r border-yellow-200 flex flex-col
          ${activeChat ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Header */}
        <div className="bg-yellow-300 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-yellow-900">ChatSphere</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Search User */}
            <SearchUser />

            {/* Create Group Button */}
            <button
              onClick={() => setShowCreateGroup(true)}
              className="w-9 h-9 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 transition active:scale-95"
              title="Create Group"
            >
              <MdGroupAdd className="text-xl" />
            </button>

            {/* Profile Menu */}
            <ProfileMenu onCreateGroup={() => setShowCreateGroup(true)} />
          </div>
        </div>

        {/* Chat List */}
        <ChatList />
      </div>

      {/* Right: Chat Window */}
      <div
        className={`flex-1 flex flex-col ${activeChat ? "flex" : "hidden md:flex"}`}
      >
        {activeChat ? (
          <ChatWindow />
        ) : (
          <WelcomeScreen onCreateGroup={() => setShowCreateGroup(true)} />
        )}
      </div>
    </div>
  );
}

// ── Welcome Screen ───────────────────────────────────
const WelcomeScreen = ({ onCreateGroup }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
    <div className="text-center space-y-4 px-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg">
          <MdMessage className="text-5xl text-yellow-900" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-yellow-800">Welcome to ChatSphere</h2>
      <p className="text-yellow-600 text-lg max-w-sm mx-auto">
        Select a chat to start messaging or search for a user to begin a new
        conversation.
      </p>

      {/* Feature Icons */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
            <MdVideoCall className="text-2xl text-yellow-800" />
          </div>
          <span className="text-xs font-medium text-yellow-700">
            Video Calls
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
            <MdPhone className="text-2xl text-yellow-800" />
          </div>
          <span className="text-xs font-medium text-yellow-700">
            Audio Calls
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
            <MdAttachFile className="text-2xl text-yellow-800" />
          </div>
          <span className="text-xs font-medium text-yellow-700">
            File Sharing
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
            <MdGroup className="text-2xl text-yellow-800" />
          </div>
          <span className="text-xs font-medium text-yellow-700">
            Group Chats
          </span>
        </div>
      </div>

      {/* Create Group Button */}
      <button
        onClick={onCreateGroup}
        className="mt-6 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-xl shadow transition active:scale-95 flex items-center gap-2 mx-auto"
      >
        <MdGroupAdd className="text-xl" />
        Create a Group
      </button>
    </div>
  </div>
);

// ── Profile Menu ─────────────────────────────────────
const ProfileMenu = ({ onCreateGroup }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, handleLogout } = useAuthContext();

  return (
    <div className="relative">
      {/* Avatar Button */}
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
          <div className="absolute right-0 top-11 z-20 bg-white rounded-xl shadow-xl border border-yellow-100 w-52 py-2 overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-yellow-100">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>

            {/* Edit Profile */}
            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition flex items-center gap-3"
            >
              <MdEdit className="text-lg text-yellow-600" />
              Edit Profile
            </button>

            {/* Call History */}
            <button
              onClick={() => {
                navigate("/calls");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition flex items-center gap-3"
            >
              <MdCall className="text-lg text-yellow-600" />
              Call History
            </button>

            {/* Create Group */}
            <button
              onClick={() => {
                onCreateGroup();
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition flex items-center gap-3"
            >
              <MdGroupAdd className="text-lg text-yellow-600" />
              Create Group
            </button>

            <div className="border-t border-yellow-100 mt-1" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-3"
            >
              <MdLogout className="text-lg" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
