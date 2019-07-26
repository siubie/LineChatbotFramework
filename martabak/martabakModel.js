var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Martabak = new Schema({
  nama: String,
  harga: Number,
  foto: String
});

mongoose.model("Martabak", Martabak);
