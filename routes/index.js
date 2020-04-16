"use strict";

var express = require("express");
var router = express.Router();

var path = require("path");
var fs = require("fs");

const stateCheck = require("./common/state_checkers");

/** Specific route settings. */
const routeSettings = {
  slug: "index",
};

function PreProcessReq(req, viewData) {
  stateCheck.genericPreProcessReq(req, viewData, routeSettings);
  const sess = req.session;
}

function ProcessReq(req, viewData) {
  stateCheck.genericProcessReq(req, viewData, routeSettings);
  let sess = req.session;
}

function PostProcessReq(req, viewData) {
  stateCheck.genericPostProcessReq(req, viewData, routeSettings);
  let sess = req.session;
}

/**
 * GET request handler
 */
router.get("/", function (req, res, next) {
  let viewData = stateCheck.initRequest(req);

  global.logger.log("debug", "Route: " + routeSettings.slug);

  // Main request cycle
  PreProcessReq(req, viewData);
  ProcessReq(req, viewData);
  PostProcessReq(req, viewData);

  console.log("");
  console.log(JSON.stringify(viewData));

  // Resolve and render dedicated template
  res.render(routeSettings.slug, viewData);
});

module.exports = router;
