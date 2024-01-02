global.allCookies = [
  'dpr=1.25; mid=ZZQ16AALAAEX1_QV41pUyxt1fET6; ig_did=772F14D9-9BE0-4F87-BDE6-17A77E1AE1D7; ig_nrcb=1; datr=5zWUZbgpB8q6-9fGdP6r3LjY; csrftoken=K5oESRUSevsVHvEAqRvBKblyzLcFY5eK; ds_user_id=63681934960; sessionid=63681934960%3AcjCLzdf8w8OJHq%3A12%3AAYe21wjT3nFIq70k14fK4Up6d508lJIl_9LoSLgByQ; shbid="13521\05463681934960\0541735748013:01f708045365bc948c41fde4f03a169468b815d7621f422c24f4d86589cc35bd574a81f5"; shbts="1704212013\05463681934960\0541735748013:01f7dd64cb15e370935cb8211f2d7b9387c2bcf9521368b06a6605d020be4f6a3ad3a605"; rur="LDC\05463681934960\0541735748019:01f7dc5e9091dedc5eccd7cb0e31833674db6e80138b4bcf7e6fe74388d2db48cc4c16f8"',
  'dpr=1.25; ig_did=1AFA5602-8560-4DDF-8DB1-76E9FC9DC839; datr=qzaUZXpwZu6Gft5eXp62Wm8O; csrftoken=HU8WzB9Et0bAbf8qI1VZTdAToAgkR5km; mid=ZZQ2wgALAAF14szCD4Y5MaBjMSUf; ds_user_id=63901225987; sessionid=63901225987%3A6OnCtOtiSPwr5N%3A7%3AAYe_hOzwR1Sot62lhmP9YCWyhj2PteBL2L7ulN_apg; shbid="3438\05463901225987\0541735748174:01f76b4408b35633f0374137f0a5329f13cfeb3909471fc1a450b399d6693fbb86b44502"; shbts="1704212174\05463901225987\0541735748174:01f72e94053318afb50bbfeca68a2ad2ac7d44fcf47c20ae5d9fb9f867b4d989d8ea462e"; rur="LLA\05463901225987\0541735748190:01f797bec990924fc2dc968fb6af8738a4b2311a867e618f597aa16470c4abb77a7ac049"',
  'dpr=1.25; ig_did=E49ADC2F-D4E4-4CBB-9B21-BA18298316AE; datr=DzeUZfZ4xOaw0u-Mirvvf3lD; csrftoken=vpsmSNV80ohWJYaXXhbIK2lmo6FFwlQ6; mid=ZZQ3HgALAAFwrnBDX11K0V73zr1E; ds_user_id=63878211833; sessionid=63878211833%3Ay9WSAIYTLKGoJc%3A5%3AAYcmuXgOarYKlRTeSbegv29Y8dgycO6ZHDQiB4aa4Q; shbid="12061\05463878211833\0541735748261:01f70750ab8d8895e0fbe690a7c789a08408aae220198157cb0846333dbfa92fa5035b63"; shbts="1704212261\05463878211833\0541735748261:01f7c96ff123d49d010cb5aeb7a943d703dd33ba634e17e7cf906c903743697bd3a698ef"; rur="LDC\05463878211833\0541735748264:01f7408ea5d8e023992e3ad80c85a3d4b3a4d79e8f2b98c00c4c87f78f5c8bc45b2546f0"',
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
