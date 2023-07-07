import Joi from "joi";

const DSym = Symbol();
export type D<_T = unknown> = Joi.AnySchema & { [DSym]: _T };
const as = <T>(i: Joi.AnySchema): D<T> => i as D<T>;

type _Obj = Record<string, D>;
export type T<D0 extends D> = D0 extends D<infer T0> ? T0 : never;

type Tidify<X> = {} & { [Key in keyof X]: X[Key] };

export const str = (): D<string> => as(Joi.string().required());

export const bool = (): D<boolean> => as(Joi.boolean().required());

export const num = (): D<number> => as(Joi.number().required());

export const any = (): D<any> => as(Joi.any().required());

export const v = <S extends string>(string: S): D<S> =>
  as(Joi.allow(string).required());

type OmittableKeys<T> = {
  [Key in keyof T]: undefined extends T[Key] ? Key : never;
}[keyof T];
type Omitted<T> = {} & Partial<T> & Omit<T, OmittableKeys<T>>;
type OmittedSafe<T> = T extends Object ? Omitted<T> : T;

interface Opt {
  <D0 extends D>(d: D0): D<T<D0> | undefined>;
  <D0 extends D>(d: D0, defaultValue: OmittedSafe<T<D0>>): D0;
}
export const opt: Opt = <D0 extends D>(
  d: D0,
  defaultValue?: OmittedSafe<T<D0>>
) =>
  defaultValue === undefined
    ? d.optional()
    : d.optional().default(defaultValue as any);

interface Or {
  <D1 extends D>(d1: D1): D<T<D1>>;
  <D1 extends D, D2 extends D>(d1: D1, d2: D2): D<T<D1> | T<D2>>;
  <D1 extends D, D2 extends D, D3 extends D>(d1: D1, d2: D2, d3: D3): D<
    T<D1> | T<D2> | T<D3>
  >;
  <D1 extends D, D2 extends D, D3 extends D, D4 extends D>(
    d1: D1,
    d2: D2,
    d3: D3,
    d4: D4
  ): D<T<D1> | T<D2> | T<D3> | T<D4>>;
  <D1 extends D, D2 extends D, D3 extends D, D4 extends D, D5 extends D>(
    d1: D1,
    d2: D2,
    d3: D3,
    d4: D4,
    d5: D5
  ): D<T<D1> | T<D2> | T<D3> | T<D4> | T<D5>>;
}
export const or: Or = (...ds: D[]) =>
  as(
    Joi.alternatives()
      .try(...ds)
      .required()
  );

export const obj = <O extends _Obj>(
  o: O
): D<{
  [key in keyof O]: T<O[key]>;
}> => {
  const newObject: {
    [key in keyof O]?: O[key];
  } = {};
  (Object.keys(o) as (keyof O)[]).forEach((k) => (newObject[k] = o[k]));
  return as(Joi.object(newObject));
};

export const root = <O extends _Obj>(
  o: O
): D<{
  [key in keyof O]: T<O[key]>;
}> => as((obj(o) as any as Joi.ObjectSchema).pattern(Joi.string(), Joi.any()));

export const arr = <D0 extends D>(d: D0): D<T<D0>[]> =>
  as(Joi.array().items(d));

export const enabled = <O0 extends D>(
  o: O0
): D<{ enabled: false } | Tidify<{ enabled: true } & T<O0>>> =>
  as(
    Joi.alternatives()
      .try(
        Joi.object({
          enabled: Joi.allow(true).required(),
        }),
        (o as any as Joi.ObjectSchema).append({
          enabled: Joi.allow(false).required(),
        })
      )
      .default({
        enabled: false,
      })
  );

export const kind = <O0 extends _Obj>(
  o: O0
): D<
  {
    [key in keyof O0]: Tidify<
      {
        kind: key;
      } & Record<key, T<O0[key]>>
    >;
  }[keyof O0]
> =>
  as(
    Joi.alternatives()
      .try(
        ...(Object.keys(o) as (keyof O0)[]).map((key) =>
          Joi.object({
            kind: Joi.allow(key).required(),
            [key]: o[key],
          })
        )
      )
      .required()
  );

export const ext =
  <Type>() =>
  <O0 extends D>(o: O0): D<T<O0> & Type> =>
    as((o as any as Joi.ObjectSchema).pattern(Joi.string(), Joi.any()));
    
export const use = <Type>(
  schema: Joi.ObjectSchema<Type> = Joi.object<Type>({})
): D<Type> => as(schema.pattern(Joi.string(), Joi.any()));

interface Either {
  (): D<never>;
  <V1>(v1: V1): D<V1>;
  <V1, V2>(v1: V1, v2: V2): D<V1 | V2>;
  <V1, V2, V3>(v1: V1, v2: V2, v3: V3): D<V1 | V2 | V3>;
  <V1, V2, V3, V4>(v1: V1, v2: V2, v3: V3, v4: V4): D<V1 | V2 | V3 | V4>;
  <V1, V2, V3, V4, V5>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5): D<
    V1 | V2 | V3 | V4 | V5
  >;
}
export const either: Either = ((...ds: any[]) =>
  Joi.allow(...ds).required()) as any;
