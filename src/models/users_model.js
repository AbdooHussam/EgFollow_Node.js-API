const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Settings = require("../models/settings_model");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const usersSchema = new mongoose.Schema(
  {
    userAid: { type: Number, required: true, trim: true, unique: true },
    pk: { type: Number, required: true, trim: true, unique: true },
    bioId: { type: String, default: "", trim: true, unique: true },
    isBioVerified: { type: Boolean, trim: true, default: false },
    biography: { type: String, default: "" },
    bioLinks: [String],
    // strong_id__: { type: String, required: true, trim: true, unique: true },
    full_name: { type: String, default: "" },
    username: { type: String, required: true, trim: true, unique: true },
    is_private: { type: Boolean, trim: true, default: false },
    is_verified: { type: Boolean, trim: true, default: false },
    is_business: { type: Boolean, trim: true, default: false },
    all_media_count: { type: Number, trim: true, default: 0 },
    followersCount: { type: Number, trim: true, default: 0 },
    followingCount: { type: Number, trim: true, default: 0 },
    session: { type: Object, default: {} },
    userPoints: { type: Number, trim: true, default: 0 },
    timesUnfollow: { type: Number, trim: true, default: 0 },
    following: [
      {
        pk: { type: Number, required: true, trim: true },
        biography: { type: String, default: "" },
        bioLinks: [String],
        full_name: { type: String, default: "" },
        username: { type: String, required: true, trim: true },
        is_private: { type: Boolean, trim: true, default: false },
        is_verified: { type: Boolean, trim: true, default: false },
        is_business: { type: Boolean, trim: true, default: false },
        all_media_count: { type: Number, trim: true, default: 0 },
        profile_pic_url: { type: String, trim: true, default: "" },
      },
    ],
    phoneNumber: { type: String, default: "", trim: true },
    profile_pic_url: { type: String, trim: true, default: "" },
    password: { type: String, default: "", trim: true },
    messageToken: { type: String, default: "", trim: true },
    passwordChangeAt: { type: Date, default: Date.now() },
    tokens: [
      {
        token: { type: String, required: true },
        date: { type: Date, default: Date.now() },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

usersSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.passwordChangeAt;
  delete userObject.tokens;

  return userObject;
};

usersSchema.methods.generateAuthToken = async function () {
  const user = this;
  // console.log(user._id + " asdasdasdasdasdsad");
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// usersSchema.statics.findByCredentials = async (username, password) => {
//   const user = await Users.findOne({ username: username });

//   if (!user) {
//     throw new Error("بيانات تسجيل الدخول غير صحيحة");
//   }
//   if (user.password !== password) {
//     throw new Error("بيانات تسجيل الدخول غير صحيحة");
//   }
//   return user;
// };

usersSchema.pre("save", async function (next) {
  const user = await Users.findById(this._id);
  if (user) {
    if (this.isModified("password") && this.password != user.password) {
      this.passwordChangeAt = Date.now();
      console.log("Paaas Chaange");
    }
  }
  if (this.isNew) {
    this.bioId = `${this._id}-EgFollow`;
    const setting = await Settings.findOne({ settingAid: 0 });
    this.userPoints = setting.initNewUserPoints;
  }

  if (!this.isModified("tokens") && this.isBioVerified == false) {
    console.log(this.biography);
    console.log("sssssssssssssssssssssssssssssssss");
    console.log(this.biography.includes(this.bioId));
    console.log(this.bioLinks.includes(this.bioId));
    if (
      !this.biography.includes(this.bioId) &&
      !this.bioLinks.includes(this.bioId)
    ) {
      this.isBioVerified = false;
      //throw new Error("Please add your Bio_Id to continue");
    } else {
      this.isBioVerified = true;
    }
  }

  next();
});

// usersSchema.pre(/^find/, function (next) {
//   this.populate({ path: "region", foreignField: "regionAid" });

//   next();
// });

usersSchema.plugin(uniqueValidator, { data: "Must be unique" });
usersSchema.plugin(arrayUniquePlugin);
usersSchema.plugin(autoIncrement.plugin, { model: "Users", field: "userAid" });
const Users = mongoose.model("Users", usersSchema, "Users");

module.exports = Users;
