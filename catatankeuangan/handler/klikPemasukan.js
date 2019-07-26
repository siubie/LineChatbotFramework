var klikPemasukan = (module.exports = {
  message: async function(params) {
    let echo = {
      type: "text",
      text: "Silahkan pilih kategori pemasukan",
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max,w_53/v1536653774/goled.png",
            action: {
              type: "postback",
              label: "Gaji",
              data: "action=klikKategoriPemasukan&kategori=gaji"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Bonus",
              data: "action=klikKategoriPemasukan&kategori=bonus"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Lainnya",
              data: "action=klikKategoriPemasukan&kategori=lainnya"
            }
          }
        ]
      }
    };
    return echo;
  }
});
