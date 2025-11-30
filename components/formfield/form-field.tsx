import React, { ReactNode, ReactElement } from "react";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  ControllerProps,
  ControllerRenderProps,
  ControllerFieldState,
  UseFormStateReturn,
} from "react-hook-form";

export interface FormFieldProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>
  extends Omit<ControllerProps<TFieldValues, TName>, "name" | "control" | "render"> {
  name: TName;
  control: Control<TFieldValues>;
  render: (props: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => ReactNode;
}

export function FormField<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  name,
  control,
  render,
  ...rest
}: FormFieldProps<TFieldValues, TName>): ReactElement {
  return (
    <Controller name={name} control={control} {...rest} render={(props) => <>{render(props)}</>} />
  );
}

FormField.displayName = "FormField";
