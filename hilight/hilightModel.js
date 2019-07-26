var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Hilight = new Schema({
  result: String,
  url: String,
  event: String
});

mongoose.model("Hilight", Hilight);
