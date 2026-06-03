import { useSelector } from "react-redux";
import Avatar from "../ui/Avatar";
import CallTimer from "./CallTimer";
import CallControls from "./CallControls";

function AudioCall() {
  const { user } = useSelector((state) => state.auth);
  const { activeCall, incomingCall, callStatus } = useSelector(
    (state) => state.call,
  );

  const otherUser = activeCall
    ? { name: activeCall.receiverName, avatar: activeCall.receiverAvatar }
    : { name: incomingCall?.callerName, avatar: incomingCall?.callerAvatar };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar src={otherUser?.avatar} name={otherUser?.name} size="xl" />

        {(callStatus === "calling" || callStatus === "ringing") && (
          <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping opacity-40" />
        )}
      </div>

      <h2 className="text-3xl font-bold text-white">{otherUser?.name}</h2>

      {/* Status */}
      {callStatus === "calling" && (
        <p className="text-white text-xl tracking-widest">Calling...</p>
      )}

      {callStatus === "ringing" && (
        <p className="text-white text-xl tracking-widest">Ringing...</p>
      )}

      {callStatus === "connected" && <CallTimer />}

      {callStatus === "rejected" && (
        <p className="text-red-200 text-xl">Call Rejected</p>
      )}

      {callStatus === "busy" && (
        <p className="text-red-200 text-xl">User Busy</p>
      )}

      {callStatus === "timeout" && (
        <p className="text-red-200 text-xl">No Answer</p>
      )}
      {/* Bottom: Controls */}
      <CallControls />
    </div>
  );
}

export default AudioCall;
