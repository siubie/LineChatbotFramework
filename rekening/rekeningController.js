var mongoose = require("mongoose");
require("./bankModel");
require("./userRekeningModel");
const cherio = require("cherio");
const TextCleaner = require("text-cleaner");
const url = require("url");
const line = require("@line/bot-sdk");
var request = require("request").defaults({
  strictSSL: false,
  rejectUnauthorized: false
});
const rekeningSeed = require("./dataBank");
const Bank = mongoose.model("Bank");
const UserRekening = mongoose.model("UserRekening");
const configRekening = {
  channelAccessToken:
    "VI2r8yo7v7fmi9HtBmz9s5mnAMXZyV1I056oc534l1H/KYQvz3nV1xX4jaBELf8InoB6CGGQKEvgibEduuua5vqo0p55xf6P3YKFaWDBgGA4pLHIS6z+b1DZ8st5fHpb2LwCYXiKI3DMqkmr/HhHbgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "b4b3749ec26951874413b6901d78aaa4"
};
const clientRekening = new line.Client(configRekening);
var user_agent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20";
var Browser = require("zombie");
var browser = new Browser({
  userAgent: user_agent,
  debug: true,
  waitFor: 10000
});

var rekening = (module.exports = {
  handleEvent: async function(event) {
    try {
      let userInfo = await rekening.getUserInfo(event.source.userId);
      let userExist = await UserRekening.findOne({ userId: userInfo.userId });
      if (userExist == null) {
        let createUser = await UserRekening.create({
          userId: userInfo.userId,
          username: userInfo.displayName
        });
      }
      if (event.type == "message") {
        let userInfoDb = await UserRekening.findOne({
          userId: event.source.userId
        });
        var url_parts = url.parse("?" + userInfoDb.state, true);
        var query = url_parts.query;
        let echo = "";
        switch (query.action) {
          case "pilihBank":
            echo = await rekening.returnCheckBank(
              query.kodeBank,
              event.message.text
            );
            rekening.updateState("", event.source.userId);
            break;
          default:
            rekening.updateState("", event.source.userId);
            echo = await rekening.returnDefault();
            break;
        }
        return clientRekening.replyMessage(event.replyToken, echo);
      } else if (event.type == "postback") {
        var url_parts = url.parse("?" + event.postback.data, true);
        var query = url_parts.query;
        switch (query.action) {
          case "daftarBank":
            await rekening.updateState(
              event.postback.data,
              event.source.userId
            );
            let echo = await rekening.returnDaftarBank();
            return clientRekening.replyMessage(event.replyToken, echo);
            break;
          case "pilihBank":
            await rekening.updateState(
              event.postback.data,
              event.source.userId
            );
            let bank = await Bank.findOne({ kodeBank: query.kodeBank });

            let echoPilih = {
              type: "text",
              text:
                "Anda Memilih " +
                bank.namaBank +
                " Silahkan Masukkan Nomor Rekening"
            };
            return clientRekening.replyMessage(event.replyToken, echoPilih);
            break;
          default:
            console.log("default");
            break;
        }
      } else if (event.type == "follow") {
        await rekening.followCallback(event);
      } else if (event.type == "unfollow") {
        await rekening.unfollowCallback(event);
      }
    } catch (err) {
      console.log(err);
    }
  },
  tesaxios: function(kodeBank, norek) {
    return new Promise(function(resolve, reject) {
      let url =
        "https://cekrekening.id/search?bank_id=" +
        kodeBank +
        "&account_number=" +
        norek;
      request(url, function(error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  },
  returnCheckBank: async function(kodeBank, norek) {
    try {
      let result = await rekening.tesaxios(kodeBank, norek);
      let $ = cherio.load(result);
      let bank = await Bank.findOne({ kodeBank: kodeBank });
      let soko = $(".mb10.mt30").text();
      let syokoks = $(".mb10.mt0").text();
      soko = TextCleaner(soko).condense();
      let add = $(".col-sm-12.list-table ul li").text();
      let kratos = $(".mb10.mt30 p").text();
      add = TextCleaner(add).condense();
      if (add) {
        syokoks = syokoks + add;
      }
      if (kratos) {
        syokoks = syokoks + kratos;
      }
      let echoCheck = {
        type: "text",
        text:
          "Nama bank " +
          bank.namaBank +
          " Nomor Rekening :" +
          norek +
          " menurut cekrekening.id rekening ini : \n" +
          syokoks,
        quickReply: {
          items: [
            {
              type: "action", // ③
              imageUrl: "https://example.com/sushi.png",
              action: {
                type: "postback",
                label: "Daftar Bank",
                data: "action=daftarBank"
              }
            }
          ]
        }
      };
      return echoCheck;
    } catch (err) {
      console.log(err);
    }
  },
  updateState: async function(state, userId) {
    try {
      let updateState = await UserRekening.findOneAndUpdate(
        { userId: userId },
        { state: state }
      );
      let userInfo = await UserRekening.findOne({
        userId: userId
      });
      console.log("Current State: " + userInfo.state);
    } catch (err) {
      console.log(err);
    }
  },
  resetState: async function(userId) {
    try {
      await UserRekening.findOneAndUpdate({ userId: userId }, { state: "" });
    } catch (err) {}
  },
  followCallback: async function(event) {
    let userInfo = await rekening.getUserInfo(event.source.userId);
  },
  unfollowCallback: async function(event) {
    let userInfo = await rekening.getUserInfo(event.source.userId);
    console.log(userInfo);
  },
  getUserInfo: async function(userId) {
    try {
      console.log(userId);
      let userInfo = await clientRekening.getProfile(userId);
      return userInfo;
    } catch (err) {
      console.log(err);
    }
  },
  returnDaftarBank: async function() {
    try {
      let echo = {
        type: "flex",
        altText: "Daftar Bank",
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: []
          }
        }
      };
      let banks = await Bank.find({}).sort({ namaKota: 1 });

      let contentToAdd = [];
      for (item of banks) {
        let soko = {
          type: "button",
          style: "primary",
          action: {
            type: "postback",
            label: item.namaBank,
            data: "action=pilihBank&kodeBank=" + item.kodeBank
          }
        };
        contentToAdd.push(soko);
      }
      echo.contents.body.contents = contentToAdd;
      return echo;
    } catch (err) {
      console.log(err);
    }
  },
  returnDefault: async function() {
    let echo = {
      type: "text", // ①
      text: "Hai juragan mau cek rekening ?",
      quickReply: {
        items: [
          {
            type: "action", // ③
            imageUrl: "https://example.com/sushi.png",
            action: {
              type: "postback",
              label: "Daftar Bank",
              data: "action=daftarBank"
            }
          }
        ]
      }
    };
    return echo;
  },
  seedBank: async function() {
    rekeningSeed.forEach(function(item) {
      new Bank({
        kodeBank: item.kodeBank,
        namaBank: item.namaBank
      }).save(function(err, bank) {
        if (err) {
          res.json(err);
        } else {
          console.log(bank);
        }
      });
    });
  },
  soko: async function(req, res) {
    return res.json("soko");
  }
});
