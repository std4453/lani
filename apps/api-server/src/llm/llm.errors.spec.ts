import { describeLlmError } from './llm.errors';

it.each(['test-key', 'key"with\\escapes', 'key\nwith\ttabs'])(
  'redacts credentials from raw and serialized errors',
  (key) => {
    expect(describeLlmError(new Error(`Failed: ${key}`), key)).toContain(
      'Failed: [REDACTED]',
    );
    expect(JSON.parse(describeLlmError({ key }, key))).toEqual({
      key: '[REDACTED]',
    });
  },
);
