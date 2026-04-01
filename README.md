# E-Commerce REST API

A full-featured e-commerce backend built with **Node.js**, **Express**, and a **dual-database architecture** using **MySQL** for transactional data and **MongoDB** for product catalog and shopping features.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5 |
| SQL Database | MySQL + Sequelize ORM |
| NoSQL Database | MongoDB + Mongoose |
| Authentication | JWT, Google OAuth (Passport.js) |
| Validation | Joi |
| File Upload | Multer + Sharp |
| Email | Nodemailer |
| Security | Helmet, CORS, Rate Limiting, bcrypt |
| Templating | EJS (Admin Panel) |
| Logging | Morgan |

## Features

### Authentication & Authorization
- User registration & login with JWT
- Google OAuth 2.0 integration
- Role-based access control (Buyer, Seller, Admin)
- Password reset via email token
- Welcome email on signup

### Product Management
- Full CRUD with image upload & processing
- Category-based organization
- Advanced filtering, sorting, search & pagination
- Seller-specific product management
- Stock tracking with low-stock alerts

### Shopping Cart
- Add, update, remove items
- Stock availability validation
- Auto-calculated totals
- Max quantity limits per item

### Order Processing
- Place orders with full cart validation
- Automatic stock deduction
- Invoice PDF generation
- QR code generation for order tracking
- Email confirmation on order placement
- Order status tracking (Pending > Confirmed > Shipped > Delivered)
- Free shipping on orders >= $100

### Review System
- Star ratings (1-5) with text reviews
- One review per product per user
- Purchase verification before review
- Automatic product rating calculation

### Admin Dashboard
- Server-side rendered panel (EJS)
- Dashboard with key metrics (revenue, users, orders, stock alerts)
- User management & role assignment
- Order status management
- Product activation toggle

### Background Jobs
- Scheduled CRON jobs for automated tasks

## Database Architecture

```
MySQL (Sequelize)              MongoDB (Mongoose)
==================             ==================
Users                          Products
Orders                         Categories
OrderItems                     Carts
Payments                       Reviews
```

**Why dual databases?**
- MySQL handles transactional data (users, orders, payments) where ACID compliance matters
- MongoDB handles catalog data (products, categories, reviews, carts) where flexible schemas and read performance are priorities

## API Endpoints

### Auth `/api/v1/auth`
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/forgot-password` | Public |
| PUT | `/reset-password/:token` | Public |
| GET | `/google` | Public |
| GET | `/me` | Authenticated |
| PATCH | `/update-password` | Authenticated |

### Products `/api/v1/products`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | Public |
| GET | `/:id` | Public |
| GET | `/category/:catId` | Public |
| GET | `/seller/mine` | Seller |
| POST | `/` | Seller / Admin |
| PUT | `/:id` | Seller / Admin |
| DELETE | `/:id` | Seller / Admin |

### Cart `/api/v1/cart`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | Buyer |
| POST | `/add` | Buyer |
| PUT | `/update/:productId` | Buyer |
| DELETE | `/remove/:productId` | Buyer |
| DELETE | `/clear` | Buyer |

### Orders `/api/v1/orders`
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/` | Buyer |
| GET | `/` | Buyer |
| GET | `/:id` | Buyer / Admin |
| PUT | `/:id/cancel` | Buyer |
| PUT | `/:id/status` | Admin |

### Reviews `/api/v1/reviews`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/:productId` | Public |
| POST | `/` | Buyer |
| PUT | `/:id` | Buyer |
| DELETE | `/:id` | Buyer / Admin |

### Admin `/admin`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/dashboard` | Admin |
| GET | `/users` | Admin |
| GET | `/orders` | Admin |
| GET | `/products` | Admin |

## Getting Started

### Prerequisites
- Node.js >= 18
- MySQL
- MongoDB

### Installation

```bash
# Clone the repository
git clone https://github.com/mokhtar239/E-Commerce.git
cd E-Commerce

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce

# MongoDB
MONGO_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Run

```bash
# Seed the database
npm run seed

# Development
npm run dev

# Production
npm start
```

## Project Structure

```
src/
├── config/          # Database & OAuth configuration
├── controllers/     # Request handlers
├── jobs/            # CRON scheduled tasks
├── middleware/       # Auth, error handling, file upload, validation
├── models/
│   ├── mongo/       # Product, Category, Cart, Review
│   └── sql/         # User, Order, OrderItem, Payment
├── routes/          # API route definitions
├── seeders/         # Database seeding scripts
├── utils/           # Helpers (email, invoice, QR, error classes)
├── validations/     # Joi validation schemas
├── views/           # EJS templates (Admin panel)
└── app.js           # Express app setup
```

## License

ISC
