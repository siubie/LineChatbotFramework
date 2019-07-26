const express = require("express");
const controller = require("./rekeningController");

const router = express.Router();

router.route("/generate").get(controller.seedBank);
router.route("/test").get(controller.tesaxios);
router.route("/resetstate/:state").get(controller.resetState);
module.exports = router;
