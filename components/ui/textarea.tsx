import React from "react";
import { TextAreaProps } from "../../types";

export const Textarea: React.FC<TextAreaProps> = ({ label, error, className, id, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-gray-400 pl-1">
        {label}
      </label>
      <textarea
        id={id}
        className={`
          flex min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white shadow-sm transition-all duration-300
          placeholder:text-gray-500 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500
          hover:bg-white/10
          resize-y
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-400 pl-1">{error}</span>}
    </div>
  );
};
