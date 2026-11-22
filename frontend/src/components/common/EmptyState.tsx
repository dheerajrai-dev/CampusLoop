import React from "react";
import { FolderSearch, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="paper-card flex flex-col items-center justify-center py-14 px-6 text-center border-dashed my-6">
      <div className="w-16 h-16 rounded-2xl bg-[#e6f3fe] text-[#0075de] flex items-center justify-center mb-5 shadow-sm">
        {icon || <FolderSearch className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-[#1a1a1a]">{title}</h3>
      <p className="text-sm text-[#73726e] max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary rounded-xl text-sm shadow-xs"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
