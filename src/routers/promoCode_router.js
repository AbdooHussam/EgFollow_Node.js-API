const express = require("express");
const { ObjectId, Double } = require("mongodb");
const PromoCodes = require("../models/promoCode_model");
const Users = require("../models/users_model");
const { authMiddlewareUser } = require("../middleware/auth");
const router = new express.Router();

router.post("/newPromoCode", async (req, res) => {
  try {
    const promoCode = new PromoCodes(req.body);
    await promoCode.save();
    res.send({ error: false, data: promoCode });
    console.log("/pooost promoCode");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

router.get("/promoCodes", async (req, res) => {
  try {
    const promoCodeAid = req.query.promoCodeAid;
    const promoCode = promoCodeAid
      ? await PromoCodes.findOne({ promoCodeAid })
      : await PromoCodes.find({});
    //.sort({ promoCodeAid: 1 });
    // if (promoCode.length == 0) {
    //   return res
    //     .status(400)
    //     .send({ error: true, data: "لا يوجد غرف مسجلة بعد" });
    // }
    // for (let i = 0; i < promoCode.length; i++) {
    //   const element = promoCode[i];
    //   promoCode[i].users = [];
    // }
    res.send({ error: false, data: promoCode });
    console.log("/get all promoCodes");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

router.patch("/promoCodes/:promoCodeAid", async (req, res) => {
  try {
    const _id = req.params.promoCodeAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = ["promoCode", "giftPoints", "isActive", "users"];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const promoCode = await PromoCodes.findOne({
      $or: [{ promoCodeAid: _id }, { _id: objId }],
    });
    if (!promoCode) {
      res.status(404).send({ error: true, data: "No promoCode Found" });
    } else {
      updates.forEach((e) => (promoCode[e] = body[e]));
      await promoCode.save();
      res.send({ error: false, data: promoCode });
    }
    console.log("/Updaaaate promoCode By Id2");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

router.delete("/promoCodes/:promoCodeAid", async (req, res) => {
  try {
    const _id = req.params.promoCodeAid;
    const promoCode = await PromoCodes.findByIdAndDelete(_id);
    if (!promoCode) {
      res.status(404).send({ error: true, data: "not found" });
    } else {
      res.send({ error: false, data: promoCode });
    }
    console.log("/Deleeete promoCode By Id");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

///////////////////////////////////////////////////////////////////////////

router.post("/applyPromoCode", authMiddlewareUser, async (req, res) => {
  try {
    const promoCode = req.body.promoCode;
    let user = req.user;
    const userAid = user.userAid;
    if (!user) {
      return res.status(404).send({ error: true, data: "not found user" });
    }
    const findPromoCode = await PromoCodes.findOne({ promoCode: promoCode });
    if (!findPromoCode) {
      return res
        .status(404)
        .send({ error: true, data: "not found Promo Code" });
    }
    const userIndex = findPromoCode.users.findIndex((e) => e == userAid);
    if (userIndex != -1) {
      return res
        .status(450)
        .send({ error: true, data: "You have already used this promo before" });
    }

    findPromoCode.users.push(userAid);
    user.userPoints = user.userPoints + findPromoCode.giftPoints;
    await findPromoCode.save();
    await user.save();
    res.send({
      error: false,
      data: findPromoCode,
      userPoints: user.userPoints,
    });
    console.log("/pooost promoCode");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

module.exports = router;
