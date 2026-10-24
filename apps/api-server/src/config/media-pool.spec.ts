import { rootConfig } from './types';
import Joi from 'joi';
const lani = (rootConfig as unknown as Joi.ObjectSchema).extract('lani');
it('保留 publicHost 的正常解析及缺省值，删除旧策略配置', () => {
  expect(
    lani.validate({ publicHost: 'https://example.test' }).error,
  ).toBeUndefined();
  expect(lani.validate(undefined).value).toEqual({});
  const result = lani.validate({ moveStrategy: 'moveOnly' });
  expect(result.error?.message).toContain('moveStrategy');
});
