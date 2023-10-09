const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const notificationSchema = new mongoose.Schema(
  {
    messageToken: { type: String, required: true, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: "Users",
    },
    messageDetails: [
      {
        title: { type: String, default: "", trim: true },
        body: { type: String, default: "", trim: true },
        longMessage: { type: String, default: "", trim: true },
        date: {
          type: Date,
          default: Date.now(),
        },
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

// //  change unique Error ( {PATH} {VALUE} {TYPE} )
notificationSchema.plugin(uniqueValidator, { data: "Must be unique" });

notificationSchema.pre(/^find/, function (next) {
  this.populate({ path: "userAid", foreignField: "userAid" });

  next();
});

const Notifications = mongoose.model(
  "Notifications",
  notificationSchema,
  "Notifications"
);

module.exports = Notifications;
