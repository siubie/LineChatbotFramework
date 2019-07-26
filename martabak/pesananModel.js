var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Pesanan = new Schema({
  userId: String,
  nama: String,
  harga: Number,
  userBayar: Boolean,
  adminBayar: Boolean,
  nomorBayar: String
});

mongoose.model("Pesanan", Pesanan);
