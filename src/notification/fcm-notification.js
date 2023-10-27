// // const { initializeApp } = require("firebase-admin/app");
// var admin = require("firebase-admin");
// const { getMessaging } = require("firebase-admin/messaging");
// const Notifications = require("../models/notification_model");
// // const Users = require("../models/users_model");
// // const Chefs = require("../models/chefs_model");

// const sendNotification = async (
//   token,
//   title,
//   body,
//   isCheff,
//   longMessage = ""
// ) => {
//   try {
//     const message = {
//       token: token,
//       notification: {
//         title: title,
//         body: body,
//       },
//       data: {
//         longMessage: longMessage,
//       },
//     };

//     // Send the notification and get the response
//     const response = await getMessaging().send(message);

//     // Return the response immediately
//     const responsePayload = {
//       data: `Successfully sent message: ${response}`,
//     };

//     // // Asynchronously save the notification details
//     // (async () => {
//     //   try {
//     //     const user = isCheff
//     //       ? await Chefs.findOne({ messageToken: token })
//     //       : await Users.findOne({ messageToken: token });
//     //     if (user) {
//     //       const existingNotification = await Notifications.findOne({
//     //         userId: user._id,
//     //       });

//     //       if (existingNotification) {
//     //         existingNotification.messageToken = user.messageToken;
//     //         existingNotification.messageDetails.push({
//     //           title,
//     //           body,
//     //           longMessage,
//     //           date: new Date(),
//     //         });
//     //         await existingNotification.save();
//     //       } else {
//     //         const newNotification = new Notifications({
//     //           messageToken: user.messageToken,
//     //           userAid: user._id,
//     //           messageDetails: [
//     //             {
//     //               title,
//     //               body,
//     //               longMessage,
//     //               date: new Date(),
//     //             },
//     //           ],
//     //         });

//     //         await newNotification.save();
//     //       }
//     //     }
//     //   } catch (e) {
//     //     console.log("Error saving notification:", e);
//     //   }
//     // })();

//     return responsePayload;
//   } catch (e) {
//     console.log("Error sending message:", e);
//     throw new Error(e);
//   }
// };

// // Topics ("all")

// const sendNotificationToTopic = async (
//   title,
//   body,
//   longMessage = "",
//   topic = "all"
// ) => {
//   try {
//     const message = {
//       notification: {
//         title: title,
//         body: body,
//       },
//       data: {
//         longMessage: longMessage,
//       },
//       topic: topic,
//     };

//     // Send the notification and get the response
//     const response = await getMessaging().send(message);

//     // Return the response immediately
//     const responsePayload = {
//       data: `Successfully sent message: ${response}`,
//     };

//     (async () => {
//       try {
//         // Retrieve all notification documents
//         const allNotifications = await Notifications.find();

//         // Loop through notifications and update message details
//         for (const notification of allNotifications) {
//           try {
//             notification.messageDetails.push({
//               title,
//               body,
//               longMessage,
//               date: new Date(),
//             });

//             await notification.save();
//           } catch (e) {
//             console.log(`Error updating notification ${notification._id}:`, e);
//           }
//         }
//       } catch (e) {
//         console.log("Error saving notification:", e);
//       }
//     })();

//     return responsePayload;
//   } catch (e) {
//     console.log("Error sending message:", e);
//     throw new Error(e);
//   }
// };

// module.exports = { sendNotification, sendNotificationToTopic };
