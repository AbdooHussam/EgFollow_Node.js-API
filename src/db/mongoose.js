const mongoose = require("mongoose");
// const validator = require("validator");

mongoose
  .connect(process.env.MONGODB_URL_HOST.toString(), {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongoose Connected!");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    // await mongoose.connection.close();
    // console.log("Clooooooosed");
  });
