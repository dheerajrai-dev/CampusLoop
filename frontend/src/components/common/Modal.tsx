import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div
        className={`bg-white rounded-xl shadow-lg border border-[#e6e6e6] w-full ${maxWidthStyles} max-h-[90vh] overflow-hidden flex flex-col transform transition-all`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0efee] bg-[#fafafa]">
          <h3 className="font-bold text-[#1a1a1a] text-base tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#73726e] hover:text-[#1a1a1a] p-1 rounded-md hover:bg-[#eaeaea] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 sm:p-5 max-h-[80vh] sm:max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
