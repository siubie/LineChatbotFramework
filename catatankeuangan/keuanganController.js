// hai | status pemasukan dan pengeluaran | quickreply tambah pemasukan,tambah pengeluaran
// qr pemasukan | masukkan nama pemasukan |
// input user nama pemasukan
// rep masukkan jumlah pemasukan
// rep | status pemasukan dan pengeluaran

var mongoose = require("mongoose");
const line = require("@line/bot-sdk");
const url = require("url");
require("./userKeuangan");
const UserKeuangan = mongoose.model("UserKeuangan");
//state
const defaultMessage = require("./messageDefault");
const klikPemasukan = require("./handler/klikPemasukan");
const klikKategoriPemasukan = require("./handler/klikKategoriPemasukan");
const masukkanPemasukan = require("./handler/masukkanPemasukan");
const masukkanPengeluaran = require("./handler/masukkanPengeluaran");
const klikPengeluaran = require("./handler/klikPengeluaran");
const klikKategoriPengeluaran = require("./handler/klikKategoriPengeluaran");
const config = {
  channelAccessToken:
    "Pi8N97aFcMlYoPqYI4MYmx9MEzxw5mnzGAVZxtZXSY7K4ZzbCibeR5rJKNZEW1ajoay4i6neF4+9J0XocshrjrSb1Zz93MaRoC2CNtHbJKxhrTgODDPmeROQq0K0ylaWnIebpMvfjX6hmuVf9FoWTgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "75a0b1120a8ceb670c332ec1bda58481"
};
const client = new line.Client(config);

var keuangan = (module.exports = {
  handleEvent: async function(event) {
    try {
      await keuangan.handleUser(event);
      switch (event.type) {
        case "message":
          const message = event.message;
          switch (message.type) {
            case "text":
              await keuangan.handleMessage(event);
              break;
            default:
              throw new Error(`Unknown message: ${JSON.stringify(message)}`);
          }
          break;
        case "postback":
          await keuangan.handlePostback(event);
          break;
        default:
          console.log(event);
          break;
      }
    } catch (err) {
      console.log(err);
    }
  },
  handleUserState: async function(event) {
    let userState = await UserKeuangan.findOne({ userId: event.source.userId });
    return userState.state;
  },
  handleUser: async function(event) {
    let userInfo = await keuangan.getUserInfo(event.source.userId);
    let userExist = await UserKeuangan.findOne({ userId: userInfo.userId });
    if (userExist == null) {
      let createUser = await UserKeuangan.create({
        userId: userInfo.userId,
        username: userInfo.displayName
      });
    }
  },
  getUserInfo: async function(userId) {
    try {
      let userInfo = await client.getProfile(userId);
      return userInfo;
    } catch (err) {
      console.log(err);
    }
  },
  updateState: async function(state, userId) {
    try {
      let updateState = await UserKeuangan.findOneAndUpdate(
        { userId: userId },
        { state: state }
      );
      let userInfo = await UserKeuangan.findOne({
        userId: userId
      });
      console.log("Current State: " + userInfo.state);
    } catch (err) {
      console.log(err);
    }
  },
  handleMessage: async function(event) {
    let echo = "";
    let userState = await keuangan.handleUserState(event);
    var url_parts = url.parse("?" + userState, true);
    var query = url_parts.query;
    switch (query.action) {
      case "klikKategoriPemasukan":
        await keuangan.updateState("masukkanPemasukan", event.source.userId);
        let masukkan = await masukkanPemasukan.message(event, query.kategori);
        echo = await defaultMessage.message(event);
        client.replyMessage(event.replyToken, echo);
        break;

      case "klikKategoriPengeluaran":
        await keuangan.updateState("masukkanPengeluaran", event.source.userId);
        let out = await masukkanPengeluaran.message(event, query.kategori);
        echo = await defaultMessage.message(event);
        client.replyMessage(event.replyToken, echo);
        break;

      default:
        await keuangan.updateState("kondisi", event.source.userId);
        echo = await defaultMessage.message(event);
        client.replyMessage(event.replyToken, echo);
        break;
    }
  },
  handlePostback: async function(event) {
    var url_parts = url.parse("?" + event.postback.data, true);
    var query = url_parts.query;
    let echo = "";
    await keuangan.updateState(event.postback.data, event.source.userId);
    switch (query.action) {
      case "klikPemasukan":
        echo = await klikPemasukan.message(event);
        client.replyMessage(event.replyToken, echo);
        break;
      case "klikKategoriPemasukan":
        echo = await klikKategoriPemasukan.message(event, query);
        client.replyMessage(event.replyToken, echo);
        break;
      case "klikPengeluaran":
        echo = await klikPengeluaran.message(event);
        client.replyMessage(event.replyToken, echo);
        break;
      case "klikKategoriPengeluaran":
        echo = await klikKategoriPengeluaran.message(event, query);
        client.replyMessage(event.replyToken, echo);
        break;
      default:
        break;
    }
  }
});
