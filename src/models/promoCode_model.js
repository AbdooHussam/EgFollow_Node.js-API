const mongoose = require("mongoose");
const Users = require("../models/users_model");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const promoCodeSchema = new mongoose.Schema(
  {
    promoCodeAid: { type: Number, required: true, trim: true, unique: true },
    promoCode: { type: String, required: true, unique: true },
    giftPoints: { type: Number, required: true, trim: true },
    isActive: { type: Boolean, trim: true, default: true },
    users: [{ type: Number, ref: "Users" }],
  },
  {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

// followOrdersSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const user = await Users.findOne({ userAid: this.orderFrom });
//     if (!user) {
//       throw new Error("User Not Found");
//     }
//     if (user.userPoints >= this.paidPoints) {
//       user.userPoints = user.userPoints - this.paidPoints;
//       await user.save();
//     } else {
//       throw new Error("Your Points not enough");
//     }
//   }

//   next();
// });

// followOrdersSchema.pre(/^find/, function (next) {
//   this.populate({ path: "orderFrom", foreignField: "userAid" });

//   next();
// });

promoCodeSchema.plugin(uniqueValidator, { data: "Must be unique" });
promoCodeSchema.plugin(arrayUniquePlugin);
promoCodeSchema.plugin(autoIncrement.plugin, {
  model: "PromoCodes",
  field: "promoCodeAid",
});
const PromoCode = mongoose.model("PromoCodes", promoCodeSchema, "PromoCodes");

module.exports = PromoCode;
