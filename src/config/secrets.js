const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require('@aws-sdk/client-secrets-manager');

const client = new SecretsManagerClient({
  region: 'us-east-1'
});

let cachedSecrets = null;

const getSecrets = async () => {
  if (cachedSecrets) return cachedSecrets;

  try {
    const command = new GetSecretValueCommand({
      SecretId: 'onepiece-api/secrets'
    });

    const result = await client.send(command);
    cachedSecrets = JSON.parse(result.SecretString);
    console.log('✓ Secrets loaded from AWS Secrets Manager');
    return cachedSecrets;
  } catch (error) {
    console.error('✗ Error getting secrets from AWS Secrets Manager:', error.message);
    
    // In Lambda, if Secrets Manager fails, use environment variables
    console.log('⚠️ Fallback to environment variables');
    cachedSecrets = {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      ADMIN_USERNAME: process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH
    };
    
    return cachedSecrets;
  }
};

module.exports = { getSecrets };
