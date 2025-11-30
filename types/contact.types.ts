export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};
