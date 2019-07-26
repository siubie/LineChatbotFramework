var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Bank = new Schema({
  kodeBank: String,
  namaBank: String
});

mongoose.model("Bank", Bank);
