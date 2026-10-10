import {
  any,
  arr,
  enabled,
  loadConfigSync,
  num,
  obj,
  opt,
  root,
  str,
  T,
} from "@lani/framework";

const subgraphs = arr(
  obj({
    name: str(),
    url: str(),
  })
);

const debug = opt(
  obj({
    pollIntervalInMs: opt(num()),
  }),
  {}
);

const authz = enabled(
  obj({
    query: str(),
    result: any(),
  })
);

const auth = enabled(
  obj({
    authority: str(),
    clientId: str(),
    authz,
    clientConfig: opt(any()),
  })
);

const schema = root({
  subgraphs,
  debug,
  auth,
  imageProxy: opt(obj({ upstream: opt(str()) }), {}),
});

type ConfigType = T<typeof schema>;

export default loadConfigSync<ConfigType>({
  schema,
});
