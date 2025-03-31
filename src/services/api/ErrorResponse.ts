export interface ErrorResponse_I {
  toast: {
    title: string;
    duration?: number;
    description?: string;
    type?: "info" | "success" | "loading" | "error";
    placement?:
      | "top"
      | "top-start"
      | "top-end"
      | "bottom"
      | "bottom-start"
      | "bottom-end";
  }[];
  container?: string;
  input: {
    path: string;
    text: string;
  }[];
  statusCode: number;
}
