import { useSelector }    from "react-redux";
import Avatar             from "../ui/Avatar";
import CallTimer          from "./CallTimer";
import CallControls       from "./CallControls";

function AudioCall() {
  const { user }      = useSelector((state) => state.auth);
  const { activeCall, incomingCall, callStatus } = useSelector((state) => state.call);

  const otherUser = activeCall
    ? { name: activeCall.receiverName, avatar: activeCall.receiverAvatar }
    : { name: incomingCall?.callerName, avatar: incomingCall?.callerAvatar };

  return (
    <div className="flex flex-col items-center justify-between h-full py-16 px-8">
      {/* Top: Other User */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar src={otherUser?.avatar} name={otherUser?.name} size="xl" />
          {callStatus === "connected" && (
            <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping opacity-30" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-white">{otherUser?.name}</h2>
        <CallTimer />
      </div>

      {/* Bottom: Controls */}
      <CallControls />
    </div>
  );
}

export default AudioCall;