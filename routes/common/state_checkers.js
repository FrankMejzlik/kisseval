"use strict";

const sessState = require("../classes/SessionState");

exports.initRequest = function (req, viewData, routeSettings) {
  // \todo Remove this, it's just for the dev. xoxo
  //req.session.state = null;

  return {};
};

exports.genericPreProcessReq = function (req, viewData, routeSettings) {
  this.checkGlobalSessionState(req, viewData);

  // Get current page slug
  viewData.currentPage = routeSettings.slug;
};

exports.genericProcessReq = function (req, viewData, routeSettings) {};

exports.genericPostProcessReq = function (req, viewData, routeSettings) {
  this.checkGlobalViewState(req, viewData);
};

exports.checkGlobalSessionState = function (req, viewData) {
  const sess = req.session;

  if (typeof sess.state === "undefined" || sess.state == null) {
    // Get what data packs are available
    if (typeof global.loadedDataPacksInfo === "undefined") {
      global.loadedDataPacksInfo = global.imageRanker.getLoadedDataPacksInfo();
    }

    let ii = 0;
    for (let pack of global.loadedDataPacksInfo) {
      if (pack.id == global.gConfig.defaultDataPack) break;

      ++ii;
    }

    sess.state = sessState.construct(
      global.loadedDataPacksInfo[ii].id,
      global.loadedDataPacksInfo[ii].model_options,
      global.loadedDataPacksInfo[ii].description,
      global.loadedDataPacksInfo[ii].target_imageset_ID,
      1
    );
  }
  // At this point sess.state should be always populated with correct values
};

exports.checkGlobalViewState = function (req, viewData) {
  const sess = req.session;

  // DOM IDs for dynamic elements
  viewData.elemIds = global.gConfig.elemIds;

  // Viwe helper functions
  viewData.helpers = {};

  viewData.ranker = {};

  // Initialize viewData
  viewData.state = {
    userLevel: sessState.getUserLevel(sess.state),
    loadedDataPacks: global.loadedDataPacksInfo,
    activeDataPackId: sessState.getActiveDataPackId(sess.state),
    activeDataPackType: sessState.getActiveDataPackType(sess.state),
    annotator: {
      fullyNative: sessState.getAnnotFullyNative(sess.state),
      framesSequence: sessState.getAnnotImageSquence(sess.state),
    },
  };
};
