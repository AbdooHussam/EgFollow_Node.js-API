var admin = require("firebase-admin");
var serviceAccount = require("./chefs-recipe-store-firebase-adminsdk-a3tdj-68cca1567b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
