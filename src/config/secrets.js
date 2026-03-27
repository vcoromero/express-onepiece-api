const getSecrets = () => {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
  };
};

module.exports = { getSecrets };
