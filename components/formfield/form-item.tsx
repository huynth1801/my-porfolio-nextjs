import React from "react";

interface FormItemProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const FormItem: React.FC<FormItemProps> = ({ label, error, children }) => {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-sm font-medium text-white">{label}</label>}
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

FormItem.displayName = "FormItem";
