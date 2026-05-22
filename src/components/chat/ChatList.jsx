import { useDispatch, useSelector } from "react-redux";
import { setActiveChat } from "../../store/chatSlice";
import { useSocketContext } from "../../context/SocketContext";
import Avatar from "../ui/Avatar";
import moment from "moment";

function ChatList() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat, onlineUsers, notification, loading } = useSelector(
    (state) => state.chat,
  );
  const { joinChat, leaveChat } = useSocketContext();

  const handleChatSelect = (chat) => {
    if (activeChat?._id === chat._id) return;
    if (activeChat) leaveChat(activeChat._id);
    dispatch(setActiveChat(chat));
    joinChat(chat._id);
  };

  // Get other participant in 1-to-1 chat
  const getChatPartner = (chat) => {
    if (chat.isGroup) return null;
    return chat.participants?.find((p) => p._id !== user?._id);
  };

  // Get unread notification count
  const getUnreadCount = (chatId) => {
    return notification.filter((n) => (n.chat?._id || n.chat) === chatId)
      .length;
  };

  // Get last message preview
  const getLastMessage = (chat) => {
    const msg = chat.lastMessage;
    if (!msg) return "Start a conversation";
    if (msg.type === "image") return "Photo";
    if (msg.type === "video") return "Video";
    if (msg.type === "audio") return " Audio";
    if (msg.type === "file") return "File";
    return msg.content?.length > 40
      ? msg.content.substring(0, 40) + "..."
      : msg.content;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <p className="text-gray-500 font-medium">No chats yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Search for a user to start chatting
          </p>
        </div>
      ) : (
        chats.map((chat) => {
          const partner = getChatPartner(chat);
          const isOnline = partner && onlineUsers.includes(partner._id);
          const unread = getUnreadCount(chat._id);
          const isActive = activeChat?._id === chat._id;

          return (
            <div
              key={chat._id}
              onClick={() => handleChatSelect(chat)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50 ${
                isActive
                  ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <Avatar
                src={chat.isGroup ? chat.groupAvatar : partner?.avatar}
                name={chat.isGroup ? chat.groupName : partner?.name}
                size="md"
                online={isOnline}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800 truncate text-sm">
                    {chat.isGroup ? chat.groupName : partner?.name}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {chat.lastMessage
                      ? moment(chat.lastMessage.createdAt).format("h:mm A")
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-400 truncate">
                    {getLastMessage(chat)}
                  </p>
                  {unread > 0 && (
                    <span className="ml-2 flex-shrink-0 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ChatList;
