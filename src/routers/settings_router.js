const express = require("express");
const { ObjectId, Double } = require("mongodb");
const Settings = require("../models/settings_model");
const Users = require("../models/users_model");
const { authMiddlewareUser } = require("../middleware/auth");
const router = new express.Router();

router.post("/newSetting", async (req, res) => {
  try {
    const setting = new Settings(req.body);
    await setting.save();
    res.send({ error: false, data: setting });
    console.log("/pooost setting");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const settingAid = req.query.settingAid;
    const setting = settingAid
      ? await Settings.findOne({ settingAid })
      : await Settings.find({});
    //.sort({ settingAid: 1 });
    // if (setting.length == 0) {
    //   return res
    //     .status(400)
    //     .send({ error: true, data: "لا يوجد غرف مسجلة بعد" });
    // }
    // for (let i = 0; i < setting.length; i++) {
    //   const element = setting[i];
    //   setting[i].users = [];
    // }
    res.send({ error: false, data: setting });
    console.log("/get all settings");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

router.patch("/settings/:settingAid", async (req, res) => {
  try {
    const _id = req.params.settingAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = ["followerPerPoints", "initNewUserPoints"];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const setting = await Settings.findOne({
      $or: [{ settingAid: _id }, { _id: objId }],
    });
    if (!setting) {
      res.status(404).send({ error: true, data: "No setting Found" });
    } else {
      updates.forEach((e) => (setting[e] = body[e]));
      await setting.save();
      res.send({ error: false, data: setting });
    }
    console.log("/Updaaaate setting By Id2");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

router.delete("/settings/:settingAid", async (req, res) => {
  try {
    const _id = req.params.settingAid;
    const setting = await Settings.findByIdAndDelete(_id);
    if (!setting) {
      res.status(404).send({ error: true, data: "not found" });
    } else {
      res.send({ error: false, data: setting });
    }
    console.log("/Deleeete setting By Id");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

module.exports = router;
