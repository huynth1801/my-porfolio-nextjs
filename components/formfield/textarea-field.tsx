import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Textarea } from "../ui/textarea";

interface TextareaRHFProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.ComponentProps<"textarea">, "name"> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  transform?: {
    input: (value: string | number) => string;
    output: (value: React.ChangeEvent<HTMLTextAreaElement>) => string | number;
  };
}

export function TextareaRHF<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  transform,
  ...props
}: TextareaRHFProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const displayValue = field.value ?? "";
        return transform ? (
          <Textarea
            {...props}
            {...field}
            onChange={(e) => field.onChange(transform.output(e))}
            value={transform.input(displayValue)}
            ref={field.ref}
            aria-invalid={!!fieldState.error}
          />
        ) : (
          <Textarea {...props} {...field} ref={field.ref} aria-invalid={!!fieldState.error} />
        );
      }}
    />
  );
}

export default TextareaRHF;
