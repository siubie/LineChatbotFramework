var mongoose = require("mongoose");
require("../userKeuangan");
require("../pengeluaranModel");
const UserKeuangan = mongoose.model("UserKeuangan");
const Pengeluaran = mongoose.model("Pengeluaran");

var masukkanPengeluaran = (module.exports = {
  message: async function(event, kategori) {
    try {
      let duite = event.message.text;
      let createPengeluaran = await Pengeluaran.create({
        userId: event.source.userId,
        kategori: kategori,
        keluar: event.message.text
      });
    } catch (err) {
      console.log(err);
    }
  }
});
