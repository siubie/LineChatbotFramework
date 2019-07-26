const express = require("express");
const controller = require("./controllerMartabak");

const router = express.Router();
router.route("/generate").get(controller.seedMartabak);
module.exports = router;
