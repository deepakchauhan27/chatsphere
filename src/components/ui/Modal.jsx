import { useEffect } from "react";

function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else        document.body.style.overflow = "unset";
    return ()  => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className={`relative z-10 w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="bg-yellow-300 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-yellow-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-yellow-700 hover:text-yellow-900 text-xl font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;