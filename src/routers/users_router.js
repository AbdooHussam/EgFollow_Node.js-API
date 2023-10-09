// const express = require("express");
// const { ObjectId, Double } = require("mongodb");
// const User = require("../models/users_model");
// const Chefs = require("../models/chefs_model");
// const router = new express.Router();
// const emailController = require("../emails/email-nodemailer");
// var admin = require("firebase-admin");
// const { getMessaging } = require("firebase-admin/messaging");
// const Notifications = require("../models/notification_model");

// router.post("/user", async (req, res) => {
//   try {
//     console.log(req.body);
//     const chef = await Chefs.findOne({ email: req.body.email });
//     const chef1 = await Chefs.findOne({ phoneNumber: req.body.phoneNumber });
//     if (chef || chef1) {
//       return res
//         .status(400)
//         .send({ error: true, data: "هذا الحساب مسجل من قبل" });
//     }
//     const user = new User(req.body);
//     await user.save();
//     const token = await user.generateAuthToken();
//     const emailOtp = emailController.generateRandomOTP(4);
//     await emailController.nodeMailerSend(
//       user.email,
//       "رمز تحقق TOWN JO",
//       `رمز تحققك هو: ${emailOtp}`
//     );
//     let messageToken = req.body.messageToken;
//     if (req.body.messageToken) {
//       user.messageToken = messageToken;
//       await user.save();

//       admin.messaging().subscribeToTopic(messageToken, "all");
//       const existingNotification = await Notifications.findOne({
//         userAid: user.userAid,
//       });

//       if (!existingNotification) {
//         const newNotification = new Notifications({
//           messageToken: user.messageToken,
//           userAid: user.userAid,
//         });
//         await newNotification.save();
//         const message = {
//           token: user.messageToken,
//           notification: {
//             title: "Welcome!",
//             body: `مرحبا بك ${user.name}`,
//           },
//         };
//         getMessaging().send(message);
//       }
//     }
//     res.send({ error: false, data: user, token, emailOtp });
//     console.log("/pooost user");
//   } catch (e) {
//     console.error(e);
//     let message = e.message;
//     let emailVerified;
//     if (message.toString().includes("Must be unique")) {
//       message = "المستخدم مسجل من قبل";
//       const user = await User.findOne({ email: req.body.email });
//       emailVerified = user.emailVerified;
//     }
//     res.status(400).send({ error: true, data: message, emailVerified });
//   }
// });

// router.post("/userLogin", async (req, res) => {
//   try {
//     const user = await User.findByCredentials(
//       req.body.email,
//       req.body.password
//     );
//     const token = await user.generateAuthToken();
//     let messageToken = req.body.messageToken;
//     if (req.body.messageToken) {
//       user.messageToken = messageToken;
//       await user.save();

//       admin.messaging().subscribeToTopic(messageToken, "ALL");
//       const existingNotification = await Notifications.findOne({
//         userAid: user.userAid,
//       });

//       if (!existingNotification) {
//         const newNotification = new Notifications({
//           messageToken: user.messageToken,
//           userAid: user.userAid,
//         });
//         await newNotification.save();
//         const message = {
//           token: user.messageToken,
//           notification: {
//             title: "Welcome!",
//             body: `مرحبا بك ${user.name}`,
//           },
//         };
//         getMessaging().send(message);
//       }
//     }
//     res.send({ error: false, data: user, token, messageToken });
//   } catch (e) {
//     console.error(e);
//     res.status(400).send({ error: true, data: e.message });
//   }
// });

// router.get("/user", async (req, res) => {
//   try {
//     let user;
//     let param = req.query;
//     if (param) {
//       user = await User.find(param);
//     } else {
//       user = await User.find({});
//     }

//     res.send({ error: false, data: user });

//     console.log("/get all user");
//   } catch (e) {
//     console.error({ error: true, data: e.message });
//     res.status(400).send({ error: true, data: e.message });
//   }
// });

// router.patch("/user/:userAid", async (req, res) => {
//   try {
//     const _id = req.params.userAid;
//     var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
//     const body = req.body;
//     const updates = Object.keys(body);
//     const allowedUpdates = [
//       "name",
//       "birthDate",
//       "phoneNumber",
//       "email",
//       "emailVerified",
//       "region",
//       "password",
//     ];
//     const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
//     if (!isValidOperation) {
//       return res.status(400).send({
//         error: true,
//         data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
//       });
//     }
//     // if use middlware
//     const user = await User.findOne({
//       $or: [{ userAid: _id }, { _id: objId }],
//     });
//     if (!user) {
//       res.status(404).send({ error: true, data: "No user Found" });
//     } else {
//       updates.forEach((e) => (user[e] = body[e]));
//       await user.save();
//       res.send({ error: false, data: user });
//     }
//     console.log("/Updaaaate region By Id2");
//   } catch (e) {
//     console.error(e);
//     res.status(500).send({ error: true, data: e.message });
//   }
// });

// router.get("/user/:userAid", async (req, res) => {
//   try {
//     const _id = req.params.userAid;
//     var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
//     const user = await User.findOne({
//       $or: [{ userAid: _id }, { _id: objId }],
//     });

//     res.send({ error: false, data: user });
//     console.log("/user");
//   } catch (e) {
//     console.error({ error: true, data: e.message });
//     res.status(400).send({ error: true, data: e.message });
//   }
// });

// router.get("/userSendMail/:userAid", async (req, res) => {
//   try {
//     const _id = req.params.userAid;
//     var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
//     const user = await User.findOne({
//       $or: [{ userAid: _id }, { _id: objId }],
//     });

//     const emailOtp = emailController.generateRandomOTP(4);
//     await emailController.nodeMailerSend(
//       user.email,
//       "رمز تحقق TOWN JO",
//       `رمز تحققك هو: ${emailOtp}`
//     );
//     res.send({ error: false, data: user, emailOtp });
//     console.log("/userSendMail");
//   } catch (e) {
//     console.error({ error: true, data: e.message });
//     res.status(400).send({ error: true, data: e.message });
//   }
// });

// /////////////////////////// Teeeest //////////////////////////

// router.get("/test/user", async (req, res) => {
//   try {
//     await emailController.nodeMailerSend(
//       "booodyhussamh@gmail.com",
//       "رمز تحقق TOWN JO",
//       `رمز تحققك هو: 555`
//     );
//     res.send({ error: false, data: "done" });

//     console.log("/get all user");
//   } catch (e) {
//     console.error({ error: true, data: e.message });
//     res.status(400).send({ error: true, data: e.message });
//   }
// });

// module.exports = router;
