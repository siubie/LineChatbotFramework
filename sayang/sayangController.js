var mongoose = require("mongoose");
const url = require("url");
const line = require("@line/bot-sdk");
const configSayang = {
  channelAccessToken:
    "Brrs1S4W6kJ6Z7qEzGKPxBMrHsJrAuTlOm+o38GjMTZrMbZVgxh30QHIKwopvsxzzlAlYCpvTU8qUMNFyRS5QvUBzOZpgtALOLtDyRhkC4zjCeEmfTXcQ0i1mqEPlF8ktzKE6hUm6DS8jl5s4NIMNgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "de8db90537854cda81db5ee20a8796b4"
};
const clientSayang = new line.Client(configSayang);
var sayang = (module.exports = {
  handleEvent: async function(event) {
    try {
      //   console.log(event);
      let echo = sayang.returnDefault();
      return clientSayang.replyMessage(event.replyToken, echo);
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
  returnDefault: async function() {
    let echo = {
      type: "text", // ①
      text: "Hai juragan mau cek rekening ?"
    };
    return echo;
  }
});
