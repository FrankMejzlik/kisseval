var express = require("express");
var router = express.Router();

var path = require("path");
var fs = require("fs");

var utils = require("./utils/utils");

const routeSettings = {
  slug: "native_annotator",
};

function PreProcessReq(req, viewData) {
  const sess = req.session;

  // Do general request preprocess
  utils.PreProcessReq(req, viewData, routeSettings);

  // Get current page slug
  viewData.currentPage = routeSettings.slug;
}

function ProcessReq(req, viewData) {
  let sess = req.session;
}

function PostProcessReq(req, viewData) {
  let sess = req.session;

  utils.PostProcessReq(req, viewData, routeSettings);
}

/*!
 * GET "/" request
 */
router.get("/", function (req, res, next) {
  let sess = req.session;
  let viewData = new Object();

  PreProcessReq(req, viewData);
  ProcessReq(req, viewData);

  if (typeof sess.nativeImage === "undefined") {
    // xoxo: If we're coupling data
    //const couplingImageData = global.imageRanker.GetRandomImage();
    const couplingImageData = global.imageRanker.GetCouplingImageNative();

    sess.nativeImage = new Object();
    sess.nativeImage.imageId = couplingImageData.imageId;
    sess.nativeImage.filename = couplingImageData.filename;
    sess.nativeImage.numNotCoupled = couplingImageData.numNotCoupled;
  }

  viewData.nativeImage = sess.nativeImage;
  viewData.numNotCoupled = sess.nativeImage.numNotCoupled;

  // Finish this request
  PostProcessReq(req, viewData);

  res.render(routeSettings.slug, viewData);
});

// Process POST from autocomplete form
router.post("/", function (req, res, next) {
  // Get this session
  const sess = req.session;
  var query = req.body.query;

  // If at least one keyword provided
  if (typeof query !== "undefined" && query !== "") {
    // Submit this query
    global.imageRanker.SubmitUserDataNativeQueries(
      Number(sess.nativeImage.imageId),
      query,
      sess.id
    );

    // Reset image
    sess.nativeImage = undefined;
  }

  // Redirect user back to game page
  res.redirect(301, "/" + routeSettings.slug);
});

module.exports = router;
