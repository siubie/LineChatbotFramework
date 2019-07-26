var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Pengeluaran = new Schema({
  userId: String,
  kategori: String,
  keluar: Number
});

mongoose.model("Pengeluaran", Pengeluaran);
