const express = require("express");
const controller = require("./alquranController");

const router = express.Router();

router.route("/test").get(controller.getSurah);
router.route("/listsurah").get(controller.returnListSurah);
module.exports = router;
