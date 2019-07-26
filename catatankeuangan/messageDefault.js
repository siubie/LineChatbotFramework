var mongoose = require("mongoose");
require("./userKeuangan");
require("./pemasukanModel");
require("./pengeluaranModel");
const UserKeuangan = mongoose.model("UserKeuangan");
const Pemasukan = mongoose.model("Pemasukan");
const Pengeluaran = mongoose.model("Pengeluaran");
var defaultMessage = (module.exports = {
  message: async function(event) {
    let totalPemasukan = await Pemasukan.aggregate([
      {
        $match: {
          userId: event.source.userId
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$masuk"
          }
        }
      }
    ]);
    let totalPengeluaran = await Pengeluaran.aggregate([
      {
        $match: {
          userId: event.source.userId
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$keluar"
          }
        }
      }
    ]);
    let tpeng = 0;
    let tmas = 0;
    if (totalPengeluaran.length == 0) {
      tpeng = 0;
    } else {
      tpeng = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "IDR"
      }).format(totalPengeluaran[0].total);
    }
    if (totalPemasukan.length == 0) {
      tmas = 0;
    } else {
      tmas = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "IDR"
      }).format(totalPemasukan[0].total);
    }
    let echo = {
      type: "text",
      text:
        "Hai Juragan ini status keuangan kita hari ini \n Pemasukan : " +
        tmas +
        " \n Pengeluaran : " +
        tpeng,
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max,w_53/v1536653774/goled.png",
            action: {
              type: "postback",
              label: "Pemasukan",
              data: "action=klikPemasukan"
            }
          },
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
            action: {
              type: "postback",
              label: "Pengeluaran",
              data: "action=klikPengeluaran"
            }
          }
        ]
      }
    };

    return echo;
  }
});
