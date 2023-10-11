const express = require("express");
const helmet = require("helmet");
var hpp = require("hpp");
const rateLimit = require("express-rate-limit");
var bodyParser = require("body-parser");
const mongoSanitize = require("express-mongo-sanitize");
var xss = require("xss-clean");
require("./db/mongoose");
//require("./notification/InitFcmNotification");
//const loginRouter = require("./routers/login_controller");
const notificationsRouter = require("./routers/notification_router");
const usersRouter = require("./routers/users_router");
const followOrdersRouter = require("./routers/followOrders_router");

process.on("uncaughtException", (err) => {
  console.log("uncaughtException");
  console.log(err.name, err.message);
  process.exit(1);
});
//----------------------------------------------------
const app = express();
const port = process.env.PORT || 3000;
// ------- Middleware -----------------------
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));
app.use(bodyParser.json({ limit: "2mb" })); // 10kb
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  message: {
    error: true,
    data: "Too many requests from this IP, Please try again after 15 minutes",
  },
});
app.use("/api", limiter);
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
//----------------------------------------------------------------
app.use("/api/users", usersRouter);
app.use("/api/followOrders", followOrdersRouter);
app.use("/api/notifications", notificationsRouter);
//app.use("/api/login", loginRouter);

//----------------------------------------------------------------

app.all("*", (req, res) => {
  return res.status(404).send({
    error: true,
    data: `Cant Fine ${req.originalUrl} on this server!`,
  });
});

const server = app.listen(port, () => {
  console.log("Server is up on port " + port);
});
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandledRejection");
  server.close(() => {
    process.exit(1);
  });
});

// let sales = 10;

// let diffAmount = 2 - 5;

// sales += diffAmount;

// console.log(sales);

// Abdoooooooooooooooooooo
