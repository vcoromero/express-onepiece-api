const serverless = require('serverless-http');

const app = require('./app');

const handler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return await handler(event, context);
};
