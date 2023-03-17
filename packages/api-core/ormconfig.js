const ormConfig = require('../../ormconfig');
const { resolve, relative } = require('path');

const config = {
  ...ormConfig,
  migrations: [resolve(__dirname, 'dist/migrations/*.js')],
  migrationsTransactionMode: 'each',
  cli: {
    migrationsDir: relative(__dirname, 'src/migrations'),
  },
};

module.exports = config;
