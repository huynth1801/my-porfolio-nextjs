import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { Field, FieldError, FieldLabel } from "./field";
import { Input } from "./input";

export interface InputFieldProps extends Omit<React.ComponentProps<"input">, "className"> {
  classNames?: {
    field?: string;
    fieldLabel?: string;
    fieldContent?: string;
    fieldInput?: string;
    fieldError?: string;
  };
  error?: { message?: string } | undefined;
  label?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { classNames = {}, error, label, id, required, type, ...props },
  ref,
) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputType = type === "password" && isPasswordVisible ? "text" : type;

  return (
    <Field className={cn("gap-1", classNames.field)}>
      {label && (
        <FieldLabel
          htmlFor={id ?? "input-field"}
          className={cn("font-semibold text-muted-foreground", classNames.fieldLabel)}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </FieldLabel>
      )}

      <div className={cn("relative", classNames.fieldContent)}>
        <Input
          {...props}
          ref={ref}
          id={id ?? "input-field"}
          type={inputType}
          required={required}
          className={cn(
            "focus-visible:ring-blue-600 focus:border-blue-600",
            type === "password" ? "pr-10" : "",
            classNames.fieldInput,
          )}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {error && <FieldError errors={[error]} className={classNames.fieldError} />}
    </Field>
  );
});
