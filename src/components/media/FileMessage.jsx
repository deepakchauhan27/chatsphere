import { useState } from "react";
import { MdDownload, MdAttachFile} from "react-icons/md";

const FILE_ICONS = {
  pdf:  { icon: "📕", color: "bg-red-50 border-red-100 text-red-600"    },
  doc:  { icon: "📘", color: "bg-blue-50 border-blue-100 text-blue-600"  },
  docx: { icon: "📘", color: "bg-blue-50 border-blue-100 text-blue-600"  },
  xls:  { icon: "📗", color: "bg-green-50 border-green-100 text-green-600"},
  xlsx: { icon: "📗", color: "bg-green-50 border-green-100 text-green-600"},
  txt:  { icon: "📄", color: "bg-gray-50 border-gray-100 text-gray-600"  },
  zip:  { icon: "📦", color: "bg-yellow-50 border-yellow-100 text-yellow-600"},
  rar:  { icon: "📦", color: "bg-yellow-50 border-yellow-100 text-yellow-600"},
  mp3:  { icon: "🎵", color: "bg-purple-50 border-purple-100 text-purple-600"},
  mp4:  { icon: "🎬", color: "bg-pink-50 border-pink-100 text-pink-600"  },
};

const getFileExtension = (filename) => {
  if (!filename) return "file";
  return filename.split(".").pop().toLowerCase();
};

const getFileInfo = (filename) => {
  const ext = getFileExtension(filename);
  return FILE_ICONS[ext] || { icon: <MdAttachFile />, color: "bg-gray-50 border-gray-100 text-gray-600" };
};

const formatFileSize = (url) => {
  // File size not always available from URL, show placeholder
  return "Download";
};

function FileMessage({ message, isOwn }) {
  const [downloading, setDownloading] = useState(false);
  const fileInfo = getFileInfo(message.mediaName);
  const ext      = getFileExtension(message.mediaName);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const response = await fetch(message.mediaUrl);
      const blob     = await response.blob();
      const url      = window.URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = message.mediaName || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 min-w-[200px] max-w-[260px] cursor-pointer hover:opacity-90 transition ${
        isOwn
          ? "bg-yellow-200/50 border-yellow-300"
          : fileInfo.color
      }`}
      onClick={handleDownload}
    >
      {/* File Icon */}
      <div className="text-3xl flex-shrink-0">
        {fileInfo.icon}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {message.mediaName || "File"}
        </p>
        <p className="text-xs opacity-60 uppercase mt-0.5">
          {ext} file
        </p>
      </div>

      {/* Download Icon */}
      <div className="flex-shrink-0">
        {downloading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
        ) : (
          <MdDownload className="text-lg opacity-70" />
        )}
      </div>
    </div>
  );
}

export default FileMessage;