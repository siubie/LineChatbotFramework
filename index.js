const express = require("express");
const line = require("@line/bot-sdk");
const app = express();
const cron = require("node-cron");
const path = require("path");
const PORT = process.env.PORT || 5000;
const controllerBioskop = require("./bioskop/bioskopController");
const controllerAlquran = require("./alquran/alquranController");
const controllerRekening = require("./rekening/rekeningController");
const controllerSayang = require("./sayang/sayangController");
const controllerBola = require("./hilight/controllerBola");
const controllerMartabak = require("./martabak/controllerMartabak");
const controllerKeuangan = require("./catatankeuangan/keuanganController");
require("./db");
var mongoose = require("mongoose");
var Gold = mongoose.model("Gold");
const config = {
  channelAccessToken:
    "Hicb59gbL/1zxlfKLMz/2x7U9ev/RsLuL4f/yzIaS8GhcEpwv67chV5eW9K2wtcWp3MVFOfik/lFq7uNPhrR1OeptNtLXjv8w2cAQ8nBSXqBg+BHTiSJV4Y53avwt4qrGSoLEUrkPZMJ0SNM+LgUiwdB04t89/1O/w1cDnyilFU=",
  channelSecret: "1579960a6238bb07d1e036fd5eb70f6c"
};
const configBioskop = {
  channelAccessToken:
    "Kty6ksICFB5DHHIy1kjdmaaU2GQji9DHe58deUwYA9rjQPLDep0ls8IEksJsSuQzpxGlwVTTHZFoHkMAZRqpBzmrmrwPL7O6TROHhxDmV7sUe4/Y7VfeBVohbBxPWYE8EMMOAjSYgzOhybZwuXUASQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "0a50f7fa1c073a81a16a1ab2e4c4a27d"
};
const configAlquran = {
  channelAccessToken:
    "YZq/IktHieJjxy57akj0Tv0vamwldYmlKcNd51pFOtSePab5HMePqlk0JZdlzk4tVBx/0vk7UeWDNtgbScnFZh6+g0dsmuGMbmsh5sKbsBUWghYzqSeQK798iwWI5OpW/SpFm4Tptr5+hab4LBAsKgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "17b2826bce31ef0ccc43742bbece88f1"
};

const configRekening = {
  channelAccessToken:
    "VI2r8yo7v7fmi9HtBmz9s5mnAMXZyV1I056oc534l1H/KYQvz3nV1xX4jaBELf8InoB6CGGQKEvgibEduuua5vqo0p55xf6P3YKFaWDBgGA4pLHIS6z+b1DZ8st5fHpb2LwCYXiKI3DMqkmr/HhHbgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "b4b3749ec26951874413b6901d78aaa4"
};

const configSayang = {
  channelAccessToken:
    "Brrs1S4W6kJ6Z7qEzGKPxBMrHsJrAuTlOm+o38GjMTZrMbZVgxh30QHIKwopvsxzzlAlYCpvTU8qUMNFyRS5QvUBzOZpgtALOLtDyRhkC4zjCeEmfTXcQ0i1mqEPlF8ktzKE6hUm6DS8jl5s4NIMNgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "de8db90537854cda81db5ee20a8796b4"
};

const configBola = {
  channelAccessToken:
    "CgA1CuZGCD2KfMd8KIYPokTJzggLML2yOC07vuyrBi/yIPknVlySPlWOb5dkOHixhlSEkQaerYVnSkKt6//UNMhWQUrenwMX7BrI9h7bZOZp/OgXN1j0y9QcMMqbap8OcZEOLuA3GBAQ9IoNJR9yXQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "e2bcb3bb6aaf14a23deef6feda6cd19f"
};
const configMartabak = {
  channelAccessToken:
    "eXnMUsYZxhuK06wb6B68fGjjlCL196utfqAjKllAcohTgHnTv1FMNrCQTXSALHZlojfFS9SnZH+OGxoSqFJo/Pj6TUK6k5xbJ8afUeQU/kZcl/XmZ0PnVc6ghsHTo7ZQvm65mnKgF1NFZT+ZtRSEOQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "55f0634dda4a567dcf66f0c61e5fec58"
};

const configKeuangan = {
  channelAccessToken:
    "Pi8N97aFcMlYoPqYI4MYmx9MEzxw5mnzGAVZxtZXSY7K4ZzbCibeR5rJKNZEW1ajoay4i6neF4+9J0XocshrjrSb1Zz93MaRoC2CNtHbJKxhrTgODDPmeROQq0K0ylaWnIebpMvfjX6hmuVf9FoWTgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "75a0b1120a8ceb670c332ec1bda58481"
};
app.get("/", (req, res) => res.send("Hello World!"));

// create LINE SDK client
const client = new line.Client(config);
const clientBioskop = new line.Client(configBioskop);
const clientAlquran = new line.Client(configAlquran);
const clientRekening = new line.Client(configRekening);
const clientBola = new line.Client(configBola);
const clientKeuangan = new line.Client(configKeuangan);

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callbackBioskop", line.middleware(configBioskop), (req, res) => {
  Promise.all(req.body.events.map(controllerBioskop.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});

// about the middleware, please refer to doc
app.post("/callbackAlquran", line.middleware(configAlquran), (req, res) => {
  Promise.all(req.body.events.map(controllerAlquran.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});

app.post("/callbackRekening", line.middleware(configRekening), (req, res) => {
  Promise.all(req.body.events.map(controllerRekening.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});

app.post("/callbackSayang", line.middleware(configSayang), (req, res) => {
  Promise.all(req.body.events.map(controllerSayang.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});
app.post("/callbackBola", line.middleware(configBola), (req, res) => {
  Promise.all(req.body.events.map(controllerBola.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});
app.post("/callbackMartabak", line.middleware(configMartabak), (req, res) => {
  Promise.all(req.body.events.map(controllerMartabak.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});
app.post("/callbackCatatan", line.middleware(configKeuangan), (req, res) => {
  Promise.all(req.body.events.map(controllerKeuangan.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});
function handleEvent(event) {
  if (event.message.text == "rate") {
    Gold.find({})
      .sort("berat")
      .exec(function(err, gold) {
        if (err) {
          const echo = {
            type: "text",
            text: "Bot nya lagi eror bos"
          };
          return client.replyMessage(event.replyToken, echo);
        } else {
          const echo = {
            type: "flex",
            altText: "Harga Emas Hari Ini",
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
                    text: "UbiBot",
                    weight: "bold",
                    color: "#1DB446",
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "Harga Emas Hari Ini",
                    weight: "bold",
                    size: "xl",
                    margin: "md"
                  },
                  {
                    type: "text",
                    text: "Harga diupdate setiap hari",
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
                    contents: [
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: "Berat",
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "Jual",
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "Beli",
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[0].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[0].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[0].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[1].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[1].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[1].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[2].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[2].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[2].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[3].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[3].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[3].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[4].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[4].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[4].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[5].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[5].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[5].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[6].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[6].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[6].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: gold[7].berat,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[7].jual,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "IDR " + gold[7].beli,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      },
                      {
                        type: "separator",
                        margin: "xxl"
                      }
                    ]
                  }
                ]
              }
            }
          };
          return client.replyMessage(event.replyToken, echo);
        }
      });
  } else {
    let echo = {
      type: "text", // ①
      text: "Hai Juragan Emas, silahkan pilih menu untuk mengecek harga emas",
      quickReply: {
        // ②
        items: [
          {
            type: "action", // ③
            imageUrl:
              "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max,w_53/v1536653774/goled.png",
            action: {
              type: "message",
              label: "Rate",
              text: "rate"
            }
          }
        ]
      }
    };

    return client.replyMessage(event.replyToken, echo);
  }
}

// cron.schedule("*/2 * * * *", function() {
//   const echo = {
//     type: "text",
//     text: "Saya tidak mengerti, saya simpan dulu"
//   };
//   return client.pushMessage("siubie", echo);
// });

app.use("/api", require("./antam/router"));
app.use("/bioskop", require("./bioskop/bioskopRoutes"));
app.use("/alquran", require("./alquran/alquranRoute"));
app.use("/rekening", require("./rekening/rekeningRoute"));
app.use("/sayang", require("./sayang/sayangRoutes"));
app.use("/bola", require("./hilight/bolaRoute"));
app.use("/martabak", require("./martabak/routesMartabak"));
app.use("/keuangan", require("./catatankeuangan/keuanganRoutes"));
app.listen(PORT, () => console.log("Application run"));
