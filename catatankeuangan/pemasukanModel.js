var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Pemasukan = new Schema({
  userId: String,
  kategori: String,
  masuk: Number
});

mongoose.model("Pemasukan", Pemasukan);
