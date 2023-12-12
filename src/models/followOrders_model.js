const mongoose = require("mongoose");
const Users = require("../models/users_model");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const followOrdersSchema = new mongoose.Schema(
  {
    followOrderAid: { type: Number, required: true, trim: true, unique: true },
    followTo: {
      pk: { type: Number, required: true, trim: true, unique: true },
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

    orderFrom: { type: Number, required: true, trim: true, ref: "Users" },
    paidPoints: { type: Number, trim: true, required: true },
    targetFollowers: { type: Number, trim: true, required: true },
    currentFollowers: { type: Number, trim: true, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

followOrdersSchema.pre("save", async function (next) {
  if (this.isNew) {
    const user = await Users.findOne({ userAid: this.orderFrom });
    if (!user) {
      throw new Error("User Not Found");
    }
    if (user.userPoints >= this.paidPoints) {
      user.userPoints = user.userPoints - this.paidPoints;
      await user.save();
    } else {
      throw new Error("Your Points not enough");
    }
  }

  next();
});

followOrdersSchema.pre(/^find/, function (next) {
  this.populate({ path: "orderFrom", foreignField: "userAid" });

  next();
});

followOrdersSchema.plugin(uniqueValidator, { data: "Must be unique" });
followOrdersSchema.plugin(arrayUniquePlugin);
followOrdersSchema.plugin(autoIncrement.plugin, {
  model: "FollowOrders",
  field: "followOrderAid",
});
const FollowOrders = mongoose.model(
  "FollowOrders",
  followOrdersSchema,
  "FollowOrders"
);

module.exports = FollowOrders;
