const express = require("express");

const { ObjectId, Double } = require("mongodb");
const FollowOrders = require("../models/followOrders_model");
const Users = require("../models/users_model");
const login_controller = require("../Controllers/login_controller");
const { authMiddlewareUser } = require("../middleware/auth");
const router = new express.Router();

router.post("/newFollowOrder", authMiddlewareUser, async (req, res) => {
  try {
    const paidPoints = req.body.paidPoints;
    const targetFollowers = req.body.targetFollowers;
    const orderUserName = req.body.orderUserName;
    let user = req.user;
    const userAid = user.userAid;
    if (!user) {
      return res.status(404).send({ error: true, data: "not found" });
    }
    let response = await login_controller.searchByUserName(user, orderUserName);
    console.log(response.error);
    if (response.error == true) {
      req.body.username = user.username;
      req.body.password = user.password;
      await login_controller.loginApi(req, res, false);

      user = await Users.findOne({ pk: user.pk });
      if (user) {
        response = await login_controller.searchByUserName(user, orderUserName);
        if (response.error == true) {
          return res.status(404).send({ error: true, data: response });
        }
      }
    }
    const followOrder1 = await FollowOrders.findOne({
      followFrom: userAid,
      "followTo.pk": response.pk,
    });
    if (followOrder1) {
      if (user.userPoints >= paidPoints) {
        user.userPoints = user.userPoints - paidPoints;
        await user.save();
      } else {
        return res
          .status(404)
          .send({ error: true, data: "Your Points not enough" });
      }
      followOrder1.targetFollowers =
        followOrder1.targetFollowers + targetFollowers;
      followOrder1.paidPoints = followOrder1.paidPoints + paidPoints;
    } else {
      const boody = {
        followTo: {
          pk: response.pk,
          strong_id__: response.strong_id__,
          full_name: response.full_name,
          username: response.username,
          is_private: response.is_private,
          is_verified: response.is_verified,
          is_business: response.is_business,
          all_media_count: response.media_count,
          profile_pic_url: response.hd_profile_pic_url_info.url,
        },
        followFrom: userAid,
        paidPoints: paidPoints,
        targetFollowers: targetFollowers,
      };
      const followOrder = new FollowOrders(boody);
      await followOrder.save();
      return res.send({ error: false, data: followOrder });
    }

    console.log("/pooost followOrder");
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/followOrders", async (req, res) => {
  try {
    const followOrderAid = req.query.followOrderAid;
    const followOrder = followOrderAid
      ? await FollowOrders.findOne({ followOrderAid })
      : await FollowOrders.find({});
    //.sort({ followOrderAid: 1 });
    // if (followOrder.length == 0) {
    //   return res
    //     .status(400)
    //     .send({ error: true, data: "لا يوجد غرف مسجلة بعد" });
    // }
    // for (let i = 0; i < followOrder.length; i++) {
    //   const element = followOrder[i];
    //   followOrder[i].users = [];
    // }
    res.send({ error: false, data: followOrder });
    console.log("/get all followOrders");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/followOrdersRandom", authMiddlewareUser, async (req, res) => {
  try {
    const user = req.user;
    const followOrder = await FollowOrders.aggregate([
      { $sample: { size: 1000 } }, // تعديل الحجم حسب عدد النتائج التي ترغب فيها
    ]);
    console.log(followOrder.length);
    for (let i = 0; i < user.following.length; i++) {
      const userElement = user.following[i];
      const friendIndex = followOrder.findIndex(
        (e) => e.followTo.pk == userElement.pk
      );
      if (friendIndex != -1) {
        followOrder.splice(friendIndex, 1);
      }
    }
    console.log(followOrder.length);
    res.send({ error: false, data: followOrder });
    console.log("/get all followOrdersRandom");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.patch("/followOrders/:followOrderAid", async (req, res) => {
  try {
    const _id = req.params.followOrderAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = [
      "paidPoints",
      "targetFollowers",
      "currentFollowers",
    ];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const followOrder = await FollowOrders.findOne({
      $or: [{ followOrderAid: _id }, { _id: objId }],
    });
    if (!followOrder) {
      res.status(404).send({ error: true, data: "No followOrder Found" });
    } else {
      updates.forEach((e) => (followOrder[e] = body[e]));
      await followOrder.save();
      res.send({ error: false, data: followOrder });
    }
    console.log("/Updaaaate followOrder By Id2");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.delete("/followOrders/:followOrderAid", async (req, res) => {
  try {
    const _id = req.params.followOrderAid;
    const followOrder = await FollowOrders.findByIdAndDelete(_id);
    if (!followOrder) {
      res.status(404).send({ error: true, data: "لم يتم العثور على الغرفة" });
    } else {
      res.send({ error: false, data: followOrder });
    }
    console.log("/Deleeete followOrder By Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/myfollowOrders/:userAid", async (req, res) => {
  try {
    const userAid = req.params.userAid;
    const followOrder = await FollowOrders.find({
      followFrom: userAid,
    }).sort({
      createdAt: -1,
    });
    if (!followOrder || followOrder.length == 0) {
      return res.status(404).send({ error: true, data: "Not Found" });
    } else {
      res.send({ error: false, data: followOrder });
    }

    console.log("/get followOrders By user Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

module.exports = router;
