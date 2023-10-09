const mongoose = require("mongoose");
const validator = require("validator");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const cartsSchema = new mongoose.Schema(
  {
    cartAid: { type: Number, required: true, trim: true, unique: true },
    recipeAid: {
      type: Number,
      required: true,
      trim: true,
      ref: "Recipes",
      // refPath: "userAid",
    },
    chefAid: {
      type: Number,
      required: true,
      trim: true,
      ref: "Chefs",
      // refPath: "userAid",
    },
    userAid: {
      type: Number,
      required: true,
      trim: true,
      ref: "Users",
      // refPath: "userAid",
    },
    quantity: { type: Number, required: true, trim: true },
    price: { type: Number, required: true, trim: true },
    totalPrice: { type: Number, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    //  toJSON: { virtuals: true },
    //  toObject: { virtuals: true },
  }
);

// cartsSchema.pre("save", async function (next) {
//   const recipe = await Recipes.findOne({ recipeAid: this.recipeAid });
//   if (!recipe) {
//     throw new Error("الوصفة غير موجودة");
//   }
//   this.totalPrice = recipe.price * this.quantity;
//   this.price = recipe.price;

//   next();
// });

//  change unique Error ( {PATH} {VALUE} {TYPE} )
cartsSchema.plugin(uniqueValidator, { data: "Must be unique" });
cartsSchema.plugin(arrayUniquePlugin);
cartsSchema.plugin(autoIncrement.plugin, {
  model: "Carts",
  field: "cartAid",
});

const Carts = mongoose.model("Carts", cartsSchema, "Carts");

module.exports = Carts;
