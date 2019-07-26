var mongoose = require("mongoose");
require("./bioskopModel");
require("./kotaModel");
var AWS = require("aws-sdk");
var fs = require("fs");
var axios = require("axios");
var cloudinary = require("cloudinary");
var request = require("request");
var decode = require("unescape");
var s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIAJ3NN6EM3PUL4TTNQ",
  secretAccessKey:
    process.env.AWS_SECRET_ACCESS_KEY ||
    "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",
  Bucket: process.env.S3_BUCKET || "ubibotbucket"
});
var bucket = process.env.S3_BUCKET || "ubibotbucket";
var Kota = mongoose.model("Kota");
const cherio = require("cherio");
var kotaSeed = require("./dataKota");
var safeEval = require("safe-eval");
var Movie = mongoose.model("Movie");
const line = require("@line/bot-sdk");
const download = require("image-downloader");
const configBioskop = {
  channelAccessToken:
    "Kty6ksICFB5DHHIy1kjdmaaU2GQji9DHe58deUwYA9rjQPLDep0ls8IEksJsSuQzpxGlwVTTHZFoHkMAZRqpBzmrmrwPL7O6TROHhxDmV7sUe4/Y7VfeBVohbBxPWYE8EMMOAjSYgzOhybZwuXUASQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "0a50f7fa1c073a81a16a1ab2e4c4a27d"
};

const clientBioskop = new line.Client(configBioskop);
var user_agent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20";
var Browser = require("zombie");
var browser = new Browser({
  userAgent: user_agent,
  debug: true,
  waitFor: 10000
});

browser.referrer = "http://www.21cineplex.com/";
var url = "http://www.21cineplex.com/nowplaying";

function loadKota(req, res) {
  // res.json(kotaSeed);
  kotaSeed.forEach(function(item) {
    new Kota({
      cidy: item.cidy,
      namaKota: item.namaKota
    }).save(function(err, kota) {
      if (err) {
        res.json(err);
      } else {
        console.log(kota);
      }
    });
  });
}
function scrapeBioskop(req, res) {
  browser.visit(url, function() {
    const $ = cherio.load(browser.html());
    let i = 0;
    //ambil array
    let scriptArray = $("script");
    //ambil array script yang ada datanya now playing
    // let ori = scriptArray[20].children[0].data;
    let ori = scriptArray[20].children[0].data;
    //di split biar variabel nya tok
    let splitVariabel = ori.split("$(function(){");
    //di split lagi
    let splitDataTok = splitVariabel[0].split("var pdata=");
    let potongEkor = splitDataTok[1].slice(0, -4);
    // console.log(splitDataTok);
    let soko = safeEval(potongEkor);
    Movie.deleteMany({}).then(function() {});
    soko.forEach(function(item) {
      new Movie({
        movieCode: item.movieCode,
        movieId: item.movieId,
        movieTitle: item.movieTitle,
        movieImage: item.movieImage,
        movieTrailerFile: item.movieTrailerFile,
        movieSinopsis: item.movieSinopsis,
        cityCode: item.cityCode,
        movieImax: item.movieImax,
        key: item.key,
        poster: item.poster
      }).save(function(err, movie) {
        if (err) {
          console.log(err);
        } else {
          let filename = item.movieImage;
          filename = filename.split(".")[0];
          cloudinary.uploader.upload(
            "http://media.21cineplex.com/webcontent/gallery/pictures/" +
              filename +
              "_300x430.jpg",
            function(result) {
              console.log(result);
              movie.movieImage = result.secure_url;
              movie.save(function(err, movie) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(movie);
                }
              });
            }
          );
        }
      });
    });
    return res.send(soko);
  });
}
async function test(req, res) {
  let movies = await Movie.find();
  let itemString = "";
  let moviesString = await movies.forEach((item, index) => {
    itemString += item.movieTitle + "\n";
  });
  return itemString;
}

async function createKota(req, res) {
  let kotas = await Kota.find({}).sort({ namaKota: 1 });
  const echo = {
    type: "flex",
    altText: "Daftar Kota",
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

  let contentToAdd = [];
  for (kota of kotas) {
    let soko = {
      type: "button",
      style: "primary",
      action: {
        type: "message",
        label: kota.namaKota,
        text: "CEK " + kota.namaKota
      }
    };
    contentToAdd.push(soko);
  }
  echo.contents.body.contents = contentToAdd;
  return echo;
}
async function createContent(req, res) {
  let movies = await Movie.find({})
    .sort({ movieId: -1 })
    .limit(10);
  const echo = {
    type: "flex",
    altText: "Now Playing",
    contents: {
      type: "carousel",
      contents: []
    }
  };
  let contentToAdd = [];
  for (movie of movies) {
    let soko = {
      type: "bubble",
      hero: {
        type: "image",
        size: "full",
        url: movie.movieImage
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: movie.movieTitle,
            wrap: true,
            weight: "bold",
            size: "xl"
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: decode(movie.movieSinopsis),
                wrap: true,
                size: "sm",
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
              type: "message",
              label: "Lihat Kota",
              text: "kota " + movie.movieId
            }
          }
        ]
      }
    };
    contentToAdd.push(soko);
  }
  echo.contents.contents = contentToAdd;
  return echo;
  // return res.json(echo.contents);
}

function returnDefault() {
  let echo = {
    type: "text", // ①
    text:
      "Hai Movie Lovers, silahkan pilih menu berikut untuk chatting atau gunakan keyword 'np'",
    quickReply: {
      // ②
      items: [
        {
          type: "action", // ③
          imageUrl:
            "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max,w_53/v1536653774/goled.png",
          action: {
            type: "message",
            label: "Now Playing",
            text: "np"
          }
        },
        {
          type: "action", // ③
          imageUrl:
            "https://res.cloudinary.com/hnqrolvvr/image/upload/ar_1:1,b_rgb:262c35,bo_1px_solid_rgb:ffffff,c_fill,g_auto,r_max/v1536715218/citylogo.png",
          action: {
            type: "message",
            label: "Pilih Kota",
            text: "kota"
          }
        }
      ]
    }
  };
  return echo;
}

async function cekMovieByKota(namaKota) {
  try {
    let dataKota = await Kota.findOne({ namaKota: namaKota });
    let cidy = dataKota.cidy;
    console.log(cidy)
  } catch (err) {
    console.log(err);
  }
}
async function handleEvent(event) {
  if (event.message.text == "np") {
    let echo = await createContent();
    return clientBioskop.replyMessage(event.replyToken, echo);
  } else if (event.message.text == "kota") {
    // console.log("masuk");
    let echo = await createKota();
    return clientBioskop.replyMessage(event.replyToken, echo);
  } else if (event.message.text.includes("CEK")) {
    let message = event.message.text;
    let kota = message.split(" ");
    kota = kota[1];
    let echo = await cekMovieByKota(kota);
    // return clientBioskop.replyMessage(event.replyToken, echo);
  } else {
    let echo = returnDefault();
    return clientBioskop.replyMessage(event.replyToken, echo);
  }
}

function gendeng(req, res) {
  request.post(
    {
      url: "http://www.21cineplex.com/page/ajax-movie-list.php",
      form: {
        cidy: "23"
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    },
    function(e, r, body) {
      console.log(body);
    }
  );
}
module.exports = {
  scrapeBioskop,
  handleEvent,
  test,
  createContent,
  loadKota,
  gendeng
};
