import { useState }               from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearActiveChat }        from "../../store/chatSlice";
import { useCallContext }         from "../../context/CallContext";
import { useSocketContext }        from "../../context/SocketContext";
import Avatar                     from "../ui/Avatar";
import GroupInfo                  from "../group/GroupInfo";
import Tooltip                    from "../ui/Tooltip";
import { MdCall,MdVideoCall} from "react-icons/md";

function ChatHeader() {
  const dispatch       = useDispatch();
  const { user }       = useSelector((state) => state.auth);
  const { activeChat, onlineUsers, typingUsers } = useSelector((state) => state.chat);
  const { initiateCall } = useCallContext();
  const { leaveChat }    = useSocketContext();
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  if (!activeChat) return null;

  const partner = !activeChat.isGroup
    ? activeChat.participants?.find((p) => p._id !== user?._id)
    : null;

  const isOnline  = partner && onlineUsers.includes(partner._id);
  const isTyping  = typingUsers.length > 0;

  const handleBack = () => {
    leaveChat(activeChat._id);
    dispatch(clearActiveChat());
  };

  const handleAudioCall = () => {
    if (!partner) return;
    initiateCall({
      receiverId:     partner._id,
      receiverName:   partner.name,
      receiverAvatar: partner.avatar,
      callType:       "audio",
    });
  };

  const handleVideoCall = () => {
    if (!partner) return;
    initiateCall({
      receiverId:     partner._id,
      receiverName:   partner.name,
      receiverAvatar: partner.avatar,
      callType:       "video",
    });
  };

  return (
    <>
      <div className="bg-yellow-300 px-4 py-3 flex items-center gap-3 shadow-sm">
        {/* Back Button (mobile) */}
        <button
          onClick={handleBack}
          className="md:hidden text-yellow-900 font-bold text-xl mr-1"
        >
          ←
        </button>

        {/* Avatar */}
        <div
          onClick={() => activeChat.isGroup && setShowGroupInfo(true)}
          className={activeChat.isGroup ? "cursor-pointer" : ""}
        >
          <Avatar
            src={activeChat.isGroup ? activeChat.groupAvatar : partner?.avatar}
            name={activeChat.isGroup ? activeChat.groupName : partner?.name}
            size="md"
            online={isOnline}
          />
        </div>

        {/* Name & Status */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => activeChat.isGroup && setShowGroupInfo(true)}
        >
          <p className="font-bold text-yellow-900 truncate">
            {activeChat.isGroup ? activeChat.groupName : partner?.name}
          </p>
          <p className="text-xs text-yellow-700">
            {isTyping
              ? "typing..."
              : activeChat.isGroup
              ? `${activeChat.participants?.length} members`
              : isOnline
              ? "online"
              : "offline"}
          </p>
        </div>

        {/* Call Buttons (1-to-1 only) */}
        {!activeChat.isGroup && (
          <div className="flex items-center gap-2">
            <Tooltip text="Audio Call">
              <button
                onClick={handleAudioCall}
                className="w-9 h-9 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 transition active:scale-95 text-lg"
              >
                <MdCall/>
              </button>
            </Tooltip>
            <Tooltip text="Video Call">
              <button
                onClick={handleVideoCall}
                className="w-9 h-9 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 transition active:scale-95 text-lg"
              >
                <MdVideoCall />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Group Info Modal */}
      {showGroupInfo && (
        <GroupInfo onClose={() => setShowGroupInfo(false)} />
      )}
    </>
  );
}

export default ChatHeader;