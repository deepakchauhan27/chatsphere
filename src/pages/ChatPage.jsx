import { useEffect }            from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveChat }        from "../store/chatSlice";
import chatService              from "../services/chatService";
import ChatWindow               from "../components/chat/ChatWindow";
import Loader                   from "../components/ui/Loader";

function ChatPage() {
  const { chatId }   = useParams();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const { activeChat, loading } = useSelector((state) => state.chat);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const chat = await chatService.getChatById(chatId);
        dispatch(setActiveChat(chat));
      } catch (error) {
        console.error("Chat not found:", error);
        navigate("/");
      }
    };

    if (chatId) loadChat();
  }, [chatId, dispatch, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-yellow-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-screen bg-yellow-50">
      {activeChat ? (
        <ChatWindow />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-yellow-600 text-lg">Chat not found</p>
        </div>
      )}
    </div>
  );
}

export default ChatPage;