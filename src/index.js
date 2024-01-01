global.allCookies = [
  'mid=ZTrgqAALAAG4WKme4nTtU4hR0uj8; ig_did=2BC641C3-C001-4FCE-9BA9-1B9C81F9058D; ig_nrcb=1; datr=p-A6ZRpDlP6wj9UCfTLbIQyk; ig_did=0C826C21-17C3-444A-ABB7-EBABD37214D7; shbid="3438\05463901225987\0541735678252:01f7a4eb94fe15ba19475931a90591de479a613bf0bbf7997deed48409134be7ecc32fd4"; shbts="1704142252\05463901225987\0541735678252:01f782160f27258b6cb4b5bbaec735f10709c8b4007964a4af224c3f9fa3189ac8307fbe"; dpr=1.25; ds_user_id=63878211833; csrftoken=bM1sKw2L1Omgj7Qig6ymnlcZRZsWPWr8; sessionid=63878211833%3AJTqdEEx6Asxkk2%3A13%3AAYc0Y0AA1VOXfuzwLk134caXmrQ7Sya27TGVXoRufw; rur="LDC\05463878211833\0541735680231:01f7bb6bda647e706701a38ef6b006ab1dc5d25854099e27ad23762e168109da5ba49b4e"',
];

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
//const notificationsRouter = require("./routers/notification_router");
const usersRouter = require("./routers/users_router");
const followOrdersRouter = require("./routers/followOrders_router");
const promoCodesRouter = require("./routers/promoCode_router");
const settingsRouter = require("./routers/settings_router");

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
app.use("/api/promoCodes", promoCodesRouter);
app.use("/api/settings", settingsRouter);
//app.use("/api/notifications", notificationsRouter);
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
