var mongoose = require("mongoose");
require("../userKeuangan");
require("../pemasukanModel");
const UserKeuangan = mongoose.model("UserKeuangan");
const Pemasukan = mongoose.model("Pemasukan");

var masukkanPemasukan = (module.exports = {
  message: async function(event, kategori) {
    try {
      let duite = event.message.text;
      let createPemasukan = await Pemasukan.create({
        userId: event.source.userId,
        kategori: kategori,
        masuk: event.message.text
      });
    } catch (err) {
      console.log(err);
    }
  }
});
