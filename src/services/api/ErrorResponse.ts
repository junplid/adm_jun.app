export interface ErrorResponse_I {
  toast: {
    text: string;
    type?: "info" | "success" | "warning" | "error" | "default";
    autoClose?: number;
    isLoading?: boolean;
    theme?: "light" | "dark" | "colored";
    draggable?: boolean | "mouse" | "touch";
  }[];
  container?: string;
  input: {
    path: string;
    text: string;
  }[];
}
