const express = require("express");
const controller = require("./bioskopController");

const router = express.Router();

router.route("/test").get(controller.test);
router.route("/scrape").get(controller.scrapeBioskop);
router.route("/crc").get(controller.createContent);
router.route("/loadKota").get(controller.loadKota);
router.route("/axios").get(controller.gendeng);

module.exports = router;
