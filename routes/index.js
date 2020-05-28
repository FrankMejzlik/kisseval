"use strict";

const express = require("express");

const router = express.Router();

const stateCheck = require("./common/state_checkers");

/** Specific route settings. */
const routeSettings = {
  slug: "index",
};

function preProcessReq(req, viewData) {
  stateCheck.genericPreProcessReq(req, viewData, routeSettings);
}

function processReq(req, viewData) {
  stateCheck.genericProcessReq(req, viewData, routeSettings);
}

function postProcessReq(req, viewData) {
  stateCheck.genericPostProcessReq(req, viewData, routeSettings);
}

/**
 * GET request handler
 */
router.get("/", function (req, res, next) {
  const viewData = stateCheck.initRequest(req);

  global.logger.log("debug", `<${req.session.id}> ROUTER = + '${routeSettings.slug}'`);

  // Main request cycle
  preProcessReq(req, viewData);
  processReq(req, viewData);
  postProcessReq(req, viewData);

  global.logger.log("silly", `<${req.session.id}>viewData = ${JSON.stringify(viewData, null, 4)}`);

  // Resolve and render dedicated template
  res.render(routeSettings.slug, viewData);
});

module.exports = router;
