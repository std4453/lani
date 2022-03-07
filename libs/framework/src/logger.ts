import rTracer from "cls-rtracer";

export interface LoggerOptions {
  tracing?: boolean;
}

export function createLogger({ tracing = true }: LoggerOptions = {}) {
  return (...args: any[]) => {
    console.log(
      ...[
        new Date().toISOString(),
        tracing && rTracer.id() ? rTracer.id() : "-",
        ...args,
      ]
    );
  };
}
