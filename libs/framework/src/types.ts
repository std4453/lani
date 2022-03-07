export type WrappedResponse<Response> =
  | {
      code: number;
      error: string;
    }
  | {
      code: number;
      data: Response;
    };
