"use strict";

var express = require("express");
var router = express.Router();

var path = require("path");
var fs = require("fs");

const SessionState = require("./classes/SessionState");
const stateCheck = require("./common/state_checkers");

/** Specific route settings. */
const routeSettings = {
  slug: "annotator",
};

function PreProcessReq(req, viewData) {
  stateCheck.genericPreProcessReq(req, viewData, routeSettings);
  const sess = req.session;
}

function ProcessReq(req, viewData) {
  stateCheck.genericProcessReq(req, viewData, routeSettings);
  let sess = req.session;

  // Get presented frame sequence
  const framesSequence = SessionState.getAnnotImageSquence(sess.state);
  if (framesSequence == null) {
    const activeImgSet = SessionState.getActieImageset(sess.state);
    const len = SessionState.getRandFrameSeqLength(sess.state);

    const framesSequence = global.imageRanker.getRandomFrameSequence(
      activeImgSet,
      len
    );
    SessionState.setAnnotImageSquence(sess.state, framesSequence);

    global.logger.log(
      "debug",
      "<" +
        req.session.id +
        "> \n" +
        "Serving image sequence: " +
        JSON.stringify(framesSequence)
    );
  }
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

  res.render(routeSettings.slug, viewData);
});

module.exports = router;
