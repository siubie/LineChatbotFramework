var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserBola = new Schema({
  userId: String,
  username: String,
  state: String
});

mongoose.model("UserBola", UserBola);
