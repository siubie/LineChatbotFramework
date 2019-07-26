var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserKeuangan = new Schema({
  userId: String,
  username: String,
  state: String
});

mongoose.model("UserKeuangan", UserKeuangan);
