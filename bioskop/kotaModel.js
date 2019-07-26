var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Kota = new Schema({
  cidy: String,
  namaKota: String
});

mongoose.model("Kota", Kota);
