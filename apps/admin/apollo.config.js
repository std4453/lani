module.exports = {
  client: {
    service: {
      name: 'lani-gateway',
      url: 'https://lani.i.std4453.com/api/gateway/graphql',
    },
    excludes: ['node_modules/**/*', 'src/generated/types.ts'],
  },
};
