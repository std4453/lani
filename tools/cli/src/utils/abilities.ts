import { LaniConfig } from "../generated/laniconf";

export interface LaniAbility<Config extends {}> {
  enabled: boolean;
  config: Config;
}

export interface TracingAbilityConfig {}

export interface LaniAbilities {
  tracing: LaniAbility<TracingAbilityConfig>;
}

export function resolveAbilities(config: LaniConfig): LaniAbilities {
  const abilities: LaniAbilities = {
    tracing: {
      enabled: false,
      config: {},
    },
  };
  if (config.abilities) {
    for (const request of config.abilities) {
      if (typeof request === "string") {
        if (request in abilities) {
          abilities[request].enabled = true;
        }
      } else if (request instanceof Array) {
        const [type, config] = request;
        if (type in abilities) {
          abilities[type] = {
            enabled: true,
            config,
          };
        }
      }
    }
  }
  return abilities;
}
