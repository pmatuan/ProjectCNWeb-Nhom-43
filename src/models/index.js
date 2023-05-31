const mongoose = require('mongoose');
const { MONGO_URI } = require('../configs');

mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error.', MONGO_URI);
  console.error(err);
  process.exit();
});

mongoose.connection.once('open', () => {
  console.log(`Connected to MongoDB: ${MONGO_URI}`);
});
