const mongoose = require("mongoose");
const Users = require("../models/users_model");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const settingsSchema = new mongoose.Schema(
  {
    settingAid: { type: Number, required: true, trim: true, unique: true },
    followerPerPoints: { type: Number, required: true, trim: true },
    initNewUserPoints: { type: Number, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

settingsSchema.plugin(uniqueValidator, { data: "Must be unique" });
settingsSchema.plugin(arrayUniquePlugin);
settingsSchema.plugin(autoIncrement.plugin, {
  model: "Settings",
  field: "settingAid",
});
const Settings = mongoose.model("Settings", settingsSchema, "Settings");

module.exports = Settings;
