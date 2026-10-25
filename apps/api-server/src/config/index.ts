import { rootConfig, RootConfig } from '@/config/types';
import { loadConfigSync } from '@lani/framework';
import { MEDIA_MIGRATION_GUIDE } from '@/media-pool/guide';

export default (() => {
  try {
    return loadConfigSync<RootConfig>({ schema: rootConfig });
  } catch (error) {
    throw new Error(
      `lani configuration invalid: ${error.message}. Guide: ${MEDIA_MIGRATION_GUIDE}`,
    );
  }
})();
