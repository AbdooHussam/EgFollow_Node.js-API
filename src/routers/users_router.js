const express = require("express");
const { ObjectId, Double } = require("mongodb");
const {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} = require("instagram-private-api");
const { sample } = require("lodash");
const inquirer = require("inquirer");
const Bluebird = require("bluebird");
const User = require("../models/users_model");
const router = new express.Router();
const login_controller = require("./login_controller");
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const Notifications = require("../models/notification_model");

const userLogin = async (req, res, token) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const loggedInUser = await login_controller.userInstaLogin2(
      username,
      password
    );
    let messageToken = req.body.messageToken;
    // if (req.body.messageToken) {
    //   user.messageToken = messageToken;
    //   await user.save();

    //   admin.messaging().subscribeToTopic(messageToken, "ALL");
    //   const existingNotification = await Notifications.findOne({
    //     userAid: user.userAid,
    //   });

    //   if (!existingNotification) {
    //     const newNotification = new Notifications({
    //       messageToken: user.messageToken,
    //       userAid: user.userAid,
    //     });
    //     await newNotification.save();
    //     const message = {
    //       token: user.messageToken,
    //       notification: {
    //         title: "Welcome!",
    //         body: `مرحبا بك ${user.name}`,
    //       },
    //     };
    //     getMessaging().send(message);
    //   }
    // }
    res.send({ error: false, data: loggedInUser, token, messageToken });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, data: e.message });
  }
};

router.post("/userLogin", async (req, res) => {
  try {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    const loggedInUser = await login_controller.userInstaLogin2(
      username,
      password
    );
    if (loggedInUser.error == true) {
      return res.status(404).send(loggedInUser);
    }

    const user = await User.findOne({ username: loggedInUser.username });
    if (user) {
      let messageToken = req.body.messageToken;
      const token = await user.generateAuthToken();
      //   await userLogin(req, res, token);
      const updates = Object.keys(loggedInUser);
      updates.forEach((e) => (user[e] = loggedInUser[e]));
      await user.save();
      return res.send({
        error: false,
        data: user,
        // loggedInUser,
        token,
        messageToken,
      });
    } else {
      const boody = {
        pk: loggedInUser.pk,
        strong_id__: loggedInUser.strong_id__,
        full_name: loggedInUser.full_name,
        username: loggedInUser.username,
        is_private: loggedInUser.is_private,
        is_verified: loggedInUser.is_verified,
        is_business: loggedInUser.is_business,
        all_media_count: loggedInUser.all_media_count,
        phoneNumber: loggedInUser.phone_number,
        profile_pic_url: loggedInUser.profile_pic_url,
        password: password,
      };
      //  console.log(boody);
      const user2 = new User(boody);
      await user2.save();
      const token = await user2.generateAuthToken();
      let messageToken = req.body.messageToken;
      //   if (req.body.messageToken) {
      //     user2.messageToken = messageToken;
      //     await user2.save();

      //     admin.messaging().subscribeToTopic(messageToken, "all");
      //     const existingNotification = await Notifications.findOne({
      //       userAid: user2.userAid,
      //     });

      //     if (!existingNotification) {
      //       const newNotification = new Notifications({
      //         messageToken: user2.messageToken,
      //         userAid: user2.userAid,
      //       });
      //       await newNotification.save();
      //       const message = {
      //         token: user2.messageToken,
      //         notification: {
      //           title: "Welcome!",
      //           body: `مرحبا بك ${user2.name}`,
      //         },
      //       };
      //       getMessaging().send(message);
      //     }
      //   }
      res.send({
        error: false,
        data: user2,
        // loggedInUser,
        token,
      });
    }

    console.log("/pooost user");
  } catch (e) {
    console.error(e);
    let message = e.message;
    let emailVerified;
    if (message.toString().includes("Must be unique")) {
      message = "المستخدم مسجل من قبل";
      const user = await User.findOne({ email: req.body.email });
      emailVerified = user.emailVerified;
    }
    res.status(400).send({ error: true, data: message, emailVerified });
  }
});

// router.route("/userLogin").post(userLogin);

router.get("/user", async (req, res) => {
  try {
    let user;
    let param = req.query;
    if (param) {
      user = await User.find(param);
    } else {
      user = await User.find({});
    }

    res.send({ error: false, data: user });

    console.log("/get all user");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(400).send({ error: true, data: e.message });
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
    const user = await User.findOne({
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
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/user/:userAid", async (req, res) => {
  try {
    const _id = req.params.userAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const user = await User.findOne({
      $or: [{ userAid: _id }, { _id: objId }],
    });

    res.send({ error: false, data: user });
    console.log("/user");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/userSendMail/:userAid", async (req, res) => {
  try {
    const _id = req.params.userAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const user = await User.findOne({
      $or: [{ userAid: _id }, { _id: objId }],
    });

    const emailOtp = emailController.generateRandomOTP(4);
    await emailController.nodeMailerSend(
      user.email,
      "رمز تحقق TOWN JO",
      `رمز تحققك هو: ${emailOtp}`
    );
    res.send({ error: false, data: user, emailOtp });
    console.log("/userSendMail");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(400).send({ error: true, data: e.message });
  }
});

/////////////////////////// Teeeest //////////////////////////

router.get("/userInsta", async (req, res) => {
  try {
    const ig = new IgApiClient();
    const userName = "abdoo_test";
    const userPass = "123456789BH";
    // You must generate device id's before login.
    // Id's generated based on seed
    // So if you pass the same value as first argument - the same id's are generated every time
    ig.state.generateDevice(userName);
    // Optionally you can setup proxy url
    // ig.state.proxyUrl = process.env.IG_PROXY;
    // Execute all requests prior to authorization in the real Android application
    // Not required but recommended
    await ig.simulate.preLoginFlow();
    const loggedInUser = await ig.account.login(userName, userPass);
    console.log(loggedInUser);

    // The same as preLoginFlow()
    // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
    //process.nextTick(async () => await ig.simulate.postLoginFlow());
    // Create UserFeed instance to get loggedInUser's posts

    const userFeed = ig.feed.user(loggedInUser.pk);
    const myPostsFirstPage = await userFeed.items();
    const followersFeed = ig.feed.accountFollowers(loggedInUser.pk);
    const followers = await getAllItemsFromFeed(followersFeed);
    const followingFeed = ig.feed.accountFollowing(loggedInUser.pk);
    const following = await getAllItemsFromFeed(followingFeed);
    let search = await ig.search.users("abdoo.hussam");
    // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page

    // await ig.media.like({
    //   // Like our first post from first page or first post from second page randomly
    //   mediaId: myPostsFirstPage[0].id,
    //   moduleInfo: {
    //     module_name: "profile",
    //     user_id: loggedInUser.pk,
    //     username: loggedInUser.username,
    //   },
    //   d: 0,
    // });

    //   await ig.friendship.create(1596873334);

    res.send({
      error: true,
      loggedInUser,
      followers,
      following,
      search,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

////////////////////////////////////////////////////////////

router.get("/userInstaLogin2", async (req, res) => {
  try {
    // Initiate Instagram API client
    const ig = new IgApiClient();
    const userName = "abdoo_test";
    const userPass = "123456789BH";
    ig.state.generateDevice(userName);
    // Perform usual login
    // If 2FA is enabled, IgLoginTwoFactorRequiredError will be thrown
    const loggedInUser = await Bluebird.try(() =>
      ig.account.login(userName, userPass)
    )
      .catch(IgLoginTwoFactorRequiredError, async (err) => {
        const { username, totp_two_factor_on, two_factor_identifier } =
          err.response.body.two_factor_info;
        // decide which method to use
        const verificationMethod = totp_two_factor_on ? "0" : "1"; // default to 1 for SMS
        // At this point a code should have been sent
        // Get the code
        const { code } = await inquirer.prompt([
          {
            type: "input",
            name: "code",
            message: `Enter code received via ${
              verificationMethod === "1" ? "SMS" : "TOTP"
            }`,
          },
        ]);
        // Use the code to finish the login process
        return ig.account.twoFactorLogin({
          username,
          verificationCode: code,
          twoFactorIdentifier: two_factor_identifier,
          verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
          trustThisDevice: "1", // Can be omitted as '1' is used by default
        });
      })
      .catch((e) =>
        console.error(
          "An error occurred while processing two factor auth",
          e,
          e.stack
        )
      );

    res.send({
      error: true,
      loggedInUser,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

module.exports = router;
