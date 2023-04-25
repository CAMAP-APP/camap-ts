const dotenv = require("dotenv");
const { resolve } = require("path");
const { readFileSync, existsSync } = require("fs");
const CamapNamingStrategy = require("./orm-naming-strategy");

const getEnv = () => {
  const envFilePath = resolve(__dirname, `.env`);
  switch (process.env.NODE_ENV) {
    case "test":
      return existsSync(`${envFilePath}.test`)
        ? dotenv.parse(readFileSync(`${envFilePath}.test`))
        : {};
    default:
      return existsSync(envFilePath)
        ? dotenv.parse(readFileSync(envFilePath))
        : {};
  }
};

let env = { ...process.env, ...getEnv() };

if (process.env.USE_LOCAL_DB) {
  env = { ...env, DB_HOST: "localhost" };
}

const config = {
  type: env.DB_CONNECTION,
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT, 10),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  entities: [resolve(__dirname, "packages/api-core", env.DB_ENTITIES)],
  // synchronize: env.SYNCHRONIZE,
  logging: JSON.parse(env.DB_LOGGING),
  charset: "utf8mb4",
  extra: { charset: "utf8mb4_general_ci" },
  namingStrategy: new CamapNamingStrategy(),
};

// console.log('-- ORM CONF -- \n', config);

module.exports = config;
