const serverless = require('serverless-http');

const app = require('./app');

const handler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
  // Optimized configuration for Lambda
  request: (request, event, context) => {
    // Add Lambda context information
    request.lambdaContext = context;
    request.lambdaEvent = event;
  },
  response: (response, event, context) => {
    // Headers optimized for API Gateway
    response.headers = {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };
  }
});

module.exports.handler = async (event, context) => {
  // Critical configuration for Lambda
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const result = await handler(event, context);
    return result;
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
