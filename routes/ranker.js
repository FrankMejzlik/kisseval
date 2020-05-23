"use strict";

const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

const SessionState = require("./classes/SessionState");
const stateCheck = require("./common/state_checkers");
const modelOptions = require(global.gConfig.modelOptsInfoFpth);

/** Specific route settings. */
const routeSettings = {
  slug: "ranker",
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

  global.logger.log("debug", "Route: " + routeSettings.slug);

  const sess = req.session;

  // Main request cycle
  preProcessReq(req, viewData);
  const uiState0 = SessionState.ranker_getCurrentUiState(sess.state);
  processReq(req, viewData);
  postProcessReq(req, viewData);

  const searchSess = SessionState.ranker_getCurrentSearchSession(sess.state);
  const uiState = SessionState.ranker_getCurrentUiState(sess.state);

  let formatedModelOptions = SessionState.ranker_getActiveModelOptions(sess.state);
  const regexp = /;/gi;
  formatedModelOptions = formatedModelOptions.replace(regexp, "<br />");

  // RANKER: Options
  viewData.ranker.options = {
    activeDataPackId: SessionState.getActiveDataPackId(sess.state),
    activeModelOptions: formatedModelOptions,
  };

  // RANKER: Search session
  viewData.ranker.searchSession = searchSess;

  // RANKER: UI state
  viewData.ranker.ui = uiState;

  viewData.ranker.state = SessionState.ranker_getState(sess.state);

  global.logger.log("debug", "<" + sess.id + ">: viewData:" + JSON.stringify(viewData, null, 4));

  // Add also model options
  const pack_type = SessionState.getActiveDataPackType(req.session.state);
  const pack_ID = SessionState.getActiveDataPackId(req.session.state);
  const pack = SessionState.getActiveDataPack(pack_ID);
  viewData.modelOptions = modelOptions[pack_type].options;
  viewData.ranker.numFrames = pack.num_frames;

  

  // Resolve and render dedicated template
  res.render(routeSettings.slug, viewData);
});

module.exports = router;
