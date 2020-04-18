"use strict";

const sessState = require("../classes/SessionState");

exports.initRequest = function(req, viewData, routeSettings) {
  // \todo Remove this, it's just for the dev
  // req.session.state = null;

  return {};
};

exports.genericPreProcessReq = function(req, viewData, routeSettings) {
  this.checkGlobalSessionState(req, viewData);

  // Get current page slug
  viewData.currentPage = routeSettings.slug;
};

exports.genericProcessReq = function(req, viewData, routeSettings) {};

exports.genericPostProcessReq = function(req, viewData, routeSettings) {
  this.checkGlobalViewState(req, viewData);
};

exports.checkGlobalSessionState = function(req, viewData) {
  const sess = req.session;

  if (typeof sess.state === "undefined" || sess.state == null) {
    // Get what data packs are available
    if (typeof global.loadedDataPacksInfo === "undefined") {
      global.loadedDataPacksInfo = global.imageRanker.getLoadedDataPacksInfo();
    }

    // By default, the first data pack is used
    sess.state = sessState.construct(
        global.loadedDataPacksInfo[0].id,
        global.loadedDataPacksInfo[0].model_options,
        global.loadedDataPacksInfo[0].target_imageset_ID,
        10,
    );
  }
  // At this point sess.state should be always populated with correct values
};

exports.checkGlobalViewState = function(req, viewData) {
  const sess = req.session;

  viewData.state = {
    userLevel: sess.state.userLevel,
    loadedDataPacks: global.loadedDataPacksInfo,
    activeDataPackId: sessState.getActiveDataPackId(sess.state),
    annotator: {
      fullyNative: sessState.getAnnotFullyNative(sess.state),
      framesSequence: sessState.getAnnotImageSquence(sess.state),
    },
  };
};
