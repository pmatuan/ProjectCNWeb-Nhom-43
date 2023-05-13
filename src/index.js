const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const httpLogger = require('http-logger');

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errors');

const omitReq = require('./middlewares/omitReq');

require('dotenv').config();
require('./models');

const { PORT } = require('./configs');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception. Shutting down...');
  console.log(err);
  process.exit(1);
});

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(httpLogger());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(omitReq);
app.use(express.static(path.join(__dirname, '..', 'public')));

require('./routes')(app);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      404,
      `${req.url} is not founded on this server or ${req.method} is not supported at ${req.url}`,
    ),
  );
});
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection. Shutting down...');
  console.log(err);
  server.close(() => process.exit(1));
});
