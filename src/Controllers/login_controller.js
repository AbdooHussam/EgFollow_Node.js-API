const express = require("express");
const { ObjectId, Double } = require("mongodb");
const fs = require("fs");
const {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} = require("instagram-private-api");
const { sample } = require("lodash");
const inquirer = require("inquirer");
const Bluebird = require("bluebird");
const Users = require("../models/users_model");
const shttps = require("socks-proxy-agent");
const router = new express.Router();

//////////////////// Teeeeeeest ///////////////////////

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

///////////////////////////////////////////////////////////////////////////

exports.userInstaGetStateLogin = async (userName, userPass) => {
  try {
    const ig = new IgApiClient();

    const user = await Users.findOne({
      username: userName,
    });
    if (!user) {
      return exports.userInstaLogin(userName, userPass);
    }
    const serialized = user.session;
    await ig.state.deserialize(serialized);
    const loggedInUser = await ig.user.usernameinfo(userName);

    const followingFeed = ig.feed.accountFollowing(user.pk);
    const following = await getAllItemsFromFeed(followingFeed);

    // return { error: true, data: loggedInUser };
    return { loggedInUser, following, serialized };
  } catch (e) {
    console.error(e);
    //  return { error: true, data: e.message };
    return exports.userInstaLogin(userName, userPass);
  }
};

exports.userInstaLogin = async (userName, userPass) => {
  try {
    const ig = new IgApiClient();
    // const userName = "abdoo.test2";
    // const userPass = "123456789B";

    ig.state.generateDevice(userName);

    // ig.request.defaults.agentClass = shttps; // apply agent class to request library defaults
    // ig.request.defaults.agentOptions = {
    //   // @ts-ignore
    //   hostname: '210.211.122.40', // proxy hostname
    //   port: 42669, // proxy port
    //   protocol: 'socks4:', // supported: 'socks:' , 'socks4:' , 'socks4a:' , 'socks5:' , 'socks5h:'
    //   //username: 'myProxyUser', // proxy username, optional
    //   //password: 'myProxyPassword123', // proxy password, optional
    // };

    // await ig.simulate.preLoginFlow();
    const loggedInUser = await ig.account.login(userName, userPass);
    // حفظ جلسة الحساب في ملف
    const serialized = await ig.state.serialize();
    //console.log(serialized);
    // fs.writeFileSync('session1.json', JSON.stringify(serialized));

    const followingFeed = ig.feed.accountFollowing(loggedInUser.pk);
    const following = await getAllItemsFromFeed(followingFeed);

    //ig.account.logout();
    return { loggedInUser, following, serialized };
  } catch (e) {
    const parts = e.message.split(";");
    const message = parts[1].trim();
    console.error(e);
    return { error: true, data: message };
  }
};

exports.userInstaLogin2 = async (userName, userPass) => {
  // Initiate Instagram API client
  const ig = new IgApiClient();
  // const userName = "abdoo.test2";
  // const userPass = "123456789B";
  ig.state.generateDevice(userName);

  //ig.request.defaults.agentClass = shttps; // apply agent class to request library defaults
  // ig.request.defaults.agentOptions = {
  //   // @ts-ignore
  //   hostname: "127.0.0.1", // proxy hostname
  //   port: 8000, // proxy port
  //   protocol: "socks:", // supported: 'socks:' , 'socks4:' , 'socks4a:' , 'socks5:' , 'socks5h:'
  //   //username: 'myProxyUser', // proxy username, optional
  //   //password: 'myProxyPassword123', // proxy password, optional
  // };

  await ig.simulate.preLoginFlow();

  let loggedInUser = await Bluebird.try(() =>
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
    .catch((e) => {
      // console.log(e.message);
      const parts = e.message.split(";");
      const message = parts[1].trim();
      console.error(
        "An error occurred while processing two factor auth",
        e,
        e.stack
      );
      return { error: true, data: message };
    });
  // await ig.simulate.postLoginFlow();

  return loggedInUser;
  // return ig;

  // res.send({
  //   error: true,
  //   loggedInUser,
  // });
};

exports.addFriendship = async (user, friendPk) => {
  try {
    const ig = new IgApiClient();
    // ig.state.generateDevice(user.username);
    // await ig.simulate.preLoginFlow();
    // const loggedInUser = await ig.account.login(user.userName, user.password);
    // const user = await Users.findOne({pk: user.pk});
    const serialized = user.session;
    await ig.state.deserialize(serialized);

    const friendship = await ig.friendship.create(friendPk);
    const search = await ig.user.info(friendPk);
    // ig.account.logout();
    return { friendship, search };
  } catch (e) {
    // const parts = e.message.split(";");
    // const message = parts[1].trim();
    console.error(e);
    return { error: true, data: e.message };
  }
};

exports.searchByUserName = async (user, friendUserName) => {
  try {
    const ig = new IgApiClient();
    // let search = await ig.user.info(friendUserName)

    const serialized = user.session;
    await ig.state.deserialize(serialized);

    // let search = await ig.user.searchExact(friendUserName);
    let search = await ig.user.usernameinfo(friendUserName);
    // let search = await ig.user.search(friendUserName);

    // ig.account.logout();

    return search;
  } catch (e) {
    // const parts = e.message.split(";");
    // const message = parts[1].trim();
    console.error(e);
    return { error: true, data: e.message };
  }
};

async function getAllItemsFromFeed(feed) {
  let items = [];
  do {
    items = items.concat(await feed.items());
  } while (feed.isMoreAvailable());
  return items;
}

////////////////////////// API ///////////////////////////////////////

exports.loginApi = async (req, res, isReturn = true) => {
  try {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    const response = await exports.userInstaGetStateLogin(username, password);
    // return res.send(response);
    if (response.error == true && isReturn) {
      return res.status(404).send(response);
    }

    const user = await Users.findOne({
      pk: response.loggedInUser.pk,
    });
    let decreasingPoints = 0;
    let timesUnfollow = 0;
    if (user) {
      let messageToken = req.body.messageToken;
      const token = await user.generateAuthToken();
      //   await userLogin(req, res, token);
      const updates = Object.keys(response.loggedInUser);
      updates.forEach((e) => (user[e] = response.loggedInUser[e]));
      let indexUsersRemove = [];
      for (let i = 0; i < user.following.length; i++) {
        const userElement = user.following[i];
        const friendIndex = response.following.findIndex(
          (e) => e["pk"] == userElement.pk
        );
        if (friendIndex == -1) {
          decreasingPoints = decreasingPoints + 2;
          timesUnfollow = timesUnfollow + 1;
          indexUsersRemove.push(i);
        }
      }
      for (let y = 0; y < indexUsersRemove.length; y++) {
        const element = indexUsersRemove[y];
        user.following.splice(element, 1);
      }

      user.userPoints = user.userPoints - decreasingPoints;
      user.timesUnfollow = user.timesUnfollow + timesUnfollow;
      (user.session = response.serialized), await user.save();
      if (isReturn) {
        return res.send({
          error: false,
          data: user,
          decreasingPoints,
          timesUnfollow,
          token,
          // response,
          // messageToken,
        });
      }
    } else {
      const boody = {
        pk: response.loggedInUser.pk,
        strong_id__: response.loggedInUser.strong_id__,
        full_name: response.loggedInUser.full_name,
        username: response.loggedInUser.username,
        is_private: response.loggedInUser.is_private,
        is_verified: response.loggedInUser.is_verified,
        is_business: response.loggedInUser.is_business,
        all_media_count: response.loggedInUser.all_media_count,
        phoneNumber: response.loggedInUser.phone_number,
        profile_pic_url: response.loggedInUser.profile_pic_url,
        password: password,
        session: response.serialized,
      };
      //  console.log(boody);
      const user2 = new Users(boody);
      await user2.save();
      const token = await user2.generateAuthToken();
      let messageToken = req.body.messageToken;
      if (isReturn) {
        res.send({
          error: false,
          data: user2,
          decreasingPoints,
          timesUnfollow,
          token,
          //response,
        });
      }
    }

    console.log("/pooost user");
  } catch (e) {
    console.error(e);
    let message = e.message;
    let emailVerified;
    if (message.toString().includes("Must be unique")) {
      message = "Users already registered";
    }
    if (isReturn) {
      res.status(400).send({ error: true, data: message });
    }
  }
};

//module.exports = router;
