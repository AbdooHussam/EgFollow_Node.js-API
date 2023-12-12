const express = require("express");
const { ObjectId, Double } = require("mongodb");
const {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} = require("instagram-private-api");
const { sample } = require("lodash");
const inquirer = require("inquirer");
const Bluebird = require("bluebird");
const Users = require("../models/users_model");
const FollowOrders = require("../models/followOrders_model");
const router = new express.Router();
const login_controller = require("../Controllers/login_controller");
//var admin = require("firebase-admin");
//const { getMessaging } = require("firebase-admin/messaging");
//const Notifications = require("../models/notification_model");
const { authMiddlewareUser } = require("../middleware/auth");

router.post("/userLogin", login_controller.loginApi);

router.post("/userLoginWithUserName", login_controller.loginApiWithUserName);

router.get("/user", async (req, res) => {
  try {
    let user;
    let param = req.query;
    if (param) {
      user = await Users.find(param);
    } else {
      user = await Users.find({});
    }

    res.send({ error: false, data: user });

    console.log("/get all user");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(450).send({ error: true, data: e.message });
  }
});

router.patch("/user/:userAid", async (req, res) => {
  try {
    const _id = req.params.userAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = [
      "name",
      "birthDate",
      "phoneNumber",
      "email",
      "emailVerified",
      "region",
      "password",
    ];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const user = await Users.findOne({
      $or: [{ userAid: _id }, { _id: objId }],
    });
    if (!user) {
      res.status(404).send({ error: true, data: "No user Found" });
    } else {
      updates.forEach((e) => (user[e] = body[e]));
      await user.save();
      res.send({ error: false, data: user });
    }
    console.log("/Updaaaate region By Id2");
  } catch (e) {
    console.error(e);
    res.status(450).send({ error: true, data: e.message });
  }
});

router.get("/user/:userAid", async (req, res) => {
  try {
    const _id = req.params.userAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const user = await Users.findOne({
      $or: [{ userAid: _id }, { _id: objId }],
    });

    res.send({ error: false, data: user });
    console.log("/user");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(450).send({ error: true, data: e.message });
  }
});

router.post("/userFriend", async (req, res) => {
  try {
    console.log(req.body);
    const userAid = req.body.userAid;
    const friendPk = req.body.friendPk;

    const user = await Users.findOne({ userAid });
    if (!user) {
      return res.status(404).send({ error: true, data: "not found" });
    }
    const response = await login_controller.addFriendship(
      user.username,
      user.password,
      friendPk
    );
    //return res.send(loggedInUser);
    if (response.error == true) {
      return res.status(404).send(response);
    }

    res.send({ error: false, data: response });
    console.log("/pooost user");
  } catch (e) {
    console.error(e);
    let message = e.message;
    // if (message.toString().includes("Must be unique")) {
    //   message = "Users already registered";
    // }
    res.status(450).send({ error: true, data: message });
  }
});

router.post("/userAddFriend", authMiddlewareUser, async (req, res) => {
  try {
    console.log(req.body);
    const friendPk = req.body.friendPk;

    let user = req.user;
    if (!user) {
      return res.status(404).send({ error: true, data: "not found" });
    }

    const friendIndex = user.following.findIndex((e) => e["pk"] == friendPk);
    if (friendIndex != -1) {
      return res.status(404).send({
        error: true,
        data: `${user.following[friendIndex].username} has already been added`,
      });
    }
    let response;
    response = await login_controller.addFriendship(user, friendPk);
    console.log(response.error);
    if (response.error == true) {
      req.body.username = user.username;
      req.body.password = user.password;
      await login_controller.loginApi(req, res, false);

      user = await Users.findOne({ pk: user.pk });
      if (user) {
        response = await login_controller.addFriendship(user, friendPk);
        if (response.error == true) {
          return res.status(404).send({ error: true, data: response });
        }
      }
    }

    // if (friendIndex == -1) {
    //   user.following.push({
    //     pk: response.search.pk,
    //     strong_id__: response.search.strong_id__,
    //     full_name: response.search.full_name,
    //     username: response.search.username,
    //     is_private: response.search.is_private,
    //     is_verified: response.search.is_verified,
    //     is_business: response.search.is_business,
    //     all_media_count: response.search.media_count,
    //     profile_pic_url: response.search.hd_profile_pic_url_info.url,
    //   });
    //   user.userPoints = user.userPoints + 1;
    //   await user.save();
    // }

    user.following.push({
      pk: response.search.pk,
      strong_id__: response.search.strong_id__,
      full_name: response.search.full_name,
      username: response.search.username,
      is_private: response.search.is_private,
      is_verified: response.search.is_verified,
      is_business: response.search.is_business,
      all_media_count: response.search.media_count,
      profile_pic_url: response.search.hd_profile_pic_url_info.url,
    });
    user.userPoints = user.userPoints + 1;
    await user.save();

    res.send({ error: false, data: response, userPoints: user.userPoints });
    console.log("/userAddFriend");
  } catch (e) {
    console.error(e);
    let message = e.message;
    res.status(450).send({ error: true, data: message });
  }
});

router.post("/searchByUserName", async (req, res) => {
  try {
    console.log(req.body);
    const userAid = req.body.userAid;
    const userPk = req.body.userPk;
    let user = await Users.findOne({ userAid });
    if (!user) {
      return res.status(404).send({ error: true, data: "not found" });
    }
    let response = await login_controller.searchByUserName(user, userPk);
    //return res.send(loggedInUser);
    console.log(response.error);
    if (response.error == true) {
      req.body.username = user.username;
      req.body.password = user.password;
      await login_controller.loginApi(req, res, false);

      user = await Users.findOne({ pk: user.pk });
      if (user) {
        response = await login_controller.searchByUserName(user, userPk);
        if (response.error == true) {
          return res.status(404).send({ error: true, data: response });
        }
      }
    }

    res.send({ error: false, data: response });
    console.log("/pooost user");
  } catch (e) {
    console.error(e);
    let message = e.message;
    // if (message.toString().includes("Must be unique")) {
    //   message = "Users already registered";
    // }
    res.status(450).send({ error: true, data: message });
  }
});

router.post("/searchToUser", async (req, res) => {
  try {
    console.log(req.body);
    const userName = req.body.userName;
    // let user = await Users.findOne({ userAid });
    // if (!user) {
    //   return res.status(404).send({ error: true, data: "not found" });
    // }
    let response = await login_controller.searchToUsers22(userName);
    console.log(response.error);
    if (response.error == true) {
      return res.status(404).send(response);
    }
    res.send({ error: false, data: response.data });
    console.log("/pooost user");
  } catch (e) {
    console.error(e);
    let message = e.message;
    res.status(450).send({ error: true, data: message });
  }
});

router.post("/verifyFollow", authMiddlewareUser, async (req, res) => {
  try {
    console.log(req.body);
    const users = req.body.users;
    const account = req.body.account;

    let user = req.user;
    if (!user) {
      return res.status(404).send({ error: true, data: "not found" });
    }

    const friendIndex = user.following.findIndex(
      (e) => e["username"] == users[0]
    );
    if (friendIndex != -1) {
      return res.status(404).send({
        error: true,
        data: `${user.following[friendIndex].username} has already been added`,
      });
    }

    let response = await login_controller.verifyFollow(users, account);
    if (response.error == true) {
      return res.status(404).send(response);
    }
    let userNotFollowing = [];
    for (let key in response.data) {
      if (response.data.hasOwnProperty(key) && response.data[key] !== true) {
        userNotFollowing.push(key);
      }
    }

    if (userNotFollowing.length != 0) {
      return res
        .status(400)
        .send({
          error: true,
          data: "You have not followed this account",
          userNotFollowing: userNotFollowing,
        });
    }

    const followUser = await FollowOrders.findOne({
      "followTo.username": users[0],
    });

    if (!followUser) {
      return res
        .status(404)
        .send({ error: true, data: "not found followUser" });
    }
    user.following.push({
      pk: followUser.followTo.pk,
      biography: followUser.followTo.biography,
      bioLinks: followUser.followTo.bioLinks,
      full_name: followUser.followTo.full_name,
      username: followUser.followTo.username,
      is_private: followUser.followTo.is_private,
      is_verified: followUser.followTo.is_verified,
      is_business: followUser.followTo.is_business,
      all_media_count: followUser.followTo.all_media_count,
      profile_pic_url: followUser.followTo.profile_pic_url,
    });
    user.userPoints = user.userPoints + 1;
    await user.save();

    res.send({
      error: false,
      data: response.data,
      userPoints: user.userPoints,
    });
  } catch (e) {
    console.error(e);
    let message = e.message;
    res.status(450).send({ error: true, data: message });
  }
});

router.post("/verifyAddFriend", authMiddlewareUser, async (req, res) => {
  try {
    console.log(req.body);
    const friendPk = req.body.friendPk;

    let user = req.user;
    if (!user) {
      return res.status(404).send({ error: true, data: "not found" });
    }

    const friendIndex = user.following.findIndex((e) => e["pk"] == friendPk);
    if (friendIndex != -1) {
      return res.status(404).send({
        error: true,
        data: `${user.following[friendIndex].username} has already been added`,
      });
    }
    const response = await login_controller.searchToGetFreindUser(user.pk);
    console.log(response.error);
    if (response.error == true) {
      return res.status(404).send({ error: true, data: response });
    }

    const friendIndex2 = response.findIndex((e) => e["pk"] == friendPk);
    if (friendIndex2 == -1) {
      return res.status(404).send({
        error: true,
        data: `User Not Found in your friend`,
      });
    }

    user.following.push({
      pk: response[friendIndex2].pk,
      strong_id__: response[friendIndex2].strong_id__,
      full_name: response[friendIndex2].full_name,
      username: response[friendIndex2].username,
      is_private: response[friendIndex2].is_private,
      is_verified: response[friendIndex2].is_verified,
      is_business: response[friendIndex2].is_business,
      all_media_count: response[friendIndex2].media_count,
      profile_pic_url: response[friendIndex2].profile_pic_url,
    });
    user.userPoints = user.userPoints + 1;
    await user.save();

    res.send({ error: false, data: response, userPoints: user.userPoints });
    console.log("/userAddFriend");
  } catch (e) {
    console.error(e);
    let message = e.message;
    res.status(450).send({ error: true, data: message });
  }
});

/////////////////////////// Teeeest //////////////////////////

module.exports = router;
