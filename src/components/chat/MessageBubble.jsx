import { useState, useRef }       from "react";
import { useSelector }            from "react-redux";
import Avatar                     from "../ui/Avatar";
import ImagePreview               from "../media/ImagePreview";
import FileMessage                from "../media/FileMessage";
import moment                     from "moment";

function MessageBubble({ message, isOwn, showAvatar }) {
  const [showTime,    setShowTime]    = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const [imagePreview, setImagePreview] = useState(false);
  const menuRef                        = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div>
            <img
              src={message.mediaUrl}
              alt="sent image"
              className="max-w-[220px] max-h-[220px] rounded-xl cursor-pointer hover:opacity-90 transition object-cover"
              onClick={() => setImagePreview(true)}
            />
            {message.content && message.content !== message.mediaName && (
              <p className="text-sm mt-1">{message.content}</p>
            )}
          </div>
        );

      case "video":
        return (
          <video
            src={message.mediaUrl}
            controls
            className="max-w-[240px] rounded-xl"
          />
        );

      case "audio":
        return (
          <div className="flex flex-col gap-1">
            <audio
              src={message.mediaUrl}
              controls
              className="max-w-[220px] h-10"
            />
            <p className="text-[10px] opacity-60">
              {message.mediaName || "Audio"}
            </p>
          </div>
        );

      case "file":
        return <FileMessage message={message} isOwn={isOwn} />;

      default:
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words max-w-[280px]">
            {message.content}
          </p>
        );
    }
  };

  return (
    <>
      {/* Image Preview Modal */}
      {imagePreview && (
        <ImagePreview
          src={message.mediaUrl}
          name={message.mediaName}
          onClose={() => setImagePreview(false)}
        />
      )}

      <div
        className={`flex items-end gap-2 mb-1 group ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
        onClick={() => setShowTime(!showTime)}
        onContextMenu={handleContextMenu}
      >
        {/* Avatar */}
        {!isOwn && showAvatar && (
          <Avatar
            src={message.sender?.avatar}
            name={message.sender?.name}
            size="sm"
          />
        )}
        {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}

        {/* Bubble */}
        <div
          className={`max-w-[70%] flex flex-col ${
            isOwn ? "items-end" : "items-start"
          }`}
        >
          {/* Sender name in group chats */}
          {!isOwn && showAvatar && (
            <p className="text-xs text-gray-500 mb-1 ml-1 font-semibold">
              {message.sender?.name}
            </p>
          )}

          {/* Bubble Box */}
          <div
            className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
              isOwn
                ? "bg-yellow-300 text-yellow-900 rounded-br-sm"
                : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
            }`}
          >
            {renderContent()}
          </div>

          {/* Time + Read Receipt */}
          {showTime && (
            <div
              className={`flex items-center gap-1 mt-1 px-1 ${
                isOwn ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span className="text-[10px] text-gray-400">
                {moment(message.createdAt).format("h:mm A")}
              </span>
              {isOwn && (
                <span
                  className={`text-[10px] font-bold ${
                    message.readBy?.length > 1
                      ? "text-blue-400"
                      : "text-gray-400"
                  }`}
                >
                  {message.readBy?.length > 1 ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          )}

          {/* Always show time below */}
          {!showTime && (
            <span className="text-[10px] text-gray-400 mt-0.5 px-1">
              {moment(message.createdAt).format("h:mm A")}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default MessageBubble;