import { useSelector }    from "react-redux";
import { useCallContext } from "../../context/CallContext";
import Avatar             from "../ui/Avatar";

function IncomingCall() {
  const { incomingCall }          = useSelector((state) => state.call);
  const { acceptCall, rejectCall } = useCallContext();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-80 text-center animate-bounce-once">
        {/* Caller Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar
              src={incomingCall.callerAvatar}
              name={incomingCall.callerName}
              size="xl"
            />
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping opacity-50" />
          </div>
        </div>

        {/* Call Info */}
        <p className="text-gray-500 text-sm font-medium mb-1">
          Incoming {incomingCall.callType} call
        </p>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {incomingCall.callerName}
        </h2>
        <p className="text-yellow-500 text-sm mb-8">
          {incomingCall.callType === "video" ? "📹 Video Call" : "🎙️ Audio Call"}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          {/* Reject */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={rejectCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition active:scale-95"
            >
              📵
            </button>
            <span className="text-xs text-gray-500 font-medium">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={acceptCall}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition active:scale-95"
            >
              📞
            </button>
            <span className="text-xs text-gray-500 font-medium">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;