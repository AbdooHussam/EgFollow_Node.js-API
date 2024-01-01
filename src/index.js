global.allCookies = [
  'mid=ZTrgqAALAAG4WKme4nTtU4hR0uj8; ig_did=2BC641C3-C001-4FCE-9BA9-1B9C81F9058D; ig_nrcb=1; datr=p-A6ZRpDlP6wj9UCfTLbIQyk; ig_did=0C826C21-17C3-444A-ABB7-EBABD37214D7; shbid="3438\05463901225987\0541735678252:01f7a4eb94fe15ba19475931a90591de479a613bf0bbf7997deed48409134be7ecc32fd4"; shbts="1704142252\05463901225987\0541735678252:01f782160f27258b6cb4b5bbaec735f10709c8b4007964a4af224c3f9fa3189ac8307fbe"; dpr=1.25; csrftoken=1U5yFhrhjXbwlE41rjPU9qkNUJWdJg71; ds_user_id=63515035554; sessionid=63515035554%3ACNA2aJfZbnfchQ%3A0%3AAYcQuL4QEI_AMDXJAwN8MFhWlIFNugX1Rwk0c-hwqQ; rur="RVA\05463515035554\0541735678381:01f732a6003d1745243f94504fcefb063a5ed5fb3821a5b92884df721d15e4e5851b16fb"',
  'mid=ZTrgqAALAAG4WKme4nTtU4hR0uj8; ig_did=2BC641C3-C001-4FCE-9BA9-1B9C81F9058D; ig_nrcb=1; datr=p-A6ZRpDlP6wj9UCfTLbIQyk; ig_did=0C826C21-17C3-444A-ABB7-EBABD37214D7; shbid="3438\05463901225987\0541735678252:01f7a4eb94fe15ba19475931a90591de479a613bf0bbf7997deed48409134be7ecc32fd4"; shbts="1704142252\05463901225987\0541735678252:01f782160f27258b6cb4b5bbaec735f10709c8b4007964a4af224c3f9fa3189ac8307fbe"; dpr=1.25; csrftoken=W2aOGiYWRtLp42Mw4OG7PtXPCKhrjxnR; ds_user_id=63873108154; sessionid=63873108154%3A6wIfnovFAHsms1%3A1%3AAYfj2YDV1-2VdCRJkWWQLe6CRRYSoNg4fnOmq-XamA; rur="LLA\05463873108154\0541735678540:01f7fe4b2b408e1b8551bde887d01ec6eab2eddb44e0c0592c96725c6e29dbd93475b3f4"',
  'mid=ZTrgqAALAAG4WKme4nTtU4hR0uj8; ig_did=2BC641C3-C001-4FCE-9BA9-1B9C81F9058D; ig_nrcb=1; datr=p-A6ZRpDlP6wj9UCfTLbIQyk; ig_did=0C826C21-17C3-444A-ABB7-EBABD37214D7; shbid="3438\05463901225987\0541735678252:01f7a4eb94fe15ba19475931a90591de479a613bf0bbf7997deed48409134be7ecc32fd4"; shbts="1704142252\05463901225987\0541735678252:01f782160f27258b6cb4b5bbaec735f10709c8b4007964a4af224c3f9fa3189ac8307fbe"; dpr=1.25; csrftoken=5KsT8whSpFGeRfVOVcE0qNBOi0G922OO; ds_user_id=63878211833; sessionid=63878211833%3AonPWTMj3brcLSr%3A11%3AAYdDLZ7Y2Lv7Vs1qXj1XoxosUqj_26tu0hHrqgK7Hg; rur="LDC\05463878211833\0541735678622:01f726a7c7d5b3dd133511cca83b1e3ddced36e3d3e676adf439b770f5bb72564f7d0197"',
  'mid=ZTrgqAALAAG4WKme4nTtU4hR0uj8; ig_did=2BC641C3-C001-4FCE-9BA9-1B9C81F9058D; ig_nrcb=1; datr=p-A6ZRpDlP6wj9UCfTLbIQyk; ig_did=0C826C21-17C3-444A-ABB7-EBABD37214D7; shbid="3438\05463901225987\0541735678252:01f7a4eb94fe15ba19475931a90591de479a613bf0bbf7997deed48409134be7ecc32fd4"; shbts="1704142252\05463901225987\0541735678252:01f782160f27258b6cb4b5bbaec735f10709c8b4007964a4af224c3f9fa3189ac8307fbe"; dpr=1.25; ds_user_id=63878211833; csrftoken=bM1sKw2L1Omgj7Qig6ymnlcZRZsWPWr8; sessionid=63878211833%3AJTqdEEx6Asxkk2%3A13%3AAYc0Y0AA1VOXfuzwLk134caXmrQ7Sya27TGVXoRufw; rur="LDC\05463878211833\0541735678656:01f75021f343422397eb6e3cd95124423191de2047683912772b3a49ce055b6f5210e2a2"',
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
