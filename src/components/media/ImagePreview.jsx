import { useEffect, useState } from "react";
import { MdZoomIn, MdZoomOut, MdClose, MdDownload } from "react-icons/md";

function ImagePreview({ src, name, onClose }) {
  const [scale,   setScale]   = useState(1);
  const [loading, setLoading] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const handleZoomIn  = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleReset   = () => setScale(1);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob     = await response.blob();
      const url      = window.URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = name || "image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm">
        <p className="text-white font-medium text-sm truncate max-w-xs">
          {name || "Image"}
        </p>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition text-lg font-bold"
          >
            <MdZoomOut />
          </button>
          <button
            onClick={handleReset}
            className="text-white/70 text-xs w-12 text-center hover:text-white transition"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition text-lg font-bold"
          >
            <MdZoomIn />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Download */}
          <button
            onClick={handleDownload}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition text-base"
          >
            <MdDownload />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition font-bold"
          >
            <MdClose />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div
        className="flex-1 flex items-center justify-center overflow-auto p-4 cursor-zoom-in"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>
          {loading && (
            <div className="flex items-center justify-center w-16 h-16">
              <div className="w-10 h-10 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={src}
            alt={name || "Preview"}
            onLoad={() => setLoading(false)}
            style={{
              transform:       `scale(${scale})`,
              transition:      "transform 0.2s ease",
              transformOrigin: "center",
              display:         loading ? "none" : "block",
            }}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom: Click outside hint */}
      <div className="text-center py-2">
        <p className="text-white/30 text-xs">
          Click outside or press ESC to close
        </p>
      </div>
    </div>
  );
}

export default ImagePreview;