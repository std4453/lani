module.exports = {
  client: {
    service: {
      name: 'lani-gateway',
      url: 'http://localhost:8080/graphql',
    },
    excludes: ['node_modules/**/*', 'src/generated/types.ts'],
  },
};
