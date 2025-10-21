require('dotenv').config();

const app = require('./app');
const { displayEndpoints } = require('./utils/endpoint-display');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Display all available endpoints
  displayEndpoints(app);
});

