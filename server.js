const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const {connectMySQL} = require("./src/config/mysql");
const connectMongoDB = require("./src/config/mongodb");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectMySQL();
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(
      `process running in ${process.env.NODE_ENV} mode in port ${PORT}`,
    );
  });
};

startServer();
