import { useSelector } from "react-redux";

function CallTimer() {
  const { callDuration, callStatus } = useSelector((state) => state.call);

  const format = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case "calling":   return "Calling...";
      case "ringing":   return "Ringing...";
      case "connected": return format(callDuration);
      case "ended":     return "Call Ended";
      case "rejected":  return "Call Rejected";
      case "busy":      return "User Busy";
      case "timeout":   return "No Answer";
      default:          return "";
    }
  };

  return (
    <div className="text-center">
      <p className="text-white/80 text-lg font-mono tracking-widest">
        {getStatusText()}
      </p>
    </div>
  );
}

export default CallTimer;