var klikKategoriPemasukan = (module.exports = {
  message: async function(params, query) {
    let echo = {
      type: "text",
      text:
        "Anda memilih kategori " +
        query.kategori +
        " Silahkan memasukkan jumlah pemasukan"
    };
    return echo;
  }
});
