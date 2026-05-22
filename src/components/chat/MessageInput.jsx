import { useState, useRef }        from "react";
import { useSelector }             from "react-redux";
import useMessages from "../../hooks/useMessage";
import MediaUpload                 from "../media/MediaUpload";
import {MdAttachFile,MdSend} from "react-icons/md";

function MessageInput({ chatId }) {
  const [text,      setText]      = useState("");
  const [showMedia, setShowMedia] = useState(false);
  const inputRef                  = useRef(null);
  const { handleSendMessage, handleSendMedia, handleTyping } = useMessages(chatId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await handleSendMessage(text);
    setText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping();
  };

  const handleMediaSend = async (file, type) => {
    await handleSendMedia(file, type);
    setShowMedia(false);
  };

  return (
    <div className="bg-white border-t border-yellow-100 px-4 py-3">
      {/* Media Upload Panel */}
      {showMedia && (
        <MediaUpload
          onSend={handleMediaSend}
          onClose={() => setShowMedia(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Media Button */}
        <button
          type="button"
          onClick={() => setShowMedia(!showMedia)}
          className="flex-shrink-0 w-10 h-10 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full flex items-center justify-center transition active:scale-95"
        >
          <MdAttachFile />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 transition max-h-32 overflow-y-auto"
            style={{ minHeight: "42px" }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex-shrink-0 w-10 h-10 bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-100 disabled:text-gray-300 text-yellow-900 rounded-full flex items-center justify-center transition active:scale-95 disabled:cursor-not-allowed"
        >
          <MdSend />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;