const path = require('path');
const express = require('express');
const morgan = require('morgan');
const qs = require('qs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const sanitizeBody = require('./utils/sanitizeBody');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set secutiry HTTP headers
// app.use(helmet());
// Further HELMET configuration for Security Policy (CSP)
// Allowed external script/style/font sources
const scriptSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com',
  'https://js.stripe.com',
];

const styleSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com',
];

const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com',
  'ws://127.0.0.1:1234',
];

const fontSrcUrls = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      connectSrc: ["'self'", ...connectSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", 'https://js.stripe.com'],
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10KB' }));

// Parses data from cookie int req.cookies
app.use(cookieParser());

// Set query parser AFTER body parser
app.set('query parser', (str) => qs.parse(str));

// FIX: Make req.query writable before mongoSanitize (EXPRESS 5 COMPATIBILITY)
app.use((req, res, next) => {
  // Create a writable copy of req.query
  const queryObj = { ...req.query };

  // Redefine req.query as a writable property
  Object.defineProperty(req, 'query', {
    value: queryObj,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  next();
});

// // Data sanitization against noSQL query injection
// app.use(mongoSanitize());
app.use(mongoSanitize());

// // Data sanitization against XSS
// app.use(xss());
app.use(sanitizeBody);

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// !
