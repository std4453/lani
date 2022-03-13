export interface RequestFn<Request, Response> {
  (req: Request): Promise<Response>;
}

export interface ServiceConfig {
  svc: string;
  namespace: string;
  port: number;
}
