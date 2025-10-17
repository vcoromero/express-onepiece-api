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
    return cachedSecrets;
  } catch (error) {
    console.error('Error getting secrets:', error);
    throw error;
  }
};

module.exports = { getSecrets };
