const express = require("express");
const controller = require("./controllerBola");

const router = express.Router();

router.route("/scrape").get(controller.scrapeScore);
router.route("/scrapeList").get(controller.scrapeList);
module.exports = router;
