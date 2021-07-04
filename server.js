const dotenv = require('dotenv');
const mongoose = require('mongoose');

// UNCAUGHT EXCEPTIONS
// Application needs to be crashed then a tool will be needed to restart the APP
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!...');
  console.log({err});
  console.log(err.name, err.message);
  process.exit();
});

dotenv.config();
const app = require('./app');

const DB = process.env.CBA_DB.replace(
  '<password>',
  process.env.CBA_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to DB successfully...');
  });

mongoose.connection.on('error', (err) => console.log(err.message));
mongoose.connection.on('disconnected', () =>
  console.log('Mongoose connection closed')
);

//   START SERVER
const port = process.env.PORT || 7083;
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

// Catching Exceptions

// Application does not necessarily need to be crashed
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit();
  });
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
