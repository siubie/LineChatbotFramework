var klikPengeluaran = (module.exports = {
  message: async function(event) {
    let echo = {
      type: "text",
      text: "Silahkan pilih kategori pengeluaran",
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max,w_53/v1536653774/goled.png",
            action: {
              type: "postback",
              label: "Makanan",
              data: "action=klikKategoriPengeluaran&kategori=makanan"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Tagihan",
              data: "action=klikKategoriPengeluaran&kategori=tagihan"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Pendidikan",
              data: "action=klikKategoriPengeluaran&kategori=pendidikan"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Transportasi",
              data: "action=klikKategoriPengeluaran&kategori=transportasi"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Transportasi",
              data: "action=klikKategoriPengeluaran&kategori=transportasi"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Hiburan",
              data: "action=klikKategoriPengeluaran&kategori=hiburan"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Lainnya",
              data: "action=klikKategoriPengeluaran&kategori=lainnya"
            }
          }
        ]
      }
    };
    return echo;
  }
});
