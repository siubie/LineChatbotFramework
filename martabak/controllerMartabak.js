var mongoose = require("mongoose");
const line = require("@line/bot-sdk");
const url = require("url");
const cherio = require("cherio");
const TextCleaner = require("text-cleaner");
var cloudinary = require("cloudinary");
var martabakSeed = require("./dataMartabak");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
require("./userMartabakModel");
require("./martabakModel");
require("./pesananModel");
const UserMartabak = mongoose.model("UserMartabak");
const Martabak = mongoose.model("Martabak");
const Pesanan = mongoose.model("Pesanan");
const configMartabak = {
  channelAccessToken:
    "eXnMUsYZxhuK06wb6B68fGjjlCL196utfqAjKllAcohTgHnTv1FMNrCQTXSALHZlojfFS9SnZH+OGxoSqFJo/Pj6TUK6k5xbJ8afUeQU/kZcl/XmZ0PnVc6ghsHTo7ZQvm65mnKgF1NFZT+ZtRSEOQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "55f0634dda4a567dcf66f0c61e5fec58"
};
const clientMartabak = new line.Client(configMartabak);

/*state 
1. List Martabak
2. Pesan 
3. Yes / No
4. Daftar Pesanan
5. Konfirmasi Pesanan
6. Upload Foto Pembayaran
7. Kode Pesanan
*/
var martabak = (module.exports = {
  handleEvent: async function(event) {
    try {
      await martabak.handleUser(event);
      switch (event.type) {
        case "message":
          const message = event.message;
          switch (message.type) {
            case "text":
              let echo = await martabak.handleMessage(event);
              return clientMartabak.replyMessage(event.replyToken, echo);
            case "image":
              var userState = await UserMartabak.findOne({
                userId: event.source.userId
              });
              if (
                userState.state == "addToCart" ||
                userState.state == "viewCart"
              ) {
                let echoImage = await martabak.handleImage(
                  message,
                  event.replyToken,
                  event
                );
                if (userState.isAdmin == true) {
                  let reply = await clientMartabak.replyMessage(
                    event.replyToken,
                    echoImage
                  );
                  let cartData = await martabak.handleShowCartAdmin(event);
                  return clientMartabak.pushMessage(userState.userId, cartData);
                } else {
                  return clientMartabak.replyMessage(
                    event.replyToken,
                    echoImage
                  );
                }
              } else {
                let echofail = {
                  type: "text",
                  text:
                    "Untuk upload bukti pembayaran melalui menu pada lihat pesanan"
                };
                return clientMartabak.replyMessage(event.replyToken, echofail);
              }
            default:
              throw new Error(`Unknown message: ${JSON.stringify(message)}`);
          }

          break;
        case "postback":
          let echoPostback = await martabak.handlePostback(event);
          break;
        default:
          console.log(event);
          break;
      }
    } catch (err) {
      console.log(err);
    }
  },
  handleUser: async function(event) {
    let userInfo = await martabak.getUserInfo(event.source.userId);
    let userExist = await UserMartabak.findOne({ userId: userInfo.userId });
    if (userExist == null) {
      let createUser = await UserMartabak.create({
        userId: userInfo.userId,
        username: userInfo.displayName
      });
    }
  },
  getUserInfo: async function(userId) {
    try {
      let userInfo = await clientMartabak.getProfile(userId);
      return userInfo;
    } catch (err) {
      console.log(err);
    }
  },
  handleImage: async function(message, replyToken, event) {
    const downloadPath = path.join(
      __dirname,
      "downloaded",
      `${message.id}.jpg`
    );
    await martabak.updateState("paymentProof", event.source.userId);
    let uploadData = await martabak.downloadContent(message.id, downloadPath);
    let updatePesanan = await Pesanan.updateMany(
      { userId: event.source.userId, userBayar: false },
      { userBayar: true, nomorBayar: message.id }
    );
    let echo = {
      type: "text",
      text:
        "Berhasil Upload Bukti Pembayaran, Nomor Pembayaran :" +
        message.id +
        " Pesanan anda sedang di periksa oleh admin",
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            action: {
              type: "message",
              label: "Lihat Menu",
              text: "menu"
            }
          }
        ]
      }
    };
    return echo;
  },
  downloadContent: async function(messageId, downloadPath) {
    return clientMartabak.getMessageContent(messageId).then(
      stream =>
        new Promise((resolve, reject) => {
          var streamCloudinary = cloudinary.v2.uploader.upload_stream(
            { public_id: "martabak_data/" + messageId },
            function(error, result) {
              if (!error) {
                resolve(result);
              }
            }
          );
          stream.pipe(streamCloudinary);
          // stream.on("end", () => resolve("success"));
          stream.on("error", reject);
        })
    );
  },
  updateState: async function(state, userId) {
    try {
      let updateState = await UserMartabak.findOneAndUpdate(
        { userId: userId },
        { state: state }
      );
      let userInfo = await UserMartabak.findOne({
        userId: userId
      });
      console.log("Current State: " + userInfo.state);
    } catch (err) {
      console.log(err);
    }
  },
  handleMessage: async function(event) {
    let echo = "";
    switch (event.message.text) {
      case "menu":
        await martabak.updateState("menu", event.source.userId);
        echo = await martabak.handleMenu(event);
        return echo;
        break;

      default:
        await martabak.updateState("menu", event.source.userId);
        echo = await martabak.handleMenu(event);
        return echo;
        break;
    }
  },
  handleMenu: async function(event) {
    let martabak = await Martabak.find({}).sort({ harga: 1 });
    const echo = {
      type: "flex",
      altText: "Daftar Menu",
      contents: {
        type: "carousel",
        contents: []
      },
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            action: {
              type: "postback",
              label: "Lihat Pesanan",
              data: "action=viewCart"
            }
          }
        ]
      }
    };
    let contentToAdd = [];
    for (item of martabak) {
      let soko = {
        type: "bubble",
        hero: {
          type: "image",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
          url: item.foto
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: item.nama,
              wrap: true,
              weight: "bold",
              size: "xl"
            },
            {
              type: "box",
              layout: "baseline",
              flex: 1,
              contents: [
                {
                  type: "text",
                  text: item.harga.toString(),
                  wrap: true,
                  weight: "bold",
                  size: "xl",
                  flex: 0
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              action: {
                type: "postback",
                label: "Add to Cart",
                data: "action=addToCart&idMenu=" + item._id
              }
            }
          ]
        }
      };
      contentToAdd.push(soko);
    }
    echo.contents.contents = contentToAdd;
    return echo;
  },
  handlePostback: async function(event) {
    var url_parts = url.parse("?" + event.postback.data, true);
    var query = url_parts.query;
    let echo = "";
    switch (query.action) {
      case "addToCart":
        echo = await martabak.handleAddToCart(event, query);
        return clientMartabak.replyMessage(event.replyToken, echo);
        //reply list item di cart
        //quick reply list menu sama checkout
        break;
      case "viewCart":
        await martabak.updateState("viewCart", event.source.userId);
        echo = await martabak.handleShowCart(event, query);
        return clientMartabak.replyMessage(event.replyToken, echo);
        //reply list item di cart
        //quick reply list menu sama checkout
        break;
      case "approvePayment":
        await martabak.updateState(query.action, event.source.userId);
        return martabak.handleApprovePayment(event, query);
        //reply resi pembayaran dan cara pembayaran
        //quick reply konfirmasi pembayaran list menu
        break;
      case "checkOut":
        await martabak.updateState(query.action, event.source.userId);
        //reply resi pembayaran dan cara pembayaran
        //quick reply konfirmasi pembayaran list menu
        break;
      case "paymentProof":
        await martabak.updateState(query.action, event.source.userId);
        //update status di cart
        //quick reply konfirmasi pembayaran list menu
        break;
      case "emptyCart":
        await martabak.updateState(query.action, event.source.userId);
        echo = martabak.handleEmptyCart(event, query);
        return echo;
        //update status di cart
        //quick reply konfirmasi pembayaran list menu
        break;
      default:
        break;
    }
  },
  handleApprovePayment: async function(event, query) {
    let updatePesanan = await Pesanan.updateMany(
      { nomorBayar: query.idPesanan },
      { adminBayar: true }
    );

    let userToNotify = await Pesanan.findOne({ nomorBayar: query.idPesanan });
    let idToNotify = userToNotify.userId;
    let echo = {
      type: "text",
      text:
        "Pesanan anda dengan nomor pemesanan " +
        query.idPesanan +
        " telah di approve oleh admin",

      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            action: {
              type: "message",
              label: "Lihat Menu",
              text: "menu"
            }
          }
        ]
      }
    };
    return clientMartabak.pushMessage(idToNotify, echo);
  },
  handleEmptyCart: async function(event, query) {
    try {
      let deleteAll = await Pesanan.deleteMany({
        userId: event.source.userId,
        userBayar: false
      });
      let echo = {
        type: "text",
        text: "Pesanan Berhasil Dihapus",
        quickReply: {
          // ②
          items: [
            {
              type: "action", // ③
              action: {
                type: "message",
                label: "Lihat Menu",
                text: "menu"
              }
            },
            {
              type: "action", // ③
              action: {
                type: "postback",
                label: "Lihat Pesanan",
                data: "action=viewCart"
              }
            }
          ]
        }
      };
      return echo;
    } catch (err) {}
  },
  handleAddToCart: async function(event, query) {
    try {
      await martabak.updateState("addToCart", event.source.userId);
      let dataMartabak = await Martabak.findById(query.idMenu);
      let createPesanan = await Pesanan.create({
        userId: event.source.userId,
        nama: dataMartabak.nama,
        harga: dataMartabak.harga,
        userBayar: false,
        adminBayar: false
      });
      let echo = await martabak.handleShowCart(event);
      return echo;
    } catch (err) {
      console.log(err);
    }
  },
  handleShowCartAdmin: async function(event) {
    let listPesanan = await Pesanan.find({
      userBayar: true,
      adminBayar: false,
      nomorBayar: event.message.id
    });

    let jp = listPesanan.length;
    let userInfo = await martabak.getUserInfo(listPesanan[0].userId);
    let echo = {
      type: "flex",
      altText: "Pesanan Baru Jurgan",
      contents: {
        type: "bubble",
        styles: {
          footer: {
            separator: true
          }
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "Kode Pesanan " + event.message.id,
              weight: "bold",
              color: "#1DB446",
              size: "sm"
            },
            {
              type: "text",
              text: userInfo.displayName,
              weight: "bold",
              size: "xxl",
              margin: "md"
            },
            {
              type: "separator",
              margin: "xxl"
            },
            {
              type: "box",
              layout: "vertical",
              margin: "xxl",
              spacing: "sm",
              contents: []
            }
          ]
        }
      },
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            action: {
              type: "message",
              label: "Lihat Menu",
              text: "menu"
            }
          }
        ]
      }
    };
    let totalHarga = 0;
    for (item of listPesanan) {
      let itemList = {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: item.nama,
            size: "sm",
            color: "#555555",
            flex: 0
          },
          {
            type: "text",
            text: "Rp " + item.harga.toString(),
            size: "sm",
            color: "#111111",
            align: "end"
          }
        ]
      };
      totalHarga += item.harga;
      echo.contents.body.contents[3].contents.push(itemList);
    }

    let separator = {
      type: "separator",
      margin: "xxl"
    };

    let jumlahPesanan = {
      type: "box",
      layout: "horizontal",
      margin: "xxl",
      contents: [
        {
          type: "text",
          text: "ITEMS",
          size: "sm",
          color: "#555555"
        },
        {
          type: "text",
          text: jp.toString(),
          size: "sm",
          color: "#111111",
          align: "end"
        }
      ]
    };

    let total = {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: "TOTAL",
          size: "sm",
          color: "#555555"
        },
        {
          type: "text",
          text: totalHarga.toString(),
          size: "sm",
          color: "#111111",
          align: "end"
        }
      ]
    };

    let approveButton = {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          action: {
            type: "postback",
            label: "Approve Payment",
            data: "action=approvePayment&idPesanan=" + event.message.id
          }
        }
      ]
    };
    echo.contents.body.contents[3].contents.push(separator);
    echo.contents.body.contents[3].contents.push(jumlahPesanan);
    echo.contents.body.contents[3].contents.push(total);
    echo.contents.body.contents[3].contents.push(approveButton);
    return echo;
  },
  handleShowCart: async function(event) {
    let listPesanan = await Pesanan.find({
      userId: event.source.userId,
      userBayar: false,
      adminBayar: false
    });

    let jp = listPesanan.length;
    let echo = {
      type: "flex",
      altText: "Daftar Pesanan",
      contents: {
        type: "bubble",
        styles: {
          footer: {
            separator: true
          }
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "PESANAN",
              weight: "bold",
              color: "#1DB446",
              size: "sm"
            },
            {
              type: "text",
              text: "Martabak Bahari",
              weight: "bold",
              size: "xxl",
              margin: "md"
            },
            {
              type: "text",
              text: "Jalan Saxofone Malang",
              size: "xs",
              color: "#aaaaaa",
              wrap: true
            },
            {
              type: "separator",
              margin: "xxl"
            },
            {
              type: "box",
              layout: "vertical",
              margin: "xxl",
              spacing: "sm",
              contents: []
            }
          ]
        }
      },
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            action: {
              type: "message",
              label: "Lihat Menu",
              text: "menu"
            }
          },
          {
            type: "action", // ③
            action: {
              type: "postback",
              label: "Hapus Pesanan",
              data: "action=emptyCart"
            }
          },
          {
            type: "action", // ③
            action: {
              type: "cameraRoll",
              label: "Upload Pembayaran"
            }
          }
        ]
      }
    };
    let totalHarga = 0;
    for (item of listPesanan) {
      let itemList = {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: item.nama,
            size: "sm",
            color: "#555555",
            flex: 0
          },
          {
            type: "text",
            text: "Rp " + item.harga.toString(),
            size: "sm",
            color: "#111111",
            align: "end"
          }
        ]
      };
      totalHarga += item.harga;
      echo.contents.body.contents[4].contents.push(itemList);
    }

    let separator = {
      type: "separator",
      margin: "xxl"
    };

    let jumlahPesanan = {
      type: "box",
      layout: "horizontal",
      margin: "xxl",
      contents: [
        {
          type: "text",
          text: "ITEMS",
          size: "sm",
          color: "#555555"
        },
        {
          type: "text",
          text: jp.toString(),
          size: "sm",
          color: "#111111",
          align: "end"
        }
      ]
    };

    let total = {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: "TOTAL",
          size: "sm",
          color: "#555555"
        },
        {
          type: "text",
          text: totalHarga.toString(),
          size: "sm",
          color: "#111111",
          align: "end"
        }
      ]
    };
    echo.contents.body.contents[4].contents.push(separator);
    echo.contents.body.contents[4].contents.push(jumlahPesanan);
    echo.contents.body.contents[4].contents.push(total);
    return echo;
  },
  seedMartabak: async function(req, res) {
    martabakSeed.forEach(function(item) {
      new Martabak({
        nama: item.nama,
        harga: item.harga,
        foto: item.foto
      }).save(function(err, kota) {
        if (err) {
          res.json(err);
        } else {
          console.log(kota);
        }
      });
    });
  }
});
