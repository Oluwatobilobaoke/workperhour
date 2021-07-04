const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const key = require('./utils/libs/gen-key');

const AppError = require('./utils/libs/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config();
process.env.CBA_ACCESS_TOKEN_SECRET = key(64);
process.env.CBA_COOKIE_SECRET = key(64);


const app = express();

// Set Security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit Request from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Data sanitize against NoSQL Query Injection
app.use(mongoSanitize()); // Checks the request headers, query strings, params for malicious codes

const userRouter = require('./routes/userRoutes');

//   Routes Middleware
app.use('/api/v1/users', userRouter);

// Unhandled Routes
app.all('*', (req, res, next) => {
  if (req.originalUrl === '/bundle.js.map') return next();
  next(
    new AppError(`Can't find resource ${req.originalUrl} on this server`, 404)
  );
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
