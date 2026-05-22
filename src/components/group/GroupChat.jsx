import { useState }               from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveChat }          from "../../store/chatSlice";
import { useSocketContext }       from "../../context/SocketContext";
import Avatar                     from "../ui/Avatar";
import CreateGroup                from "./CreateGroup";
import GroupInfo                  from "./GroupInfo";
import moment                     from "moment";

function GroupChat() {
  const dispatch     = useDispatch();
  const { user }     = useSelector((state) => state.auth);
  const { chats, activeChat, onlineUsers } = useSelector((state) => state.chat);
  const { joinChat, leaveChat }            = useSocketContext();

  const [showCreate,   setShowCreate]   = useState(false);
  const [showInfo,     setShowInfo]     = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Filter only group chats
  const groupChats = chats.filter((c) => c.isGroup);

  const handleGroupSelect = (chat) => {
    if (activeChat?._id === chat._id) return;
    if (activeChat) leaveChat(activeChat._id);
    dispatch(setActiveChat(chat));
    joinChat(chat._id);
  };

  const handleGroupInfo = (e, chat) => {
    e.stopPropagation();
    setSelectedGroup(chat);
    setShowInfo(true);
  };

  const getLastMessage = (chat) => {
    const msg = chat.lastMessage;
    if (!msg) return "No messages yet";
    const senderName =
      msg.sender?._id === user._id ? "You" : msg.sender?.name?.split(" ")[0];
    if (msg.type === "image") return `${senderName}: 📷 Photo`;
    if (msg.type === "video") return `${senderName}: 🎥 Video`;
    if (msg.type === "audio") return `${senderName}: 🎙️ Audio`;
    if (msg.type === "file")  return `${senderName}: 📎 File`;
    return `${senderName}: ${
      msg.content?.length > 35
        ? msg.content.substring(0, 35) + "..."
        : msg.content
    }`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-yellow-300 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-yellow-900">Groups</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-bold px-3 py-1.5 rounded-lg transition active:scale-95"
        >
          + New Group
        </button>
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto">
        {groupChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-gray-500 font-medium">No groups yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create a group to start chatting
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold px-5 py-2 rounded-lg transition active:scale-95"
            >
              Create Group
            </button>
          </div>
        ) : (
          groupChats.map((chat) => {
            const isActive      = activeChat?._id === chat._id;
            const onlineCount   = chat.participants?.filter((p) =>
              onlineUsers.includes(p._id)
            ).length;

            return (
              <div
                key={chat._id}
                onClick={() => handleGroupSelect(chat)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50 ${
                  isActive
                    ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Group Avatar */}
                <Avatar
                  src={chat.groupAvatar}
                  name={chat.groupName}
                  size="md"
                />

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800 truncate text-sm">
                      {chat.groupName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {chat.lastMessage
                        ? moment(chat.updatedAt).format("h:mm A")
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-400 truncate">
                      {getLastMessage(chat)}
                    </p>
                    <span className="text-xs text-green-500 flex-shrink-0 ml-2">
                      {onlineCount > 0 ? `${onlineCount} online` : ""}
                    </span>
                  </div>
                </div>

                {/* Info Button */}
                <button
                  onClick={(e) => handleGroupInfo(e, chat)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-600 text-lg flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-yellow-100 transition"
                >
                  ℹ️
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroup
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Group Info Modal */}
      {showInfo && selectedGroup && (
        <GroupInfo onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}

export default GroupChat;