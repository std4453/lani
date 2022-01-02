export interface WrappedResponse<Response> {
  code: number;
  error?: string;
  data?: Response;
}
