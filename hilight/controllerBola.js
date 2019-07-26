var mongoose = require("mongoose");
const line = require("@line/bot-sdk");
const url = require("url");
const cherio = require("cherio");
const TextCleaner = require("text-cleaner");
require("./userBola");
require("./hilightModel");
var request = require("request").defaults({
  strictSSL: false,
  rejectUnauthorized: false
});
var safeEval = require("safe-eval");
const UserBola = mongoose.model("UserBola");
const Hilight = mongoose.model("Hilight");
const configBola = {
  channelAccessToken:
    "CgA1CuZGCD2KfMd8KIYPokTJzggLML2yOC07vuyrBi/yIPknVlySPlWOb5dkOHixhlSEkQaerYVnSkKt6//UNMhWQUrenwMX7BrI9h7bZOZp/OgXN1j0y9QcMMqbap8OcZEOLuA3GBAQ9IoNJR9yXQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "e2bcb3bb6aaf14a23deef6feda6cd19f"
};
const clientBola = new line.Client(configBola);

var bola = (module.exports = {
  handleEvent: async function(event) {
    try {
      await bola.handleUser(event);
      switch (event.type) {
        case "message":
          let echo = await bola.handleMessage(event);
          await bola.updateState("listBola", event.source.userId);
          return clientBola.replyMessage(event.replyToken, echo);
          break;
        case "postback":
          let echoPostback = await bola.handlePostback(event);
          return clientBola.replyMessage(event.replyToken, echoPostback);
          break;
        default:
          break;
      }
    } catch (err) {
      console.log(err);
    }
  },
  handleUser: async function(event) {
    let userInfo = await bola.getUserInfo(event.source.userId);
    let userExist = await UserBola.findOne({ userId: userInfo.userId });
    if (userExist == null) {
      let createUser = await UserBola.create({
        userId: userInfo.userId,
        username: userInfo.displayName
      });
    }
  },
  getUserInfo: async function(userId) {
    try {
      let userInfo = await clientBola.getProfile(userId);
      return userInfo;
    } catch (err) {
      console.log(err);
    }
  },
  updateState: async function(state, userId) {
    try {
      let updateState = await UserBola.findOneAndUpdate(
        { userId: userId },
        { state: state }
      );
      let userInfo = await UserBola.findOne({
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
      case "score":
        echo = bola.handleScore(event);
        return echo;
        break;

      default:
        echo = bola.handleScore(event);
        return echo;
        break;
    }
  },
  handleScore: async function(event) {
    try {
      let echo = {
        type: "flex",
        altText: "Hilight",
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: []
          }
        },
        quickReply: {
          // ②
          items: [
            {
              type: "action", // ③
              action: {
                type: "message",
                label: "Lihat Score",
                text: "score"
              }
            }
          ]
        }
      };
      let scoreDb = await Hilight.find({});
      let contentToAdd = [
        {
          type: "text",
          text: "Pilih pada score untuk melihat detail",
          wrap: true
        },
        {
          type: "separator",
          margin: "xxl"
        }
      ];
      for (item of scoreDb) {
        let soko = {
          type: "text",
          text: item.result,
          wrap: true,
          action: {
            type: "postback",
            label: "test",
            data: "action=pilihMatch&idMatch=" + item._id
          }
        };
        let separator = {
          type: "separator",
          margin: "xl"
        };
        contentToAdd.push(soko);
        contentToAdd.push(separator);
      }
      echo.contents.body.contents = contentToAdd;
      return echo;
    } catch (err) {
      console.log(err);
    }
  },
  handlePostback: async function(event) {
    var url_parts = url.parse("?" + event.postback.data, true);
    var query = url_parts.query;
    switch (query.action) {
      case "pilihMatch":
        await bola.updateState("pilihMatch", event.source.userId);
        let dataMatch = await bola.handleDataMatch(query.idMatch);
        return dataMatch;
        break;

      default:
        break;
    }
  },
  handleDataMatch: async function(idMatch) {
    try {
      let matchDetail = await Hilight.findById(idMatch);
      let matchUrl = matchDetail.url;
      let detailPage = await bola.scrapeScorePromise(matchUrl);
      let $ = cherio.load(detailPage);
      // let teamLogos = $(".mph-teamlogo").length;
      // console.log(teamLogos);
      let raw = detailPage.split("DataStore.match = ");
      let rawBaru = raw[1].split("</script>");
      let rawFix = rawBaru[0];
      let data = safeEval(rawFix);
      let echo = {
        type: "flex",
        altText: "Detail Pertandingan",
        contents: {
          type: "bubble",
          hero: {
            type: "image",
            url:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/v1537884539/hilight.png",
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
            action: {
              type: "uri",
              uri: "https://linecorp.com"
            }
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            action: {
              type: "uri",
              uri: "https://linecorp.com"
            },
            contents: [
              {
                type: "text",
                text: "Hilight Pertandingan",
                size: "xl",
                weight: "bold"
              },
              {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                  //home team
                  //home score
                  //away team
                  //away score
                ]
              },
              {
                type: "text",
                text:
                  "Referee :" +
                  data.refereeName +
                  " | Stadium : " +
                  data.venueName,
                wrap: true,
                color: "#aaaaaa",
                size: "xxs"
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
                label: "Lihat Score",
                text: "score"
              }
            }
          ]
        }
      };
      let homeTeamInfo = {
        type: "box",
        layout: "baseline",
        contents: [
          {
            type: "text",
            text: data.homeTeam.name,
            weight: "bold",
            margin: "sm",
            flex: 0
          },
          {
            type: "text",
            text: data.homeScore,
            weight: "bold",
            size: "sm",
            align: "end"
          }
        ]
      };

      let awayTeamInfo = {
        type: "box",
        layout: "baseline",
        contents: [
          {
            type: "text",
            text: data.awayTeam.name,
            weight: "bold",
            margin: "sm",
            flex: 0
          },
          {
            type: "text",
            text: data.awayScore,
            size: "sm",
            align: "end",
            weight: "bold"
          }
        ]
      };
      echo.contents.body.contents[1].contents.push(homeTeamInfo);
      let test = Object.keys(data.incidents);
      for (item of test) {
        if (
          data.incidents[item].code.category == "g" &&
          data.incidents[item].side == "home"
        ) {
          console.log(data.incidents[item].player.name);
          let homeGoal = {
            type: "text",
            text: data.incidents[item].player.name,
            size: "sm",
            align: "end",
            color: "#aaaaaa"
          };
          echo.contents.body.contents[1].contents.push(homeGoal);
        }
      }
      echo.contents.body.contents[1].contents.push(awayTeamInfo);
      for (item of test) {
        if (
          data.incidents[item].code.category == "g" &&
          data.incidents[item].side == "away"
        ) {
          console.log(data.incidents[item].player.name);
          let awayGoal = {
            type: "text",
            text: data.incidents[item].player.name,
            size: "sm",
            align: "end",
            color: "#aaaaaa"
          };
          echo.contents.body.contents[1].contents.push(awayGoal);
        }
      }
      return echo;
    } catch (err) {
      console.log(err);
    }
  },
  scrapeList: async function(req, res) {
    let url = "http://footyroom.com/";
    let result = await bola.scrapeListPromise(url);
    let $ = cherio.load(result);
    const list = $("#infinite-scroll .card-title .spoiler");
    var jsonReturn = [];
    Hilight.deleteMany({}).then(function() {
      list.each(function(i, elem) {
        new Hilight({
          result: $(this).text(),
          url: $(this).attr("href")
        }).save(function(err, hilight) {
          console.log(hilight);
          jsonReturn.push(hilight);
        });
      });
    });

    return res.json(jsonReturn);
  },
  scrapeScore: async function(req, res) {
    let result = await bola.scrapeScorePromise();
    return res.json(result);
  },
  scrapeListPromise: function(url) {
    return new Promise(function(resolve, reject) {
      request(url, function(error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  },
  scrapeScorePromise: function(url) {
    return new Promise(function(resolve, reject) {
      request(url, function(error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  }
});
