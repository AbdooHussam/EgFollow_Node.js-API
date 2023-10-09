const express = require("express");
const { ObjectId, Double } = require("mongodb");
const Notifications = require("../models/notification_model");
const User = require("../models/users_model");
const router = new express.Router();
const {
  sendNotification,
  sendNotificationToTopic,
} = require("../notification/fcm-notification");

router.post("/notification", async (req, res) => {
  try {
    const { userAid, messageToken, title, body, longMessage } = req.body;

    const existingNotification = await Notifications.findOne({
      messageToken,
      userAid,
    });

    if (existingNotification) {
      existingNotification.messageDetails.push({
        title,
        body,
        longMessage,
        date: new Date(),
      });
      await existingNotification.save();

      res.status(200).send({
        error: true,
        data: "Message added to existing notification",
      });
    } else {
      const newNotification = new Notifications({
        messageToken,
        userAid,
        messageDetails: [
          {
            title,
            body,
            longMessage,
            date: new Date(),
          },
        ],
      });

      await newNotification.save();
      res.status(201).send({ error: false, data: "New notification created" });
    }
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/notification", async (req, res) => {
  try {
    const notification = await Notifications.find({});
    res.send({ error: false, data: notification });

    console.log("/get all notification");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(400).send({ error: true, data: e.message });
  }
});

router.post("/sendNotification", async (req, res) => {
  try {
    const _id = req.body.userAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    let title = req.body.title || "Teest";
    let body = req.body.body || "Teest Body";
    let longMessage = req.body.longMessage || "";

    const user = await User.findOne({
      $or: [{ userAid: _id }, { _id: objId }],
    }).populate({
      path: "region",
      // foreignField: "regionAid",
    });

    if (!user) {
      return res.status(404).send({ error: true, data: "user not found" });
    }

    let data = await sendNotification(
      user.messageToken,
      title,
      body,
      longMessage
    );
    return res.send({ error: false, data: data });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.post("/sendNotificationTopic", async (req, res) => {
  try {
    let topic = req.body.topic || "all";
    let title = req.body.title || "Teest";
    let body = req.body.body || "Teest Body";
    let longMessage = req.body.longMessage || "";

    let data = await sendNotificationToTopic(title, body, longMessage, topic);
    return res.send({ error: false, data: data });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/myNotification/:userAid", async (req, res) => {
  try {
    const userAid = req.params.userAid;
    const notification = await Notifications.findOne({ userAid }, "-userAid");
    if (!notification) {
      return res.status(404).send({ error: true, data: "Not Found" });
    } else {
      res.send({ error: false, data: notification });
    }

    console.log("/get Notifications By user Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

module.exports = router;
