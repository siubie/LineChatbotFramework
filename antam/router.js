const cherio = require("cherio");
const axios = require("axios");
const router = require("express").Router();
const cron = require("node-cron");
const mongoose = require("mongoose");
var Gold = mongoose.model("Gold");

function scrapeAntam(req, res) {
  return axios
    .get("http://www.anekalogam.co.id/harga-emas-terkini/")
    .then(function(response) {
      const $ = cherio.load(response.data);
      const d = new Date();
      $("#tablepress-1 .column-1").each(function(i, element) {
        var berat = $(this).text();
        var jual = $(this)
          .next()
          .text();
        var beli = $(this)
          .next()
          .next()
          .text();
        //delete all
        Gold.deleteMany({}).then(function() {
          if (berat != "LM Antam \n(Reinvented)" && berat != "") {
            new Gold({
              berat: berat,
              jual: jual,
              beli: beli
            }).save(function(err) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
        //refill
      });
    })
    .catch(function(err) {
      console.log(err);
    });
}

function getAntamData(req, res) {
  Gold.find({})
    .sort("berat")
    .exec(function(err, gold) {
      if (err) return next(err);
      res.send(gold);
    });
}

cron.schedule("0 12 * * *", function() {
  scrapeAntam();
});

// cron.schedule("*/1 * * * *", function() {
//   scrapeAntam();
// });
router.get("/manual", scrapeAntam);
router.get("/antam", getAntamData);
module.exports = router;
