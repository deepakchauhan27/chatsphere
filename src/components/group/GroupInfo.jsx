import { useState }               from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateChatInList }       from "../../store/chatSlice";
import Modal                      from "../ui/Modal";
import Avatar                     from "../ui/Avatar";
import chatService                from "../../services/chatService";
import toast                      from "react-hot-toast";

function GroupInfo({ onClose }) {
  const { user }       = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);
  const dispatch       = useDispatch();
  const [loading, setLoading] = useState(false);

  const isAdmin = activeChat?.groupAdmin === user?._id ||
                  activeChat?.groupAdmin?._id === user?._id;

  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      const updated = await chatService.removeFromGroup(activeChat._id, memberId);
      dispatch(updateChatInList(updated));
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setLoading(true);
      await chatService.removeFromGroup(activeChat._id, user._id);
      toast.success("Left group");
      onClose();
    } catch {
      toast.error("Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Group Info" size="md">
      {/* Group Avatar & Name */}
      <div className="flex flex-col items-center mb-6">
        <Avatar
          src={activeChat?.groupAvatar}
          name={activeChat?.groupName}
          size="xl"
        />
        <h2 className="text-xl font-bold text-gray-800 mt-3">
          {activeChat?.groupName}
        </h2>
        <p className="text-sm text-gray-400">
          {activeChat?.participants?.length} members
        </p>
      </div>

      {/* Members List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Members
        </p>
        {activeChat?.participants?.map((member) => {
          const isCurrentUser = member._id === user?._id;
          const isMemberAdmin =
            activeChat.groupAdmin === member._id ||
            activeChat.groupAdmin?._id === member._id;

          return (
            <div
              key={member._id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-yellow-50"
            >
              <Avatar src={member.avatar} name={member.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {member.name}
                  {isCurrentUser && (
                    <span className="text-yellow-500 ml-1">(You)</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
              {isMemberAdmin && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  Admin
                </span>
              )}
              {isAdmin && !isCurrentUser && !isMemberAdmin && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  disabled={loading}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Leave Group */}
      <button
        onClick={handleLeaveGroup}
        disabled={loading}
        className="w-full mt-5 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-2.5 rounded-lg border border-red-100 transition active:scale-95"
      >
        🚪 Leave Group
      </button>
    </Modal>
  );
}

export default GroupInfo;