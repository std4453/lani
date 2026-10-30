import { arr, obj, opt, str } from '@lani/framework';
import { titleRule } from '@lani/smart-download';

export const smartDownloadConfig = opt(
  obj({
    rules: opt(
      obj({
        title: opt(
          obj({
            excludes: opt(
              arr(
                str().custom((value, helpers) => {
                  try {
                    titleRule(value);
                    return value;
                  } catch {
                    return helpers.error('any.invalid');
                  }
                }),
              ),
              [],
            ),
          }),
          { excludes: [] },
        ),
      }),
      { title: { excludes: [] } },
    ),
  }),
  { rules: { title: { excludes: [] } } },
);
