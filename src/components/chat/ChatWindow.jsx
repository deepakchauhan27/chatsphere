import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Loader from "../ui/Loader";
import { useSocketContext } from "../../context/SocketContext";
import useMessages from "../../hooks/useMessage";

function ChatWindow() {
  const { user } = useSelector((state) => state.auth);
  const { activeChat, typingUsers } = useSelector((state) => state.chat);
  const { joinChat } = useSocketContext();

  const { messages, msgLoading, bottomRef, groupMessagesByDate } = useMessages(
    activeChat?._id,
  );

  // Join chat room on mount
  useEffect(() => {
    if (activeChat?._id) {
      joinChat(activeChat._id);
    }
  }, [activeChat?._id]);

  const isOwn = (senderId) =>
    senderId === user?._id || senderId?._id === user?._id;

  const shouldShowAvatar = (messages, index) => {
    if (index === 0) return true;
    const prev = messages[index - 1];
    const curr = messages[index];
    return prev.sender?._id !== curr.sender?._id || prev.sender !== curr.sender;
  };

  const grouped = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {msgLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-3">👋</div>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Say hello to start the conversation!
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  {date === new Date().toLocaleDateString() ? "Today" : date}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Messages */}
              {msgs.map((message, index) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={isOwn(message.sender?._id || message.sender)}
                  showAvatar={
                    activeChat.isGroup &&
                    shouldShowAvatar(msgs, index) &&
                    !isOwn(message.sender?._id || message.sender)
                  }
                />
              ))}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-gray-100">
              <span
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput chatId={activeChat?._id} />
    </div>
  );
}

export default ChatWindow;
