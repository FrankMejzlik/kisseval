"use strict";

const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

const SessionState = require("./classes/SessionState");
const stateCheck = require("./common/state_checkers");

/** Specific route settings. */
const routeSettings = {
  slug: "annotator",
};

function preProcessReq(req, viewData) {
  stateCheck.genericPreProcessReq(req, viewData, routeSettings);
}

function processReq(req, viewData) {
  stateCheck.genericProcessReq(req, viewData, routeSettings);
  const sess = req.session;

  // Get presented frame sequence
  const framesSequence = SessionState.getAnnotImageSquence(sess.state);
  if (framesSequence == null) {
    const activeImgSet = SessionState.getActieImageset(sess.state);
    const activeDataPack = SessionState.getActiveDataPackId(sess.state);
    const len = SessionState.getRandFrameSeqLength(sess.state);

    const framesSequence = global.imageRanker.getRandomFrameSequence(activeImgSet, activeDataPack, len);
    SessionState.setAnnotImageSquence(sess.state, framesSequence);

    global.logger.log(
      "debug",
      "<" + req.session.id + "> \n" + "Serving image sequence: " + JSON.stringify(framesSequence)
    );
  }
}

function postProcessReq(req, viewData) {
  stateCheck.genericPostProcessReq(req, viewData, routeSettings);
}

/**
 * GET request handler
 */
router.get("/", function (req, res, next) {
  const viewData = stateCheck.initRequest(req);

  global.logger.log("debug", "Route: " + routeSettings.slug);

  // Main request cycle
  preProcessReq(req, viewData);
  processReq(req, viewData);
  postProcessReq(req, viewData);

  res.render(routeSettings.slug, viewData);
});

module.exports = router;
