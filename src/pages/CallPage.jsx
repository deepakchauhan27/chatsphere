import { useEffect }              from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCallHistory }       from "../store/callSlice";
import { useCallContext }         from "../context/CallContext";
import CallScreen                 from "../components/call/CallScreen";
import Loader                     from "../components/ui/Loader";
import { useNavigate }            from "react-router-dom";
import moment                     from "moment";
import { MdVideoCall, MdMic,MdCall }     from "react-icons/md";

function CallPage() {
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const { user }       = useSelector((state) => state.auth);
  const { callHistory, historyLoading } = useSelector((state) => state.call);
  const { activeCall, callStatus }      = useSelector((state) => state.call);

  useEffect(() => {
    dispatch(fetchCallHistory());
  }, [dispatch]);

  // ── Call status icon ───────────────────────────────
  const getCallIcon = (log) => {
    const isCaller = log.caller._id === user._id;
    if (log.status === "missed")   return "📵";
    if (log.status === "rejected") return "❌";
    if (isCaller)                  return "📤";
    return "📥";
  };

  // ── Call status color ──────────────────────────────
  const getStatusColor = (status) => {
    if (status === "missed")   return "text-red-500";
    if (status === "rejected") return "text-orange-500";
    return "text-green-500";
  };

  // ── Format duration ────────────────────────────────
  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">

      {/* Active Call Screen */}
      {activeCall && callStatus !== "idle" && <CallScreen />}

      {/* Header */}
      <div className="bg-yellow-300 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-yellow-900 hover:text-yellow-700 font-bold text-xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-extrabold text-yellow-900">
          Call History
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {historyLoading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : callHistory.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="text-6xl mb-4 "><MdCall className="text-amber-400" /></div>
            <p className="text-yellow-700 text-2xl font-medium">
              No call history yet
            </p>
            <p className="text-yellow-500 text-sm">
              Start a call from any chat
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {callHistory.map((log) => {
              const isCaller  = log.caller._id === user._id;
              const otherUser = isCaller ? log.receiver : log.caller;

              return (
                <div
                  key={log._id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100 flex items-center gap-4 hover:shadow-md transition"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-200">
                    {otherUser?.avatar ? (
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-yellow-300 flex items-center justify-center text-yellow-900 font-bold">
                        {otherUser?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {otherUser?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium ${getStatusColor(log.status)}`}>
                        {getCallIcon(log)} {log.status}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400">
                        {log.type === "video" ? "📹" : "🎙️"} {log.type}
                      </span>
                      {log.duration > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            ⏱ {formatDuration(log.duration)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {moment(log.createdAt).format("MMM D")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {moment(log.createdAt).format("h:mm A")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CallPage;