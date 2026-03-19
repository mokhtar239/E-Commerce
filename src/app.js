const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');


// ROUTES

const adminRoutes   = require('./routes/adminRoutes')  ;
const authRoutes    = require('./routes/authRoutes')   ;
const cartRoutes    = require('./routes/cartRoutes')   ;
const orderRoutes   = require('./routes/orderRoutes')  ;
const productRoutes = require('./routes/productRoutes');
const reviewRoutes  = require('./routes/reviewRoutes') ;
const userRoutes    = require('./routes/userRoutes')   ;




const app = express();


// Security MiddleWare
app.use(helmet());
app.use(cors());


// Body Parser
app.use(express.json({ limit : '10kb' }));
app.use(express.urlencoded({ extended: true }));


// logger in development
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));


// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000 , 
    max      : 100 ,
    message  : {success:false , message : 'Too Many Requests , please try again Later'}
})
app.use('/api' , limiter);


// static Files
app.use(express.static(path.join(__dirname, '../public')));

// welcome Route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to E-Commerce API' });
});


// API Routes
app.use( '/api/v1/auth'    , authRoutes);
app.use( '/api/v1/products', productRoutes);
app.use( '/api/v1/users'   , userRoutes);
app.use( '/api/v1/orders'  , orderRoutes);
app.use( '/api/v1/cart'    , cartRoutes);
app.use( '/api/v1/reviews' , reviewRoutes);
app.use( '/api/v1/admin'   , adminRoutes);


// 404 handLer
app.all( '{*path}' , (req , res) => {
    res.status(404).json({ success : false , message : `Can not Find ${req.originalUrl}`})
} );

// error Handler
const errHandler = require('./middleware/errorHandler');
app.use(errHandler);


module.exports = app;