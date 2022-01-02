export interface RequestFn<Request extends {}, Response extends {}> {
  (req: Request): Promise<Response>;
}

export interface ServiceConfig {
  svc: string;
  namespace: string;
  port: number;
}
