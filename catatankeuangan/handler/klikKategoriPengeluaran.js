var klikKategoriPengeluaran = (module.exports = {
  message: async function(params, query) {
    let echo = {
      type: "text",
      text:
        "Anda memilih kategori " +
        query.kategori +
        " Silahkan memasukkan jumlah pengeluaran"
    };
    return echo;
  }
});
