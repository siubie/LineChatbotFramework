var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserRekening = new Schema({
  userId: String,
  username: String,
  state: String
});

mongoose.model("UserRekening", UserRekening);
