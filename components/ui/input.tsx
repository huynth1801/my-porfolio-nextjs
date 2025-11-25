import React from "react";
import { motion } from "framer-motion";
import { InputProps } from "../../types";

export const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-gray-400 pl-1">
        {label}
      </label>
      <div className="relative group">
        <input
          id={id}
          className={`
            flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-sm transition-all duration-300
            placeholder:text-gray-500 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500
            hover:bg-white/10
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
          {...props}
        />
        {/* Animated bottom line effect */}
        <motion.div
          className="absolute bottom-0 left-0 h-[1px] bg-indigo-500"
          initial={{ width: "0%" }}
          whileFocus={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {error && <span className="text-xs text-red-400 pl-1">{error}</span>}
    </div>
  );
};
