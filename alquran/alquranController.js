const line = require("@line/bot-sdk");
var url = require("url");
const axios = require("axios");
const configAlquran = {
  channelAccessToken:
    "YZq/IktHieJjxy57akj0Tv0vamwldYmlKcNd51pFOtSePab5HMePqlk0JZdlzk4tVBx/0vk7UeWDNtgbScnFZh6+g0dsmuGMbmsh5sKbsBUWghYzqSeQK798iwWI5OpW/SpFm4Tptr5+hab4LBAsKgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "17b2826bce31ef0ccc43742bbece88f1"
};
const clientAlquran = new line.Client(configAlquran);
var alquran = (module.exports = {
  handleEvent: async function(event) {
    try {
      if (event.type == "message") {
        let sokos = event.message.text;
        if (event.message.text == "Juz") {
          let echo = await alquran.returnListJuz();
          return clientAlquran.replyMessage(event.replyToken, echo);
        } else if (sokos.includes("Juz ")) {
          let noJuz = event.message.text.split(" ");
          noJuz = noJuz[1];
          let echo = await alquran.returnListSurah(noJuz);
          return clientAlquran.replyMessage(event.replyToken, echo);
        } else {
          let echo = await alquran.returnDefault();
          return clientAlquran.replyMessage(event.replyToken, echo);
        }
      } else if (event.type == "postback") {
        var url_parts = url.parse("?" + event.postback.data, true);
        var query = url_parts.query;
        switch (query.action) {
          case "readSurah":
            let ayahId;
            if (query.ayahId != null) {
              ayahId = query.ayahId;
            } else {
              ayahId = 0;
            }
            let echo = await alquran.returnReadAyahOfSurah(
              query.surahId,
              ayahId
            );
            return clientAlquran.replyMessage(event.replyToken, echo);
            break;

          default:
            console.log("default");
            break;
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
  returnReadAyahOfSurah: async function(surahId, ayahId) {
    let response = await axios.get(
      "http://api.alquran.cloud/surah/" + surahId + "/ar.alafasy"
    );
    // console.log(response.data.data.englishName);
    // console.log(response.data.data.ayahs[ayahId]);
    let nextAyah = parseInt(ayahId) + 1;
    console.log("next ayah =" + nextAyah);
    let echo = {
      type: "flex",
      altText: response.data.data.englishName,
      contents: {
        type: "bubble",
        direction: "rtl",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: response.data.data.ayahs[ayahId].text,
              size: "xl",
              wrap: true
            }
          ]
        }
      }
    };

    let quickReply = {
      items: [
        {
          type: "action", // ③
          imageUrl: "https://example.com/sushi.png",
          action: {
            type: "message",
            label: "Daftar Juz",
            text: "Juz"
          }
        }
      ]
    };
    let nextAyahQr = {
      type: "action",
      action: {
        type: "postback",
        label: "Ayat Selanjutnya",
        data: "action=readSurah&surahId=" + surahId + "&ayahId=" + nextAyah
      }
    };
    if (nextAyah < response.data.data.numberOfAyahs) {
      quickReply.items.push(nextAyahQr);
    }
    echo.quickReply = quickReply;
    return echo;
  },
  returnListSurah: async function(noJuz) {
    try {
      let echo = {
        type: "flex",
        altText: "Daftar Surah",
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
      let soko = noJuz;
      let response = await axios.get(
        "http://api.alquran.cloud/juz/" + soko + "/ar.alafasy"
      );

      let toIterate = response.data.data.surahs;
      let test = Object.keys(toIterate);
      let contentToAdd = [];
      for (item of test) {
        let soko = {
          type: "button",
          style: "primary",
          action: {
            // {
            //   "type": "postback",
            //   "label": "Buy",
            //   "data": "action=buy&itemid=123"
            // },
            type: "postback",
            label: toIterate[item].englishName,
            data: "action=readSurah&surahId=" + toIterate[item].number
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
  returnListJuz: async function() {
    let echo = {
      type: "flex",
      altText: "Daftar Juz",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 1",
                    text: "Juz 1"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 2",
                    text: "Juz 2"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 3",
                    text: "Juz 3"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 4",
                    text: "Juz 4"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 5",
                    text: "Juz 5"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 6",
                    text: "Juz 6"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 7",
                    text: "Juz 7"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 8",
                    text: "Juz 8"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 9",
                    text: "Juz 9"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 10",
                    text: "Juz 10"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 11",
                    text: "Juz 11"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 12",
                    text: "Juz 12"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 13",
                    text: "Juz 13"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 14",
                    text: "Juz 14"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 15",
                    text: "Juz 15"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 16",
                    text: "Juz 16"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 17",
                    text: "Juz 17"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 18",
                    text: "Juz 18"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 19",
                    text: "Juz 19"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 20",
                    text: "Juz 20"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 21",
                    text: "Juz 21"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 22",
                    text: "Juz 22"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 23",
                    text: "Juz 23"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 24",
                    text: "Juz 24"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 25",
                    text: "Juz 25"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 26",
                    text: "Juz 26"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 27",
                    text: "Juz 27"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 28",
                    text: "Juz 28"
                  }
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  action: {
                    type: "message",
                    label: "Juz 29",
                    text: "Juz 29"
                  }
                },
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "message",
                    label: "Juz 30",
                    text: "Juz 30"
                  }
                }
              ]
            }
          ]
        }
      },
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            imageUrl: "https://example.com/sushi.png",
            action: {
              type: "message",
              label: "Daftar Juz",
              text: "Juz"
            }
          },
          {
            type: "action",
            action: {
              type: "postback",
              label: "Buy",
              data: "action=buy&itemid=111",
              text: "Buy"
            }
          }
        ]
      }
    };

    return echo;
  },
  returnDefault: async function() {
    let echo = {
      type: "text", // ①
      text: "Hai hari ini mau ngaji apa ?",
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            imageUrl: "https://example.com/sushi.png",
            action: {
              type: "message",
              label: "Daftar Juz",
              text: "Juz"
            }
          },
          {
            type: "action",
            action: {
              type: "postback",
              label: "Buy",
              data: "action=buy&itemid=111",
              text: "Buy"
            }
          }
        ]
      }
    };

    return echo;
  },
  returnAudio: async function() {
    let echo = {
      type: "text", // ①
      text: "Select your favorite food category or send me your location!",
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            imageUrl: "https://example.com/sushi.png",
            action: {
              type: "message",
              label: "Sushi",
              text: "Sushi"
            }
          },
          {
            type: "action",
            imageUrl: "https://example.com/tempura.png",
            action: {
              type: "message",
              label: "Tempura",
              text: "Tempura"
            }
          },
          {
            type: "action", // ④
            action: {
              type: "location",
              label: "Send location"
            }
          }
        ]
      }
    };

    return echo;
  },
  randomAyat: async function() {
    try {
    } catch (err) {}
  },
  listJuz: async function() {},
  listSurah: async function(idJuz) {},
  getSurah: async function(idSurah) {}
});
