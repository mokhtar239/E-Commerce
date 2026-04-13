const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const passport  = require('./config/passport');


// ROUTES

const adminRoutes   = require('./routes/adminRoutes')  ;
const authRoutes    = require('./routes/authRoutes')   ;
const cartRoutes    = require('./routes/cartRoutes')   ;
const orderRoutes   = require('./routes/orderRoutes')  ;
const productRoutes = require('./routes/productRoutes');
const reviewRoutes  = require('./routes/reviewRoutes') ;
const userRoutes    = require('./routes/userRoutes')   ;




const app = express();

// Behind a reverse proxy (Nginx/Heroku/Render) — required for correct req.ip / rate-limit
app.set('trust proxy', 1);

// View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security MiddleWare
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
    credentials: true
}));


// Body Parser
app.use(express.json({ limit : '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


// logger in development
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));


// Rate Limiter (general)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000 ,
    max      : 100 ,
    message  : {success:false , message : 'Too Many Requests , please try again Later'}
})
app.use('/api' , limiter);

// Stricter limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many auth attempts, please try again later' }
});


// static Files
app.use(express.static(path.join(__dirname, '../public')));

// welcome Route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to E-Commerce API' });
});

app.use(passport.initialize());

// API Routes
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use( '/api/v1/auth'    , authRoutes);
app.use( '/api/v1/products', productRoutes);
app.use( '/api/v1/users'   , userRoutes);
app.use( '/api/v1/orders'  , orderRoutes);
app.use( '/api/v1/cart'    , cartRoutes);
app.use( '/api/v1/reviews' , reviewRoutes);
app.use( '/admin'          , adminRoutes);


// 404 handLer
app.all( '{*path}' , (req , res) => {
    res.status(404).json({ success : false , message : `Can not Find ${req.originalUrl}`})
} );

// error Handler
const errHandler = require('./middleware/errorHandler');
app.use(errHandler);


module.exports = app;