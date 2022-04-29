import { rootConfigSchema } from '@/config/help';
import { RootConfig } from '@/config/types';
import { loadConfigSync } from '@lani/framework';

export default loadConfigSync<RootConfig>({
  schema: rootConfigSchema(),
});
