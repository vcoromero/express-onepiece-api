const serverlessExpress = require('@codegenie/serverless-express');
const app = require('./app');

const proxy = serverlessExpress({ app });

exports.handler = async (event, context) => proxy(event, context);
