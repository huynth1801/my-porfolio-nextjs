import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { InputField, InputFieldProps } from "../ui/input-field";

interface InputFieldRHFProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<InputFieldProps, "name"> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  transform?: {
    input: (value: number) => string;
    output: (value: React.ChangeEvent<HTMLInputElement>) => number;
  };
}

export function InputFieldRHF<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  transform,
  ...props
}: InputFieldRHFProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const displayValue = field.value ?? 0;
        return transform ? (
          <InputField
            {...props}
            {...field}
            onChange={(e) => field.onChange(transform.output(e))}
            value={transform.input(displayValue)}
            ref={field.ref}
            error={fieldState.error}
          />
        ) : (
          <InputField {...props} {...field} ref={field.ref} error={fieldState.error} />
        );
      }}
    />
  );
}

export default InputFieldRHF;
