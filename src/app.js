const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', healthRoutes);

module.exports = app;

