const dotenv = require("dotenv");
dotenv.config();

const required = ['JWT_SECRET', 'MYSQL_DB', 'MYSQL_USER', 'MYSQL_HOST', 'MONGO_URI'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`FATAL: missing required env var ${key}`);
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

const app = require("./src/app");
const { connectMySQL } = require("./src/config/mysql");
const connectMongoDB = require("./src/config/mongodb");
const { sequelize } = require("./src/models/sql");
const startAllJobs = require("./src/jobs/cronJobs");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectMySQL();
  await connectMongoDB();

  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
    console.log('MySQL tables synced successfully');
  }

  startAllJobs();

  const server = app.listen(PORT, () => {
    console.log(
      `process running in ${process.env.NODE_ENV} mode in port ${PORT}`,
    );
  });

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      sequelize.close();
      process.exit(0);
    });
  });
};

startServer();
