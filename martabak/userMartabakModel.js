var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserMartabak = new Schema({
  userId: String,
  username: String,
  state: String,
  isAdmin: Boolean
});

mongoose.model("UserMartabak", UserMartabak);
